// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";

/**
 * Self-Signup Edge Function
 *
 * Bypasses Supabase's rate-limited /auth/v1/signup endpoint by using the
 * admin API (admin.createUser) to create auth users. Sends a branded
 * confirmation/welcome email via the tenant's own SMTP — same pattern
 * as auth-email-hook but without triggering the Supabase email pipeline.
 *
 * Works for ALL tenants (tenant is passed in the request body).
 */

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey);

        const body = await req.json();
        const { email, password, fullName, role, phone, seaiNumber, tenant } = body;

        if (!email || !password || !fullName || !role) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (password.length < 6) {
            return new Response(
                JSON.stringify({ success: false, error: 'Password must be at least 6 characters' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const resolvedTenant = tenant || 'ireland';
        const normalizedEmail = email.trim().toLowerCase();

        // 1. Check if email already exists in profiles
        const { data: existingProfile } = await supabaseAdmin
            .from('profiles')
            .select('id, email')
            .eq('email', normalizedEmail)
            .maybeSingle();

        if (existingProfile) {
            return new Response(
                JSON.stringify({ success: false, error: 'EMAIL_EXISTS' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 2. Check if phone already exists (if provided)
        if (phone && phone.trim().length >= 7) {
            const { data: existingPhone } = await supabaseAdmin
                .from('profiles')
                .select('id')
                .eq('phone', phone.trim())
                .maybeSingle();
            if (existingPhone) {
                return new Response(
                    JSON.stringify({ success: false, error: 'PHONE_EXISTS' }),
                    { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                );
            }
        }

        // 3. Create auth user via admin API — email_confirm: false so user must verify via email
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: password,
            email_confirm: false,
            user_metadata: {
                full_name: fullName,
                role: role,
                phone: phone || null,
                seai_number: seaiNumber || null,
                tenant: resolvedTenant,
                registration_status: (role === 'business' || role === 'contractor') ? 'pending' : 'active',
            },
        });

        if (authError) {
            console.error('[self-signup] Auth user creation error:', authError.message);
            return new Response(
                JSON.stringify({ success: false, error: authError.message }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        if (!authData.user) {
            return new Response(
                JSON.stringify({ success: false, error: 'User creation returned no user' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        const userId = authData.user.id;

        // 4. Build profile data
        let profileData: any = {
            id: userId,
            full_name: fullName,
            email: normalizedEmail,
            role: role,
            phone: phone || null,
            tenant: resolvedTenant,
            registration_status: (role === 'business' || role === 'contractor') ? 'pending' : 'active',
            is_active: true,
        };

        if (role === 'contractor') {
            profileData = {
                ...profileData,
                seai_number: seaiNumber || null,
                subscription_status: 'inactive',
                stripe_payment_id: 'FREE_ASSESSOR',
            };
        } else if (role === 'business') {
            profileData = {
                ...profileData,
                subscription_status: 'inactive',
                stripe_payment_id: 'MANUAL_BY_ADMIN',
            };
        }

        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert(profileData, { onConflict: 'id' });

        if (profileError) {
            console.error('[self-signup] Profile upsert error:', profileError.message);
        }

        // 5. Generate a verification link via admin API (does NOT send Supabase email)
        // Redirect after confirmation: contractors/businesses go to onboarding to complete their profile
        const tenantConfigForRedirect = await getTenantConfig(supabaseAdmin, resolvedTenant);
        const tenantWebsiteUrl = (tenantConfigForRedirect.website_url || `https://${tenantConfigForRedirect.domain}`).replace(/\/$/, '');
        const postConfirmPath = role === 'contractor'
            ? '/assessor-onboarding'
            : role === 'business'
                ? '/business-onboarding'
                : '/dashboard/user';
        const redirectTo = `${tenantWebsiteUrl}${postConfirmPath}`;

        const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
            type: 'signup',
            email: normalizedEmail,
            password: password,
            options: { redirectTo },
        });

        if (linkError || !linkData?.properties?.action_link) {
            console.error('[self-signup] Failed to generate verification link:', linkError?.message);
            return new Response(
                JSON.stringify({ success: false, error: 'Failed to generate verification link' }),
                { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            );
        }

        // 6. Send confirmation email via tenant SMTP with the verification link
        try {
            const config = tenantConfigForRedirect;
            if (config.smtp_hostname && config.smtp_username && config.smtp_password) {
                const websiteUrl = (config.website_url || `https://${config.domain}`).replace(/\/$/, '');
                const logoUrl = config.logo_url || `${websiteUrl}/logo.svg`;
                const brandName = config.display_name;
                const isSpanish = resolvedTenant === 'spain';
                const isPortuguese = resolvedTenant === 'portugal';
                const isEngland = resolvedTenant === 'england';

                // Use the action_link from generateLink — it contains the token Supabase will verify
                const confirmationUrl = linkData.properties.action_link;

                const subject = isSpanish
                    ? `Confirma tu cuenta – ${brandName}`
                    : isPortuguese
                        ? `Confirme a sua conta – ${brandName}`
                        : `Confirm your account – ${brandName}`;

                const html = buildConfirmationEmail(normalizedEmail, confirmationUrl, `${websiteUrl}/login`, websiteUrl, brandName, isSpanish, isEngland, isPortuguese, logoUrl);

                const client = new CustomSmtpClient(config.domain);
                await client.connect(config.smtp_hostname, config.smtp_port);
                await client.authenticate(config.smtp_username, config.smtp_password);
                await client.send(config.smtp_from, normalizedEmail, subject, html);
                await client.close();
                console.log(`[self-signup] Confirmation email sent to ${normalizedEmail} via tenant ${resolvedTenant} SMTP`);
            }
        } catch (smtpErr: any) {
            console.error('[self-signup] Confirmation email error (non-blocking):', smtpErr.message);
        }

        return new Response(
            JSON.stringify({
                success: true,
                user: authData.user,
                needsEmailConfirmation: true,
                message: 'Account created. Check your email to confirm.',
            }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (err: any) {
        console.error('[self-signup] Global error:', err.message);
        return new Response(
            JSON.stringify({ success: false, error: err.message }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});

function buildConfirmationEmail(
    email: string,
    confirmationUrl: string,
    fallbackUrl: string,
    websiteUrl: string,
    brandName: string,
    isSpanish: boolean,
    isEngland: boolean,
    isPortuguese: boolean = false,
    logoUrl: string = `${websiteUrl}/logo.svg`
): string {
    if (isPortuguese) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${logoUrl}" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Confirme a sua conta</h1>
            <p style="font-size: 16px; color: #333;">Olá,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Obrigado por se registar na <strong>${brandName}</strong>. Clique no botão abaixo para confirmar a sua conta e começar.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirmar a minha conta</a>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">Se o botão não funcionar, copie e cole este link:</p>
            <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${brandName}.<br>
                Apoiando objetivos de energia sustentável através de certificações profissionais.
            </p>
        </div>`;
    }
    if (isSpanish) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${logoUrl}" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Confirma tu cuenta</h1>
            <p style="font-size: 16px; color: #333;">Hola,</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Gracias por registrarte en <strong>${brandName}</strong>. Haz clic en el botón de abajo para confirmar tu cuenta y comenzar.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirmar mi cuenta</a>
            </div>
            <p style="color: #6b7280; font-size: 0.9rem;">Si el botón no funciona, copia y pega este enlace:</p>
            <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${brandName}.<br>
                Apoyando objetivos de energía sostenible a través de certificaciones profesionales.
            </p>
        </div>`;
    }
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="${logoUrl}" alt="${brandName}" style="height: 40px; filter: grayscale(1) brightness(0.2);">
        </div>
        <h1 style="color: #007F00; text-align: center; font-size: 24px;">Confirm your account</h1>
        <p style="font-size: 16px; color: #333;">Hi,</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Thanks for signing up with <strong>${brandName}</strong>. Click the button below to confirm your account and get started.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Confirm my account</a>
        </div>
        <p style="color: #6b7280; font-size: 0.9rem;">If the button doesn't work, copy and paste this link:</p>
        <p style="word-break: break-all; color: #007F00; font-size: 0.85rem;">${confirmationUrl}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} ${brandName}.<br>
            Supporting sustainable energy goals through professional assessments.
        </p>
    </div>`;
}
