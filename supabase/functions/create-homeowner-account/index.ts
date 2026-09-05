// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AuthResult {
    user: any | null;
    profile: any | null;
    error: string | null;
}

async function verifyAuth(req: Request, serviceRoleClient: any): Promise<AuthResult> {
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
        return { user: null, profile: null, error: 'Missing authorization header' };
    }
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) {
        return { user: null, profile: null, error: 'Missing bearer token' };
    }
    const { data, error } = await serviceRoleClient.auth.getUser(token);
    if (error || !data.user) {
        return { user: null, profile: null, error: error?.message || 'Invalid or expired token' };
    }
    return { user: data.user, profile: null, error: null };
}

async function requireAdmin(req: Request, serviceRoleClient: any): Promise<AuthResult> {
    const authResult = await verifyAuth(req, serviceRoleClient);
    if (authResult.error || !authResult.user) {
        return authResult;
    }
    const { data: profile, error: profileError } = await serviceRoleClient
        .from('profiles')
        .select('role, tenant')
        .eq('id', authResult.user.id)
        .maybeSingle();
    if (profileError) {
        return { user: null, profile: null, error: profileError.message };
    }
    if (!profile || profile.role !== 'admin') {
        return { user: null, profile: null, error: 'Forbidden: admin access required' };
    }
    return { user: authResult.user, profile, error: null };
}

async function getTenantConfig(supabase: any, tenant: string) {
    const { data, error } = await supabase
        .from('tenant_configurations')
        .select('*')
        .eq('tenant', tenant)
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();
    if (error || !data) {
        console.error(`[tenant] Failed to load config for tenant "${tenant}":`, error);
        throw new Error(`Tenant config not found: ${tenant}`);
    }
    return {
        tenant: data.tenant,
        domain: data.domain,
        display_name: data.display_name,
        website_url: data.website_url || `https://${data.domain}`,
    };
}

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

        if (!phone || phone.trim() === '') {
            return new Response(JSON.stringify({ success: false, error: 'A phone number is required to create a homeowner account' }), { status: 400, headers: responseHeaders });
        }

        // 1. Check if a profile already exists with this email FOR THIS TENANT
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, email, full_name, role')
            .eq('email', email.toLowerCase())
            .eq('tenant', tenant)
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

        // 1b. Check if the phone number is already in use by another profile FOR THIS TENANT
        const { data: phoneConflict } = await supabase
            .from('profiles')
            .select('id, email, full_name, role, tenant')
            .eq('phone', phone.trim())
            .eq('tenant', tenant)
            .maybeSingle();

        if (phoneConflict) {
            return new Response(JSON.stringify({
                success: false,
                error: `This phone number is already registered to ${phoneConflict.email}. Please use a different phone number or log in with that account.`,
            }), { status: 409, headers: responseHeaders });
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
            user_metadata: { full_name: fullName, phone: phone || null, tenant, role: 'homeowner', is_admin_created: true },
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
