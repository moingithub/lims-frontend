/**
 * Email Service
 * Handles email notifications for the LIMS system
 * 
 * NOTE: This is a mock implementation for demonstration purposes.
 * In production, this would integrate with a real email service like:
 * - SendGrid
 * - AWS SES
 * - Mailgun
 * - Your own SMTP server
 */

export interface EmailData {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export interface CheckOutEmailData {
  contactName: string;
  contactEmail: string;
  customerName: string;
  checkOutDate: string;
  cylinders: string[];
}

export const emailService = {
  /**
   * Send Check-Out Confirmation Email
   * Sends an email to the selected contact with all check-out details
   */
  sendCheckOutConfirmation: (data: CheckOutEmailData): boolean => {
    const { contactName, contactEmail, customerName, checkOutDate, cylinders } = data;

    // Generate HTML email body
    const htmlBody = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background-color: #f97316;
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #f9f9f9;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
    }
    .detail-row {
      margin: 15px 0;
      padding: 10px;
      background-color: white;
      border-radius: 4px;
    }
    .detail-label {
      font-weight: bold;
      color: #666;
      font-size: 14px;
    }
    .detail-value {
      font-size: 16px;
      margin-top: 5px;
    }
    .cylinder-list {
      background-color: white;
      padding: 15px;
      border-radius: 4px;
      margin-top: 10px;
    }
    .cylinder-item {
      padding: 8px;
      margin: 5px 0;
      background-color: #f0f0f0;
      border-left: 3px solid #f97316;
      border-radius: 3px;
    }
    .footer {
      margin-top: 20px;
      padding: 15px;
      background-color: #f0f0f0;
      border-radius: 0 0 8px 8px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
    .success-badge {
      display: inline-block;
      background-color: #22c55e;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      margin: 10px 0;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1 style="margin: 0;">Natty Gas Lab</h1>
      <p style="margin: 5px 0 0 0;">Cylinder Check-Out Confirmation</p>
    </div>
    
    <div class="content">
      <div class="success-badge">✓ Check-Out Completed Successfully</div>
      
      <div class="detail-row">
        <div class="detail-label">Company</div>
        <div class="detail-value">${customerName}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Contact Person</div>
        <div class="detail-value">${contactName}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Email</div>
        <div class="detail-value">${contactEmail}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Check-Out Date</div>
        <div class="detail-value">${checkOutDate}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Number of Cylinders</div>
        <div class="detail-value">${cylinders.length}</div>
      </div>
      
      <div class="detail-row">
        <div class="detail-label">Checked Out Cylinders</div>
        <div class="cylinder-list">
          ${cylinders.map(cylinder => `<div class="cylinder-item">${cylinder}</div>`).join('')}
        </div>
      </div>
    </div>
    
    <div class="footer">
      <p><strong>Natty Gas Lab</strong></p>
      <p>This is an automated email notification. Please do not reply to this email.</p>
      <p>If you have any questions, please contact your laboratory representative.</p>
    </div>
  </div>
</body>
</html>
    `;

    // Generate plain text version
    const textBody = `
NATTY GAS LAB - CYLINDER CHECK-OUT CONFIRMATION

Check-Out Completed Successfully!

Company: ${customerName}
Contact Person: ${contactName}
Email: ${contactEmail}
Check-Out Date: ${checkOutDate}
Number of Cylinders: ${cylinders.length}

Checked Out Cylinders:
${cylinders.map((cylinder, index) => `${index + 1}. ${cylinder}`).join('\n')}

---
Natty Gas Lab
This is an automated email notification.
    `.trim();

    const emailData: EmailData = {
      to: contactEmail,
      subject: `Cylinder Check-Out Confirmation - ${customerName} - ${checkOutDate}`,
      htmlBody,
      textBody,
    };

    // Mock email sending - in production, this would call a real email service
    console.log("=== EMAIL SENT ===");
    console.log("To:", emailData.to);
    console.log("Subject:", emailData.subject);
    console.log("HTML Body Length:", emailData.htmlBody.length);
    console.log("==================");

    // Simulate successful email send
    return true;
  },

  /**
   * Generic email sending function
   * Can be used for other types of emails in the future
   */
  sendEmail: (emailData: EmailData): boolean => {
    // Mock implementation
    console.log("=== EMAIL SENT ===");
    console.log("To:", emailData.to);
    console.log("Subject:", emailData.subject);
    console.log("==================");
    
    return true;
  },
};
