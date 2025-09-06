const formData = require('form-data');
const Mailgun = require('mailgun.js');

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
	username: 'api',
	key: process.env.MAILGUN_API_KEY,
});

// Generate a 6-digit OTP
const generateOTP = () => {
	return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP email
const sendOTPEmail = async (email, firstName, otp) => {
	const emailData = {
		from: process.env.FROM_EMAIL,
		to: email,
		subject: 'Verify Your Email - BloodConnect',
		html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification - BloodConnect</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  margin-top: 20px;
              }
              .header {
                  text-align: center;
                  padding: 20px 0;
                  border-bottom: 2px solid #e74c3c;
              }
              .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #e74c3c;
                  margin-bottom: 10px;
              }
              .content {
                  padding: 30px 20px;
                  text-align: center;
              }
              .otp-code {
                  background-color: #f8f9fa;
                  border: 2px dashed #e74c3c;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                  font-size: 32px;
                  font-weight: bold;
                  color: #e74c3c;
                  letter-spacing: 8px;
              }
              .message {
                  color: #333;
                  font-size: 16px;
                  margin: 20px 0;
              }
              .warning {
                  background-color: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 5px;
                  padding: 15px;
                  margin: 20px 0;
                  color: #856404;
              }
              .footer {
                  text-align: center;
                  padding: 20px;
                  border-top: 1px solid #eee;
                  color: #666;
                  font-size: 14px;
              }
              .blood-icon {
                  color: #e74c3c;
                  font-size: 24px;
                  margin-right: 10px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">
                      <span class="blood-icon">🩸</span>
                      BloodConnect
                  </div>
                  <p style="color: #666; margin: 0;">Connecting Lives Through Blood Donation</p>
              </div>

              <div class="content">
                  <h2 style="color: #333; margin-bottom: 20px;">Welcome ${firstName}!</h2>

                  <p class="message">
                      Thank you for joining BloodConnect! To complete your registration and start saving lives,
                      please verify your email address using the OTP code below.
                  </p>

                  <div class="otp-code">
                      ${otp}
                  </div>

                  <p class="message">
                      Enter this 6-digit code on the verification page to activate your account.
                  </p>

                  <div class="warning">
                      <strong>⚠️ Important:</strong> This OTP will expire in 10 minutes for security reasons.
                      If you didn't request this verification, please ignore this email.
                  </div>

                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                      Having trouble? Contact our support team at
                      <a href="mailto:${process.env.REPLY_TO_EMAIL}" style="color: #e74c3c;">${process.env.REPLY_TO_EMAIL}</a>
                  </p>
              </div>

              <div class="footer">
                  <p>
                      © 2025 BloodConnect. All rights reserved.<br>
                      You're receiving this email because you signed up for BloodConnect.
                  </p>
                  <p style="font-size: 12px; color: #999;">
                      This is an automated message, please do not reply to this email.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `,
		text: `
      Welcome to BloodConnect!

      Hi ${firstName},

      Thank you for joining BloodConnect! To complete your registration, please verify your email address using the following OTP code:

      Verification Code: ${otp}

      Enter this 6-digit code on the verification page to activate your account.

      Important: This OTP will expire in 10 minutes for security reasons.

      If you didn't request this verification, please ignore this email.

      Having trouble? Contact our support team at ${process.env.REPLY_TO_EMAIL}

      © 2025 BloodConnect. All rights reserved.
    `
	};

	try {
		const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
		return { success: true, messageId: result.id };
	} catch (error) {
		console.error('Error sending OTP email:', error);
		return { success: false, error: error.message };
	}
};

// Send welcome email after successful verification
const sendWelcomeEmail = async (email, firstName) => {
	const emailData = {
		from: process.env.FROM_EMAIL,
		to: email,
		subject: 'Welcome to BloodConnect - Your Account is Active!',
		html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to BloodConnect</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  margin-top: 20px;
              }
              .header {
                  text-align: center;
                  padding: 20px 0;
                  border-bottom: 2px solid #27ae60;
              }
              .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #e74c3c;
                  margin-bottom: 10px;
              }
              .content {
                  padding: 30px 20px;
                  text-align: center;
              }
              .success-badge {
                  background-color: #d4edda;
                  border: 2px solid #27ae60;
                  border-radius: 50px;
                  padding: 20px;
                  margin: 20px 0;
                  display: inline-block;
              }
              .message {
                  color: #333;
                  font-size: 16px;
                  margin: 20px 0;
              }
              .features {
                  text-align: left;
                  margin: 30px 0;
                  padding: 20px;
                  background-color: #f8f9fa;
                  border-radius: 8px;
              }
              .feature-item {
                  margin: 15px 0;
                  padding-left: 30px;
                  position: relative;
              }
              .feature-item:before {
                  content: "🩸";
                  position: absolute;
                  left: 0;
                  top: 0;
              }
              .button {
                  display: inline-block;
                  background-color: #e74c3c;
                  color: white;
                  padding: 15px 40px;
                  text-decoration: none;
                  border-radius: 5px;
                  margin: 20px 0;
                  font-weight: bold;
                  font-size: 16px;
              }
              .footer {
                  text-align: center;
                  padding: 20px;
                  border-top: 1px solid #eee;
                  color: #666;
                  font-size: 14px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">
                      🩸 BloodConnect
                  </div>
                  <p style="color: #666; margin: 0;">Connecting Lives Through Blood Donation</p>
              </div>

              <div class="content">
                  <div class="success-badge">
                  </div>

                  <h2 style="color: #27ae60; margin-bottom: 20px;">Account Verified Successfully!</h2>

                  <p class="message">
                      <strong>Congratulations ${firstName}!</strong><br>
                      Your BloodConnect account has been successfully verified and is now active.
                      You're now part of a community dedicated to saving lives through blood donation.
                  </p>

                  <div class="features">
                      <h3 style="color: #333; margin-top: 0;">What you can do now:</h3>
                      <div class="feature-item">Register as a blood donor and help save lives</div>
                      <div class="feature-item">Request blood for emergencies or medical procedures</div>
                      <div class="feature-item">Make monetary donations to support blood banks</div>
                      <div class="feature-item">Track your donation history and impact</div>
                      <div class="feature-item">Receive notifications for urgent blood requests in your area</div>
                      <div class="feature-item">Connect with nearby blood banks and hospitals</div>
                  </div>

                  <a href="${process.env.FRONTEND_URL}/login" class="button">
                      Start Your Journey
                  </a>

                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                      Questions? Our support team is here to help at
                      <a href="mailto:${process.env.REPLY_TO_EMAIL}" style="color: #e74c3c;">${process.env.REPLY_TO_EMAIL}</a>
                  </p>
              </div>

              <div class="footer">
                  <p>
                      © 2025 BloodConnect. All rights reserved.<br>
                      Together, we save lives through the gift of blood donation.
                  </p>
                  <p style="font-size: 12px; color: #999;">
                      You're receiving this email because you successfully verified your BloodConnect account.
                  </p>
              </div>
          </div>
      </body>
      </html>
    `,
		text: `
      Congratulations ${firstName}!

      Your BloodConnect account has been successfully verified and is now active.

      You're now part of a community dedicated to saving lives through blood donation.

      What you can do now:
      • Register as a blood donor and help save lives
      • Request blood for emergencies or medical procedures
      • Make monetary donations to support blood banks
      • Track your donation history and impact
      • Receive notifications for urgent blood requests in your area
      • Connect with nearby blood banks and hospitals

      Get started: ${process.env.FRONTEND_URL}/login

      Questions? Contact us at ${process.env.REPLY_TO_EMAIL}

      © 2025 BloodConnect. All rights reserved.
    `
	};

	try {
		const result = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);
		return { success: true, messageId: result.id };
	} catch (error) {
		console.error('Error sending welcome email:', error);
		return { success: false, error: error.message };
	}
};

