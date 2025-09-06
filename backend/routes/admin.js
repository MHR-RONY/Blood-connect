const express = require('express');
const { query, body, param } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const EmergencyRequest = require('../models/EmergencyRequest');
const Payment = require('../models/Payment');
const { authenticate, authorize } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// Apply admin authentication to all routes
router.use(authenticate);
router.use(authorize('admin', 'moderator'));

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Admin only
router.get('/dashboard', async (req, res) => {
	try {
		const { period = '30' } = req.query; // days
		const startDate = new Date();
		startDate.setDate(startDate.getDate() - parseInt(period));

		// Get overall statistics
		const [
			totalUsers,
			activeUsers,
			totalDonations,
			pendingRequests,
			activeEmergencies,
			recentUsers,
			donationStats,
			requestStats
		] = await Promise.all([
			User.countDocuments(),
			User.countDocuments({ isActive: true, lastLogin: { $gte: startDate } }),
			Donation.countDocuments({ status: 'completed' }),
			BloodRequest.countDocuments({ status: { $in: ['pending', 'active'] } }),
			EmergencyRequest.countDocuments({ status: 'active' }),
			User.find({ createdAt: { $gte: startDate } })
				.select('firstName lastName email createdAt')
				.sort({ createdAt: -1 })
				.limit(10),
			Donation.aggregate([
				{ $match: { createdAt: { $gte: startDate } } },
				{
					$group: {
						_id: '$status',
						count: { $sum: 1 }
					}
				}
			]),
			BloodRequest.aggregate([
				{ $match: { createdAt: { $gte: startDate } } },
				{
					$group: {
						_id: '$status',
						count: { $sum: 1 }
					}
				}
			])
		]);

		// Blood type distribution
		const bloodTypeStats = await User.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: '$bloodType',
					count: { $sum: 1 },
					availableDonors: {
						$sum: { $cond: ['$isAvailableDonor', 1, 0] }
					}
				}
			},
			{ $sort: { count: -1 } }
		]);

		// Geographic distribution
		const locationStats = await User.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: '$location.city',
					count: { $sum: 1 },
					donors: {
						$sum: { $cond: ['$isAvailableDonor', 1, 0] }
					}
				}
			},
			{ $sort: { count: -1 } },
			{ $limit: 10 }
		]);

		// Recent activity
		const recentActivity = await Promise.all([
			Donation.find({ createdAt: { $gte: startDate } })
				.populate('donor', 'firstName lastName')
				.select('donor createdAt status')
				.sort({ createdAt: -1 })
				.limit(5),
			BloodRequest.find({ createdAt: { $gte: startDate } })
				.populate('requester', 'firstName lastName')
				.select('requester patient.bloodType createdAt status')
				.sort({ createdAt: -1 })
				.limit(5),
			EmergencyRequest.find({ createdAt: { $gte: startDate } })
				.populate('requester', 'firstName lastName')
				.select('requester patient.bloodType emergency.severity createdAt status')
				.sort({ createdAt: -1 })
				.limit(5)
		]);

		res.json({
			success: true,
			message: 'Admin dashboard data retrieved successfully',
			data: {
				overview: {
					totalUsers,
					activeUsers,
					totalDonations,
					pendingRequests,
					activeEmergencies
				},
				bloodTypeDistribution: bloodTypeStats,
				locationDistribution: locationStats,
				donationStats: donationStats.reduce((acc, stat) => {
					acc[stat._id] = stat.count;
					return acc;
				}, {}),
				requestStats: requestStats.reduce((acc, stat) => {
					acc[stat._id] = stat.count;
					return acc;
				}, {}),
				recentUsers,
				recentActivity: {
					donations: recentActivity[0],
					requests: recentActivity[1],
					emergencies: recentActivity[2]
				}
			},
			period: `${period} days`
		});
	} catch (error) {
		console.error('Admin dashboard error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve dashboard data',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/users
// @desc    Get all users with filters
// @access  Admin only
router.get('/users', [
	query('role')
		.optional()
		.isIn(['user', 'admin', 'moderator'])
		.withMessage('Invalid role'),
	query('isActive')
		.optional()
		.isBoolean()
		.withMessage('isActive must be boolean'),
	query('isBanned')
		.optional()
		.isBoolean()
		.withMessage('isBanned must be boolean'),
	query('bloodType')
		.optional()
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
		.withMessage('Invalid blood type'),
	query('city')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('City must be at least 2 characters'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	validate
], async (req, res) => {
	try {
		const {
			role,
			isActive,
			isBanned,
			bloodType,
			city,
			search,
			page = 1,
			limit = 20,
			sortBy = 'createdAt',
			sortOrder = 'desc'
		} = req.query;

		// Build search query
		const searchQuery = {};

		if (role) {
			searchQuery.role = role;
		}

		if (isActive !== undefined) {
			searchQuery.isActive = isActive === 'true';
		}

		if (isBanned !== undefined) {
			searchQuery.isBanned = isBanned === 'true';
		}

		if (bloodType) {
			searchQuery.bloodType = bloodType;
		}

		if (city) {
			searchQuery['location.city'] = new RegExp(city, 'i');
		}

		if (search) {
			searchQuery.$or = [
				{ firstName: new RegExp(search, 'i') },
				{ lastName: new RegExp(search, 'i') },
				{ email: new RegExp(search, 'i') },
				{ phone: new RegExp(search, 'i') }
			];
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Execute search
		const users = await User.find(searchQuery)
			.select('-password')
			.populate('bannedBy', 'firstName lastName email')
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
		const total = await User.countDocuments(searchQuery);

		res.json({
			success: true,
			message: 'Users retrieved successfully',
			data: {
				users,
				pagination: {
					page: parseInt(page),
					limit: parseInt(limit),
					total: total,
					pages: Math.ceil(total / parseInt(limit))
				}
			}
		});
	} catch (error) {
		console.error('Get users error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to retrieve users',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Admin only
router.put('/users/:id/status', async (req, res) => {
	try {
		const { id } = req.params;
		const { isActive, reason } = req.body;

		if (typeof isActive !== 'boolean') {
			return res.status(400).json({
				message: 'isActive field is required and must be boolean'
			});
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		// Prevent deactivating other admins
		if (user.role === 'admin' && !isActive && req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Cannot deactivate admin users'
			});
		}

		user.isActive = isActive;
		await user.save();

		// Log the action (in a real app, you'd save this to an audit log)
		console.log(`Admin ${req.user.email} ${isActive ? 'activated' : 'deactivated'} user ${user.email}. Reason: ${reason || 'Not provided'}`);

		res.json({
			message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				isActive: user.isActive
			}
		});
	} catch (error) {
		console.error('Update user status error:', error);
		res.status(500).json({
			message: 'Failed to update user status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/admin/users/:id/role
// @desc    Update user role
// @access  Admin only
router.put('/users/:id/role', authorize('admin'), async (req, res) => {
	try {
		const { id } = req.params;
		const { role } = req.body;

		if (!['user', 'admin', 'moderator'].includes(role)) {
			return res.status(400).json({
				message: 'Invalid role. Must be user, admin, or moderator'
			});
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		// Prevent changing own role
		if (user._id.toString() === req.user._id.toString()) {
			return res.status(400).json({
				message: 'Cannot change your own role'
			});
		}

		user.role = role;
		await user.save();

		// Log the action
		console.log(`Admin ${req.user.email} changed role of user ${user.email} to ${role}`);

		res.json({
			message: `User role updated to ${role} successfully`,
			user: {
				_id: user._id,
				firstName: user.firstName,
				lastName: user.lastName,
				email: user.email,
				role: user.role
			}
		});
	} catch (error) {
		console.error('Update user role error:', error);
		res.status(500).json({
			message: 'Failed to update user role',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/donations
// @desc    Get all donations for admin
// @access  Admin only
router.get('/donations', [
	query('status')
		.optional()
		.isIn(['scheduled', 'completed', 'cancelled', 'expired'])
		.withMessage('Invalid status'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	validate
], async (req, res) => {
	try {
		const {
			status,
			bloodType,
			city,
			startDate,
			endDate,
			page = 1,
			limit = 20
		} = req.query;

		// Build search query
		const searchQuery = {};

		if (status) {
			searchQuery.status = status;
		}

		if (bloodType) {
			searchQuery.bloodType = bloodType;
		}

		if (city) {
			searchQuery['location.city'] = new RegExp(city, 'i');
		}

		if (startDate || endDate) {
			searchQuery.donationDate = {};
			if (startDate) {
				searchQuery.donationDate.$gte = new Date(startDate);
			}
			if (endDate) {
				searchQuery.donationDate.$lte = new Date(endDate);
			}
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const donations = await Donation.find(searchQuery)
			.populate('donor', 'firstName lastName email phone')
			.populate('recipient', 'firstName lastName')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Donation.countDocuments(searchQuery);

		res.json({
			message: 'Donations retrieved successfully',
			donations,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get admin donations error:', error);
		res.status(500).json({
			message: 'Failed to retrieve donations',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/payments
// @desc    Get all monetary donations/payments for admin
// @access  Admin only
router.get('/payments', [
	query('status')
		.optional()
		.isIn(['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED'])
		.withMessage('Invalid status'),
	query('startDate')
		.optional()
		.isISO8601()
		.withMessage('Invalid start date'),
	query('endDate')
		.optional()
		.isISO8601()
		.withMessage('Invalid end date'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	validate
], async (req, res) => {
	try {
		const {
			status,
			startDate,
			endDate,
			page = 1,
			limit = 20
		} = req.query;

		// Build search query
		const searchQuery = {};

		if (status) {
			searchQuery.status = status;
		}

		if (startDate || endDate) {
			searchQuery.createdAt = {};
			if (startDate) {
				searchQuery.createdAt.$gte = new Date(startDate);
			}
			if (endDate) {
				searchQuery.createdAt.$lte = new Date(endDate);
			}
		}

		// Get payments with pagination
		const [payments, total] = await Promise.all([
			Payment.find(searchQuery)
				.populate('userId', 'firstName lastName email')
				.select('-__v')
				.sort({ createdAt: -1 })
				.limit(parseInt(limit))
				.skip((parseInt(page) - 1) * parseInt(limit)),
			Payment.countDocuments(searchQuery)
		]);

		// Calculate stats
		const stats = await Payment.aggregate([
			{ $match: searchQuery },
			{
				$group: {
					_id: null,
					totalAmount: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'SUCCESS'] },
								then: '$amount',
								else: 0
							}
						}
					},
					totalPayments: { $sum: 1 },
					successfulPayments: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'SUCCESS'] },
								then: 1,
								else: 0
							}
						}
					},
					failedPayments: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'FAILED'] },
								then: 1,
								else: 0
							}
						}
					},
					pendingPayments: {
						$sum: {
							$cond: {
								if: { $eq: ['$status', 'PENDING'] },
								then: 1,
								else: 0
							}
						}
					}
				}
			}
		]);

		const summary = stats[0] || {
			totalAmount: 0,
			totalPayments: 0,
			successfulPayments: 0,
			failedPayments: 0,
			pendingPayments: 0
		};

		// Get payment method distribution
		const paymentMethods = await Payment.aggregate([
			{ $match: { ...searchQuery, status: 'SUCCESS' } },
			{
				$group: {
					_id: '$cardType',
					count: { $sum: 1 },
					totalAmount: { $sum: '$amount' }
				}
			},
			{ $sort: { count: -1 } }
		]);

		// Get purpose distribution
		const purposeDistribution = await Payment.aggregate([
			{ $match: { ...searchQuery, status: 'SUCCESS' } },
			{
				$group: {
					_id: '$purpose',
					count: { $sum: 1 },
					totalAmount: { $sum: '$amount' }
				}
			},
			{ $sort: { totalAmount: -1 } }
		]);

		res.json({
			message: 'Payments retrieved successfully',
			payments,
			summary,
			paymentMethods,
			purposeDistribution,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get admin payments error:', error);
		res.status(500).json({
			message: 'Failed to retrieve payments',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/requests
// @desc    Get all blood requests for admin
// @access  Admin only
router.get('/requests', [
	query('status')
		.optional()
		.isIn(['pending', 'active', 'partially-fulfilled', 'fulfilled', 'expired', 'cancelled'])
		.withMessage('Invalid status'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	validate
], async (req, res) => {
	try {
		const {
			status,
			bloodType,
			city,
			urgency,
			page = 1,
			limit = 20
		} = req.query;

		// Build search query
		const searchQuery = {};

		if (status) {
			searchQuery.status = status;
		}

		if (bloodType) {
			searchQuery['patient.bloodType'] = bloodType;
		}

		if (city) {
			searchQuery['hospital.city'] = new RegExp(city, 'i');
		}

		if (urgency) {
			searchQuery['bloodRequirement.urgency'] = urgency;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const requests = await BloodRequest.find(searchQuery)
			.populate('requester', 'firstName lastName email phone')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await BloodRequest.countDocuments(searchQuery);

		res.json({
			message: 'Blood requests retrieved successfully',
			requests,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get admin requests error:', error);
		res.status(500).json({
			message: 'Failed to retrieve blood requests',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PATCH /api/admin/requests/:id/status
// @desc    Update blood request status (fulfill/decline)
// @access  Admin only
router.patch('/requests/:id/status', [
	param('id')
		.isMongoId()
		.withMessage('Invalid request ID'),
	body('status')
		.isIn(['fulfilled', 'cancelled', 'partially-fulfilled'])
		.withMessage('Status must be fulfilled, cancelled, or partially-fulfilled'),
	body('adminMessage')
		.optional()
		.trim()
		.isLength({ max: 500 })
		.withMessage('Admin message must be less than 500 characters'),
	body('adminNotes')
		.optional()
		.trim()
		.isLength({ max: 1000 })
		.withMessage('Admin notes must be less than 1000 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { status, adminMessage, adminNotes } = req.body;

		const bloodRequest = await BloodRequest.findById(id);
		if (!bloodRequest) {
			return res.status(404).json({
				message: 'Blood request not found'
			});
		}

		// Update request status and admin info
		bloodRequest.status = status;
		bloodRequest.adminMessage = adminMessage;
		bloodRequest.adminNotes = adminNotes;
		bloodRequest.processedBy = req.user._id;
		bloodRequest.processedAt = new Date();

		await bloodRequest.save();

		// Populate requester info for response
		await bloodRequest.populate('requester', 'firstName lastName email phone');
		await bloodRequest.populate('processedBy', 'firstName lastName email');

		res.json({
			message: `Blood request ${status} successfully`,
			request: bloodRequest
		});
	} catch (error) {
		console.error('Update blood request status error:', error);
		res.status(500).json({
			message: 'Failed to update blood request status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/emergencies
// @desc    Get all emergency requests for admin
// @access  Admin only
router.get('/emergencies', [
	query('status')
		.optional()
		.isIn(['active', 'partially-resolved', 'resolved', 'expired', 'cancelled'])
		.withMessage('Invalid status'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 100 })
		.withMessage('Limit must be between 1 and 100'),
	validate
], async (req, res) => {
	try {
		const {
			status,
			bloodType,
			city,
			severity,
			page = 1,
			limit = 20
		} = req.query;

		// Build search query
		const searchQuery = {};

		if (status) {
			searchQuery.status = status;
		}

		if (bloodType) {
			searchQuery['patient.bloodType'] = bloodType;
		}

		if (city) {
			searchQuery['hospital.city'] = new RegExp(city, 'i');
		}

		if (severity) {
			searchQuery['emergency.severity'] = severity;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const emergencies = await EmergencyRequest.find(searchQuery)
			.populate('requester', 'firstName lastName email phone')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await EmergencyRequest.countDocuments(searchQuery);

		res.json({
			message: 'Emergency requests retrieved successfully',
			emergencies,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get admin emergencies error:', error);
		res.status(500).json({
			message: 'Failed to retrieve emergency requests',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/analytics
// @desc    Get detailed analytics
// @access  Admin only
router.get('/analytics', async (req, res) => {
	try {
		const { startDate, endDate, groupBy = 'month' } = req.query;

		// Date filter
		const dateFilter = {};
		if (startDate || endDate) {
			dateFilter.createdAt = {};
			if (startDate) {
				dateFilter.createdAt.$gte = new Date(startDate);
			}
			if (endDate) {
				dateFilter.createdAt.$lte = new Date(endDate);
			}
		}

		// Group by configuration
		const groupByConfig = {
			day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
			week: { $dateToString: { format: '%Y-%U', date: '$createdAt' } },
			month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
			year: { $dateToString: { format: '%Y', date: '$createdAt' } }
		};

		// Get time-series data
		const [userGrowth, donationTrends, requestTrends] = await Promise.all([
			User.aggregate([
				{ $match: dateFilter },
				{
					$group: {
						_id: groupByConfig[groupBy],
						newUsers: { $sum: 1 },
						donors: { $sum: { $cond: ['$isAvailableDonor', 1, 0] } }
					}
				},
				{ $sort: { _id: 1 } }
			]),
			Donation.aggregate([
				{ $match: dateFilter },
				{
					$group: {
						_id: groupByConfig[groupBy],
						totalDonations: { $sum: 1 },
						completedDonations: {
							$sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
						},
						totalBloodCollected: {
							$sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] }
						}
					}
				},
				{ $sort: { _id: 1 } }
			]),
			BloodRequest.aggregate([
				{ $match: dateFilter },
				{
					$group: {
						_id: groupByConfig[groupBy],
						totalRequests: { $sum: 1 },
						fulfilledRequests: {
							$sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
						},
						urgentRequests: {
							$sum: { $cond: [{ $eq: ['$bloodRequirement.urgency', 'critical'] }, 1, 0] }
						}
					}
				},
				{ $sort: { _id: 1 } }
			])
		]);

		// Blood type analysis
		const bloodTypeAnalysis = await User.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: '$bloodType',
					totalUsers: { $sum: 1 },
					availableDonors: {
						$sum: { $cond: ['$isAvailableDonor', 1, 0] }
					},
					avgDonations: { $avg: '$donationCount' },
					totalDonations: { $sum: '$donationCount' }
				}
			},
			{ $sort: { totalUsers: -1 } }
		]);

		// Geographic analysis
		const geographicAnalysis = await User.aggregate([
			{ $match: { isActive: true } },
			{
				$group: {
					_id: {
						city: '$location.city',
						area: '$location.area'
					},
					totalUsers: { $sum: 1 },
					donors: {
						$sum: { $cond: ['$isAvailableDonor', 1, 0] }
					}
				}
			},
			{ $sort: { totalUsers: -1 } },
			{ $limit: 20 }
		]);

		// Success rates
		const donationSuccessRate = await Donation.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					completed: {
						$sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
					}
				}
			}
		]);

		const requestFulfillmentRate = await BloodRequest.aggregate([
			{
				$group: {
					_id: null,
					total: { $sum: 1 },
					fulfilled: {
						$sum: { $cond: [{ $eq: ['$status', 'fulfilled'] }, 1, 0] }
					}
				}
			}
		]);

		res.json({
			message: 'Analytics data retrieved successfully',
			analytics: {
				timeSeries: {
					userGrowth,
					donationTrends,
					requestTrends
				},
				bloodTypeAnalysis,
				geographicAnalysis,
				successRates: {
					donations: donationSuccessRate[0] || { total: 0, completed: 0 },
					requests: requestFulfillmentRate[0] || { total: 0, fulfilled: 0 }
				}
			},
			filters: {
				startDate,
				endDate,
				groupBy
			}
		});
	} catch (error) {
		console.error('Get analytics error:', error);
		res.status(500).json({
			message: 'Failed to retrieve analytics data',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/admin/change-password
// @desc    Change admin password
// @access  Admin only
router.put('/change-password', [
	body('currentPassword')
		.notEmpty()
		.withMessage('Current password is required'),
	body('newPassword')
		.isLength({ min: 6 })
		.withMessage('New password must be at least 6 characters long')
		.matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
		.withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number'),
	body('confirmPassword')
		.custom((value, { req }) => {
			if (value !== req.body.newPassword) {
				throw new Error('Password confirmation does not match');
			}
			return true;
		})
], validate, async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		// Get current user with password
		const user = await User.findById(userId).select('+password');
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Verify current password
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({
				success: false,
				message: 'Current password is incorrect'
			});
		}

		// Update password
		user.password = newPassword;
		await user.save();

		res.json({
			success: true,
			message: 'Password changed successfully'
		});

	} catch (error) {
		console.error('Change password error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to change password',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/users/:id
// @desc    Get detailed user information
// @access  Admin only
router.get('/users/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const user = await User.findById(id)
			.populate('bannedBy', 'firstName lastName email')
			.select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Get user's donation history
		const donations = await Donation.find({ donor: id })
			.populate('request', 'patient.bloodType')
			.sort({ createdAt: -1 })
			.limit(10);

		// Get user's blood requests
		const requests = await BloodRequest.find({ requester: id })
			.sort({ createdAt: -1 })
			.limit(10);

		// Get user's emergency requests
		const emergencyRequests = await EmergencyRequest.find({ requester: id })
			.sort({ createdAt: -1 })
			.limit(5);

		res.json({
			success: true,
			data: {
				user,
				donations,
				requests,
				emergencyRequests,
				stats: {
					donationCount: user.donationCount || 0,
					requestCount: requests.length,
					emergencyCount: emergencyRequests.length
				}
			}
		});

	} catch (error) {
		console.error('Get user details error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to get user details',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/admin/users/:id/ban
// @desc    Ban or unban a user
// @access  Admin only
router.put('/users/:id/ban', async (req, res) => {
	try {
		const { id } = req.params;
		const { isBanned, banReason } = req.body;

		if (typeof isBanned !== 'boolean') {
			return res.status(400).json({
				success: false,
				message: 'isBanned field is required and must be boolean'
			});
		}

		if (isBanned && !banReason) {
			return res.status(400).json({
				success: false,
				message: 'Ban reason is required when banning a user'
			});
		}

		const user = await User.findById(id);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		// Prevent banning other admins
		if (user.role === 'admin' && isBanned) {
			return res.status(403).json({
				success: false,
				message: 'Cannot ban admin users'
			});
		}

		// Prevent self-ban
		if (user._id.toString() === req.user._id.toString() && isBanned) {
			return res.status(400).json({
				success: false,
				message: 'Cannot ban yourself'
			});
		}

		// Update ban status
		user.isBanned = isBanned;
		user.banReason = isBanned ? banReason : null;
		user.bannedBy = isBanned ? req.user._id : null;
		user.bannedAt = isBanned ? new Date() : null;

		// If banned, deactivate; if unbanned, reactivate
		user.isActive = !isBanned;

		await user.save();

		// Log the action
		console.log(`Admin ${req.user.email} ${isBanned ? 'banned' : 'unbanned'} user ${user.email}. Reason: ${banReason || 'Not provided'}`);

		res.json({
			success: true,
			message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`,
			data: {
				user: {
					_id: user._id,
					firstName: user.firstName,
					lastName: user.lastName,
					email: user.email,
					isActive: user.isActive,
					isBanned: user.isBanned,
					banReason: user.banReason,
					bannedAt: user.bannedAt
				}
			}
		});

	} catch (error) {
		console.error('Ban/unban user error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to update user ban status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/donors
// @desc    Get all donors with statistics
// @access  Admin only
router.get('/donors', [
	query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
	query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
	query('search').optional().isString().trim().isLength({ max: 50 }).withMessage('Search term too long'),
	query('bloodType').optional().isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood type'),
	query('status').optional().isIn(['Available', 'Unavailable']).withMessage('Invalid status'),
	query('isActive').optional().isBoolean().withMessage('isActive must be boolean'),
	validate
], async (req, res) => {
	try {
		const {
			page = 1,
			limit = 10,
			search,
			bloodType,
			status,
			isActive
		} = req.query;

		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Build search query
		let searchQuery = {};

		// Add search functionality (name, email, phone)
		if (search) {
			searchQuery.$or = [
				{ firstName: { $regex: search, $options: 'i' } },
				{ lastName: { $regex: search, $options: 'i' } },
				{ email: { $regex: search, $options: 'i' } },
				{ phone: { $regex: search, $options: 'i' } }
			];
		}

		// Filter by blood type
		if (bloodType) {
			searchQuery.bloodType = bloodType;
		}

		// Filter by active status
		if (isActive !== undefined) {
			searchQuery.isActive = isActive === 'true';
		}

		// Filter by availability status
		if (status) {
			if (status === 'Available') {
				searchQuery.isAvailableDonor = true;
				searchQuery.isActive = true;
			} else if (status === 'Unavailable') {
				searchQuery.$or = [
					{ isAvailableDonor: false },
					{ isActive: false }
				];
			}
		}

		// Get total count for pagination
		const total = await User.countDocuments(searchQuery);

		// Get donors with their donation counts
		const donors = await User.aggregate([
			{ $match: searchQuery },
			{
				$lookup: {
					from: 'hospitaldonations',
					localField: '_id',
					foreignField: 'user',
					as: 'hospitalDonations'
				}
			},
			{
				$lookup: {
					from: 'donations',
					localField: '_id',
					foreignField: 'donor',
					as: 'donations'
				}
			},
			{
				$addFields: {
					totalDonations: {
						$add: [
							{ $size: '$hospitalDonations' },
							{ $size: '$donations' }
						]
					},
					donationCount: {
						$add: [
							{ $size: '$hospitalDonations' },
							{ $size: '$donations' }
						]
					}
				}
			},
			{
				$project: {
					firstName: 1,
					lastName: 1,
					email: 1,
					phone: 1,
					bloodType: 1,
					location: 1,
					isAvailableDonor: 1,
					isActive: 1,
					isVerified: 1,
					createdAt: 1,
					lastLogin: 1,
					totalDonations: 1,
					donationCount: 1,
					status: {
						$cond: {
							if: { $and: ['$isActive', '$isAvailableDonor'] },
							then: 'Available',
							else: 'Unavailable'
						}
					}
				}
			},
			{ $sort: { createdAt: -1 } },
			{ $skip: skip },
			{ $limit: parseInt(limit) }
		]);

		// Get blood type statistics
		const bloodTypeStats = await User.aggregate([
			{
				$match: {
					isActive: true,
					isAvailableDonor: true
				}
			},
			{
				$group: {
					_id: '$bloodType',
					count: { $sum: 1 }
				}
			}
		]);

		// Initialize all blood types with 0 count
		const allBloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
		const bloodTypeStatsObject = {};

		// Set all blood types to 0 initially
		allBloodTypes.forEach(bloodType => {
			bloodTypeStatsObject[bloodType] = 0;
		});

		// Update with actual counts
		bloodTypeStats.forEach(stat => {
			if (stat._id && allBloodTypes.includes(stat._id)) {
				bloodTypeStatsObject[stat._id] = stat.count;
			}
		});

		// Calculate pagination info
		const totalPages = Math.ceil(total / parseInt(limit));

		res.json({
			success: true,
			data: {
				donors,
				total,
				page: parseInt(page),
				totalPages,
				bloodTypeStats: bloodTypeStatsObject
			}
		});

	} catch (error) {
		console.error('Get donors error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch donors',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/admin/donors/:id
// @desc    Get donor details with donation history
// @access  Admin only
router.get('/donors/:id', async (req, res) => {
	try {
		const { id } = req.params;

		// Get donor details
		const donor = await User.findById(id)
			.select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');

		if (!donor) {
			return res.status(404).json({
				success: false,
				message: 'Donor not found'
			});
		}

		// Get donations and hospital donations
		const [donations, hospitalDonations] = await Promise.all([
			Donation.find({ donor: id })
				.populate('request', 'patient.bloodType patient.name createdAt')
				.sort({ createdAt: -1 }),
			require('../models/HospitalDonation').find({ user: id })
				.sort({ createdAt: -1 })
		]);

		// Calculate stats
		const stats = {
			totalDonations: donations.length + hospitalDonations.length,
			hospitalDonations: hospitalDonations.length,
			availableDonorRegistrations: donor.isAvailableDonor ? 1 : 0
		};

		res.json({
			success: true,
			data: {
				donor: {
					...donor.toObject(),
					totalDonations: stats.totalDonations,
					status: donor.isActive && donor.isAvailableDonor ? 'Available' : 'Unavailable'
				},
				donations,
				hospitalDonations,
				stats
			}
		});

	} catch (error) {
		console.error('Get donor details error:', error);
		res.status(500).json({
			success: false,
			message: 'Failed to fetch donor details',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
