import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

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

        // Fetch promo settings
        const { data: promo, error: promoError } = await supabase
            .from('promo_settings')
            .select('*')
            .eq('id', 1)
            .single();

        if (promoError) {
            console.error("Error fetching promo settings:", promoError);
        }

        // Prepare Promo HTML (for customer email only)
        let promoHtml = '';
        if (promo && promo.is_enabled) {
            promoHtml = `
            <div style="background-color: #f9fafb; padding: 25px; text-align: center; border-radius: 8px; margin-top: 30px; border: 1px solid #f3f4f6;">
                <h3 style="margin: 0 0 8px 0; color: #111827; font-size: 18px; font-weight: bold; font-family: Arial, sans-serif;">${promo.headline}</h3>
                <p style="margin: 0 0 16px 0; color: #6b7280; font-size: 14px; font-family: Arial, sans-serif;">${promo.sub_text}</p>
                <a href="${promo.destination_url}" target="_blank" style="display: inline-block; text-decoration: none;">
                    ${promo.image_url ? `<img src="${promo.image_url}" alt="Partner Offer" style="max-width: 100%; height: auto; border-radius: 6px; display: block; border: none;" />` : `<span style="background: #007F00; color: white; padding: 10px 20px; border-radius: 6px; font-size: 14px;">View Offer</span>`}
                </a>
            </div>
            `;
        }

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
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">New Lead Received</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                      <p style="font-size: 16px;">You have received a new inquiry from <strong>The Berman</strong> website.</p>

                      <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Name:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.name}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Email:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">
                            <a href="mailto:${record.email}" style="color: #007F00; text-decoration: none;">${record.email}</a>
                          </td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Phone:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.phone}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Location:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.town}, ${record.county}</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Type:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.property_type} (${record.purpose})</td>
                        </tr>
                        <tr>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Message:</td>
                          <td style="padding: 10px; border-bottom: 1px solid #eee; line-height: 1.5;">${record.message}</td>
                        </tr>
                      </table>

                      <div style="margin-top: 20px; background-color: #f3f4f6; padding: 10px; border-radius: 6px; font-size: 12px; color: #666;">
                         <strong>System Note:</strong> ${promo && promo.is_enabled ? '✅ Customer received Partner Promo.' : '❌ Partner Promo is disabled or not found.'}
                      </div>

                      <div style="margin-top: 30px; text-align: center;">
                        <a href="https://theberman.eu/admin" style="background-color: #9ACD32; color: #004d00; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">View in Admin Panel</a>
                      </div>
                    </div>
                    <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
                      &copy; 2026 The Berman. All rights reserved.
                    </div>
                  </div>
                `
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
                html: `
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
                    <div style="background-color: #007F00; padding: 20px; text-align: center;">
                      <h1 style="color: white; margin: 0; font-size: 24px;">Thanks for contacting us!</h1>
                    </div>
                    <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
                      <p style="font-size: 16px; line-height: 1.6;">Hi <strong>${record.name}</strong>,</p>
                      <p style="font-size: 16px; line-height: 1.6;">We've received your details for a BER assessment in <strong>${record.town}</strong>. One of our team members will review your request and get back to you with a quote shortly.</p>

                      <div style="background-color: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #eee;">
                        <h4 style="margin: 0 0 10px 0; color: #555; font-size: 14px; text-transform: uppercase;">Your Details:</h4>
                        <p style="margin: 0; font-size: 14px; color: #777;"><strong>Phone:</strong> ${record.phone}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;"><strong>Type:</strong> ${record.property_type}</p>
                        <p style="margin: 5px 0 0 0; font-size: 14px; color: #777;"><strong>Purpose:</strong> ${record.purpose}</p>
                      </div>

                      <p style="font-size: 16px; line-height: 1.6;">If you have any urgent questions, feel free to reply to this email.</p>

                      ${promoHtml}

                    </div>
                    <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
                      &copy; 2026 The Berman. All rights reserved.
                    </div>
                  </div>
                `
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
