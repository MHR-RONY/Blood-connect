const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
	return nodemailer.createTransporter({
		host: process.env.EMAIL_HOST,
		port: process.env.EMAIL_PORT,
		secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
		auth: {
			user: process.env.EMAIL_USER,
			pass: process.env.EMAIL_PASSWORD,
		},
	});
};

/**
 * Send welcome email to new users
 * @param {string} email - User's email address
 * @param {string} name - User's name
 * @param {string} userType - User type (donor/recipient)
 */
const sendWelcomeEmail = async (email, name, userType) => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: `"Blood Connect" <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: 'Welcome to Blood Connect - Save Lives Together!',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">Welcome to Blood Connect</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Connecting Hearts, Saving Lives</p>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${name},</h2>

            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Welcome to Blood Connect! Thank you for joining our life-saving community as a ${userType}.
              Your decision to be part of this platform makes you a hero in someone's story.
            </p>

            ${userType === 'donor' ? `
              <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
                <h3 style="color: #dc2626; margin: 0 0 10px 0;">As a Blood Donor:</h3>
                <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                  <li>You can help save up to 3 lives with a single donation</li>
                  <li>Receive notifications for urgent blood requests in your area</li>
                  <li>Track your donation history and impact</li>
                  <li>Get reminders when you're eligible to donate again</li>
                </ul>
              </div>
            ` : `
              <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 20px; margin: 20px 0;">
                <h3 style="color: #0369a1; margin: 0 0 10px 0;">As a Blood Recipient:</h3>
                <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                  <li>Submit blood requests when needed</li>
                  <li>Find compatible donors in your area</li>
                  <li>Access emergency blood request services</li>
                  <li>Connect with our network of verified donors</li>
                </ul>
              </div>
            `}

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/dashboard"
                 style="background-color: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you have any questions, please don't hesitate to contact our support team at
              <a href="mailto:${process.env.SUPPORT_EMAIL}" style="color: #dc2626;">${process.env.SUPPORT_EMAIL}</a>
            </p>
          </div>

          <div style="background-color: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
              Blood Connect - Connecting Hearts, Saving Lives<br>
              This email was sent to ${email}. If you didn't create an account, please ignore this email.
            </p>
          </div>
        </div>
      `
		};

		await transporter.sendMail(mailOptions);
		console.log('Welcome email sent successfully to:', email);
	} catch (error) {
		console.error('Error sending welcome email:', error);
		throw error;
	}
};

/**
 * Send blood request notification to donors
 * @param {Array} donors - Array of donor email addresses
 * @param {Object} requestInfo - Blood request information
 */
