const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');
const { generateOTP, sendOTPEmail, sendWelcomeEmail, sendPasswordResetOTPEmail } = require('../utils/emailService');

const router = express.Router();

// Validation rules
const registerValidation = [
	body('firstName')
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('First name must be between 2 and 50 characters'),

	body('lastName')
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Last name must be between 2 and 50 characters'),

	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address'),

	body('password')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),

	body('phone')
		.isMobilePhone()
		.withMessage('Please provide a valid phone number'),

	body('dateOfBirth')
		.isISO8601()
		.withMessage('Please provide a valid date of birth'),

	body('gender')
		.isIn(['male', 'female', 'other', 'prefer-not-to-say'])
		.withMessage('Please select a valid gender'),

	body('bloodType')
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
		.withMessage('Please select a valid blood type'),

	body('weight')
		.isNumeric()
		.isFloat({ min: 45, max: 200 })
		.withMessage('Weight must be between 45 and 200 kg'),

	body('location.city')
		.trim()
		.notEmpty()
		.withMessage('City is required'),

	body('location.area')
		.trim()
		.notEmpty()
		.withMessage('Area is required')
];

const loginValidation = [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address'),

	body('password')
		.notEmpty()
		.withMessage('Password is required')
];

// Generate JWT token
const generateToken = (userId) => {
	return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '7d'
	});
};

