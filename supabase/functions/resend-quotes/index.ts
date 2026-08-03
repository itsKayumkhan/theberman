// @ts-nocheck
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CustomSmtpClient } from "../shared/smtp.ts";
import { getTenantConfig } from "../shared/tenant.ts";
import { generatePromoHtml } from "../send-quote-notification/templates/promo-section.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function generateQuotesSummaryEmail(
    customerName: string,
    quotes: any[],
    websiteUrl: string,
    promoHtml: string,
    tenant: string,
    displayName: string,
    logoUrl: string,
    propertyAddress: string,
) {
    const isSpanish = tenant === 'spain';
    const isPortuguese = tenant === 'portugal';
    const isFrench = tenant === 'france';
    const brandName = displayName;
    const dashboardUrl = `${websiteUrl}/dashboard/user`;
    const currency = tenant === 'england' ? '£' : '€';

    const quotesHtml = quotes.map((q, i) => {
        const contractorName = q.contractor?.full_name || 'Assessor';
        const companyName = q.contractor?.company_name || '';
        const seaiNumber = q.contractor?.seai_number || '';
        const date = new Date(q.created_at).toLocaleDateString('en-GB');
        return `
        <div style="background-color: #f9fff9; border: 1px solid #d4edda; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <div>
                    <strong style="font-size: 16px; color: #1a1a1a;">${contractorName}</strong>
                    ${companyName ? `<br><span style="font-size: 13px; color: #666;">${companyName}</span>` : ''}
                    ${seaiNumber ? `<br><span style="font-size: 12px; color: #999;">Reg: ${seaiNumber}</span>` : ''}
                </div>
                <div style="text-align: right;">
                    <span style="font-size: 24px; font-weight: 800; color: #007F00;">${currency}${q.price}</span>
                    <br><span style="font-size: 11px; color: #999;">${date}</span>
                </div>
            </div>
            ${q.notes ? `<p style="font-size: 14px; color: #555; margin: 8px 0 0 0; font-style: italic;">${q.notes}</p>` : ''}
        </div>`;
    }).join('');

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f7f4;">
    <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="background-color: #007F00; color: white; padding: 40px 20px; text-align: center;">
            <img src="${logoUrl}" alt="${brandName}" style="height: 35px; margin-bottom: 15px; filter: brightness(0) invert(1);">
            <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">
                ${isSpanish ? 'Tus Presupuestos' : isPortuguese ? 'Os Seus Orçamentos' : isFrench ? 'Vos Devis DPE' : 'Your BER Quotes'}
            </h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">${propertyAddress}</p>
        </div>

        <div style="padding: 40px 30px;">
            <p style="font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #1a1a1a;">
                ${isSpanish ? 'Hola' : isPortuguese ? 'Olá' : isFrench ? 'Bonjour' : 'Hi'} ${customerName},
            </p>
            <p style="font-size: 16px; color: #444; margin-bottom: 25px;">
                ${isSpanish ? `Has recibido ${quotes.length} presupuestos para tu propiedad. Compáralos a continuación y elige el que mejor se adapte a tus necesidades.`
                : isPortuguese ? `Recebeu ${quotes.length} orçamentos para o seu imóvel. Compare-os abaixo e escolha o que melhor se adapta às suas necessidades.`
                : isFrench ? `Vous avez reçu ${quotes.length} devis pour votre propriété. Comparez-les ci-dessous et choisissez celui qui correspond le mieux à vos besoins.`
                : `You've received ${quotes.length} quotes for your property. Compare them below and choose the one that best suits your needs.`}
            </p>

            ${quotesHtml}

            <div style="text-align: center; margin: 40px 0;">
                <a href="${dashboardUrl}" style="background-color: #007F00; color: #ffffff !important; padding: 18px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 18px; display: inline-block; box-shadow: 0 4px 12px rgba(0,127,0,0.2);">
                    ${isSpanish ? 'Revisar y Aceptar Presupuesto' : isPortuguese ? 'Rever e Aceitar Orçamento' : isFrench ? 'Réviser et Accepter le Devis' : 'Review & Accept Quote'}
                </a>
            </div>

            <p style="font-size: 15px; color: #555; margin-bottom: 25px;">
                ${isSpanish ? 'Puedes confirmar tu reserva al instante aceptando el presupuesto online. Un pequeño depósito asegura tu plaza.'
                : isPortuguese ? 'Pode confirmar a sua reserva instantaneamente aceitando o orçamento online. Um pequeno depósito garante o seu lugar.'
                : isFrench ? 'Vous pouvez confirmer votre réservation instantanément en acceptant le devis en ligne. Un petit dépôt garantit votre place.'
                : 'You can instantly confirm your booking by accepting the quote online. A small deposit secures your spot.'}
            </p>
        </div>

        <div style="padding: 30px; background-color: #fafafa; border-top: 1px solid #eee;">
            ${promoHtml}
            <div style="margin-top: 25px; text-align: center; font-size: 12px; color: #999;">
                &copy; ${new Date().getFullYear()} ${brandName}. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>`.trim();
}

Deno.serve(async (req: Request) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    const responseHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

    try {
        const { assessmentId, tenant = 'ireland' } = await req.json();

        if (!assessmentId) {
            return new Response(JSON.stringify({ success: false, error: 'assessmentId is required' }), { status: 400, headers: responseHeaders });
        }

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

        const config = await getTenantConfig(supabase, tenant);
        const websiteUrl = config.website_url;
        const logoUrl = config.logo_url;
        const smtpFrom = config.smtp_from || `${config.display_name} <${config.smtp_username}>`;

        // 1. Fetch assessment
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('contact_name, contact_email, contact_phone, property_address, town, county')
            .eq('id', assessmentId)
            .eq('tenant', tenant)
            .single();

        if (assessmentError || !assessment) {
            throw new Error(`Failed to fetch assessment: ${assessmentError?.message}`);
        }

        // 2. Fetch all quotes with contractor details
        const { data: quotes, error: quotesError } = await supabase
            .from('quotes')
            .select(`
                id, price, notes, created_at, status,
                contractor:profiles!quotes_created_by_profile_fkey(full_name, company_name, seai_number, email, phone)
            `)
            .eq('assessment_id', assessmentId)
            .order('price', { ascending: true });

        if (quotesError) throw quotesError;

        if (!quotes || quotes.length === 0) {
            return new Response(JSON.stringify({ success: false, error: 'No quotes found for this assessment' }), { status: 400, headers: responseHeaders });
        }

        // 3. Send email with all quotes
        const smtpHostname = config.smtp_hostname;
        const smtpPort = config.smtp_port;
        const smtpUsername = config.smtp_username;
        const smtpPassword = config.smtp_password;

        if (!smtpHostname || !smtpUsername || !smtpPassword) {
            return new Response(JSON.stringify({ success: false, error: 'SMTP Secrets missing' }), { status: 500, headers: responseHeaders });
        }

        const { data: sponsors } = await supabase.from('sponsors').select('*').eq('is_active', true).eq('tenant', tenant).limit(3);
        const promoHtml = generatePromoHtml(sponsors || []);

        const isSpanish = tenant === 'spain';
        const isPortuguese = tenant === 'portugal';
        const isFrench = tenant === 'france';
        const propertyAddress = assessment.property_address || `${assessment.town || ''}, ${assessment.county || ''}`;

        const emailHtml = generateQuotesSummaryEmail(
            assessment.contact_name,
            quotes,
            websiteUrl,
            promoHtml,
            tenant,
            config.display_name,
            logoUrl,
            propertyAddress,
        );

        const client = new CustomSmtpClient(config.domain);
        try {
            await client.connect(smtpHostname, smtpPort);
            await client.authenticate(smtpUsername, smtpPassword);

            const subject = isSpanish
                ? `Tus ${quotes.length} presupuestos para ${propertyAddress}`
                : isPortuguese
                    ? `Os seus ${quotes.length} orçamentos para ${propertyAddress}`
                    : isFrench
                        ? `Vos ${quotes.length} devis pour ${propertyAddress}`
                        : `Your ${quotes.length} BER quotes for ${propertyAddress}`;

            await client.send(smtpFrom, assessment.contact_email, subject, emailHtml);
            await client.close();
        } catch (smtpErr) {
            console.error('[resend-quotes] SMTP error:', smtpErr);
            return new Response(JSON.stringify({ success: false, error: 'SMTP failed', details: smtpErr?.message }), { status: 500, headers: responseHeaders });
        }

        // 4. Update notification_status to 'sent' for all quotes
        const quoteIds = quotes.map(q => q.id);
        await supabase
            .from('quotes')
            .update({ notification_status: 'sent' })
            .in('id', quoteIds);

        console.log(`[resend-quotes] SUCCESS: Sent ${quotes.length} quotes to ${assessment.contact_email}`);

        return new Response(JSON.stringify({
            success: true,
            message: `Sent ${quotes.length} quotes to ${assessment.contact_email}`,
            quotesCount: quotes.length,
        }), { headers: responseHeaders });

    } catch (err: any) {
        console.error('[resend-quotes] Error:', err);
        return new Response(JSON.stringify({ success: false, error: err?.message || 'Internal error' }), { status: 500, headers: responseHeaders });
    }
});
