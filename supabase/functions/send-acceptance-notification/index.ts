/// <reference lib="deno.ns" />
// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { generateHomeownerAcceptanceEmail } from "./templates/homeowner-acceptance.ts";
import { generateContractorBookingEmail } from "./templates/contractor-booking.ts";
import { generatePromoHtml } from "./templates/promo-section.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { assessmentId, quoteId } = await req.json();

        if (!assessmentId || !quoteId) {
            throw new Error("assessmentId and quoteId are required");
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        // 1. Fetch Data
        // a) Assessment & Profiles (Homeowner)
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, property_address')
            .eq('id', assessmentId)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        // b) Quote & Contractor Profile
        const { data: quote, error: quoteError } = await supabase
            .from('quotes')
            .select('price, created_by, profiles!quotes_created_by_fkey(full_name, email)')
            .eq('id', quoteId)
            .single();

        if (quoteError || !quote) {
            throw new Error(`Failed to fetch quote: ${quoteError?.message}`);
        }

        const contractor = quote.profiles;

        // c) Sponsors for Promo
        const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).limit(3);
        const promoHtml = generatePromoHtml(sponsors || []);

        const smtpHostname = Deno.env.get('SMTP_HOSTNAME');
        const smtpPortStr = Deno.env.get('SMTP_PORT');
        const smtpUsername = Deno.env.get('SMTP_USERNAME');
        const smtpPassword = Deno.env.get('SMTP_PASSWORD');
        const smtpFromEnv = Deno.env.get('SMTP_FROM') || 'no-reply@theberman.eu';
        const smtpFrom = smtpFromEnv.includes('<') ? smtpFromEnv : `Theberman.eu <${smtpFromEnv}>`;
        const websiteUrl = Deno.env.get('PUBLIC_WEBSITE_URL') || 'https://theberman.eu';

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            return new Response(JSON.stringify({ success: false, message: 'SMTP Secrets missing' }), { headers: responseHeaders });
        }

        const smtpPort = parseInt(smtpPortStr || '587');
        const client = new CustomSmtpClient();

        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            // 2. Notify Homeowner
            const homeownerHtml = generateHomeownerAcceptanceEmail(
                assessment.contact_name,
                contractor.full_name,
                quote.price,
                websiteUrl,
                promoHtml
            );
            await client.send(smtpFrom, assessment.contact_email, 'Booking Confirmed - TheBerman.eu', homeownerHtml);

            // 3. Notify Contractor
            const contractorHtml = generateContractorBookingEmail(
                contractor.full_name,
                assessment.contact_name,
                assessment.property_address,
                quote.price,
                websiteUrl,
                promoHtml
            );
            await client.send(smtpFrom, contractor.email, 'New Booking Confirmed!', contractorHtml);

            await client.close();
            return new Response(JSON.stringify({ success: true, message: 'Acceptance notifications sent' }), { headers: responseHeaders });

        } catch (smtpErr: any) {
            console.error("[SMTP ERROR]", smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP Failed', details: smtpErr?.message }), { headers: responseHeaders });
        }

    } catch (err: any) {
        console.error("[GLOBAL ERROR]", err);
        return new Response(JSON.stringify({ success: false, error: 'Internal Error', details: err?.message }), { headers: responseHeaders });
    }
});