// @route   GET /api/auth/check-email
// @desc    Check if email already exists
// @access  Public
router.get('/check-email', async (req, res) => {
	try {
		const { email } = req.query;

		if (!email) {
			return res.status(400).json({
				success: false,
				message: 'Email is required'
			});
		}

		const existingUser = await User.findOne({ email: email.toLowerCase() });

		res.json({
			success: true,
			data: {
				exists: !!existingUser
			}
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error while checking email',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, validate, async (req, res) => {
	try {
		const {
			firstName,
			lastName,
			email,
			password,
			phone,
			dateOfBirth,
			gender,
			bloodType,
			weight,
			location,
			isAvailableDonor = true
		} = req.body;

		// Check if user already exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User already exists with this email address'
			});
		}

		// Check if phone number already exists
		const existingPhone = await User.findOne({ phone });
		if (existingPhone) {
			return res.status(400).json({
				success: false,
				message: 'User already exists with this phone number'
			});
		}

		// Create new user
		const user = new User({
			firstName,
			lastName,
			email,
			password,
			phone,
			dateOfBirth,
			gender,
			bloodType,
			weight,
			location,
			isAvailableDonor,
			isVerified: false // User needs to verify email first
		});

		// Generate OTP
		const otp = generateOTP();
		user.otpCode = otp;
		user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

		await user.save();

		// Send OTP email
		const emailResult = await sendOTPEmail(email, firstName, otp);

		if (!emailResult.success) {
			// If email fails, we should still allow the user to try again
			console.error('Failed to send OTP email:', emailResult.error);
		}

		res.status(201).json({
			success: true,
			message: 'Registration successful! Please check your email for the verification code.',
			data: {
				email: user.email,
				userId: user._id,
				requiresVerification: true
			}
		});
	} catch (error) {
		console.error('Registration error:', error);

		if (error.code === 11000) {
			const field = Object.keys(error.keyPattern)[0];
			return res.status(400).json({
				message: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
			});
		}

		res.status(500).json({
			message: 'Registration failed. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address'),
	body('otp')
		.isLength({ min: 6, max: 6 })
		.isNumeric()
		.withMessage('OTP must be a 6-digit number')
], validate, async (req, res) => {
	try {
		const { email, otp } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Check if user is already verified
		if (user.isVerified) {
			return res.status(400).json({
				success: false,
				message: 'Account is already verified'
			});
		}

		// Check if OTP exists and hasn't expired
		if (!user.otpCode || !user.otpExpires) {
			return res.status(400).json({
				success: false,
				message: 'No OTP found. Please request a new verification code.'
			});
		}

		// Check if OTP has expired
		if (new Date() > user.otpExpires) {
			return res.status(400).json({
				success: false,
				message: 'OTP has expired. Please request a new verification code.'
			});
		}

		// Check if OTP matches
		if (user.otpCode !== otp) {
			return res.status(400).json({
				success: false,
				message: 'Invalid OTP code'
			});
		}

		// Verify user
		user.isVerified = true;
		user.otpCode = undefined;
		user.otpExpires = undefined;
		await user.save();

		// Send welcome email
		const emailResult = await sendWelcomeEmail(user.email, user.firstName);
		if (!emailResult.success) {
			console.error('Failed to send welcome email:', emailResult.error);
		}

		// Generate token
		const token = generateToken(user._id);

		// Remove password from response
		const userResponse = user.toObject();
		delete userResponse.password;

		res.json({
			success: true,
			message: 'Email verified successfully! Welcome to BloodConnect.',
			data: {
				token,
				user: userResponse
			}
		});
	} catch (error) {
		console.error('OTP verification error:', error);
		res.status(500).json({
			success: false,
			message: 'Verification failed. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/resend-otp
// @desc    Resend OTP code
// @access  Public
router.post('/resend-otp', [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address')
], validate, async (req, res) => {
	try {
		const { email } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Check if user is already verified
		if (user.isVerified) {
			return res.status(400).json({
				success: false,
				message: 'Account is already verified'
			});
		}

		// Generate new OTP
		const otp = generateOTP();
		user.otpCode = otp;
		user.otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

		await user.save();

		// Send OTP email
		const emailResult = await sendOTPEmail(email, user.firstName, otp);

		if (!emailResult.success) {
			return res.status(500).json({
				success: false,
				message: 'Failed to send verification email. Please try again.'
			});
		}

		res.json({
			success: true,
			message: 'Verification code sent successfully! Please check your email.'
		});
	} catch (error) {
		console.error('Resend OTP error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to resend verification code. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, validate, async (req, res) => {
	try {
		const { email, password } = req.body;

		// Find user and include password for comparison
		const user = await User.findOne({ email }).select('+password');

		if (!user) {
			return res.status(401).json({
				message: 'Invalid email or password'
			});
		}

		// Check if user is banned first (before checking isActive)
		if (user.isBanned) {
			return res.status(403).json({
				success: false,
				message: 'Account has been suspended',
				isBanned: true,
				banInfo: {
					banReason: user.banReason,
					bannedAt: user.bannedAt,
					bannedBy: user.bannedBy
				}
			});
		}

		// Check if account is active
		if (!user.isActive) {
			return res.status(401).json({
				success: false,
				message: 'Account has been deactivated. Please contact support.'
			});
		}

		// Check password
		const isPasswordValid = await user.comparePassword(password);

		if (!isPasswordValid) {
			return res.status(401).json({
				message: 'Invalid email or password'
			});
		}

		// Update last login
		user.lastLogin = new Date();
		await user.save();

		// Generate token
		const token = generateToken(user._id);

		// Remove password from response
		const userResponse = user.toObject();
		delete userResponse.password;

		res.json({
			success: true,
			message: 'Login successful',
			data: {
				token,
				user: userResponse
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Login failed. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
	try {
		const user = await User.findById(req.user._id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		res.json({
			success: true,
			message: 'User profile retrieved successfully',
			data: user
		});
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve user profile',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/logout
// @desc    Logout user (client-side token removal)
// @access  Private
router.post('/logout', authenticate, (req, res) => {
	res.json({
		message: 'Logout successful. Please remove the token from your client.'
	});
});

// @route   POST /api/auth/change-password
// @desc    Change user password
// @access  Private
router.post('/change-password', [
	authenticate,
	body('currentPassword').notEmpty().withMessage('Current password is required'),
	body('newPassword')
		.isLength({ min: 6 })
		.withMessage('New password must be at least 6 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
	validate
], async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		// Get user with password
		const user = await User.findById(req.user.id).select('+password');

		// Verify current password
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);

		if (!isCurrentPasswordValid) {
			return res.status(400).json({
				message: 'Current password is incorrect'
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.json({
			message: 'Password changed successfully'
		});
	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({
			message: 'Failed to change password',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Public
router.post('/verify-token', (req, res) => {
	try {
		const { token } = req.body;

		if (!token) {
			return res.status(400).json({
				message: 'Token is required'
			});
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		res.json({
			message: 'Token is valid',
			valid: true,
			userId: decoded.id,
			expiresAt: new Date(decoded.exp * 1000)
		});
	} catch (error) {
		res.status(401).json({
			message: 'Invalid or expired token',
			valid: false
		});
	}
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP to email
// @access  Public
router.post('/forgot-password', [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address')
], validate, async (req, res) => {
	try {
		const { email } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'No account found with this email address'
			});
		}

		// Generate OTP for password reset
		const otp = generateOTP();
		user.resetPasswordOTP = otp;
		user.resetPasswordOTPExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

		await user.save();

		// Send password reset OTP email
		const emailResult = await sendPasswordResetOTPEmail(email, user.firstName, otp);
		if (!emailResult.success) {
			console.error('Failed to send password reset email:', emailResult.error);
			return res.status(500).json({
				success: false,
				message: 'Failed to send password reset email. Please try again.'
			});
		}

		res.json({
			success: true,
			message: 'Password reset code has been sent to your email',
			data: {
				email: user.email
			}
		});
	} catch (error) {
		console.error('Forgot password error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to process password reset request. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/verify-reset-otp
// @desc    Verify password reset OTP
// @access  Public
router.post('/verify-reset-otp', [
	body('email')
		.isEmail()
		.normalizeEmail()
		.withMessage('Please provide a valid email address'),
	body('otp')
		.isLength({ min: 6, max: 6 })
		.isNumeric()
		.withMessage('OTP must be a 6-digit number')
], validate, async (req, res) => {
	try {
		const { email, otp } = req.body;

		// Find user
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Check if reset OTP exists and hasn't expired
		if (!user.resetPasswordOTP || !user.resetPasswordOTPExpires) {
			return res.status(400).json({
				success: false,
				message: 'No password reset request found. Please request a new reset code.'
			});
		}

		// Check if OTP has expired
		if (new Date() > user.resetPasswordOTPExpires) {
			return res.status(400).json({
				success: false,
				message: 'Reset code has expired. Please request a new one.'
			});
		}

		// Check if OTP matches
		if (user.resetPasswordOTP !== otp) {
			return res.status(400).json({
				success: false,
				message: 'Invalid reset code'
			});
		}

		// Generate a temporary token for password reset (valid for 10 minutes)
		const resetToken = jwt.sign(
			{ id: user._id, purpose: 'password-reset' },
			process.env.JWT_SECRET,
			{ expiresIn: '10m' }
		);

		res.json({
			success: true,
			message: 'Reset code verified successfully',
			data: {
				resetToken,
				email: user.email
			}
		});
	} catch (error) {
		console.error('Reset OTP verification error:', error);
		res.status(500).json({
			success: false,
			message: 'Verification failed. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/auth/reset-password
// @desc    Reset password with verified token
// @access  Public
router.post('/reset-password', [
	body('resetToken')
		.notEmpty()
		.withMessage('Reset token is required'),
	body('newPassword')
		.isLength({ min: 6 })
		.withMessage('Password must be at least 6 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
], validate, async (req, res) => {
	try {
		const { resetToken, newPassword } = req.body;

		// Verify reset token
		let decoded;
		try {
			decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
			if (decoded.purpose !== 'password-reset') {
				throw new Error('Invalid token purpose');
			}
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: 'Invalid or expired reset token'
			});
		}

		// Find user
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Hash the new password
		const bcrypt = require('bcryptjs');
		const salt = await bcrypt.genSalt(12);
		user.password = await bcrypt.hash(newPassword, salt);
		user.resetPasswordOTP = undefined;
		user.resetPasswordOTPExpires = undefined;
		await user.save({ validateBeforeSave: false });

		res.json({
			success: true,
			message: 'Password has been reset successfully. You can now log in with your new password.'
		});
	} catch (error) {
		console.error('Password reset error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to reset password. Please try again.',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