// Send password reset OTP email
const sendPasswordResetOTPEmail = async (email, firstName, otp) => {
	const emailData = {
		from: process.env.FROM_EMAIL,
		to: email,
		subject: 'Password Reset - BloodConnect',
		html: `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - BloodConnect</title>
          <style>
              body {
                  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                  line-height: 1.6;
                  margin: 0;
                  padding: 0;
                  background-color: #f4f4f4;
              }
              .container {
                  max-width: 600px;
                  margin: 0 auto;
                  padding: 20px;
                  background-color: #ffffff;
                  border-radius: 10px;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                  margin-top: 20px;
              }
              .header {
                  text-align: center;
                  padding: 20px 0;
                  border-bottom: 2px solid #e74c3c;
              }
              .logo {
                  font-size: 28px;
                  font-weight: bold;
                  color: #e74c3c;
                  display: flex;
                  align-items: center;
                  justify-content: center;
              }
              .content {
                  padding: 30px 20px;
                  text-align: center;
              }
              .warning-icon {
                  font-size: 48px;
                  color: #f39c12;
                  margin: 20px 0;
              }
              .message {
                  color: #333;
                  font-size: 16px;
                  margin: 20px 0;
                  text-align: left;
              }
              .otp-code {
                  background-color: #f8f9fa;
                  border: 2px dashed #e74c3c;
                  border-radius: 8px;
                  font-size: 32px;
                  font-weight: bold;
                  letter-spacing: 8px;
                  padding: 20px;
                  margin: 30px 0;
                  color: #e74c3c;
              }
              .security-notice {
                  background-color: #fff3cd;
                  border: 1px solid #ffeaa7;
                  border-radius: 8px;
                  padding: 15px;
                  margin: 20px 0;
                  color: #856404;
              }
              .footer {
                  text-align: center;
                  padding: 20px;
                  border-top: 1px solid #eee;
                  color: #666;
                  font-size: 14px;
              }
              .blood-icon {
                  color: #e74c3c;
                  font-size: 24px;
                  margin-right: 10px;
              }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="header">
                  <div class="logo">
                      <span class="blood-icon">🩸</span>
                      BloodConnect
                  </div>
                  <p style="color: #666; margin: 0;">Connecting Lives Through Blood Donation</p>
              </div>

              <div class="content">
                  <div class="warning-icon">🔒</div>
                  
                  <h2 style="color: #333; margin-bottom: 20px;">Password Reset Request</h2>

                  <p class="message">
                      Hi ${firstName},<br><br>
                      We received a request to reset your password for your BloodConnect account.
                      If you made this request, please use the verification code below to proceed with resetting your password.
                  </p>

                  <div class="otp-code">
                      ${otp}
                  </div>

                  <p class="message">
                      <strong>This code will expire in 10 minutes.</strong><br>
                      Enter this code on the password reset page to continue.
                  </p>

                  <div class="security-notice">
                      <strong>Security Notice:</strong><br>
                      • If you didn't request this password reset, please ignore this email and your password will remain unchanged.<br>
                      • Never share this code with anyone.<br>
                      • BloodConnect will never ask for your password via email.
                  </div>

                  <p style="color: #666; font-size: 14px; margin-top: 30px;">
                      If you're having trouble with your account, please contact our support team at
                      <a href="mailto:${process.env.REPLY_TO_EMAIL}" style="color: #e74c3c;">${process.env.REPLY_TO_EMAIL}</a>
                  </p>
              </div>

              <div class="footer">
                  <p>Thank you for being part of the BloodConnect community!</p>
                  <p>
                      <a href="${process.env.FRONTEND_URL}" style="color: #e74c3c; text-decoration: none;">BloodConnect</a> |
                      <a href="${process.env.FRONTEND_URL}/help" style="color: #e74c3c; text-decoration: none;">Help Center</a> |
                      <a href="${process.env.FRONTEND_URL}/privacy" style="color: #e74c3c; text-decoration: none;">Privacy Policy</a>
                  </p>
              </div>
          </div>
      </body>
      </html>
    `
	};

	try {
		const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, emailData);

		return {
			success: true,
			messageId: response.id,
			message: 'Password reset OTP email sent successfully'
		};
	} catch (error) {
		console.error('Error sending password reset OTP email:', error);
		return {
			success: false,
			error: error.message || 'Failed to send password reset email'
		};
	}
};

module.exports = {
	generateOTP,
	sendOTPEmail,
	sendWelcomeEmail,
	sendPasswordResetOTPEmail
};
