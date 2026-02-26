export const generateHomeownerQuoteEmail = (customerName: string, websiteUrl: string = "https://theberman.eu", promoHtml: string = "") => {
    const dashboardUrl = `${websiteUrl}/dashboard/user`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #eee; }
        .header { background-color: #58a25c; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 32px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; color: #333; }
        .message { font-size: 16px; color: #555; margin-bottom: 25px; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #58a25c; color: white !important; padding: 16px 45px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px; display: inline-block; }
        .footer { padding: 30px; border-top: 1px solid #eee; font-size: 14px; color: #888; background-color: #ffffff; }
        .guarantee { font-size: 13px; color: #666; margin-top: 30px; line-height: 1.4; border-top: 1px solid #eee; padding-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>New BER Quote</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${customerName},</div>
            <div class="message">
                Good news! You've received a new quote from your local BER Assessor.
            </div>
            <div class="message">
                Quotes include all applicable SEAI fees. This is the total price you will pay - no surprises!
            </div>
            <div class="button-container">
                <a href="${dashboardUrl}" class="button">View Quote</a>
            </div>
            <div class="message">
                You can instantly confirm your booking online by accepting a quote and paying a small booking deposit.
            </div>
            <div class="guarantee">
                We also offer a <strong>100% NO-RISK MONEY-BACK GUARANTEE!</strong> If for any reason you wish to cancel before the assessor visits your home, we will refund your deposit in full, no questions asked.
            </div>
        </div>
        <div class="footer">
            ${promoHtml}
            <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #aaa;">
                &copy; ${new Date().getFullYear()} TheBerman. All rights reserved.
            </div>
        </div>
    </div>
</body>
</html>
    `.trim();
};
