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

        // 3. Create auth user via admin API — email_confirm: true skips Supabase email entirely
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: password,
            email_confirm: true,
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

        // 5. Send welcome email via tenant SMTP (non-blocking — user is already created)
        try {
            const config = await getTenantConfig(supabaseAdmin, resolvedTenant);
            if (config.smtp_hostname && config.smtp_username && config.smtp_password) {
                const websiteUrl = (config.website_url || `https://${config.domain}`).replace(/\/$/, '');
                const logoUrl = config.logo_url || `${websiteUrl}/logo.svg`;
                const brandName = config.display_name;
                const loginUrl = `${websiteUrl}/login`;
                const isSpanish = resolvedTenant === 'spain';
                const isPortuguese = resolvedTenant === 'portugal';
                const isEngland = resolvedTenant === 'england';

                const subject = isSpanish
                    ? `Bienvenido a ${brandName}`
                    : isPortuguese
                        ? `Bem-vindo à ${brandName}`
                        : `Welcome to ${brandName}`;

                const html = buildWelcomeEmail(fullName, loginUrl, websiteUrl, brandName, isSpanish, isPortuguese, isEngland, logoUrl);

                const client = new CustomSmtpClient(config.domain);
                await client.connect(config.smtp_hostname, config.smtp_port);
                await client.authenticate(config.smtp_username, config.smtp_password);
                await client.send(config.smtp_from, normalizedEmail, subject, html);
                await client.close();
                console.log(`[self-signup] Welcome email sent to ${normalizedEmail} via tenant ${resolvedTenant} SMTP`);
            }
        } catch (smtpErr: any) {
            console.error('[self-signup] Welcome email error (non-blocking):', smtpErr.message);
        }

        return new Response(
            JSON.stringify({
                success: true,
                user: authData.user,
                message: 'Account created successfully',
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

function buildWelcomeEmail(
    fullName: string,
    loginUrl: string,
    websiteUrl: string,
    brandName: string,
    isSpanish: boolean,
    isPortuguese: boolean,
    isEngland: boolean,
    logoUrl: string
): string {
    if (isPortuguese) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${logoUrl}" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Bem-vindo à ${brandName}</h1>
            <p style="font-size: 16px; color: #333;">Olá, ${fullName}</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                A sua conta foi criada com sucesso. Já pode iniciar sessão e começar a usar a plataforma.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Iniciar Sessão</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${brandName}. Todos os direitos reservados.
            </p>
        </div>`;
    }
    if (isSpanish) {
        return `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
            <div style="text-align: center; margin-bottom: 25px;">
                <img src="${logoUrl}" alt="${brandName}" style="height: 40px;">
            </div>
            <h1 style="color: #007F00; text-align: center; font-size: 24px;">Bienvenido a ${brandName}</h1>
            <p style="font-size: 16px; color: #333;">Hola, ${fullName}</p>
            <p style="font-size: 15px; color: #555; line-height: 1.6;">
                Tu cuenta ha sido creada con éxito. Ya puedes iniciar sesión y empezar a usar la plataforma.
            </p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${loginUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Iniciar Sesión</a>
            </div>
            <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
            <p style="font-size: 12px; color: #999; text-align: center;">
                &copy; ${new Date().getFullYear()} ${brandName}. Todos los derechos reservados.
            </p>
        </div>`;
    }
    return `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 1rem;">
        <div style="text-align: center; margin-bottom: 25px;">
            <img src="${logoUrl}" alt="${brandName}" style="height: 40px;">
        </div>
        <h1 style="color: #007F00; text-align: center; font-size: 24px;">Welcome to ${brandName}</h1>
        <p style="font-size: 16px; color: #333;">Hi, ${fullName}</p>
        <p style="font-size: 15px; color: #555; line-height: 1.6;">
            Your account has been created successfully. You can now log in and start using the platform.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${loginUrl}" style="display: inline-block; background: #007F00; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Log In</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 30px 0;">
        <p style="font-size: 12px; color: #999; text-align: center;">
            &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
        </p>
    </div>`;
}