const sendBloodRequestNotification = async (donors, requestInfo) => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: `"Blood Connect" <${process.env.EMAIL_FROM}>`,
			bcc: donors, // Send to multiple donors using BCC
			subject: `🩸 Urgent: ${requestInfo.bloodType} Blood Needed in ${requestInfo.location}`,
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">🆘 Urgent Blood Request</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">A Life Depends on Your Help</p>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin-bottom: 20px;">
              <h2 style="color: #dc2626; margin: 0 0 15px 0;">Blood Type Needed: ${requestInfo.bloodType}</h2>
              <div style="color: #4b5563;">
                <p style="margin: 5px 0;"><strong>Location:</strong> ${requestInfo.location}</p>
                <p style="margin: 5px 0;"><strong>Hospital:</strong> ${requestInfo.hospital || 'Not specified'}</p>
                <p style="margin: 5px 0;"><strong>Contact:</strong> ${requestInfo.contactNumber}</p>
                <p style="margin: 5px 0;"><strong>Urgency:</strong> <span style="color: #dc2626; font-weight: bold;">${requestInfo.urgency || 'High'}</span></p>
                ${requestInfo.additionalNotes ? `<p style="margin: 5px 0;"><strong>Notes:</strong> ${requestInfo.additionalNotes}</p>` : ''}
              </div>
            </div>

            <p style="color: #1f2937; line-height: 1.6; margin-bottom: 20px;">
              Dear Blood Donor,<br><br>
              Someone in your area urgently needs ${requestInfo.bloodType} blood. Your donation could be the difference between life and death.
              Every minute counts in emergency situations.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.FRONTEND_URL}/donate-blood"
                 style="background-color: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
                🩸 I Can Help - Donate Now
              </a>
            </div>

            <div style="background-color: #f0f9ff; border-left: 4px solid #0369a1; padding: 15px; margin: 20px 0;">
              <h3 style="color: #0369a1; margin: 0 0 10px 0; font-size: 16px;">Quick Reminder:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
                <li>Donation is safe and takes only 10-15 minutes</li>
                <li>You can donate every 56 days (8 weeks)</li>
                <li>Free health checkup and refreshments provided</li>
                <li>Your donation can save up to 3 lives</li>
              </ul>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px;">
              If you cannot donate at this time, please consider sharing this request with other potential donors.
              Together, we can save lives.
            </p>
          </div>

          <div style="background-color: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
              Blood Connect - Connecting Hearts, Saving Lives<br>
              To unsubscribe from blood request notifications, visit your dashboard settings.
            </p>
          </div>
        </div>
      `
		};

		await transporter.sendMail(mailOptions);
		console.log(`Blood request notification sent to ${donors.length} donors`);
	} catch (error) {
		console.error('Error sending blood request notification:', error);
		throw error;
	}
};

/**
 * Send donation confirmation email
 * @param {string} email - Donor's email
 * @param {string} name - Donor's name
 * @param {Object} donationInfo - Donation details
 */
const sendDonationConfirmation = async (email, name, donationInfo) => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: `"Blood Connect" <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: '🎉 Thank You for Your Life-Saving Donation!',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #059669 0%, #047857 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🎉 Thank You, Hero!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Your Donation Saves Lives</p>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <h2 style="color: #1f2937; margin-bottom: 20px;">Dear ${name},</h2>

            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              Thank you for your generous blood donation! Your selfless act of kindness has the power to save up to 3 lives.
              You are truly a hero in our community.
            </p>

            <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
              <h3 style="color: #059669; margin: 0 0 15px 0;">Donation Details:</h3>
              <div style="color: #4b5563;">
                <p style="margin: 5px 0;"><strong>Donation ID:</strong> ${donationInfo.donationId}</p>
                <p style="margin: 5px 0;"><strong>Blood Type:</strong> ${donationInfo.bloodType}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(donationInfo.date).toLocaleDateString()}</p>
                <p style="margin: 5px 0;"><strong>Location:</strong> ${donationInfo.location}</p>
                <p style="margin: 5px 0;"><strong>Volume:</strong> ${donationInfo.volume || '450ml'}</p>
              </div>
            </div>

            <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0;">
              <h3 style="color: #d97706; margin: 0 0 15px 0;">Post-Donation Care:</h3>
              <ul style="color: #4b5563; margin: 0; padding-left: 20px;">
                <li>Rest for 15-20 minutes after donation</li>
                <li>Drink plenty of fluids (water, juice) for the next 24 hours</li>
                <li>Avoid strenuous activities for the rest of the day</li>
                <li>Eat iron-rich foods to help replenish your blood</li>
                <li>Keep the bandage on for at least 4 hours</li>
              </ul>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <p style="color: #059669; font-size: 18px; font-weight: bold; margin-bottom: 15px;">
                You'll be eligible to donate again on: ${new Date(Date.now() + 56 * 24 * 60 * 60 * 1000).toLocaleDateString()}
              </p>
              <a href="${process.env.FRONTEND_URL}/profile"
                 style="background-color: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                View Your Donation History
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
              Share your good deed and inspire others to donate blood!<br>
              <a href="${process.env.FRONTEND_URL}/share-donation" style="color: #dc2626;">Share on Social Media</a>
            </p>
          </div>

          <div style="background-color: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
              Blood Connect - Connecting Hearts, Saving Lives<br>
              Thank you for being a part of our life-saving community.
            </p>
          </div>
        </div>
      `
		};

		await transporter.sendMail(mailOptions);
		console.log('Donation confirmation email sent successfully to:', email);
	} catch (error) {
		console.error('Error sending donation confirmation email:', error);
		throw error;
	}
};

/**
 * Send emergency blood request alert
 * @param {Array} recipients - Array of recipient email addresses
 * @param {Object} emergencyInfo - Emergency request information
 */
const sendEmergencyAlert = async (recipients, emergencyInfo) => {
	try {
		const transporter = createTransporter();

		const mailOptions = {
			from: `"Blood Connect Emergency" <${process.env.EMAIL_FROM}>`,
			bcc: recipients,
			subject: `🚨 EMERGENCY: ${emergencyInfo.bloodType} Blood Needed URGENTLY`,
			priority: 'high',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px;">🚨 EMERGENCY ALERT</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: bold;">CRITICAL BLOOD SHORTAGE</p>
          </div>

          <div style="padding: 30px; background-color: #fef2f2;">
            <div style="background-color: #b91c1c; color: white; padding: 20px; margin-bottom: 20px; text-align: center; border-radius: 6px;">
              <h2 style="margin: 0; font-size: 24px;">${emergencyInfo.bloodType} BLOOD NEEDED</h2>
              <p style="margin: 10px 0 0 0; font-size: 16px;">IMMEDIATE RESPONSE REQUIRED</p>
            </div>

            <div style="color: #4b5563; margin-bottom: 20px;">
              <p style="margin: 5px 0; font-size: 16px;"><strong>Hospital:</strong> ${emergencyInfo.hospital}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Location:</strong> ${emergencyInfo.location}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Contact:</strong> ${emergencyInfo.contactNumber}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Units Needed:</strong> ${emergencyInfo.unitsNeeded || 'Multiple'}</p>
              <p style="margin: 5px 0; font-size: 16px;"><strong>Time Critical:</strong> <span style="color: #b91c1c; font-weight: bold;">Next 2-4 Hours</span></p>
            </div>

            <div style="background-color: #fef2f2; border: 2px solid #b91c1c; padding: 20px; margin: 20px 0; text-align: center;">
              <p style="color: #b91c1c; font-size: 18px; font-weight: bold; margin: 0 0 15px 0;">
                A LIFE HANGS IN THE BALANCE
              </p>
              <p style="color: #4b5563; margin: 0;">
                This is an emergency situation. If you are eligible to donate ${emergencyInfo.bloodType} blood,
                please respond immediately. Every minute counts.
              </p>
            </div>

            <div style="text-align: center; margin: 30px 0;">
              <a href="tel:${emergencyInfo.contactNumber}"
                 style="background-color: #b91c1c; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 18px; margin: 10px;">
                📞 CALL NOW: ${emergencyInfo.contactNumber}
              </a>
              <br>
              <a href="${process.env.FRONTEND_URL}/emergency-response"
                 style="background-color: #dc2626; color: white; padding: 15px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; margin: 10px;">
                🩸 RESPOND TO EMERGENCY
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px; text-align: center; margin-top: 30px;">
              If you cannot help, please forward this to potential donors immediately.<br>
              Time is critical - someone's life depends on it.
            </p>
          </div>

          <div style="background-color: #7f1d1d; color: #fca5a5; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
              Blood Connect Emergency Response System<br>
              This is an automated emergency alert. Please respond immediately if possible.
            </p>
          </div>
        </div>
      `
		};

		await transporter.sendMail(mailOptions);
		console.log(`Emergency alert sent to ${recipients.length} recipients`);
	} catch (error) {
		console.error('Error sending emergency alert:', error);
		throw error;
	}
};

