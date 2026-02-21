/// <reference lib="deno.ns" />
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { generateOnboardingHtml } from "./templates/onboarding-template.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { fullName, email, town, onboardingUrl } = await req.json();

        if (!email || !fullName) {
            throw new Error("Missing recipient details");
        }

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
        const smtpUsername = Deno.env.get('SMTP_USERNAME')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `Theberman.eu <${smtpFromEnv}>`;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            throw new Error('SMTP configuration missing in environment');
        }

        const client = new CustomSmtpClient()
        await client.connect(smtpHostname, smtpPort)
        await client.authenticate(smtpUsername, smtpPassword)

        const html = generateOnboardingHtml(fullName, town || '', onboardingUrl)
        await client.send(smtpFrom!, email, `Important: Complete your Berman Home Energy Registration`, html)

        await client.close()
        console.log(`[send-onboarding-link] SUCCESS: Onboarding email sent to ${email}`);

        return new Response(
            JSON.stringify({ success: true, message: 'Email sent successfully' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[send-onboarding-link] GLOBAL ERROR", err);
        return new Response(
            JSON.stringify({ success: false, error: err?.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
