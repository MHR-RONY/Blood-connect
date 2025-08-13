const express = require('express');
const { query } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const EmergencyRequest = require('../models/EmergencyRequest');
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
			message: 'Admin dashboard data retrieved successfully',
			statistics: {
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
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
		const total = await User.countDocuments(searchQuery);

		res.json({
			message: 'Users retrieved successfully',
			users,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get users error:', error);
		res.status(500).json({
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

module.exports = router;
