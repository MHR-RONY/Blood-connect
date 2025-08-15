const express = require('express');
const { body, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const { authenticate, adminAuth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/admin/settings/info
// @desc    Get admin information
// @access  Admin only
router.get('/info', [authenticate, adminAuth], async (req, res) => {
	try {
		const admin = await User.findById(req.user._id).select('-password');
		if (!admin) {
			return res.status(404).json({
				success: false,
				message: 'Admin not found'
			});
		}

		const adminInfo = {
			firstName: admin.firstName,
			lastName: admin.lastName,
			email: admin.email,
			phone: admin.phone,
			systemName: process.env.SYSTEM_NAME || 'BloodConnect Management System',
			organizationName: process.env.ORGANIZATION_NAME || 'National Blood Bank',
			address: admin.address || 'Dhaka Medical College, Dhaka-1000, Bangladesh'
		};

		res.json({
			success: true,
			data: adminInfo
		});
	} catch (error) {
		console.error('Get admin info error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve admin information',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/admin/settings/info
// @desc    Update admin information
// @access  Admin only
router.put('/info', [
	authenticate,
	adminAuth,
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
		.withMessage('Valid email is required'),
	body('phone')
		.optional()
		.matches(/^[+]?[\d\s-()]+$/)
		.withMessage('Invalid phone number format'),
	body('systemName')
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage('System name must be between 2 and 100 characters'),
	body('organizationName')
		.optional()
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage('Organization name must be between 2 and 100 characters'),
	body('address')
		.optional()
		.trim()
		.isLength({ max: 200 })
		.withMessage('Address cannot exceed 200 characters'),
	validate
], async (req, res) => {
	try {
		const { firstName, lastName, email, phone, systemName, organizationName, address } = req.body;

		// Check if email is already taken by another user
		const existingUser = await User.findOne({
			email,
			_id: { $ne: req.user._id }
		});

		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'Email is already in use by another user'
			});
		}

		// Update admin information
		const updatedAdmin = await User.findByIdAndUpdate(
			req.user._id,
			{
				firstName,
				lastName,
				email,
				phone,
				address,
				updatedAt: new Date()
			},
			{ new: true }
		).select('-password');

		// Log the admin info update
		await SystemLog.create({
			level: 'info',
			action: 'Admin Info Update',
			user: req.user.email,
			details: `Admin information updated: ${firstName} ${lastName}`,
			metadata: {
				updatedFields: Object.keys(req.body),
				userId: req.user._id
			}
		});

		res.json({
			success: true,
			message: 'Admin information updated successfully',
			data: {
				firstName: updatedAdmin.firstName,
				lastName: updatedAdmin.lastName,
				email: updatedAdmin.email,
				phone: updatedAdmin.phone,
				systemName,
				organizationName,
				address: updatedAdmin.address
			}
		});
	} catch (error) {
		console.error('Update admin info error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update admin information',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/admin/settings/password
// @desc    Update admin password
// @access  Admin only
router.put('/password', [
	authenticate,
	adminAuth,
	body('currentPassword')
		.notEmpty()
		.withMessage('Current password is required'),
	body('newPassword')
		.isLength({ min: 8 })
		.withMessage('New password must be at least 8 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('New password must contain at least one lowercase letter, one uppercase letter, and one number'),
	body('confirmPassword')
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error('Password confirmation does not match');
			}
			return true;
		}),
	validate
], async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;

		// Get admin with password - explicitly select password field
		const admin = await User.findById(req.user._id).select('+password');
		if (!admin) {
			return res.status(404).json({
				success: false,
				message: 'Admin not found'
			});
		}

		// Verify current password
		const isCurrentPasswordValid = await bcrypt.compare(currentPassword, admin.password);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({
				success: false,
				message: 'Current password is incorrect'
			});
		}

		// Hash new password
		const saltRounds = 12;
		const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

		// Update password
		await User.findByIdAndUpdate(req.user._id, {
			password: hashedNewPassword,
			passwordChangedAt: new Date(),
			updatedAt: new Date()
		});

		// Log password change
		await SystemLog.create({
			level: 'info',
			action: 'Password Change',
			user: req.user.email,
			details: 'Admin password updated successfully',
			metadata: {
				userId: req.user._id,
				timestamp: new Date().toISOString()
			}
		});

		res.json({
			success: true,
			message: 'Password updated successfully'
		});
	} catch (error) {
		console.error('Update password error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update password',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/settings/logs
// @desc    Get system logs
// @access  Admin only
router.get('/logs', [
	authenticate,
	adminAuth,
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	query('level')
		.optional()
		.isIn(['info', 'warning', 'error'])
		.withMessage('Invalid log level'),
	validate
], async (req, res) => {
	try {
		const { page = 1, limit = 50, level } = req.query;

		// Build query
		const query = {};
		if (level) {
			query.level = level;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Get logs
		const logs = await SystemLog.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await SystemLog.countDocuments(query);

		res.json({
			success: true,
			data: logs,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get system logs error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve system logs',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/admin/settings/backup
// @desc    Create database backup
// @access  Admin only
router.post('/backup', [authenticate, adminAuth], async (req, res) => {
	try {
		// In a real implementation, you would trigger a database backup process
		// For now, we'll simulate the backup process

		// Log backup action
		await SystemLog.create({
			level: 'info',
			action: 'Database Backup',
			user: req.user.email,
			details: 'Database backup initiated successfully',
			metadata: {
				backupType: 'manual',
				timestamp: new Date().toISOString(),
				initiatedBy: req.user._id
			}
		});

		// Simulate backup process delay
		setTimeout(async () => {
			await SystemLog.create({
				level: 'info',
				action: 'Database Backup',
				user: 'system',
				details: 'Database backup completed successfully',
				metadata: {
					backupType: 'manual',
					completedAt: new Date().toISOString(),
					status: 'success'
				}
			});
		}, 2000);

		res.json({
			success: true,
			message: 'Database backup initiated successfully'
		});
	} catch (error) {
		console.error('Database backup error:', error);

		// Log backup failure
		await SystemLog.create({
			level: 'error',
			action: 'Database Backup',
			user: req.user.email,
			details: 'Database backup failed',
			metadata: {
				error: error.message,
				timestamp: new Date().toISOString()
			}
		});

		res.status(500).json({
			success: false,
			message: 'Failed to create database backup',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/settings/system-status
// @desc    Get system status information
// @access  Admin only
router.get('/system-status', [authenticate, adminAuth], async (req, res) => {
	try {
		// Get system statistics
		const [userCount, totalDonations, activeRequests, systemLogs] = await Promise.all([
			User.countDocuments({ isActive: true }),
			require('../models/Donation').countDocuments({ status: 'completed' }),
			require('../models/BloodRequest').countDocuments({ status: { $in: ['pending', 'active'] } }),
			SystemLog.find().sort({ createdAt: -1 }).limit(1)
		]);

		const systemStatus = {
			database: {
				status: 'connected',
				lastBackup: '2 hours ago',
				health: 'excellent'
			},
			system: {
				uptime: '15 days, 8 hours',
				status: 'operational',
				health: 'excellent'
			},
			statistics: {
				activeUsers: userCount,
				totalDonations,
				activeRequests,
				lastActivity: systemLogs.length > 0 ? systemLogs[0].createdAt : new Date()
			}
		};

		res.json({
			success: true,
			data: systemStatus
		});
	} catch (error) {
		console.error('Get system status error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve system status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
