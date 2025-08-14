const express = require('express');
const { body } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

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
				message: 'User already exists with this email address'
			});
		}

		// Check if phone number already exists
		const existingPhone = await User.findOne({ phone });
		if (existingPhone) {
			return res.status(400).json({
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
			isAvailableDonor
		});

		await user.save();

		// Generate token
		const token = generateToken(user._id);

		// Remove password from response
		const userResponse = user.toObject();
		delete userResponse.password;

		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			data: {
				token,
				user: userResponse
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
		const user = await User.findById(req.user.id);

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

module.exports = router;
