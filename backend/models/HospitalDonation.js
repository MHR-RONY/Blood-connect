const mongoose = require('mongoose');

const hospitalDonationSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	donorInfo: {
		name: {
			type: String,
			required: true
		},
		email: {
			type: String,
			required: true
		},
		phone: {
			type: String,
			required: true
		},
		age: {
			type: Number,
			required: true
		},
		weight: {
			type: Number,
			required: true
		},
		gender: {
			type: String,
			enum: ['male', 'female', 'other'],
			required: true
		},
		address: {
			type: String,
			required: true
		},
		city: {
			type: String,
			required: true
		}
	},
	bloodInfo: {
		bloodType: {
			type: String,
			enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
			required: true
		},
		quantity: {
			type: Number,
			required: true,
			default: 450
		}
	},
	appointmentDetails: {
		donationCenter: {
			type: String,
			required: true
		},
		preferredDate: {
			type: Date,
			required: true
		},
		preferredTime: {
			type: String,
			required: true
		}
	},
	emergencyContact: {
		name: {
			type: String
		},
		phone: {
			type: String
		}
	},
	medicalHistory: {
		lastDonation: {
			type: Date
		},
		medications: {
			type: String
		},
		medicalConditions: {
			type: String
		}
	},
	notes: {
		type: String
	},
	status: {
		type: String,
		enum: ['pending', 'approved', 'rejected', 'completed', 'cancelled'],
		default: 'pending'
	},
	adminNotes: {
		type: String
	},
	submittedAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true
});

// Index for efficient queries
hospitalDonationSchema.index({ userId: 1 });
hospitalDonationSchema.index({ status: 1 });
hospitalDonationSchema.index({ 'bloodInfo.bloodType': 1 });
hospitalDonationSchema.index({ submittedAt: -1 });

module.exports = mongoose.model('HospitalDonation', hospitalDonationSchema);
