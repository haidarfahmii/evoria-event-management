// backend/src/utils/email-templates.util.ts

export const emailTemplates = {
  welcomeEmail: (data: { userName: string; verificationLink: string }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Evoria!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.userName},</h2>
          <p>Thank you for joining Evoria!</p>
          <p>Please verify your email address:</p>
          <a href="${data.verificationLink}" class="button">Verify My Email</a>
          <p><small>Link expires in 24 hours</small></p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Evoria. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `,

  transactionAccepted: (data: {
    userName: string;
    eventName: string;
    transactionId: string;
    qty: number;
    eventDate: string;
    venue: string;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .success { background: #d4edda; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0; }
        .ticket-info { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; border: 2px dashed #667eea; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Payment Confirmed!</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.userName},</h2>
          <div class="success">
            <p><strong>✅ Your payment has been accepted!</strong></p>
          </div>
          <div class="ticket-info">
            <h3>🎫 Your Ticket Details:</h3>
            <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
            <p><strong>Event:</strong> ${data.eventName}</p>
            <p><strong>Quantity:</strong> ${data.qty} ticket(s)</p>
            <p><strong>Date:</strong> ${data.eventDate}</p>
            <p><strong>Venue:</strong> ${data.venue}</p>
          </div>
          <p>See you at the event! 🎊</p>
        </div>
      </div>
    </body>
    </html>
  `,

  transactionRejected: (data: {
    userName: string;
    eventName: string;
    transactionId: string;
    reason?: string;
    pointsRestored: number;
    couponRestored?: string;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Transaction Rejected</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.userName},</h2>
          <p>Your transaction has been rejected by the organizer.</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Event:</strong> ${data.eventName}</p>
          ${data.reason ? `<p><strong>Reason:</strong> ${data.reason}</p>` : ""}
          <div class="info">
            <h3>💰 Refund Information:</h3>
            <ul>
              ${
                data.pointsRestored > 0
                  ? `<li>${data.pointsRestored.toLocaleString(
                      "id-ID"
                    )} points restored</li>`
                  : ""
              }
              ${
                data.couponRestored
                  ? `<li>Coupon: ${data.couponRestored} restored</li>`
                  : ""
              }
              <li>Event seats released</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  transactionExpired: (data: {
    userName: string;
    eventName: string;
    transactionId: string;
    pointsRestored: number;
    couponRestored?: string;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #434343 0%, #000000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Transaction Expired</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.userName},</h2>
          <p>Your transaction expired (no payment proof uploaded within 2 hours).</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Event:</strong> ${data.eventName}</p>
          <div class="info">
            <h3>💰 Refund:</h3>
            <ul>
              ${
                data.pointsRestored > 0
                  ? `<li>${data.pointsRestored.toLocaleString(
                      "id-ID"
                    )} points restored</li>`
                  : ""
              }
              ${
                data.couponRestored
                  ? `<li>Coupon: ${data.couponRestored} restored</li>`
                  : ""
              }
              <li>Event seats released</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,

  transactionCancelled: (data: {
    userName: string;
    eventName: string;
    transactionId: string;
    pointsRestored: number;
    couponRestored?: string;
  }) => `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #434343 0%, #000000 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .info { background: #d1ecf1; border-left: 4px solid #0c5460; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Transaction Cancelled</h1>
        </div>
        <div class="content">
          <h2>Hi ${data.userName},</h2>
          <p>Transaction cancelled (organizer didn't respond within 3 days).</p>
          <p><strong>Transaction ID:</strong> ${data.transactionId}</p>
          <p><strong>Event:</strong> ${data.eventName}</p>
          <div class="info">
            <h3>💰 Full Refund:</h3>
            <ul>
              ${
                data.pointsRestored > 0
                  ? `<li>${data.pointsRestored.toLocaleString(
                      "id-ID"
                    )} points restored</li>`
                  : ""
              }
              ${
                data.couponRestored
                  ? `<li>Coupon: ${data.couponRestored} restored</li>`
                  : ""
              }
              <li>Event seats released</li>
            </ul>
          </div>
        </div>
      </div>
    </body>
    </html>
  `,
};
