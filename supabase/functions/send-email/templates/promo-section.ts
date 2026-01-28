
export const generatePromoHtml = (promo: any) => {
    if (!promo || !promo.is_enabled) return '';

    return `
            <div style="background-color: #f2f2f2; padding: 30px 20px; text-align: center; border-radius: 4px; margin-top: 30px; border: 1px solid #e5e5e5;">
                <h3 style="margin: 0 0 10px 0; color: #333333; font-size: 16px; font-weight: bold; font-family: Arial, sans-serif;">${promo.headline}</h3>

                <p style="margin: 0 0 5px 0; color: #333333; font-size: 14px; font-family: Arial, sans-serif; font-weight: bold;">
                    ${promo.sub_text} at
                </p>

                <p style="margin: 0 0 20px 0;">
                    <a href="${promo.destination_url}" target="_blank" style="color: #0066cc; text-decoration: underline; font-weight: bold; font-size: 15px; font-family: Arial, sans-serif;">
                         ${promo.destination_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    </a>
                </p>

                <a href="${promo.destination_url}" target="_blank" style="display: inline-block; text-decoration: none;">
                    ${promo.image_url ? `<img src="${promo.image_url}" alt="Partner Offer" style="max-width: 200px; height: auto; display: block; margin: 0 auto;" />` : `<span style="background: #007F00; color: white; padding: 10px 20px; border-radius: 6px; font-size: 14px;">View Offer</span>`}
                </a>
            </div>
    `;
};
