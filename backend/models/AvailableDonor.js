const mongoose = require('mongoose');

const availableDonorSchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true,
		unique: true
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
		}
	},
	availability: {
		schedule: {
			type: String,
			enum: ['anytime', 'weekdays', 'weekends', 'mornings', 'afternoons', 'evenings', 'emergencies'],
			required: true
		},
		contactPreference: {
			type: String,
			enum: ['phone', 'sms', 'both', 'emergency-only'],
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
	isActive: {
		type: Boolean,
		default: true
	},
	registeredAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	lastContactedAt: {
		type: Date
	},
	donationCount: {
		type: Number,
		default: 0
	}
}, {
	timestamps: true
});

// Indexes for efficient queries
// Note: userId already has unique index from schema definition
availableDonorSchema.index({ 'bloodInfo.bloodType': 1 });
availableDonorSchema.index({ 'donorInfo.city': 1 });
availableDonorSchema.index({ isActive: 1 });
availableDonorSchema.index({ registeredAt: -1 });

// Compound index for blood type and city filtering
availableDonorSchema.index({
	'bloodInfo.bloodType': 1,
	'donorInfo.city': 1,
	isActive: 1
});

module.exports = mongoose.model('AvailableDonor', availableDonorSchema);