/**
 * Send password reset email
 * @param {string} email - User's email
 * @param {string} resetToken - Password reset token
 */
const sendPasswordResetEmail = async (email, resetToken) => {
	try {
		const transporter = createTransporter();
		const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

		const mailOptions = {
			from: `"Blood Connect" <${process.env.EMAIL_FROM}>`,
			to: email,
			subject: 'Reset Your Blood Connect Password',
			html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Password Reset Request</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Blood Connect Account</p>
          </div>

          <div style="padding: 30px; background-color: #f9fafb;">
            <p style="color: #4b5563; line-height: 1.6; margin-bottom: 20px;">
              You requested a password reset for your Blood Connect account. Click the button below to reset your password.
              This link will expire in 1 hour for security reasons.
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}"
                 style="background-color: #4f46e5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                Reset Password
              </a>
            </div>

            <p style="color: #6b7280; font-size: 14px;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>

            <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser:<br>
              <a href="${resetUrl}" style="color: #4f46e5; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <div style="background-color: #374151; color: #d1d5db; padding: 20px; text-align: center; font-size: 12px;">
            <p style="margin: 0;">
              Blood Connect - Connecting Hearts, Saving Lives<br>
              This email was sent to ${email}
            </p>
          </div>
        </div>
      `
		};

		await transporter.sendMail(mailOptions);
		console.log('Password reset email sent successfully to:', email);
	} catch (error) {
		console.error('Error sending password reset email:', error);
		throw error;
	}
};

module.exports = {
	sendWelcomeEmail,
	sendBloodRequestNotification,
	sendDonationConfirmation,
	sendEmergencyAlert,
	sendPasswordResetEmail
};
