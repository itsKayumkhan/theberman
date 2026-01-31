export const generateContractorEmail = (customerCounty: string, customerTown: string, contractorName: string, promoHtml: string, websiteUrl: string = "https://theberman.eu") => {
    const locationStr = `${customerTown}${customerTown && customerCounty ? ', ' : ''}${customerCounty}`;
    const dashboardUrl = `${websiteUrl}/dashboard/contractor`;

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; border: 1px solid #eee; }
        .header { background-color: #007F00; color: white; padding: 40px 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .greeting { font-size: 18px; font-weight: bold; margin-bottom: 20px; }
        .message { font-size: 16px; color: #555; margin-bottom: 30px; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #55a355; color: white !important; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 18px; display: inline-block; }
        .footer { padding: 30px; border-top: 1px solid #eee; font-size: 14px; color: #888; }
        .promo-container { margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${locationStr}</h1>
        </div>
        <div class="content">
            <div class="greeting">Hi ${contractorName},</div>
            <div class="message">
                A client in <strong>${locationStr}</strong> is looking for a BER Certificate.
            </div>
            <div class="button-container">
                <a href="${dashboardUrl}" class="button">Quote Now</a>
            </div>
            <div class="message">
                Best Regards,<br>
                TheBerman Team
            </div>
        </div>
        <div class="footer">
            ${promoHtml}
        </div>
    </div>
</body>
</html>
    `.trim();
};
