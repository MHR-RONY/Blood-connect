const express = require('express');
const { body, query } = require('express-validator');
const Donation = require('../models/Donation');
const User = require('../models/User');
const BloodRequest = require('../models/BloodRequest');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/donations
// @desc    Schedule a donation
// @access  Private
router.post('/', [
	authenticate,
	body('bloodType')
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
		.withMessage('Invalid blood type'),
	body('appointmentTime')
		.isISO8601()
		.withMessage('Valid appointment time is required'),
	body('location.hospital')
		.trim()
		.notEmpty()
		.withMessage('Hospital name is required'),
	body('location.address')
		.trim()
		.notEmpty()
		.withMessage('Hospital address is required'),
	body('location.city')
		.trim()
		.notEmpty()
		.withMessage('City is required'),
	body('amount')
		.optional()
		.isInt({ min: 250, max: 500 })
		.withMessage('Donation amount must be between 250ml and 500ml'),
	validate
], async (req, res) => {
	try {
		const {
			bloodType,
			appointmentTime,
			location,
			amount = 450,
			recipient,
			notes,
			isEmergency = false,
			emergencyRequest
		} = req.body;

		// Check if user can donate
		const donor = await User.findById(req.user._id);
		const eligibility = donor.checkDonationEligibility();

		if (!eligibility.eligible) {
			return res.status(400).json({
				message: 'You are not eligible to donate at this time',
				reasons: eligibility.reasons
			});
		}

		// Verify blood type matches user's blood type
		if (bloodType !== donor.bloodType) {
			return res.status(400).json({
				message: 'Blood type must match your registered blood type'
			});
		}

		// Check appointment time is in the future
		if (new Date(appointmentTime) <= new Date()) {
			return res.status(400).json({
				message: 'Appointment time must be in the future'
			});
		}

		const donation = new Donation({
			donor: req.user._id,
			recipient,
			bloodType,
			amount,
			appointmentTime,
			location,
			notes,
			isEmergency,
			emergencyRequest
		});

		await donation.save();

		// Populate donor info for response
		await donation.populate('donor', 'firstName lastName phone');
		if (recipient) {
			await donation.populate('recipient', 'firstName lastName');
		}

		res.status(201).json({
			message: 'Donation scheduled successfully',
			donation
		});
	} catch (error) {
		console.error('Schedule donation error:', error);
		res.status(500).json({
			message: 'Failed to schedule donation',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/donations
// @desc    Get donations with filters
// @access  Private (for donors/admins)
router.get('/', [
	authenticate,
	query('status')
		.optional()
		.isIn(['scheduled', 'completed', 'cancelled', 'expired'])
		.withMessage('Invalid status'),
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
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
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
			limit = 10,
			sortBy = 'donationDate',
			sortOrder = 'desc'
		} = req.query;

		// Build search query
		const searchQuery = {};

		// If not admin, only show user's own donations
		if (req.user.role !== 'admin') {
			searchQuery.donor = req.user._id;
		}

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

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Build sort object
		const sort = {};
		sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

		// Execute search
		const donations = await Donation.find(searchQuery)
			.populate('donor', 'firstName lastName phone')
			.populate('recipient', 'firstName lastName')
			.populate('emergencyRequest', 'emergency.type patient.name')
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
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
		console.error('Get donations error:', error);
		res.status(500).json({
			message: 'Failed to retrieve donations',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/donations/:id
// @desc    Get a specific donation
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
	try {
		const { id } = req.params;

		const donation = await Donation.findById(id)
			.populate('donor', 'firstName lastName phone email')
			.populate('recipient', 'firstName lastName')
			.populate('emergencyRequest', 'emergency.type patient.name hospital.name');

		if (!donation) {
			return res.status(404).json({
				message: 'Donation not found'
			});
		}

		// Check if user can access this donation
		const canAccess = req.user.role === 'admin' ||
			donation.donor._id.toString() === req.user._id.toString() ||
			(donation.recipient && donation.recipient._id.toString() === req.user._id.toString());

		if (!canAccess) {
			return res.status(403).json({
				message: 'Access denied'
			});
		}

		res.json({
			message: 'Donation retrieved successfully',
			donation
		});
	} catch (error) {
		console.error('Get donation error:', error);
		res.status(500).json({
			message: 'Failed to retrieve donation',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/donations/:id/status
// @desc    Update donation status
// @access  Private (donor or admin)
router.put('/:id/status', [
	authenticate,
	body('status')
		.isIn(['scheduled', 'completed', 'cancelled', 'expired'])
		.withMessage('Invalid status'),
	body('notes')
		.optional()
		.isLength({ max: 500 })
		.withMessage('Notes cannot exceed 500 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { status, notes } = req.body;

		const donation = await Donation.findById(id);

		if (!donation) {
			return res.status(404).json({
				message: 'Donation not found'
			});
		}

		// Check permissions
		const canUpdate = req.user.role === 'admin' ||
			donation.donor.toString() === req.user._id.toString();

		if (!canUpdate) {
			return res.status(403).json({
				message: 'Access denied'
			});
		}

		// Update status
		donation.status = status;
		if (notes) {
			donation.notes = notes;
		}

		// If completing donation, update donor record
		if (status === 'completed') {
			const donor = await User.findById(donation.donor);
			await donor.recordDonation();

			donation.donationDate = new Date();
		}

		await donation.save();

		res.json({
			message: 'Donation status updated successfully',
			donation
		});
	} catch (error) {
		console.error('Update donation status error:', error);
		res.status(500).json({
			message: 'Failed to update donation status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/donations/:id/prescreening
// @desc    Update pre-screening results
// @access  Private (admin/medical staff only)
router.put('/:id/prescreening', [
	authenticate,
	body('hemoglobin')
		.optional()
		.isFloat({ min: 10, max: 20 })
		.withMessage('Hemoglobin must be between 10 and 20 g/dL'),
	body('bloodPressure.systolic')
		.optional()
		.isInt({ min: 80, max: 200 })
		.withMessage('Systolic pressure must be between 80 and 200 mmHg'),
	body('bloodPressure.diastolic')
		.optional()
		.isInt({ min: 40, max: 120 })
		.withMessage('Diastolic pressure must be between 40 and 120 mmHg'),
	body('pulse')
		.optional()
		.isInt({ min: 40, max: 120 })
		.withMessage('Pulse must be between 40 and 120 bpm'),
	body('temperature')
		.optional()
		.isFloat({ min: 35, max: 39 })
		.withMessage('Temperature must be between 35 and 39°C'),
	body('weight')
		.optional()
		.isFloat({ min: 45, max: 200 })
		.withMessage('Weight must be between 45 and 200 kg'),
	body('passed')
		.isBoolean()
		.withMessage('Passed status is required'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const prescreeningData = req.body;

		// Check if user has permission (admin or medical staff)
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Only medical staff can update pre-screening results'
			});
		}

		const donation = await Donation.findById(id);

		if (!donation) {
			return res.status(404).json({
				message: 'Donation not found'
			});
		}

		// Update pre-screening data
		donation.preScreening = {
			...donation.preScreening.toObject(),
			...prescreeningData
		};

		await donation.save();

		res.json({
			message: 'Pre-screening results updated successfully',
			preScreening: donation.preScreening
		});
	} catch (error) {
		console.error('Update pre-screening error:', error);
		res.status(500).json({
			message: 'Failed to update pre-screening results',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/donations/:id/test-results
// @desc    Update test results
// @access  Private (admin/medical staff only)
router.put('/:id/test-results', [
	authenticate,
	body('hivTest')
		.optional()
		.isIn(['positive', 'negative', 'pending'])
		.withMessage('Invalid HIV test result'),
	body('hepatitisBTest')
		.optional()
		.isIn(['positive', 'negative', 'pending'])
		.withMessage('Invalid Hepatitis B test result'),
	body('hepatitisCTest')
		.optional()
		.isIn(['positive', 'negative', 'pending'])
		.withMessage('Invalid Hepatitis C test result'),
	body('syphilisTest')
		.optional()
		.isIn(['positive', 'negative', 'pending'])
		.withMessage('Invalid Syphilis test result'),
	body('malariaTest')
		.optional()
		.isIn(['positive', 'negative', 'pending'])
		.withMessage('Invalid Malaria test result'),
	body('approved')
		.optional()
		.isBoolean()
		.withMessage('Approved status must be boolean'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const testData = req.body;

		// Check if user has permission (admin or medical staff)
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Only medical staff can update test results'
			});
		}

		const donation = await Donation.findById(id);

		if (!donation) {
			return res.status(404).json({
				message: 'Donation not found'
			});
		}

		// Update test results
		donation.testResults = {
			...donation.testResults.toObject(),
			...testData,
			testDate: new Date(),
			testedBy: req.user.fullName
		};

		await donation.save();

		res.json({
			message: 'Test results updated successfully',
			testResults: donation.testResults
		});
	} catch (error) {
		console.error('Update test results error:', error);
		res.status(500).json({
			message: 'Failed to update test results',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/donations/:id/feedback
// @desc    Submit feedback for a donation
// @access  Private (donor only)
router.post('/:id/feedback', [
	authenticate,
	body('donorRating')
		.optional()
		.isInt({ min: 1, max: 5 })
		.withMessage('Donor rating must be between 1 and 5'),
	body('donorComments')
		.optional()
		.isLength({ max: 500 })
		.withMessage('Donor comments cannot exceed 500 characters'),
	body('hospitalRating')
		.optional()
		.isInt({ min: 1, max: 5 })
		.withMessage('Hospital rating must be between 1 and 5'),
	body('hospitalComments')
		.optional()
		.isLength({ max: 500 })
		.withMessage('Hospital comments cannot exceed 500 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const feedbackData = req.body;

		const donation = await Donation.findById(id);

		if (!donation) {
			return res.status(404).json({
				message: 'Donation not found'
			});
		}

		// Check if user is the donor
		if (donation.donor.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'Only the donor can submit feedback'
			});
		}

		// Check if donation is completed
		if (donation.status !== 'completed') {
			return res.status(400).json({
				message: 'Feedback can only be submitted for completed donations'
			});
		}

		// Update feedback
		donation.feedback = {
			...donation.feedback.toObject(),
			...feedbackData
		};

		await donation.save();

		res.json({
			message: 'Feedback submitted successfully',
			feedback: donation.feedback
		});
	} catch (error) {
		console.error('Submit feedback error:', error);
		res.status(500).json({
			message: 'Failed to submit feedback',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/donations/statistics/overview
// @desc    Get donation statistics
// @access  Private (admin only)
router.get('/statistics/overview', authenticate, async (req, res) => {
	try {
		if (req.user.role !== 'admin') {
			return res.status(403).json({
				message: 'Access denied. Admin only.'
			});
		}

		const { startDate, endDate } = req.query;

		// Build date filter
		const dateFilter = {};
		if (startDate || endDate) {
			dateFilter.donationDate = {};
			if (startDate) {
				dateFilter.donationDate.$gte = new Date(startDate);
			}
			if (endDate) {
				dateFilter.donationDate.$lte = new Date(endDate);
			}
		}

		// Get various statistics
		const [
			totalDonations,
			completedDonations,
			donationsByBloodType,
			donationsByCity,
			monthlyDonations
		] = await Promise.all([
			Donation.countDocuments(dateFilter),
			Donation.countDocuments({ ...dateFilter, status: 'completed' }),
			Donation.aggregate([
				{ $match: { ...dateFilter, status: 'completed' } },
				{ $group: { _id: '$bloodType', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
				{ $sort: { count: -1 } }
			]),
			Donation.aggregate([
				{ $match: { ...dateFilter, status: 'completed' } },
				{ $group: { _id: '$location.city', count: { $sum: 1 } } },
				{ $sort: { count: -1 } },
				{ $limit: 10 }
			]),
			Donation.aggregate([
				{ $match: { ...dateFilter, status: 'completed' } },
				{
					$group: {
						_id: {
							year: { $year: '$donationDate' },
							month: { $month: '$donationDate' }
						},
						count: { $sum: 1 },
						totalAmount: { $sum: '$amount' }
					}
				},
				{ $sort: { '_id.year': 1, '_id.month': 1 } }
			])
		]);

		res.json({
			message: 'Donation statistics retrieved successfully',
			statistics: {
				totalDonations,
				completedDonations,
				successRate: totalDonations > 0 ? ((completedDonations / totalDonations) * 100).toFixed(2) : 0,
				donationsByBloodType,
				donationsByCity,
				monthlyTrend: monthlyDonations
			}
		});
	} catch (error) {
		console.error('Get donation statistics error:', error);
		res.status(500).json({
			message: 'Failed to retrieve donation statistics',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
