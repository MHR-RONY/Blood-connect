const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const HospitalDonation = require('../models/HospitalDonation');

// @route   POST /api/donations/hospital
// @desc    Submit hospital donation request
// @access  Private
router.post('/hospital', authenticate, async (req, res) => {
	try {
		const {
			bloodType,
			unitsNeeded,
			urgencyLevel,
			donationDate,
			hospital,
			contactPhone,
			medicalConditions,
			notes
		} = req.body;

		// Get user information from the authenticated user
		const user = req.user;

		// Create new hospital donation request
		const hospitalDonation = new HospitalDonation({
			userId: user.id,
			donorInfo: {
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				phone: contactPhone || user.phone,
				age: user.dateOfBirth ? new Date().getFullYear() - new Date(user.dateOfBirth).getFullYear() : 25,
				weight: user.weight || 50,
				gender: user.gender?.toLowerCase() || 'other',
				address: `${user.location?.area || ''}, ${user.location?.city || ''}`,
				city: user.location?.city || 'Dhaka'
			},
			bloodInfo: {
				bloodType,
				quantity: Math.round((unitsNeeded || 1) * 450) // Convert units to ml
			},
			appointmentDetails: {
				donationCenter: hospital || 'Not specified',
				preferredDate: donationDate ? new Date(donationDate) : new Date(),
				preferredTime: 'To be scheduled'
			},
			emergencyContact: {
				name: 'Emergency Contact',
				phone: contactPhone || user.phone
			},
			medicalHistory: {
				lastDonation: null,
				medications: '',
				medicalConditions: medicalConditions || ''
			},
			notes: notes || '',
			status: 'pending',
			submittedAt: new Date()
		});

		await hospitalDonation.save();		res.status(201).json({
			success: true,
			message: 'Hospital donation request submitted successfully',
			data: hospitalDonation
		});

	} catch (error) {
		console.error('Hospital donation submission error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while submitting donation request'
		});
	}
});

// @route   GET /api/donations/hospital/user
// @desc    Get user's hospital donation history
// @access  Private
router.get('/hospital/user', authenticate, async (req, res) => {
	try {
		const donations = await HospitalDonation.find({ userId: req.user.id })
			.sort({ submittedAt: -1 });

		res.json({
			success: true,
			data: donations
		});

	} catch (error) {
		console.error('Get hospital donations error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while fetching donations'
		});
	}
});

// @route   GET /api/donations/hospital/admin
// @desc    Get all hospital donation requests for admin
// @access  Private (Admin only)
router.get('/hospital/admin', authenticate, async (req, res) => {
	try {
		// TODO: Add admin role check middleware
		const donations = await HospitalDonation.find()
			.sort({ submittedAt: -1 });

		res.json({
			success: true,
			data: donations
		});

	} catch (error) {
		console.error('Get all hospital donations error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while fetching donations'
		});
	}
});

// @route   PUT /api/donations/hospital/:id/status
// @desc    Update hospital donation status (Admin only)
// @access  Private (Admin only)
router.put('/hospital/:id/status', authenticate, async (req, res) => {
	try {
		const { status, adminNotes } = req.body;
		const donationId = req.params.id;

		const donation = await HospitalDonation.findById(donationId);
		
		if (!donation) {
			return res.status(404).json({
				success: false,
				message: 'Donation request not found'
			});
		}

		donation.status = status;
		if (adminNotes) {
			donation.adminNotes = adminNotes;
		}
		donation.updatedAt = new Date();

		await donation.save();

		res.json({
			success: true,
			message: 'Donation status updated successfully',
			data: donation
		});

	} catch (error) {
		console.error('Update donation status error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error while updating donation status'
		});
	}
});

module.exports = router;
