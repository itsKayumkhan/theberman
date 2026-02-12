/// <reference lib="deno.ns" />
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { generateBusinessEmail } from "./templates/business-notification.ts"
import { generateCustomerConfirmationEmail } from "./templates/customer-confirmation.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

class CustomSmtpClient {
    private conn: Deno.Conn | null = null;
    private reader: ReadableStreamDefaultReader<Uint8Array> | null = null;
    private encoder = new TextEncoder();
    private decoder = new TextDecoder();

    async connect(hostname: string, port: number) {
        console.log(`[SMTP] Connecting to ${hostname}:${port}...`);
        this.conn = await Deno.connect({ hostname, port });
        this.reader = this.conn.readable.getReader();
        await this.readResponse();

        await this.command("EHLO localhost");

        if (port !== 465) {
            console.log("[SMTP] Issuing STARTTLS...");
            await this.command("STARTTLS");
            if (this.reader) this.reader.releaseLock();
            if (!this.conn) throw new Error("Connection lost during STARTTLS");
            const tlsConn = await Deno.startTls(this.conn, { hostname });
            this.conn = tlsConn;
            this.reader = this.conn.readable.getReader();
            await this.command("EHLO localhost");
        }
    }

    async authenticate(user: string, pass: string) {
        await this.command("AUTH LOGIN");
        await this.command(btoa(user));
        await this.command(btoa(pass));
    }

    async send(from: string, to: string, subject: string, html: string) {
        await this.command(`MAIL FROM:<${from}>`);
        await this.command(`RCPT TO:<${to}>`);
        await this.command("DATA");

        const message = [
            `From: ${from}`,
            `To: ${to}`,
            `Subject: ${subject}`,
            `Content-Type: text/html; charset=UTF-8`,
            `MIME-Version: 1.0`,
            "",
            html,
            "\r\n."
        ].join("\r\n");

        await this.command(message);
    }

    async close() {
        if (this.conn) {
            try { await this.command("QUIT"); } catch (e) { }
            this.conn.close();
        }
    }

    private async command(cmd: string) {
        await this.conn!.write(this.encoder.encode(cmd + "\r\n"));
        return await this.readResponse();
    }

    private async readResponse() {
        const { value } = await this.reader!.read();
        if (!value) throw new Error("No response from server");
        const response = this.decoder.decode(value);
        if (response.startsWith("4") || response.startsWith("5")) {
            throw new Error(`SMTP Error: ${response}`);
        }
        return response;
    }
}

Deno.serve(async (req: Request) => {
    console.log(`[Edge Function] Request received: ${req.method}`);

    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("[Edge Function] Parsing JSON body...");
        const jsonBody = await req.json();
        console.log("[Edge Function] JSON body parsed.");
        const { record, businessEmail, businessName } = jsonBody;

        if (!record || !businessEmail) {
            console.error("[Edge Function] Missing required fields in body:", { hasRecord: !!record, hasEmail: !!businessEmail });
            throw new Error("Missing required fields: record or businessEmail");
        }

        console.log("[Edge Function] Loading environment variables...");
        // Initialize Supabase client to match environment of working function
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME')
        const smtpPort = parseInt(Deno.env.get('SMTP_PORT') || '587')
        const smtpUsername = Deno.env.get('SMTP_USERNAME')
        const smtpPassword = Deno.env.get('SMTP_PASSWORD')
        // Use SMTP_FROM or fallback to username (email)
        const smtpFrom = Deno.env.get('SMTP_FROM') || smtpUsername

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            console.error("[Edge Function] SMTP Configuration Missing!", {
                hasHost: !!smtpHostname,
                hasUser: !!smtpUsername,
                hasPass: !!smtpPassword
            });
            throw new Error('SMTP configuration missing in Edge Function Environment');
        }
        console.log(`[Edge Function] SMTP Config loaded. Host: ${smtpHostname}, Port: ${smtpPort}, User: ${smtpUsername}, From: ${smtpFrom}`);

        console.log("[Edge Function] Initializing SMTP Client...");
        const client = new CustomSmtpClient()

        console.log("[Edge Function] Connecting to SMTP server...");
        await client.connect(smtpHostname, smtpPort)
        console.log("[Edge Function] Connected to SMTP server.");

        console.log("[Edge Function] Authenticating...");
        await client.authenticate(smtpUsername, smtpPassword)
        console.log("[Edge Function] Authenticated.");

        // 1. Send notification to the business
        console.log(`[Edge Function] Sending email to business: ${businessEmail}`);
        const businessHtml = generateBusinessEmail(record, businessName || 'Service Provider')
        await client.send(smtpFrom!, businessEmail, `New Enquiry: ${record.name}`, businessHtml)
        console.log("[Edge Function] Business email sent.");

        // 2. Send confirmation to the customer
        console.log(`[Edge Function] Sending confirmation to customer: ${record.email}`);
        const customerHtml = generateCustomerConfirmationEmail(record, businessName || 'Service Provider')
        await client.send(smtpFrom!, record.email, `Enquiry Confirmation: ${businessName || 'Service Provider'}`, customerHtml)
        console.log("[Edge Function] Customer email sent.");

        await client.close()
        console.log("[Edge Function] SMTP Connection closed.");

        return new Response(
            JSON.stringify({ success: true, message: 'Enquiry sent successfully via SMTP' }),
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    } catch (err: any) {
        console.error("[GLOBAL ERROR CAUGHT]", err);
        return new Response(
            JSON.stringify({ success: false, error: 'Internal Error', details: err?.message, stack: err?.stack }),
            // Return 200 even on error to ensure client sees the body (so we can debug it)
            { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
        )
    }
})
