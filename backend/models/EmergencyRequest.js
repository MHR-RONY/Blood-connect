const mongoose = require('mongoose');

const emergencyRequestSchema = new mongoose.Schema({
	requester: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Requester is required']
	},
	patient: {
		name: {
			type: String,
			required: [true, 'Patient name is required'],
			trim: true
		},
		age: {
			type: Number,
			required: [true, 'Patient age is required'],
			min: [0, 'Age cannot be negative']
		},
		gender: {
			type: String,
			required: [true, 'Patient gender is required'],
			enum: ['male', 'female', 'other']
		},
		bloodType: {
			type: String,
			required: [true, 'Patient blood type is required'],
			enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
		},
		contactNumber: {
			type: String,
			required: [true, 'Contact number is required']
		},
		emergencyContact: {
			name: String,
			relationship: String,
			phone: String
		}
	},
	emergency: {
		type: {
			type: String,
			required: [true, 'Emergency type is required'],
			enum: [
				'accident',
				'surgery',
				'massive-bleeding',
				'organ-failure',
				'pregnancy-complication',
				'blood-disorder',
				'other'
			]
		},
		severity: {
			type: String,
			required: [true, 'Severity level is required'],
			enum: ['critical', 'severe', 'moderate'],
			default: 'critical'
		},
		description: {
			type: String,
			required: [true, 'Emergency description is required'],
			maxlength: [500, 'Description cannot exceed 500 characters']
		},
		timeOfIncident: {
			type: Date,
			required: [true, 'Time of incident is required']
		}
	},
	hospital: {
		name: {
			type: String,
			required: [true, 'Hospital name is required']
		},
		address: {
			type: String,
			required: [true, 'Hospital address is required']
		},
		city: {
			type: String,
			required: [true, 'City is required']
		},
		area: {
			type: String,
			required: [true, 'Area is required']
		},
		contactNumber: {
			type: String,
			required: [true, 'Hospital contact number is required']
		},
		emergencyDepartment: {
			type: String,
			required: [true, 'Emergency department contact is required']
		},
		doctorInCharge: {
			name: {
				type: String,
				required: [true, 'Doctor name is required']
			},
			contactNumber: String,
			department: String
		},
		coordinates: {
			lat: Number,
			lng: Number
		}
	},
	bloodRequirement: {
		units: {
			type: Number,
			required: [true, 'Number of units required'],
			min: [1, 'At least 1 unit is required'],
			max: [20, 'Maximum 20 units can be requested for emergency']
		},
		requiredWithin: {
			type: Number, // Hours
			required: [true, 'Time requirement is needed'],
			min: [1, 'Must be required within at least 1 hour'],
			max: [72, 'Emergency cannot exceed 72 hours']
		},
		bloodComponents: {
			wholeBlood: {
				type: Boolean,
				default: true
			},
			redBloodCells: {
				type: Boolean,
				default: false
			},
			platelets: {
				type: Boolean,
				default: false
			},
			plasma: {
				type: Boolean,
				default: false
			}
		}
	},
	status: {
		type: String,
		enum: ['active', 'partially-resolved', 'resolved', 'expired', 'cancelled'],
		default: 'active'
	},
	priority: {
		type: Number,
		default: 5, // Highest priority for emergencies
		min: 1,
		max: 5
	},
	responses: [{
		donor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		message: {
			type: String,
			maxlength: [200, 'Response message cannot exceed 200 characters']
		},
		availability: {
			type: String,
			enum: ['immediate', 'within-1h', 'within-2h', 'within-4h'],
			required: true
		},
		location: {
			currentCity: String,
			estimatedArrival: String
		},
		contactMethod: {
			type: String,
			enum: ['phone', 'emergency-contact'],
			default: 'phone'
		},
		status: {
			type: String,
			enum: ['pending', 'confirmed', 'on-way', 'arrived', 'donated', 'declined'],
			default: 'pending'
		},
		responseTime: {
			type: Date,
			default: Date.now
		},
		confirmationTime: Date,
		arrivalTime: Date,
		donationTime: Date
	}],
	confirmedDonors: [{
		donor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		confirmationTime: {
			type: Date,
			default: Date.now
		},
		expectedArrival: Date,
		actualArrival: Date,
		donationStatus: {
			type: String,
			enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
			default: 'scheduled'
		},
		unitsContributed: {
			type: Number,
			default: 1,
			min: 1
		},
		notes: String
	}],
	broadcast: {
		isActive: {
			type: Boolean,
			default: true
		},
		radius: {
			type: Number,
			default: 50, // km
			min: 5,
			max: 100
		},
		methods: {
			sms: {
				type: Boolean,
				default: true
			},
			email: {
				type: Boolean,
				default: true
			},
			pushNotification: {
				type: Boolean,
				default: true
			},
			publicAlert: {
				type: Boolean,
				default: false
			}
		},
		sentTo: [{
			user: {
				type: mongoose.Schema.Types.ObjectId,
				ref: 'User'
			},
			method: String,
			sentAt: {
				type: Date,
				default: Date.now
			},
			delivered: {
				type: Boolean,
				default: false
			},
			read: {
				type: Boolean,
				default: false
			}
		}],
		totalSent: {
			type: Number,
			default: 0
		},
		totalResponses: {
			type: Number,
			default: 0
		}
	},
	verification: {
		isVerified: {
			type: Boolean,
			default: false
		},
		verifiedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		verificationTime: Date,
		verificationMethod: {
			type: String,
			enum: ['hospital-confirmed', 'doctor-verified', 'admin-verified', 'auto-verified']
		},
		documents: [{
			type: String, // Document URLs
			description: String,
			uploadedAt: {
				type: Date,
				default: Date.now
			}
		}]
	},
	timeline: [{
		event: {
			type: String,
			required: true
		},
		description: String,
		timestamp: {
			type: Date,
			default: Date.now
		},
		actor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		metadata: mongoose.Schema.Types.Mixed
	}],
	analytics: {
		views: {
			type: Number,
			default: 0
		},
		shares: {
			type: Number,
			default: 0
		},
		averageResponseTime: Number, // in minutes
		geographicReach: [String] // cities/areas where broadcast reached
	},
	resolution: {
		resolvedAt: Date,
		resolvedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		totalUnitsReceived: {
			type: Number,
			default: 0
		},
		donorsInvolved: {
			type: Number,
			default: 0
		},
		resolutionNotes: String,
		patientOutcome: {
			type: String,
			enum: ['stable', 'critical', 'recovered', 'referred', 'unknown']
		}
	},
	expiresAt: {
		type: Date,
		index: { expireAfterSeconds: 0 }
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual for time remaining
emergencyRequestSchema.virtual('timeRemaining').get(function () {
	const deadline = new Date(this.createdAt.getTime() + (this.bloodRequirement.requiredWithin * 60 * 60 * 1000));
	const now = new Date();
	const diffTime = deadline - now;
	return Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60))); // hours remaining
});

