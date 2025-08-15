const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
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
			min: [0, 'Age cannot be negative'],
			max: [150, 'Age cannot exceed 150']
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
		relationship: {
			type: String,
			required: [true, 'Relationship to patient is required'],
			enum: ['self', 'family', 'friend', 'hospital', 'doctor', 'other']
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
		doctorName: {
			type: String,
			required: [true, 'Doctor name is required']
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
			max: [10, 'Maximum 10 units can be requested']
		},
		urgency: {
			type: String,
			required: [true, 'Urgency level is required'],
			enum: ['low', 'medium', 'high', 'critical'],
			default: 'medium'
		},
		requiredBy: {
			type: Date,
			required: [true, 'Required by date is required'],
			validate: {
				validator: function (date) {
					return date > new Date();
				},
				message: 'Required by date must be in the future'
			}
		},
		purpose: {
			type: String,
			required: [true, 'Purpose of blood requirement is required'],
			enum: [
				'surgery',
				'accident',
				'cancer-treatment',
				'anemia',
				'pregnancy-complications',
				'blood-disorder',
				'organ-transplant',
				'other'
			]
		},
		medicalCondition: {
			type: String,
			maxlength: [500, 'Medical condition description cannot exceed 500 characters']
		}
	},
	status: {
		type: String,
		enum: ['pending', 'active', 'partially-fulfilled', 'fulfilled', 'expired', 'cancelled'],
		default: 'pending'
	},
	priority: {
		type: Number,
		default: 1,
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
			maxlength: [300, 'Response message cannot exceed 300 characters']
		},
		availability: {
			type: String,
			enum: ['immediate', 'within-24h', 'within-48h', 'within-week'],
			required: true
		},
		contactMethod: {
			type: String,
			enum: ['phone', 'email', 'both'],
			default: 'both'
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'rejected', 'completed'],
			default: 'pending'
		},
		responseDate: {
			type: Date,
			default: Date.now
		}
	}],
	acceptedDonors: [{
		donor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		donationDate: Date,
		status: {
			type: String,
			enum: ['scheduled', 'completed', 'cancelled'],
			default: 'scheduled'
		},
		notes: String
	}],
	visibility: {
		type: String,
		enum: ['public', 'friends', 'hospital'],
		default: 'public'
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
		verificationDate: Date,
		verificationNotes: String,
		documents: [{
			type: String, // URLs to uploaded documents
			description: String
		}]
	},
	updates: [{
		message: {
			type: String,
			required: true,
			maxlength: [300, 'Update message cannot exceed 300 characters']
		},
		updatedBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true
		},
		updateDate: {
			type: Date,
			default: Date.now
		},
		type: {
			type: String,
			enum: ['status-change', 'requirement-update', 'location-change', 'general'],
			default: 'general'
		}
	}],
	tags: [String],
	shareableLink: {
		type: String,
		unique: true,
		sparse: true
	},
	analytics: {
		views: {
			type: Number,
			default: 0
		},
		shares: {
			type: Number,
			default: 0
		},
		responses: {
			type: Number,
			default: 0
		}
	},
	expiresAt: {
		type: Date,
		index: { expireAfterSeconds: 0 }
	},
	// Admin fields for processing requests
	adminMessage: {
		type: String,
		maxlength: [500, 'Admin message cannot exceed 500 characters']
	},
	adminNotes: {
		type: String,
		maxlength: [1000, 'Admin notes cannot exceed 1000 characters']
	},
	processedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	},
	processedAt: {
		type: Date
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual for time remaining
bloodRequestSchema.virtual('timeRemaining').get(function () {
	const now = new Date();
	const required = this.bloodRequirement?.requiredBy;
	if (!required) return 0;
	const diffTime = required - now;
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	return diffDays;
});

// Virtual for units fulfilled
bloodRequestSchema.virtual('unitsFulfilled').get(function () {
	if (!this.acceptedDonors || !Array.isArray(this.acceptedDonors)) {
		return 0;
	}
	return this.acceptedDonors.filter(donor => donor.status === 'completed').length;
});

// Virtual for completion percentage
bloodRequestSchema.virtual('completionPercentage').get(function () {
	const fulfilled = this.unitsFulfilled;
	const required = this.bloodRequirement?.units || 1;
	if (required === 0) return 0;
	return Math.round((fulfilled / required) * 100);
});

// Virtual for urgency score (for sorting)
bloodRequestSchema.virtual('urgencyScore').get(function () {
	const urgencyWeights = { critical: 4, high: 3, medium: 2, low: 1 };
	const urgency = this.bloodRequirement?.urgency || 'low';
	const timeWeight = Math.max(0, 5 - this.timeRemaining); // More urgent as time decreases
	return (urgencyWeights[urgency] || 1) * 10 + timeWeight;
});

// Index for efficient searches
bloodRequestSchema.index({ 'patient.bloodType': 1, status: 1, 'bloodRequirement.requiredBy': 1 });
bloodRequestSchema.index({ 'hospital.city': 1, 'hospital.area': 1, status: 1 });
bloodRequestSchema.index({ status: 1, priority: -1, createdAt: -1 });
bloodRequestSchema.index({ requester: 1, createdAt: -1 });
bloodRequestSchema.index({ 'bloodRequirement.urgency': 1, 'bloodRequirement.requiredBy': 1 });

// Pre-save middleware to set expiry date
bloodRequestSchema.pre('save', function (next) {
	if (this.isNew) {
		// Set expiry date to required by date + 7 days buffer
		this.expiresAt = new Date(this.bloodRequirement.requiredBy.getTime() + (7 * 24 * 60 * 60 * 1000));

		// Generate shareable link
		if (!this.shareableLink) {
			this.shareableLink = Math.random().toString(36).substr(2, 12);
		}
	}
	next();
});

// Pre-save middleware to update status based on fulfillment
bloodRequestSchema.pre('save', function (next) {
	const fulfilled = this.unitsFulfilled;
	const required = this.bloodRequirement.units;

	if (fulfilled >= required && this.status !== 'fulfilled') {
		this.status = 'fulfilled';
		this.addUpdate('Request fulfilled - all required units secured', this.requester);
	} else if (fulfilled > 0 && fulfilled < required && this.status === 'active') {
		this.status = 'partially-fulfilled';
	}

	next();
});

// Method to add update
bloodRequestSchema.methods.addUpdate = function (message, updatedBy, type = 'general') {
	this.updates.push({
		message,
		updatedBy,
		type,
		updateDate: new Date()
	});
};

// Method to add response
bloodRequestSchema.methods.addResponse = function (donorId, responseData) {
	this.responses.push({
		donor: donorId,
		...responseData
	});
	this.analytics.responses += 1;
};

// Method to accept donor
bloodRequestSchema.methods.acceptDonor = function (donorId, notes = '') {
	const response = this.responses.find(r => r.donor.toString() === donorId.toString());
	if (response) {
		response.status = 'accepted';
	}

	this.acceptedDonors.push({
		donor: donorId,
		notes
	});

	this.addUpdate(`Donor accepted for donation`, this.requester, 'status-change');
};

// Method to check if request is expired
bloodRequestSchema.methods.isExpired = function () {
	return new Date() > this.bloodRequirement.requiredBy;
};

// Static method to get compatible requests for a blood type
bloodRequestSchema.statics.getCompatibleRequests = function (donorBloodType) {
	const compatibility = {
		'O-': ['O-'],
		'O+': ['O-', 'O+'],
		'A-': ['A-', 'AB-'],
		'A+': ['A-', 'A+', 'AB-', 'AB+'],
		'B-': ['B-', 'AB-'],
		'B+': ['B-', 'B+', 'AB-', 'AB+'],
		'AB-': ['AB-'],
		'AB+': ['A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
	};

	return compatibility[donorBloodType] || [];
};

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);
