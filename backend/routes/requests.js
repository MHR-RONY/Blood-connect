const express = require('express');
const { body, query } = require('express-validator');
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');
const { authenticate, optionalAuth } = require('../middleware/auth');
const validate = require('../middleware/validation');

const router = express.Router();

// @route   POST /api/requests
// @desc    Create a new blood request
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
	body('patient.relationship')
		.isIn(['self', 'family', 'friend', 'hospital', 'doctor', 'other'])
		.withMessage('Invalid relationship'),
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
	body('hospital.doctorName')
		.trim()
		.notEmpty()
		.withMessage('Doctor name is required'),
	body('bloodRequirement.units')
		.isInt({ min: 1, max: 10 })
		.withMessage('Units must be between 1 and 10'),
	body('bloodRequirement.urgency')
		.isIn(['low', 'medium', 'high', 'critical'])
		.withMessage('Invalid urgency level'),
	body('bloodRequirement.requiredBy')
		.isISO8601()
		.withMessage('Valid required by date is required'),
	body('bloodRequirement.purpose')
		.isIn(['surgery', 'accident', 'cancer-treatment', 'anemia', 'pregnancy-complications', 'blood-disorder', 'organ-transplant', 'other'])
		.withMessage('Invalid purpose'),
	validate
], async (req, res) => {
	try {
		console.log('Received blood request data:', JSON.stringify(req.body, null, 2));

		const requestData = {
			...req.body,
			requester: req.user._id,
			status: 'pending'
		};

		// Set priority based on urgency
		const urgencyPriority = {
			'low': 1,
			'medium': 2,
			'high': 3,
			'critical': 4
		};
		requestData.priority = urgencyPriority[req.body.bloodRequirement.urgency];

		const bloodRequest = new BloodRequest(requestData);
		await bloodRequest.save();

		// Populate requester info for response
		await bloodRequest.populate('requester', 'firstName lastName phone');

		res.status(201).json({
			message: 'Blood request created successfully',
			request: bloodRequest
		});
	} catch (error) {
		console.error('Create blood request error:', error);
		res.status(500).json({
			message: 'Failed to create blood request',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/requests
// @desc    Get blood requests with filters
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
	query('area')
		.optional()
		.trim()
		.isLength({ min: 2 })
		.withMessage('Area must be at least 2 characters'),
	query('urgency')
		.optional()
		.isIn(['low', 'medium', 'high', 'critical'])
		.withMessage('Invalid urgency level'),
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
		.isInt({ min: 1, max: 50 })
		.withMessage('Limit must be between 1 and 50'),
	validate
], optionalAuth, async (req, res) => {
	try {
		const {
			bloodType,
			city,
			area,
			urgency,
			status = ['pending', 'active', 'partially-fulfilled'],
			page = 1,
			limit = 10,
			sortBy = 'urgencyScore',
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

		if (area) {
			searchQuery['hospital.area'] = new RegExp(area, 'i');
		}

		if (urgency) {
			searchQuery['bloodRequirement.urgency'] = urgency;
		}

		// Handle status as array or string
		if (Array.isArray(status)) {
			searchQuery.status = { $in: status };
		} else {
			searchQuery.status = status;
		}

		// Filter out expired requests
		searchQuery['bloodRequirement.requiredBy'] = { $gte: new Date() };

		// If user is authenticated, exclude their own requests from general listing
		if (req.user) {
			searchQuery.requester = { $ne: req.user._id };
		}

		// Calculate pagination
		const skip = (parseInt(page) - 1) * parseInt(limit);

		// Build sort object
		const sort = {};
		if (sortBy === 'urgencyScore') {
			sort.priority = -1;
			sort.createdAt = -1;
		} else {
			sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
		}

		// Execute search
		const requests = await BloodRequest.find(searchQuery)
			.populate('requester', 'firstName lastName rating.average')
			.select('-responses -updates') // Exclude sensitive data from listing
			.sort(sort)
			.skip(skip)
			.limit(parseInt(limit));

		// Get total count for pagination
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
		console.error('Get blood requests error:', error);
		res.status(500).json({
			message: 'Failed to retrieve blood requests',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/requests/:id
// @desc    Get a specific blood request
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
	try {
		const { id } = req.params;

		const request = await BloodRequest.findById(id)
			.populate('requester', 'firstName lastName phone rating.average')
			.populate('responses.donor', 'firstName lastName rating.average')
			.populate('acceptedDonors.donor', 'firstName lastName phone');

		if (!request) {
			return res.status(404).json({
				message: 'Blood request not found'
			});
		}

		// Increment view count
		request.analytics.views += 1;
		await request.save();

		// If not the requester, hide sensitive information
		const isRequester = req.user && req.user._id.toString() === request.requester._id.toString();

		if (!isRequester) {
			// Remove sensitive contact information
			if (request.requester.phone) {
				request.requester.phone = undefined;
			}

			// Hide full contact details of accepted donors
			request.acceptedDonors.forEach(acceptedDonor => {
				if (acceptedDonor.donor.phone) {
					acceptedDonor.donor.phone = undefined;
				}
			});
		}

		res.json({
			message: 'Blood request retrieved successfully',
			request,
			isRequester
		});
	} catch (error) {
		console.error('Get blood request error:', error);
		res.status(500).json({
			message: 'Failed to retrieve blood request',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/requests/:id/respond
// @desc    Respond to a blood request
// @access  Private
router.post('/:id/respond', [
	authenticate,
	body('message')
		.optional()
		.isLength({ max: 300 })
		.withMessage('Message cannot exceed 300 characters'),
	body('availability')
		.isIn(['immediate', 'within-24h', 'within-48h', 'within-week'])
		.withMessage('Invalid availability option'),
	body('contactMethod')
		.optional()
		.isIn(['phone', 'email', 'both'])
		.withMessage('Invalid contact method'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { message, availability, contactMethod = 'both' } = req.body;

		const request = await BloodRequest.findById(id);

		if (!request) {
			return res.status(404).json({
				message: 'Blood request not found'
			});
		}

		if (request.status === 'fulfilled' || request.status === 'expired' || request.status === 'cancelled') {
			return res.status(400).json({
				message: 'This blood request is no longer active'
			});
		}

		// Check if user already responded
		const existingResponse = request.responses.find(
			response => response.donor.toString() === req.user._id.toString()
		);

		if (existingResponse) {
			return res.status(400).json({
				message: 'You have already responded to this request'
			});
		}

		// Check if user can donate to this blood type
		const compatibleTypes = BloodRequest.getCompatibleRequests(req.user.bloodType);
		if (!compatibleTypes.includes(request.patient.bloodType)) {
			return res.status(400).json({
				message: 'Your blood type is not compatible with this request'
			});
		}

		// Add response
		request.addResponse(req.user._id, {
			message,
			availability,
			contactMethod
		});

		// Update request status to active if it was pending
		if (request.status === 'pending') {
			request.status = 'active';
		}

		await request.save();

		// Populate the new response for return
		await request.populate('responses.donor', 'firstName lastName rating.average');

		res.json({
			message: 'Response submitted successfully',
			response: request.responses[request.responses.length - 1]
		});
	} catch (error) {
		console.error('Respond to blood request error:', error);
		res.status(500).json({
			message: 'Failed to submit response',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   POST /api/requests/:id/accept-donor
// @desc    Accept a donor response (requester only)
// @access  Private
router.post('/:id/accept-donor', [
	authenticate,
	body('donorId')
		.isMongoId()
		.withMessage('Valid donor ID is required'),
	body('notes')
		.optional()
		.isLength({ max: 300 })
		.withMessage('Notes cannot exceed 300 characters'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const { donorId, notes } = req.body;

		const request = await BloodRequest.findById(id);

		if (!request) {
			return res.status(404).json({
				message: 'Blood request not found'
			});
		}

		// Check if user is the requester
		if (request.requester.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'Only the requester can accept donors'
			});
		}

		// Check if request is still active
		if (request.status === 'fulfilled') {
			return res.status(400).json({
				message: 'This request has already been fulfilled'
			});
		}

		// Check if donor exists in responses
		const donorResponse = request.responses.find(
			response => response.donor.toString() === donorId
		);

		if (!donorResponse) {
			return res.status(404).json({
				message: 'Donor response not found'
			});
		}

		if (donorResponse.status === 'accepted') {
			return res.status(400).json({
				message: 'This donor has already been accepted'
			});
		}

		// Accept the donor
		request.acceptDonor(donorId, notes);
		await request.save();

		// Populate for response
		await request.populate('acceptedDonors.donor', 'firstName lastName phone');

		res.json({
			message: 'Donor accepted successfully',
			acceptedDonor: request.acceptedDonors[request.acceptedDonors.length - 1]
		});
	} catch (error) {
		console.error('Accept donor error:', error);
		res.status(500).json({
			message: 'Failed to accept donor',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   PUT /api/requests/:id
// @desc    Update a blood request (requester only)
// @access  Private
router.put('/:id', [
	authenticate,
	body('bloodRequirement.units')
		.optional()
		.isInt({ min: 1, max: 10 })
		.withMessage('Units must be between 1 and 10'),
	body('bloodRequirement.urgency')
		.optional()
		.isIn(['low', 'medium', 'high', 'critical'])
		.withMessage('Invalid urgency level'),
	body('bloodRequirement.requiredBy')
		.optional()
		.isISO8601()
		.withMessage('Valid required by date is required'),
	body('status')
		.optional()
		.isIn(['pending', 'active', 'partially-fulfilled', 'fulfilled', 'expired', 'cancelled'])
		.withMessage('Invalid status'),
	validate
], async (req, res) => {
	try {
		const { id } = req.params;
		const updates = req.body;

		const request = await BloodRequest.findById(id);

		if (!request) {
			return res.status(404).json({
				message: 'Blood request not found'
			});
		}

		// Check if user is the requester
		if (request.requester.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'Only the requester can update this request'
			});
		}

		// Update allowed fields
		const allowedUpdates = ['bloodRequirement', 'status', 'hospital'];
		Object.keys(updates).forEach(key => {
			if (allowedUpdates.includes(key)) {
				if (key === 'bloodRequirement' && request[key]) {
					Object.assign(request[key], updates[key]);
				} else {
					request[key] = updates[key];
				}
			}
		});

		// Add update to timeline
		request.addUpdate('Request updated', req.user._id, 'requirement-update');

		await request.save();

		res.json({
			message: 'Blood request updated successfully',
			request
		});
	} catch (error) {
		console.error('Update blood request error:', error);
		res.status(500).json({
			message: 'Failed to update blood request',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   DELETE /api/requests/:id
// @desc    Cancel/delete a blood request (requester only)
// @access  Private
router.delete('/:id', authenticate, async (req, res) => {
	try {
		const { id } = req.params;

		const request = await BloodRequest.findById(id);

		if (!request) {
			return res.status(404).json({
				message: 'Blood request not found'
			});
		}

		// Check if user is the requester
		if (request.requester.toString() !== req.user._id.toString()) {
			return res.status(403).json({
				message: 'Only the requester can cancel this request'
			});
		}

		// Update status to cancelled instead of deleting
		request.status = 'cancelled';
		request.addUpdate('Request cancelled by requester', req.user._id, 'status-change');
		await request.save();

		res.json({
			message: 'Blood request cancelled successfully'
		});
	} catch (error) {
		console.error('Cancel blood request error:', error);
		res.status(500).json({
			message: 'Failed to cancel blood request',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

// @route   GET /api/requests/my/requests
// @desc    Get user's own blood requests
// @access  Private
router.get('/my/requests', [
	authenticate,
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

		const requests = await BloodRequest.find(searchQuery)
			.populate('responses.donor', 'firstName lastName rating.average')
			.populate('acceptedDonors.donor', 'firstName lastName phone')
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(parseInt(limit));

		const total = await BloodRequest.countDocuments(searchQuery);

		res.json({
			message: 'Your blood requests retrieved successfully',
			requests,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(total / parseInt(limit)),
				totalItems: total,
				itemsPerPage: parseInt(limit)
			}
		});
	} catch (error) {
		console.error('Get my requests error:', error);
		res.status(500).json({
			message: 'Failed to retrieve your requests',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

module.exports = router;
