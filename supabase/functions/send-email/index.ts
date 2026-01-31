import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { generatePromoHtml } from "./templates/promo-section.ts"
import { generateAdminEmail } from "./templates/admin-notification.ts"
import { generateCustomerEmail } from "./templates/customer-confirmation.ts"

const RESEND_API_KEY = 're_eHfq1MYG_BsYiVUPrXG96aMZNuXmHUEc7';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { record } = await req.json()

        // Initialize Supabase Client to fetch promo settings
        const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // Fetch sponsors (up to 3)
        const { data: sponsors, error: sponsorsError } = await supabase
            .from('sponsors')
            .select('*')
            .eq('is_active', true)
            .limit(3);

        if (sponsorsError) {
            console.error("Error fetching sponsors:", sponsorsError);
        }

        // Generate Promo HTML
        const promoHtml = generatePromoHtml(sponsors || []);

        // 1. Admin Notification (No Promo)
        const adminEmailReq = fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'The Berman <onboarding@resend.dev>',
                to: ['hello@theberman.eu'],
                subject: `New Lead: ${record.name}`,
                html: generateAdminEmail(record, sponsors || [], promoHtml)
            })
        });

        // 2. Customer Confirmation Email (Details + Promo)
        const customerEmailReq = fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${RESEND_API_KEY}`
            },
            body: JSON.stringify({
                from: 'The Berman <onboarding@resend.dev>',
                to: [record.email],
                subject: `Confirmation: We've received your inquiry`,
                html: generateCustomerEmail(record, promoHtml)
            })
        });

        const [adminRes, customerRes] = await Promise.all([adminEmailReq, customerEmailReq]);

        const adminData = await adminRes.json();
        const customerData = await customerRes.json();

        console.log(`Emails processed for: ${record.email}. AdminID: ${adminData.id}, CustomerID: ${customerData.id}`);

        return new Response(
            JSON.stringify({ message: "Emails processed successfully" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
