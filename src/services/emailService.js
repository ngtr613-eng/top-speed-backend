import nodemailer from 'nodemailer';

export const sendModificationRequestEmail = async (requestData) => {
  try {
    console.log('📧 Starting to send modification request email...');
    console.log('📧 SMTP User:', process.env.SMTP_USER ? '✓ Set' : '❌ Not set');
    console.log('📧 SMTP Pass:', process.env.SMTP_PASS ? '✓ Set' : '❌ Not set');
    console.log('📧 Team Email:', process.env.TEAM_EMAIL ? process.env.TEAM_EMAIL : '❌ Not set');

    // Create transporter using Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      throw new Error('SMTP connection failed: ' + verifyError.message);
    }

    // Selected modifications
    const selectedMods = Object.entries(requestData.modifications)
      .filter(([, value]) => value === true)
      .map(([key]) => {
        const modNames = {
          exhaust: 'Performance Exhaust System',
          engine: 'Engine Tuning & Optimization',
          brakes: 'Brake System Upgrade',
          carBody: 'Body Kit & Aerodynamics',
          colors: 'Custom Paint & Colors',
        };
        return modNames[key] || key;
      });

    // Create email HTML template
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0f0f0f; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); border: 2px solid #dc2626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 32px; font-weight: bold; letter-spacing: 1px; }
            .header p { margin: 8px 0 0 0; font-size: 15px; opacity: 0.95; font-weight: 500; }
            .content { padding: 40px; color: #e5e7eb; }
            .section { margin-bottom: 30px; }
            .section-title { font-size: 18px; font-weight: bold; color: #dc2626; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #dc2626; }
            .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #374151; }
            .info-label { color: #9ca3af; font-weight: 600; font-size: 14px; }
            .info-value { color: #f3f4f6; font-weight: 500; text-align: right; max-width: 60%; word-break: break-word; }
            .modifications { background-color: #1f2937; border-left: 4px solid #dc2626; padding: 20px; border-radius: 6px; }
            .mod-item { padding: 10px 0; color: #f3f4f6; display: flex; align-items: flex-start; font-weight: 500; }
            .mod-item:before { content: ""; display: inline-block; width: 8px; height: 8px; background-color: #dc2626; border-radius: 50%; margin-right: 12px; margin-top: 6px; flex-shrink: 0; }
            .footer { background-color: #1f2937; padding: 25px 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #374151; }
            .footer p { margin: 6px 0; }
            .footer-brand { font-size: 14px; font-weight: bold; color: #dc2626; margin-bottom: 8px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TOP SPEED</h1>
              <p>Car Modification Request</p>
            </div>

            <div class="content">
              <div class="section">
                <div class="section-title">Client Information</div>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${requestData.clientName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${requestData.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${requestData.phoneNumber}</span>
                </div>
                ${requestData.address ? `<div class="info-row">
                  <span class="info-label">Address:</span>
                  <span class="info-value">${requestData.address}</span>
                </div>` : ''}
              </div>

              <div class="section">
                <div class="section-title">Vehicle Details</div>
                <div class="info-row">
                  <span class="info-label">Car Model:</span>
                  <span class="info-value">${requestData.carType}</span>
                </div>
                ${requestData.maintenanceTime ? `<div class="info-row">
                  <span class="info-label">Estimated Duration:</span>
                  <span class="info-value">${requestData.maintenanceTime.replace(/_/g, ' ')}</span>
                </div>` : ''}
                ${requestData.desiredDay ? `<div class="info-row">
                  <span class="info-label">Preferred Date:</span>
                  <span class="info-value">${new Date(requestData.desiredDay).toLocaleDateString()}</span>
                </div>` : ''}
              </div>

              <div class="section">
                <div class="section-title">Selected Modifications</div>
                <div class="modifications">
                  ${selectedMods.map(mod => `<div class="mod-item">${mod}</div>`).join('')}
                </div>
              </div>

              <div class="section" style="margin-bottom: 0;">
                <p style="margin: 0; color: #9ca3af; font-size: 14px; line-height: 1.8;">
                  <strong style="color: #f3f4f6;">Action Required:</strong> Please review this modification request and contact the client promptly to discuss specifications, confirm the service timeline, and provide a detailed quote.
                </p>
              </div>
            </div>

            <div class="footer">
              <p class="footer-brand">TOP SPEED</p>
              <p>Premium Automotive Modification Services</p>
              <p style="margin-top: 10px; font-size: 11px; color: #6b7280;">Submitted: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create text version
    const textTemplate = `
TOP SPEED - CAR MODIFICATION REQUEST

CLIENT INFORMATION:
Name: ${requestData.clientName}
Phone: ${requestData.phoneNumber}
Email: ${requestData.email}

VEHICLE DETAILS:
Car Type/Model: ${requestData.carType}

SELECTED MODIFICATIONS:
${selectedMods.map(mod => `• ${mod}`).join('\n')}

---
This request was submitted on ${new Date().toLocaleString()}
    `;

    // Send email to admin
    console.log('📧 Sending email to admin:', process.env.TEAM_EMAIL || process.env.SMTP_USER);
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: process.env.TEAM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER,
      subject: `New Car Modification Request - ${requestData.clientName}`,
      text: textTemplate,
      html: htmlTemplate,
      replyTo: requestData.email,
    });
    console.log('✅ Admin email sent successfully');

    // Send confirmation email to client
    console.log('📧 Sending confirmation email to client:', requestData.email);
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: requestData.email,
      subject: 'TOP SPEED - Your Modification Request Received',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #0f0f0f; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); border: 2px solid #dc2626; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
              .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
              .content { padding: 40px; color: #e5e7eb; }
              .content p { margin: 12px 0; line-height: 1.6; font-size: 15px; }
              .content strong { color: #f3f4f6; }
              .content ul { margin: 12px 0; padding-left: 24px; }
              .content li { margin: 8px 0; }
              .highlight-box { background-color: #1f2937; border-left: 4px solid #dc2626; padding: 20px; border-radius: 6px; margin: 16px 0; }
              .highlight-box p { margin: 0; }
              .footer { background-color: #1f2937; padding: 25px 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #374151; }
              .footer p { margin: 6px 0; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Request Confirmed</h1>
              </div>
              <div class="content">
                <p>Dear ${requestData.clientName},</p>
                <p>Thank you for submitting your car modification request to TOP SPEED! We have received your information and will begin reviewing it right away.</p>
                
                <div class="highlight-box">
                  <p><strong style="font-size: 16px; color: #dc2626;">What Happens Next:</strong></p>
                  <ul style="margin: 12px 0; padding-left: 20px;">
                    <li>Our expert modification team will review your preferences</li>
                    <li>We'll contact you within 24 hours via phone or email</li>
                    <li>We'll provide a detailed modification plan and pricing quote</li>
                    <li>We'll schedule your service at a convenient time</li>
                  </ul>
                </div>

                <p><strong>Your Modification Details:</strong></p>
                <ul style="margin: 12px 0; padding-left: 20px;">
                  <li><strong>Vehicle:</strong> ${requestData.carType}</li>
                  ${requestData.maintenanceTime ? `<li><strong>Preferred Timeline:</strong> ${requestData.maintenanceTime.replace(/_/g, ' ')}</li>` : ''}
                  ${requestData.desiredDay ? `<li><strong>Scheduled For:</strong> ${new Date(requestData.desiredDay).toLocaleDateString()}</li>` : ''}
                </ul>

                <p>If you have any questions or would like to discuss your modifications further, please feel free to reach out to us directly.</p>
                
                <p style="margin-top: 24px;"><strong>Best regards,</strong><br><strong style="color: #dc2626; font-size: 16px;">TOP SPEED Team</strong><br>Professional Automotive Modifications</p>
              </div>
              <div class="footer">
                <p><strong>TOP SPEED</strong></p>
                <p>Premium Automotive Services</p>
                <p style="margin-top: 12px; font-size: 11px; color: #6b7280;">This is an automated confirmation email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log('✅ Client confirmation email sent successfully');

    return { success: true, message: 'Modification request sent successfully' };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
};

export const sendMaintenanceRequestEmail = async (requestData) => {
  try {
    console.log('📧 Starting to send maintenance request email...');
    console.log('📧 SMTP User:', process.env.SMTP_USER ? '✓ Set' : '❌ Not set');
    console.log('📧 SMTP Pass:', process.env.SMTP_PASS ? '✓ Set' : '❌ Not set');
    console.log('📧 Team Email:', process.env.TEAM_EMAIL ? process.env.TEAM_EMAIL : '❌ Not set');

    // Create transporter using Gmail SMTP configuration
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    // Verify transporter connection
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (verifyError) {
      console.error('❌ SMTP connection failed:', verifyError.message);
      throw new Error('SMTP connection failed: ' + verifyError.message);
    }

    // Create email HTML template for admin
    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; background-color: #0f0f0f; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); border: 2px solid #10b981; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.3); }
            .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; }
            .header p { margin: 5px 0 0 0; font-size: 14px; opacity: 0.9; }
            .content { padding: 30px; color: #e5e7eb; }
            .section { margin-bottom: 25px; }
            .section-title { font-size: 16px; font-weight: bold; color: #10b981; margin-bottom: 12px; border-bottom: 1px solid #374151; padding-bottom: 8px; }
            .info-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #1f2937; }
            .info-label { color: #9ca3af; font-weight: 600; }
            .info-value { color: #f3f4f6; text-align: right; }
            .issue-box { background-color: #1f2937; border-left: 4px solid #10b981; padding: 15px; border-radius: 4px; }
            .footer { background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #374151; }
            .footer p { margin: 5px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TOP SPEED</h1>
              <p>New Maintenance Service Request</p>
            </div>

            <div class="content">
              <div class="section">
                <div class="section-title">Client Information</div>
                <div class="info-row">
                  <span class="info-label">Name:</span>
                  <span class="info-value">${requestData.clientName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Phone:</span>
                  <span class="info-value">${requestData.phoneNumber}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Email:</span>
                  <span class="info-value">${requestData.email}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Address:</span>
                  <span class="info-value">${requestData.address}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Vehicle Information</div>
                <div class="info-row">
                  <span class="info-label">Car Type/Model:</span>
                  <span class="info-value">${requestData.carType}</span>
                </div>
              </div>

              <div class="section">
                <div class="section-title">Issue Description</div>
                <div class="issue-box">
                  <p style="margin: 0; color: #f3f4f6; font-weight: bold; margin-bottom: 8px;">${requestData.issueCategory}</p>
                  <p style="margin: 0; color: #d1d5db; font-size: 14px;">${requestData.issueDescription}</p>
                </div>
              </div>

              <div class="section">
                <p style="margin: 0; color: #9ca3af; font-size: 13px; line-height: 1.6;">
                  This is a new maintenance service request from a client. Please review the details above and contact the client at the provided phone number or email address to confirm service schedule and provide a quote.
                </p>
              </div>
            </div>

            <div class="footer">
              <p><strong>TOP SPEED - Premium Automotive Services</strong></p>
              <p>Service Request Management System</p>
              <p>Timestamp: ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Create text version
    const textTemplate = `
TOP SPEED - MAINTENANCE SERVICE REQUEST

CLIENT INFORMATION:
Name: ${requestData.clientName}
Phone: ${requestData.phoneNumber}
Email: ${requestData.email}
Address: ${requestData.address}

VEHICLE INFORMATION:
Car Type/Model: ${requestData.carType}

ISSUE DESCRIPTION:
Category: ${requestData.issueCategory}
Details: ${requestData.issueDescription}

---
This request was submitted on ${new Date().toLocaleString()}
    `;

    // Send email to admin
    console.log('📧 Sending email to admin:', process.env.TEAM_EMAIL || process.env.SMTP_USER);
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: process.env.TEAM_EMAIL || process.env.SMTP_USER || process.env.EMAIL_USER,
      subject: `New Maintenance Service Request - ${requestData.clientName}`,
      text: textTemplate,
      html: htmlTemplate,
      replyTo: requestData.email,
    });
    console.log('✅ Admin email sent successfully');

    // Send confirmation email to client
    console.log('📧 Sending confirmation email to client:', requestData.email);
    await transporter.sendMail({
      from: process.env.SMTP_USER || process.env.EMAIL_USER,
      to: requestData.email,
      subject: 'TOP SPEED - Your Maintenance Request Received',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; background-color: #0f0f0f; margin: 0; padding: 20px; }
              .container { max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); border: 2px solid #10b981; border-radius: 12px; overflow: hidden; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 20px; text-align: center; color: white; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { padding: 30px; color: #e5e7eb; }
              .footer { background-color: #1f2937; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Request Received</h1>
              </div>
              <div class="content">
                <p>Dear ${requestData.clientName},</p>
                <p>Thank you for submitting your maintenance service request to TOP SPEED! We have received your information and will review it shortly.</p>
                <p><strong>What happens next:</strong></p>
                <ul>
                  <li>Our professional technical team will review your request</li>
                  <li>We will contact you within 24 hours via phone or email</li>
                  <li>We'll provide a detailed diagnosis and service quote</li>
                  <li>We'll schedule the maintenance at your convenience</li>
                </ul>
                <p>Your reference details:</p>
                <ul>
                  <li>Car: ${requestData.carType}</li>
                  <li>Issue: ${requestData.issueCategory}</li>
                  <li>Submitted: ${new Date().toLocaleString()}</li>
                </ul>
                <p>If you have any questions, please don't hesitate to contact us.</p>
                <p><strong>Best regards,</strong><br>TOP SPEED Team</p>
              </div>
              <div class="footer">
                <p>This is an automated confirmation email. Please do not reply to this message.</p>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    console.log('✅ Client confirmation email sent successfully');

    return { success: true, message: 'Maintenance request sent successfully' };
  } catch (error) {
    console.error('❌ Email sending error:', error.message);
    console.error('❌ Error details:', error);
    throw error;
  }
};

export const sendOTPEmail = async (email, userName, otp) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER || process.env.EMAIL_USER,
        pass: process.env.SMTP_PASS || process.env.EMAIL_APP_PASSWORD,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    await transporter.verify();

    const htmlTemplate = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #000; margin: 0; padding: 20px; }
            .container { max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1a1a1a 0%, #000 100%); border: 1px solid #333; border-radius: 8px; overflow: hidden; }
            .header { background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 40px 20px; text-align: center; color: white; }
            .header h1 { margin: 0; font-size: 28px; font-weight: bold; letter-spacing: 0.5px; }
            .content { padding: 40px 30px; color: #e5e7eb; }
            .greeting { font-size: 16px; margin-bottom: 25px; line-height: 1.6; }
            .greeting strong { color: #fff; }
            .otp-box { background-color: #111; border: 2px solid #dc2626; border-radius: 8px; padding: 30px; text-align: center; margin: 30px 0; }
            .otp-text { font-size: 12px; color: #9ca3af; margin-bottom: 15px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
            .otp-code { font-size: 42px; font-weight: bold; color: #dc2626; letter-spacing: 4px; font-family: 'Courier New', monospace; }
            .expiry { font-size: 13px; color: #ef4444; margin-top: 15px; font-weight: 500; }
            .instructions { font-size: 14px; color: #9ca3af; line-height: 1.8; margin-top: 30px; }
            .footer { background-color: #1a1a1a; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 12px; border-top: 1px solid #333; }
            .footer p { margin: 5px 0; }
            a { color: #dc2626; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>TOP SPEED</h1>
            </div>
            <div class="content">
              <div class="greeting">
                Hello <strong>${userName}</strong>,
                <br><br>
                Thank you for registering with TOP SPEED. To complete your account setup, please verify your email address using the code below.
              </div>
              
              <div class="otp-box">
                <div class="otp-text">Your Verification Code</div>
                <div class="otp-code">${otp}</div>
                <div class="expiry">This code expires in 10 minutes</div>
              </div>

              <div class="instructions">
                <strong>How to proceed:</strong>
                <br>1. Enter this code in the verification page
                <br>2. Your account will be activated immediately
                <br>3. You can then access all TOP SPEED features
              </div>

              <div style="margin-top: 30px; padding-top: 30px; border-top: 1px solid #333; font-size: 13px; color: #6b7280; line-height: 1.8;">
                If you didn't create this account, please ignore this email.
                <br><br>
                <strong>Note:</strong> Never share your verification code with anyone. TOP SPEED support will never ask for it.
              </div>
            </div>
            <div class="footer">
              <p>TOP SPEED - Car Experience Platform</p>
              <p>© 2026 All rights reserved</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: email,
      subject: 'Verify Your TOP SPEED Account - Temporary Code',
      html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ OTP email sent successfully to:', email);
    return { success: true };
  } catch (error) {
    console.error('❌ OTP email sending error:', error.message);
    throw error;
  }
};
