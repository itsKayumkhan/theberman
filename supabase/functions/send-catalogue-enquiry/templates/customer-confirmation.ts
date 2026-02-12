
export const generateCustomerConfirmationEmail = (record: any, businessName: string) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-bottom: 3px solid #1b6cb5;">
        <h1 style="color: #333; margin: 0; font-size: 24px;">Message Sent Successfully</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 16px;">Hello <strong>${record.name}</strong>,</p>
        <p style="font-size: 16px;">Your message has been successfully sent to <strong>${businessName}</strong> via The Berman Catalogue.</p>
        
        <div style="background-color: #f1f7fd; padding: 15px; border-radius: 4px; margin: 20px 0;">
          <p style="margin: 0; font-size: 14px; color: #555;"><strong>Your Message:</strong></p>
          <p style="margin: 10px 0 0 0; font-style: italic; color: #666;">"${record.message || 'No message provided.'}"</p>
        </div>

        <p style="font-size: 14px; color: #777;">The business will review your enquiry and get back to you directly at <strong>${record.email}</strong>.</p>
      </div>
      <div style="text-align: center; padding: 20px; font-size: 12px; color: #999;">
        &copy; 2026 The Berman. All rights reserved. <br/>
        <a href="https://theberman.eu" style="color: #1b6cb5; text-decoration: none;">theberman.eu</a>
      </div>
    </div>
  `;
};
