// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { requireAdmin } from "../shared/auth.ts";
import { getTenantConfig } from "../shared/tenant.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function generateSecurePassword(length = 14): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    const randomBytes = new Uint8Array(length);
    crypto.getRandomValues(randomBytes);
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars[randomBytes[i] % chars.length];
    }
    return password;
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Require admin auth
        const { error: authError } = await requireAdmin(req, supabase);
        if (authError) {
            return new Response(
                JSON.stringify({ success: false, error: 'Unauthorized' }),
                { status: 401, headers: responseHeaders },
            );
        }

        const { email, fullName, phone, tenant = 'ireland' } = await req.json();

        if (!email || !fullName) {
            return new Response(JSON.stringify({ success: false, error: 'email and fullName are required' }), { status: 400, headers: responseHeaders });
        }

        // 1. Check if a profile already exists with this email
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (existingProfile) {
            return new Response(JSON.stringify({
                success: true,
                userId: existingProfile.id,
                created: false,
                message: `Existing ${existingProfile.role || 'user'} profile found`,
                profile: existingProfile,
            }), { headers: responseHeaders });
        }

        // 2. Check if an auth user exists with this email
        const { data: existingAuthUser } = await supabase.auth.admin.listUsers();
        const found = existingAuthUser?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

        if (found) {
            // Create profile if missing
            const { data: newProfile } = await supabase
                .from('profiles')
                .upsert({
                    id: found.id,
                    email: email.toLowerCase(),
                    full_name: fullName,
                    phone: phone || null,
                    role: 'homeowner',
                    tenant,
                    is_active: true,
                }, { onConflict: 'id' })
                .select()
                .single();

            return new Response(JSON.stringify({
                success: true,
                userId: found.id,
                created: false,
                message: 'Linked to existing auth user',
                profile: newProfile,
            }), { headers: responseHeaders });
        }

        // 3. Create new auth user with secure password
        const password = generateSecurePassword(14);
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, phone, tenant, role: 'homeowner', is_admin_created: true },
        });

        if (createError) throw createError;

        // 4. Create profile via upsert (handles trigger-created profiles)
        const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
                id: newUser.user.id,
                email: email.toLowerCase(),
                full_name: fullName,
                phone: phone || null,
                role: 'homeowner',
                tenant,
                is_active: true,
            }, { onConflict: 'id' });

        if (profileError) {
            console.error('[create-homeowner-account] Profile creation failed:', profileError);
        }

        // 5. Resolve tenant website URL for login link
        let websiteUrl = 'https://theberman.eu';
        try {
            const tenantConfig = await getTenantConfig(supabase, tenant);
            websiteUrl = (tenantConfig.website_url || `https://${tenantConfig.domain}`).replace(/\/$/, '');
        } catch (e) {
            // fallback to default
        }
        const loginUrl = `${websiteUrl}/login`;

        return new Response(JSON.stringify({
            success: true,
            userId: newUser.user.id,
            created: true,
            message: 'New homeowner account created',
            password,
            loginUrl,
            user: newUser.user,
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error('[create-homeowner-account] Error:', err);
        return new Response(JSON.stringify({ success: false, error: err?.message || 'Internal error' }), { status: 500, headers: responseHeaders });
    }
});
