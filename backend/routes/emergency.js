const express = require('express');
const { body, query } = require('express-validator');
const EmergencyRequest = require('../models/EmergencyRequest');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/emergency
// @desc    Create a new emergency blood request
// @access  Private
router.post('/', [
	authenticate,
	body('patient.name')
		.trim()
		.isLength({ min: 2, max: 100 })
		.withMessage('Patient name must be between 2 and 100 characters'),
	body('patient.age')
		.isInt({ min: 0, max: 150 })
		.withMessage('Patient age must be between 0 and 150'),
	body('patient.gender')
		.isIn(['male', 'female', 'other'])
		.withMessage('Invalid gender'),
	body('patient.bloodType')
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
		.withMessage('Invalid blood type'),
	body('patient.contactNumber')
		.isMobilePhone()
		.withMessage('Valid contact number is required'),
	body('emergency.type')
		.isIn(['accident', 'surgery', 'massive-bleeding', 'organ-failure', 'pregnancy-complication', 'blood-disorder', 'other'])
		.withMessage('Invalid emergency type'),
	body('emergency.severity')
		.isIn(['critical', 'severe', 'moderate'])
		.withMessage('Invalid severity level'),
	body('emergency.description')
		.trim()
		.isLength({ min: 10, max: 500 })
		.withMessage('Emergency description must be between 10 and 500 characters'),
	body('emergency.timeOfIncident')
		.isISO8601()
		.withMessage('Valid time of incident is required'),
	body('hospital.name')
		.trim()
		.notEmpty()
		.withMessage('Hospital name is required'),
	body('hospital.address')
		.trim()
		.notEmpty()
		.withMessage('Hospital address is required'),
	body('hospital.city')
		.trim()
		.notEmpty()
		.withMessage('Hospital city is required'),
	body('hospital.area')
		.trim()
		.notEmpty()
		.withMessage('Hospital area is required'),
	body('hospital.contactNumber')
		.isMobilePhone()
		.withMessage('Valid hospital contact number is required'),
	body('hospital.emergencyDepartment')
		.trim()
		.notEmpty()
		.withMessage('Emergency department contact is required'),
	body('hospital.doctorInCharge.name')
		.trim()
		.notEmpty()
		.withMessage('Doctor name is required'),
	body('bloodRequirement.units')
		.isInt({ min: 1, max: 20 })
		.withMessage('Units must be between 1 and 20'),
	body('bloodRequirement.requiredWithin')
		.isInt({ min: 1, max: 72 })
		.withMessage('Required within must be between 1 and 72 hours'),
	validate
], async (req, res) => {
	try {
		const emergencyData = {
			...req.body,
			requester: req.user._id,
			status: 'active',
			priority: 5 // Highest priority for emergencies
		};

		const emergency = new EmergencyRequest(emergencyData);
		await emergency.save();

		// Add initial timeline event
		emergency.addTimelineEvent(
			'emergency-created',
			'Emergency blood request created',
			req.user._id,
			{ severity: req.body.emergency.severity, units: req.body.bloodRequirement.units }
		);

		await emergency.save();

		// Populate requester info for response
		await emergency.populate('requester', 'firstName lastName phone');

		// Broadcast emergency to compatible donors
		try {
			const eligibleDonors = await emergency.broadcastEmergency(User);
			emergency.addTimelineEvent(
				'emergency-broadcasted',
				`Emergency broadcasted to ${eligibleDonors.length} eligible donors`,
				req.user._id,
				{ donorsNotified: eligibleDonors.length }
			);
			await emergency.save();
		} catch (broadcastError) {
			console.error('Error broadcasting emergency:', broadcastError);
			// Continue even if broadcast fails
		}

		res.status(201).json({
			message: 'Emergency blood request created successfully',
			emergency,
			broadcastStatus: 'Notifying eligible donors...'
		});
	} catch (error) {
		console.error('Create emergency request error:', error);
		res.status(500).json({
			message: 'Failed to create emergency request',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/emergency
// @desc    Get emergency blood requests
// @access  Public
router.get('/', [
	query('bloodType')
		.optional()
		.isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'])
		.withMessage('Invalid blood type'),
	query('city')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('City must be at least 2 characters'),
	query('severity')
		.optional()
		.isIn(['critical', 'severe', 'moderate'])
		.withMessage('Invalid severity level'),
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
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
	validate
], async (req, res) => {
	try {
		const {
			bloodType,
			city,
			severity,
			status = ['active', 'partially-resolved'],
			page = 1,
			limit = 10,
			sortBy = 'urgencyLevel',
			sortOrder = 'desc'
		} = req.query;

		// Build search query
		const searchQuery = {};

		if (bloodType) {
			searchQuery['patient.bloodType'] = bloodType;
		}

		if (city) {
			searchQuery['hospital.city'] = new RegExp(city, 'i');
		}

		if (severity) {
			searchQuery['emergency.severity'] = severity;
		}

		// Handle status as array or string
		if (Array.isArray(status)) {
			searchQuery.status = { $in: status };
		} else {
			searchQuery.status = status;
		}

		// Only show active emergencies that haven't expired
		const now = new Date();
		searchQuery.expiresAt = { $gt: now };

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Build sort object
		const sort = {};
		if (sortBy === 'urgencyLevel') {
			sort.priority = -1;
			sort['emergency.severity'] = -1;
			sort.createdAt = -1;
		} else {
			sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
		}

		// Execute search
		const emergencies = await EmergencyRequest.find(searchQuery)
			.populate('requester', 'firstName lastName rating.average')
			.select('-responses -timeline') // Exclude sensitive data from listing
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
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
		console.error('Get emergency requests error:', error);
		res.status(500).json({
			message: 'Failed to retrieve emergency requests',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/emergency/:id
// @desc    Get a specific emergency request
// @access  Public
router.get('/:id', async (req, res) => {
	try {
		const { id } = req.params;

		const emergency = await EmergencyRequest.findById(id)
			.populate('requester', 'firstName lastName phone rating.average')
			.populate('responses.donor', 'firstName lastName rating.average phone')
			.populate('confirmedDonors.donor', 'firstName lastName phone');

		if (!emergency) {
			return res.status(404).json({
				message: 'Emergency request not found'
			});
		}

		// Increment view count
		emergency.analytics.views += 1;
		await emergency.save();

		res.json({
			message: 'Emergency request retrieved successfully',
			emergency
		});
	} catch (error) {
		console.error('Get emergency request error:', error);
		res.status(500).json({
			message: 'Failed to retrieve emergency request',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/emergency/:id/respond
// @desc    Respond to an emergency blood request
// @access  Private
router.post('/:id/respond', [
	authenticate,
	body('message')
		.optional()
		.isLength({ max: 200 })
		.withMessage('Message cannot exceed 200 characters'),
	body('availability')
		.isIn(['immediate', 'within-1h', 'within-2h', 'within-4h'])
		.withMessage('Invalid availability option'),
	body('location.currentCity')
		.trim()
		.isLength({ min: 2 })
		.withMessage('Current city must be at least 2 characters'),
	body('location.estimatedArrival')
		.optional()
		.trim(),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { message, availability, location, contactMethod = 'phone' } = req.body;

		const emergency = await EmergencyRequest.findById(id);

		if (!emergency) {
			return res.status(404).json({
				message: 'Emergency request not found'
			});
		}

		if (emergency.status === 'resolved' || emergency.status === 'expired' || emergency.status === 'cancelled') {
			return res.status(400).json({
				message: 'This emergency request is no longer active'
			});
		}

		// Check if user already responded
		const existingResponse = emergency.responses.find(
			response => response.donor.toString() === req.user._id.toString()
		);

		if (existingResponse) {
			return res.status(400).json({
				message: 'You have already responded to this emergency'
			});
		}

		// Check if user can donate to this blood type
		const compatibleTypes = EmergencyRequest.getCompatibleDonors(emergency.patient.bloodType);
		if (!compatibleTypes.includes(req.user.bloodType)) {
			return res.status(400).json({
				message: 'Your blood type is not compatible with this emergency request'
			});
		}

		// Check donor eligibility
		const donor = await User.findById(req.user._id);
		const eligibility = donor.checkDonationEligibility();

		if (!eligibility.eligible) {
			return res.status(400).json({
				message: 'You are not eligible to donate at this time',
				reasons: eligibility.reasons
			});
		}

		// Add response
		emergency.responses.push({
			donor: req.user._id,
			message,
			availability,
			location,
			contactMethod
		});

		// Update analytics
		emergency.broadcast.totalResponses += 1;

		// Add timeline event
		emergency.addTimelineEvent(
			'donor-responded',
			`${req.user.firstName} ${req.user.lastName} responded to emergency`,
			req.user._id,
			{ availability, bloodType: req.user.bloodType }
		);

		await emergency.save();

		// Populate the new response for return
		await emergency.populate('responses.donor', 'firstName lastName rating.average');

		res.json({
			message: 'Emergency response submitted successfully',
			response: emergency.responses[emergency.responses.length - 1]
		});
	} catch (error) {
		console.error('Respond to emergency error:', error);
		res.status(500).json({
			message: 'Failed to submit emergency response',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/emergency/:id/confirm-donor
// @desc    Confirm a donor for emergency (requester only)
// @access  Private
router.post('/:id/confirm-donor', [
	authenticate,
	body('donorId')
		.isMongoId()
		.withMessage('Valid donor ID is required'),
	body('expectedArrival')
		.isISO8601()
		.withMessage('Valid expected arrival time is required'),
	body('notes')
		.optional()
		.isLength({ max: 300 })
		.withMessage('Notes cannot exceed 300 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { donorId, expectedArrival, notes } = req.body;

		const emergency = await EmergencyRequest.findById(id);

		if (!emergency) {
			return res.status(404).json({
				message: 'Emergency request not found'
			});
		}

		// Check if user is the requester
		if (emergency.requester.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'Only the requester can confirm donors'
			});
		}

		// Check if emergency is still active
		if (emergency.status === 'resolved') {
			return res.status(400).json({
				message: 'This emergency has already been resolved'
			});
		}

		// Check if donor exists in responses
		const donorResponse = emergency.responses.find(
			response => response.donor.toString() === donorId
		);

		if (!donorResponse) {
			return res.status(404).json({
				message: 'Donor response not found'
			});
		}

		if (donorResponse.status === 'confirmed') {
			return res.status(400).json({
				message: 'This donor has already been confirmed'
			});
		}

		// Confirm the donor
		emergency.confirmDonor(donorId, expectedArrival, notes);
		await emergency.save();

		// Populate for response
		await emergency.populate('confirmedDonors.donor', 'firstName lastName phone');

		res.json({
			message: 'Donor confirmed successfully',
			confirmedDonor: emergency.confirmedDonors[emergency.confirmedDonors.length - 1]
		});
	} catch (error) {
		console.error('Confirm donor error:', error);
		res.status(500).json({
			message: 'Failed to confirm donor',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/emergency/:id/donor-status
// @desc    Update donor status in emergency
// @access  Private
router.put('/:id/donor-status', [
	authenticate,
	body('donorId')
		.isMongoId()
		.withMessage('Valid donor ID is required'),
	body('status')
		.isIn(['scheduled', 'in-progress', 'completed', 'cancelled'])
		.withMessage('Invalid donation status'),
	body('unitsContributed')
		.optional()
		.isInt({ min: 1, max: 5 })
		.withMessage('Units contributed must be between 1 and 5'),
	body('notes')
		.optional()
		.isLength({ max: 300 })
		.withMessage('Notes cannot exceed 300 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { donorId, status, unitsContributed, notes } = req.body;

		const emergency = await EmergencyRequest.findById(id);

		if (!emergency) {
			return res.status(404).json({
				message: 'Emergency request not found'
			});
		}

		// Check permissions (requester or the donor themselves)
		const isRequester = emergency.requester.toString() === req.user._id.toString();
		const isDonor = req.user._id.toString() === donorId;

		if (!isRequester && !isDonor) {
			return res.status(403).json({
				message: 'Access denied'
			});
		}

		// Find confirmed donor
		const confirmedDonor = emergency.confirmedDonors.find(
			cd => cd.donor.toString() === donorId
		);

		if (!confirmedDonor) {
			return res.status(404).json({
				message: 'Confirmed donor not found'
			});
		}

		// Update donor status
		confirmedDonor.donationStatus = status;
		if (unitsContributed) {
			confirmedDonor.unitsContributed = unitsContributed;
		}
		if (notes) {
			confirmedDonor.notes = notes;
		}

		// Record arrival time
		if (status === 'in-progress' && !confirmedDonor.actualArrival) {
			confirmedDonor.actualArrival = new Date();
		}

		// Add timeline event
		emergency.addTimelineEvent(
			'donor-status-updated',
			`Donor status updated to ${status}`,
			req.user._id,
			{ donorId, newStatus: status, unitsContributed }
		);

		// Check if emergency is resolved
		const totalUnitsReceived = emergency.confirmedDonors.reduce((total, donor) => {
			return total + (donor.donationStatus === 'completed' ? donor.unitsContributed : 0);
		}, 0);

		if (totalUnitsReceived >= emergency.bloodRequirement.units && emergency.status === 'active') {
			emergency.status = 'resolved';
			emergency.resolution = {
				resolvedAt: new Date(),
				resolvedBy: req.user._id,
				totalUnitsReceived,
				donorsInvolved: emergency.confirmedDonors.length,
				resolutionNotes: 'Emergency resolved - required blood units received'
			};

			emergency.addTimelineEvent(
				'emergency-resolved',
				'Emergency successfully resolved',
				req.user._id,
				{ totalUnitsReceived, donorsInvolved: emergency.confirmedDonors.length }
			);
		}

		await emergency.save();

		res.json({
			message: 'Donor status updated successfully',
			confirmedDonor,
			emergencyStatus: emergency.status
		});
	} catch (error) {
		console.error('Update donor status error:', error);
		res.status(500).json({
			message: 'Failed to update donor status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/emergency/my/requests
// @desc    Get user's own emergency requests
// @access  Private
router.get('/my/requests', [
	authenticate,
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
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
	validate
], async (req, res) => {
	try {
		const { status, page = 1, limit = 10 } = req.query;

		const searchQuery = { requester: req.user._id };

		if (status) {
			searchQuery.status = status;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const emergencies = await EmergencyRequest.find(searchQuery)
			.populate('responses.donor', 'firstName lastName rating.average')
			.populate('confirmedDonors.donor', 'firstName lastName phone')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await EmergencyRequest.countDocuments(searchQuery);

		res.json({
			message: 'Your emergency requests retrieved successfully',
			emergencies,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get my emergency requests error:', error);
		res.status(500).json({
			message: 'Failed to retrieve your emergency requests',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/emergency/:id/status
// @desc    Update emergency status
// @access  Private (requester only)
router.put('/:id/status', [
	authenticate,
	body('status')
		.isIn(['active', 'partially-resolved', 'resolved', 'expired', 'cancelled'])
		.withMessage('Invalid status'),
	body('resolutionNotes')
		.optional()
		.isLength({ max: 500 })
		.withMessage('Resolution notes cannot exceed 500 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { status, resolutionNotes } = req.body;

		const emergency = await EmergencyRequest.findById(id);

		if (!emergency) {
			return res.status(404).json({
				message: 'Emergency request not found'
			});
		}

		// Check if user is the requester
		if (emergency.requester.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'Only the requester can update emergency status'
			});
		}

		// Update status
		emergency.status = status;

		// Update resolution info if resolving
		if (status === 'resolved' || status === 'cancelled') {
			emergency.resolution = {
				resolvedAt: new Date(),
				resolvedBy: req.user._id,
				totalUnitsReceived: emergency.unitsReceived,
				donorsInvolved: emergency.confirmedDonors.length,
				resolutionNotes
			};
		}

		// Add timeline event
		emergency.addTimelineEvent(
			'status-changed',
			`Emergency status changed to ${status}`,
			req.user._id,
			{ newStatus: status }
		);

		await emergency.save();

		res.json({
			message: 'Emergency status updated successfully',
			emergency
		});
	} catch (error) {
		console.error('Update emergency status error:', error);
		res.status(500).json({
			message: 'Failed to update emergency status',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
