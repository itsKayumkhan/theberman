// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { email, fullName, phone, tenant = 'ireland' } = await req.json();

        if (!email || !fullName) {
            return new Response(JSON.stringify({ success: false, error: 'email and fullName are required' }), { status: 400, headers: responseHeaders });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Check if a profile already exists with this email
        const { data: existingProfile } = await supabase
            .from('profiles')
            .select('id, email, full_name')
            .eq('email', email.toLowerCase())
            .maybeSingle();

        if (existingProfile) {
            return new Response(JSON.stringify({
                success: true,
                userId: existingProfile.id,
                created: false,
                message: 'Existing user found'
            }), { headers: responseHeaders });
        }

        // 2. Check if an auth user exists with this email
        const { data: existingAuthUser, error: listError } = await supabase.auth.admin.listUsers();
        const found = existingAuthUser?.users?.find((u: any) => u.email?.toLowerCase() === email.toLowerCase());

        if (found) {
            // Create profile if missing
            const { data: newProfile } = await supabase
                .from('profiles')
                .insert({
                    id: found.id,
                    email: email.toLowerCase(),
                    full_name: fullName,
                    phone: phone || null,
                    role: 'homeowner',
                    tenant,
                    is_active: true,
                })
                .select()
                .single();

            return new Response(JSON.stringify({
                success: true,
                userId: found.id,
                created: false,
                message: 'Linked to existing auth user'
            }), { headers: responseHeaders });
        }

        // 3. Create new auth user with temporary password
        const tempPassword = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2) + 'A1!';
        const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true,
            user_metadata: { full_name: fullName, phone, tenant },
        });

        if (createError) throw createError;

        // 4. Create profile
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: newUser.user.id,
                email: email.toLowerCase(),
                full_name: fullName,
                phone: phone || null,
                role: 'homeowner',
                tenant,
                is_active: true,
            });

        if (profileError) {
            console.error('[create-homeowner-account] Profile creation failed:', profileError);
        }

        return new Response(JSON.stringify({
            success: true,
            userId: newUser.user.id,
            created: true,
            message: 'New homeowner account created'
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error('[create-homeowner-account] Error:', err);
        return new Response(JSON.stringify({ success: false, error: err?.message || 'Internal error' }), { status: 500, headers: responseHeaders });
    }
});
