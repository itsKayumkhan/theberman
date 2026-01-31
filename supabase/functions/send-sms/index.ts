import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { phone, message } = await req.json()

        if (!phone || !message) {
            throw new Error("Phone and message are required")
        }

        // Generic Logging (Mock Provider)
        console.log(`[SMS SERVICE] Sending to ${phone}: ${message}`);

        // Placeholder for Twilio/ClickSend Integration
        // const accountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        // const authToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        // ... implementation ...

        return new Response(
            JSON.stringify({ success: true, message: "SMS logged successfully (Mock Mode)" }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (error: any) {
        return new Response(
            JSON.stringify({ error: error.message || 'Unknown error' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
