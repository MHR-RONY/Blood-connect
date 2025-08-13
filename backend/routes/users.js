const express = require('express');
const { body, query } = require('express-validator');
const User = require('../models/User');
const Donation = require('../models/Donation');
const BloodRequest = require('../models/BloodRequest');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// @route   GET /api/users/search
// @desc    Search for blood donors
// @access  Public
router.get('/search', [
	query('bloodType')
		.optional()
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
		.withMessage('Invalid blood type'),
	query('city')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('City must be at least 2 characters'),
	query('area')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('Area must be at least 2 characters'),
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
	validate
], async (req, res) => {
	try {
		const {
			bloodType,
			city,
			area,
			page = 1,
			limit = 10,
			sortBy = 'rating.average',
			sortOrder = 'desc'
		} = req.query;

		// Build search query
		const searchQuery = {
			isAvailableDonor: true,
			isActive: true,
			'medicalHistory.isEligibleToDonate': true
		};

		if (bloodType) {
			searchQuery.bloodType = bloodType;
		}

		if (city) {
			searchQuery['location.city'] = new RegExp(city, 'i');
		}

		if (area) {
			searchQuery['location.area'] = new RegExp(area, 'i');
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Execute search
		const donors = await User.find(searchQuery)
			.select('-password -email -phone -medicalHistory -preferences')
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit))
			.lean();

		// Get total count for pagination
		const total = await User.countDocuments(searchQuery);

		// Add virtual fields manually since we're using lean()
		const donorsWithVirtuals = donors.map(donor => ({
			...donor,
			fullName: `${donor.firstName} ${donor.lastName}`,
			age: Math.floor((new Date() - new Date(donor.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365)),
			canDonate: !donor.lastDonationDate ||
				((new Date() - new Date(donor.lastDonationDate)) / (1000 * 60 * 60 * 24)) >= 56
		}));

		res.json({
			message: 'Donors retrieved successfully',
			donors: donorsWithVirtuals,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Search donors error:', error);
		res.status(500).json({
			message: 'Failed to search donors',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/users/profile/:id
// @desc    Get user profile by ID
// @access  Public (limited info) / Private (full info if own profile)
router.get('/profile/:id', optionalAuth, async (req, res) => {
	try {
		const { id } = req.params;

		// Check if requesting own profile
		const isOwnProfile = req.user && req.user._id.toString() === id;

		let selectFields = '-password';
		if (!isOwnProfile) {
			// Limited info for public profiles
			selectFields = '-password -email -phone -medicalHistory -preferences -verificationToken -passwordResetToken';
		}

		const user = await User.findById(id).select(selectFields);

		if (!user || !user.isActive) {
			return res.status(404).json({
				message: 'User not found'
			});
		}

		// Get donation history if requested
		const includeDonations = req.query.includeDonations === 'true';
		let donations = [];

		if (includeDonations && (isOwnProfile || user.role === 'user')) {
			donations = await Donation.find({ donor: id })
				.populate('recipient', 'firstName lastName')
				.select(isOwnProfile ? {} : 'donationDate status location amount')
				.sort({ donationDate: -1 })
				.limit(10);
		}

		res.json({
			message: 'User profile retrieved successfully',
			user,
			donations: includeDonations ? donations : undefined,
			isOwnProfile
		});
	} catch (error) {
		console.error('Get user profile error:', error);
		res.status(500).json({
			message: 'Failed to retrieve user profile',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', [
	authenticate,
	body('firstName')
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('First name must be between 2 and 50 characters'),
	body('lastName')
		.optional()
		.trim()
		.isLength({ min: 2, max: 50 })
		.withMessage('Last name must be between 2 and 50 characters'),
	body('phone')
		.optional()
		.isMobilePhone()
		.withMessage('Please provide a valid phone number'),
	body('weight')
		.optional()
		.isNumeric()
		.isFloat({ min: 45, max: 200 })
		.withMessage('Weight must be between 45 and 200 kg'),
	body('location.city')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('City cannot be empty'),
	body('location.area')
		.optional()
		.trim()
		.notEmpty()
		.withMessage('Area cannot be empty'),
	validate
], async (req, res) => {
	try {
		const updates = req.body;
		const allowedUpdates = [
			'firstName', 'lastName', 'phone', 'weight', 'location',
			'isAvailableDonor', 'preferences', 'medicalHistory'
		];

		// Filter allowed updates
		const filteredUpdates = {};
		Object.keys(updates).forEach(key => {
			if (allowedUpdates.includes(key)) {
				filteredUpdates[key] = updates[key];
			}
		});

		const user = await User.findByIdAndUpdate(
			req.user._id,
			filteredUpdates,
			{ new: true, runValidators: true }
		).select('-password');

		res.json({
			message: 'Profile updated successfully',
			user
		});
	} catch (error) {
		console.error('Update profile error:', error);

		if (error.code === 11000) {
			return res.status(400).json({
				message: 'Phone number already exists'
			});
		}

		res.status(500).json({
			message: 'Failed to update profile',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/users/availability
// @desc    Update donor availability
// @access  Private
router.put('/availability', [
	authenticate,
	body('isAvailableDonor')
		.isBoolean()
		.withMessage('Availability must be true or false'),
	validate
], async (req, res) => {
	try {
		const { isAvailableDonor } = req.body;

		const user = await User.findByIdAndUpdate(
			req.user._id,
			{ isAvailableDonor },
			{ new: true }
		).select('isAvailableDonor firstName lastName');

		res.json({
			message: `Donor availability ${isAvailableDonor ? 'activated' : 'deactivated'} successfully`,
			user
		});
	} catch (error) {
		console.error('Update availability error:', error);
		res.status(500).json({
			message: 'Failed to update availability',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/users/dashboard
// @desc    Get user dashboard data
// @access  Private
router.get('/dashboard', authenticate, async (req, res) => {
	try {
		const userId = req.user._id;

		// Get user's donation history
		const donations = await Donation.find({ donor: userId })
			.populate('recipient', 'firstName lastName')
			.sort({ donationDate: -1 })
			.limit(5);

		// Get user's blood requests
		const myRequests = await BloodRequest.find({ requester: userId })
			.sort({ createdAt: -1 })
			.limit(5);

		// Get nearby blood requests that user can help with
		const compatibleBloodTypes = BloodRequest.getCompatibleRequests(req.user.bloodType);
		const nearbyRequests = await BloodRequest.find({
			'patient.bloodType': { $in: compatibleBloodTypes },
			'hospital.city': req.user.location.city,
			status: { $in: ['pending', 'active', 'partially-fulfilled'] },
			requester: { $ne: userId }
		})
			.populate('requester', 'firstName lastName')
			.sort({ priority: -1, createdAt: -1 })
			.limit(5);

		// Calculate statistics
		const stats = {
			totalDonations: req.user.donationCount,
			lastDonationDate: req.user.lastDonationDate,
			canDonate: req.user.canDonate,
			rating: req.user.rating.average,
			bloodType: req.user.bloodType,
			location: req.user.location
		};

		res.json({
			message: 'Dashboard data retrieved successfully',
			stats,
			recentDonations: donations,
			myRequests,
			nearbyRequests
		});
	} catch (error) {
		console.error('Get dashboard error:', error);
		res.status(500).json({
			message: 'Failed to retrieve dashboard data',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/users/donation-history
// @desc    Get user's donation history
// @access  Private
router.get('/donation-history', [
	authenticate,
	query('page')
		.optional()
		.isInt({ min: 1 })
		.withMessage('Page must be a positive integer'),
	query('limit')
		.optional()
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
	validate
], async (req, res) => {
	try {
		const { page = 1, limit = 10 } = req.query;
		const skip = (parseInt(page) - 1) * parseInt(limit);

		const donations = await Donation.find({ donor: req.user._id })
			.populate('recipient', 'firstName lastName')
			.populate('emergencyRequest', 'emergency.type patient.name')
			.sort({ donationDate: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await Donation.countDocuments({ donor: req.user._id });

		res.json({
			message: 'Donation history retrieved successfully',
			donations,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get donation history error:', error);
		res.status(500).json({
			message: 'Failed to retrieve donation history',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/users/report
// @desc    Report a user
// @access  Private
router.post('/report', [
	authenticate,
	body('reportedUser')
		.isMongoId()
		.withMessage('Valid user ID is required'),
	body('reason')
		.isIn(['spam', 'inappropriate-behavior', 'fake-profile', 'scam', 'other'])
		.withMessage('Valid reason is required'),
	body('description')
		.optional()
		.isLength({ max: 500 })
		.withMessage('Description cannot exceed 500 characters'),
	validate
], async (req, res) => {
	try {
		const { reportedUser, reason, description } = req.body;

		// Check if reported user exists
		const userExists = await User.findById(reportedUser);
		if (!userExists) {
			return res.status(404).json({
				message: 'Reported user not found'
			});
		}

		// Here you would typically save the report to a reports collection
		// For now, we'll just log it and return success
		console.log('User Report:', {
			reporter: req.user._id,
			reportedUser,
			reason,
			description,
			timestamp: new Date()
		});

		res.json({
			message: 'Report submitted successfully. Our team will review it.'
		});
	} catch (error) {
		console.error('Report user error:', error);
		res.status(500).json({
			message: 'Failed to submit report',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