// Virtual for units received
emergencyRequestSchema.virtual('unitsReceived').get(function () {
	return this.confirmedDonors.reduce((total, donor) => {
		return total + (donor.donationStatus === 'completed' ? donor.unitsContributed : 0);
	}, 0);
});

// Virtual for completion percentage
emergencyRequestSchema.virtual('completionPercentage').get(function () {
	const received = this.unitsReceived;
	const required = this.bloodRequirement.units;
	return Math.min(100, Math.round((received / required) * 100));
});

// Virtual for urgency level (0-10 scale)
emergencyRequestSchema.virtual('urgencyLevel').get(function () {
	const severityWeight = { critical: 10, severe: 7, moderate: 4 };
	const timeWeight = Math.max(0, 10 - this.bloodRequirement.requiredWithin);
	const unitsWeight = Math.min(3, this.bloodRequirement.units / 2);

	return Math.min(10, severityWeight[this.emergency.severity] + timeWeight + unitsWeight);
});

// Index for efficient queries
emergencyRequestSchema.index({ status: 1, priority: -1, createdAt: -1 });
emergencyRequestSchema.index({ 'patient.bloodType': 1, status: 1 });
emergencyRequestSchema.index({ 'hospital.city': 1, 'hospital.area': 1, status: 1 });
emergencyRequestSchema.index({ createdAt: -1 });
emergencyRequestSchema.index({ 'emergency.severity': 1, status: 1 });

// Pre-save middleware to set expiry
emergencyRequestSchema.pre('save', function (next) {
	if (this.isNew) {
		// Emergency requests expire after the required time + 2 hour buffer
		const expiryTime = this.bloodRequirement.requiredWithin + 2;
		this.expiresAt = new Date(this.createdAt.getTime() + (expiryTime * 60 * 60 * 1000));
	}
	next();
});

// Method to add timeline event
emergencyRequestSchema.methods.addTimelineEvent = function (event, description, actor, metadata = {}) {
	this.timeline.push({
		event,
		description,
		actor,
		metadata,
		timestamp: new Date()
	});
};

// Method to confirm donor
emergencyRequestSchema.methods.confirmDonor = function (donorId, expectedArrival, notes = '') {
	// Update response status
	const response = this.responses.find(r => r.donor.toString() === donorId.toString());
	if (response) {
		response.status = 'confirmed';
		response.confirmationTime = new Date();
	}

	// Add to confirmed donors
	this.confirmedDonors.push({
		donor: donorId,
		expectedArrival,
		notes
	});

	this.addTimelineEvent('donor-confirmed', `Donor confirmed for emergency`, donorId);
};

// Method to broadcast emergency
emergencyRequestSchema.methods.broadcastEmergency = async function (userModel) {
	const compatibleBloodTypes = this.constructor.getCompatibleDonors(this.patient.bloodType);

	// Find eligible donors in the area
	const eligibleDonors = await userModel.find({
		bloodType: { $in: compatibleBloodTypes },
		isAvailableDonor: true,
		'location.city': this.hospital.city,
		'preferences.emergencyAlerts': true,
		isActive: true
	});

	// Update broadcast info
	this.broadcast.totalSent = eligibleDonors.length;

	return eligibleDonors;
};

// Static method to get compatible donor blood types
emergencyRequestSchema.statics.getCompatibleDonors = function (patientBloodType) {
	const compatibility = {
		'O-': ['O-'],
		'O+': ['O-', 'O+'],
		'A-': ['O-', 'A-'],
		'A+': ['O-', 'O+', 'A-', 'A+'],
		'B-': ['O-', 'B-'],
		'B+': ['O-', 'O+', 'B-', 'B+'],
		'AB-': ['O-', 'A-', 'B-', 'AB-'],
		'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
	};

	return compatibility[patientBloodType] || [];
};

module.exports = mongoose.model('EmergencyRequest', emergencyRequestSchema);
