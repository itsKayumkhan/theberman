
export const generateBusinessEmail = (record: any, businessName: string) => {
    return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
      <div style="background-color: #1b6cb5; padding: 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">New Enquiry for ${businessName}</h1>
      </div>
      <div style="padding: 20px; border: 1px solid #ddd; border-top: none;">
        <p style="font-size: 16px;">Hello <strong>${businessName}</strong>,</p>
        <p style="font-size: 16px;">You have received a new enquiry from a potential customer via your listing on <strong>The Berman Catalogue</strong>.</p>

        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; width: 120px;">Customer Name:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.name}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Email:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">
              <a href="mailto:${record.email}" style="color: #1b6cb5; text-decoration: none;">${record.email}</a>
            </td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Customer Phone:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee;">${record.phone || 'Not provided'}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold; vertical-align: top;">Message:</td>
            <td style="padding: 10px; border-bottom: 1px solid #eee; line-height: 1.5;">${record.message || 'No message provided.'}</td>
          </tr>
        </table>

        <div style="margin-top: 30px; text-align: center;">
          <a href="mailto:${record.email}" style="background-color: #1b6cb5; color: white; padding: 12px 24px; text-decoration: none; font-weight: bold; border-radius: 4px; display: inline-block;">Reply to Customer</a>
        </div>
      </div>
      <div style="text-align: center; padding: 10px; font-size: 12px; color: #999;">
        &copy; 2026 The Berman. All rights reserved. <br/>
        <a href="https://theberman.eu" style="color: #1b6cb5; text-decoration: none;">theberman.eu</a>
      </div>
    </div>
  `;
};
