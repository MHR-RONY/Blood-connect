const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const AvailableDonor = require('../models/AvailableDonor');

// @route   POST /api/donors/register
// @desc    Register as available donor
// @access  Private
router.post('/register', authenticate, async (req, res) => {
	try {
		const {
			isAvailable,
			availableUntil,
			preferredTimeSlots,
			maxDistanceKm,
			emergencyContact,
			notes
		} = req.body;

		// Get user information from the authenticated user
		const user = req.user;

		// Check if user is already registered as available donor
		const existingDonor = await AvailableDonor.findOne({ userId: user.id });
		
		if (existingDonor) {
			// Update existing donor information
			existingDonor.donorInfo = {
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				phone: user.phone,
				age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 25,
				weight: user.weight || 50,
				gender: user.gender?.toLowerCase() || 'other',
				address: `${user.location?.area || ''}, ${user.location?.city || ''}`,
				city: user.location?.city || 'Dhaka'
			};
			existingDonor.bloodInfo = {
				bloodType: user.bloodType || 'O+'
			};
			existingDonor.availability = {
				schedule: 'anytime',
				contactPreference: 'phone'
			};
			existingDonor.emergencyContact = {
				name: 'Emergency Contact',
				phone: user.phone
			};
			existingDonor.medicalHistory = {
				lastDonation: null,
				medications: '',
				medicalConditions: ''
			};
			existingDonor.notes = notes || '';
			existingDonor.isActive = isAvailable !== false;
			existingDonor.updatedAt = new Date();

			await existingDonor.save();

			return res.json({
				success: true,
				message: 'Available donor information updated successfully',
				data: existingDonor
			});
		}

		// Create new available donor
		const availableDonor = new AvailableDonor({
			userId: user.id,
			donorInfo: {
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				phone: user.phone,
				age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 25,
				weight: user.weight || 50,
				gender: user.gender?.toLowerCase() || 'other',
				address: `${user.location?.area || ''}, ${user.location?.city || ''}`,
				city: user.location?.city || 'Dhaka'
			},
			bloodInfo: {
				bloodType: user.bloodType || 'O+'
			},
			availability: {
				schedule: 'anytime',
				contactPreference: 'phone'
			},
			emergencyContact: {
				name: 'Emergency Contact',
				phone: user.phone
			},
			medicalHistory: {
				lastDonation: null,
				medications: '',
				medicalConditions: ''
			},
			notes: notes || '',
			isActive: isAvailable !== false,
			registeredAt: new Date()
		});

		await availableDonor.save();

		res.status(201).json({
			success: true,
			message: 'Registered as available donor successfully',
			data: availableDonor
		});

	} catch (error) {
		console.error('Available donor registration error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while registering as donor'
		});
	}
});

// @route   GET /api/donors/available
// @desc    Get all available donors (for find-donors page)
// @access  Public
router.get('/available', async (req, res) => {
	try {
		const { bloodType, city, limit = 20, page = 1 } = req.query;

		let query = { isActive: true };

		// Filter by blood type if provided
		if (bloodType) {
			query['bloodInfo.bloodType'] = bloodType;
		}

		// Filter by city if provided
		if (city) {
			query['donorInfo.city'] = { $regex: city, $options: 'i' };
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const donors = await AvailableDonor.find(query)
			.select('-medicalHistory') // Don't expose sensitive medical info but keep emergencyContact availability
			.sort({ registeredAt: -1 })
			.limit(parseInt(limit))
			.skip(skip);

		const total = await AvailableDonor.countDocuments(query);

		// Transform donors data to include emergency contact availability flag without exposing contact details
		const transformedDonors = donors.map(donor => {
			const donorObj = donor.toObject();
			
			// Add emergency contact availability flag
			donorObj.hasEmergencyContact = !!(donorObj.emergencyContact && donorObj.emergencyContact.phone);
			
			// Remove actual emergency contact details for privacy
			delete donorObj.emergencyContact;
			
			return donorObj;
		});

		res.json({
			success: true,
			data: transformedDonors,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total,
				pages: Math.ceil(total / parseInt(limit))
			}
		});

	} catch (error) {
		console.error('Get available donors error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while fetching available donors'
		});
	}
});

// @route   GET /api/donors/profile
// @desc    Get user's donor profile
// @access  Private
router.get('/profile', authenticate, async (req, res) => {
	try {
		const donor = await AvailableDonor.findOne({ userId: req.user.id });

		if (!donor) {
			return res.status(404).json({
				success: false,
				message: 'Donor profile not found'
			});
		}

		res.json({
			success: true,
			data: donor
		});

	} catch (error) {
		console.error('Get donor profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while fetching donor profile'
		});
	}
});

// @route   PUT /api/donors/availability
// @desc    Update donor availability status
// @access  Private
router.put('/availability', authenticate, async (req, res) => {
	try {
		const { isActive } = req.body;

		const donor = await AvailableDonor.findOne({ userId: req.user.id });

		if (!donor) {
			return res.status(404).json({
				success: false,
				message: 'Donor profile not found'
			});
		}

		donor.isActive = isActive;
		donor.updatedAt = new Date();

		await donor.save();

		res.json({
			success: true,
			message: `Donor availability ${isActive ? 'activated' : 'deactivated'} successfully`,
			data: donor
		});

	} catch (error) {
		console.error('Update donor availability error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while updating availability'
		});
	}
});

module.exports = router;
