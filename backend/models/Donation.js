const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
	donor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: [true, 'Donor is required']
	},
	recipient: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	bloodType: {
		type: String,
		required: [true, 'Blood type is required'],
		enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
	},
	amount: {
		type: Number,
		required: [true, 'Donation amount is required'],
		min: [250, 'Minimum donation amount is 250ml'],
		max: [500, 'Maximum donation amount is 500ml'],
		default: 450
	},
	donationDate: {
		type: Date,
		required: [true, 'Donation date is required'],
		default: Date.now
	},
	location: {
		hospital: {
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
		coordinates: {
			lat: Number,
			lng: Number
		}
	},
	status: {
		type: String,
		enum: ['scheduled', 'completed', 'cancelled', 'expired'],
		default: 'scheduled'
	},
	appointmentTime: {
		type: Date,
		required: [true, 'Appointment time is required']
	},
	medicalStaff: {
		doctorName: String,
		nurseName: String,
		contactNumber: String
	},
	preScreening: {
		hemoglobin: {
			type: Number,
			min: 12.5,
			max: 20
		},
		bloodPressure: {
			systolic: Number,
			diastolic: Number
		},
		pulse: {
			type: Number,
			min: 50,
			max: 100
		},
		temperature: {
			type: Number,
			min: 36,
			max: 37.5
		},
		weight: {
			type: Number,
			min: 50
		},
		passed: {
			type: Boolean,
			default: false
		},
		notes: String
	},
	postDonation: {
		complications: {
			type: Boolean,
			default: false
		},
		complicationDetails: String,
		recoveryNotes: String,
		followUpRequired: {
			type: Boolean,
			default: false
		},
		followUpDate: Date
	},
	certificateIssued: {
		type: Boolean,
		default: false
	},
	certificateNumber: {
		type: String,
		unique: true,
		sparse: true
	},
	bloodBagId: {
		type: String,
		unique: true,
		sparse: true
	},
	testResults: {
		bloodGroup: String,
		hivTest: {
			type: String,
			enum: ['positive', 'negative', 'pending'],
			default: 'pending'
		},
		hepatitisBTest: {
			type: String,
			enum: ['positive', 'negative', 'pending'],
			default: 'pending'
		},
		hepatitisCTest: {
			type: String,
			enum: ['positive', 'negative', 'pending'],
			default: 'pending'
		},
		syphilisTest: {
			type: String,
			enum: ['positive', 'negative', 'pending'],
			default: 'pending'
		},
		malariaTest: {
			type: String,
			enum: ['positive', 'negative', 'pending'],
			default: 'pending'
		},
		testDate: Date,
		testedBy: String,
		approved: {
			type: Boolean,
			default: false
		}
	},
	notes: {
		type: String,
		maxlength: [500, 'Notes cannot exceed 500 characters']
	},
	feedback: {
		donorRating: {
			type: Number,
			min: 1,
			max: 5
		},
		donorComments: String,
		hospitalRating: {
			type: Number,
			min: 1,
			max: 5
		},
		hospitalComments: String
	},
	isEmergency: {
		type: Boolean,
		default: false
	},
	emergencyRequest: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'EmergencyRequest',
		default: null
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual for donation expiry (blood expires after 35-42 days)
donationSchema.virtual('expiryDate').get(function () {
	const expiryDays = 35; // Conservative estimate
	return new Date(this.donationDate.getTime() + (expiryDays * 24 * 60 * 60 * 1000));
});

// Virtual for days until expiry
donationSchema.virtual('daysUntilExpiry').get(function () {
	const now = new Date();
	const expiry = this.expiryDate;
	const diffTime = expiry - now;
	return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

// Virtual for compatibility check
donationSchema.virtual('isExpired').get(function () {
	return new Date() > this.expiryDate;
});

// Index for efficient queries
donationSchema.index({ donor: 1, donationDate: -1 });
donationSchema.index({ bloodType: 1, status: 1, donationDate: -1 });
donationSchema.index({ 'location.city': 1, bloodType: 1, status: 1 });
donationSchema.index({ status: 1, donationDate: -1 });

// Pre-save middleware to generate certificate number
donationSchema.pre('save', function (next) {
	if (this.status === 'completed' && !this.certificateNumber) {
		const year = new Date().getFullYear();
		const month = String(new Date().getMonth() + 1).padStart(2, '0');
		const random = Math.random().toString(36).substr(2, 6).toUpperCase();
		this.certificateNumber = `BC${year}${month}${random}`;
		this.certificateIssued = true;
	}
	next();
});

// Pre-save middleware to generate blood bag ID
donationSchema.pre('save', function (next) {
	if (this.status === 'completed' && !this.bloodBagId) {
		const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
		const random = Math.random().toString(36).substr(2, 4).toUpperCase();
		this.bloodBagId = `BB${date}${random}`;
	}
	next();
});

// Method to check blood compatibility
donationSchema.methods.isCompatibleWith = function (recipientBloodType) {
	const compatibility = {
		'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
		'O+': ['O+', 'A+', 'B+', 'AB+'],
		'A-': ['A-', 'A+', 'AB-', 'AB+'],
		'A+': ['A+', 'AB+'],
		'B-': ['B-', 'B+', 'AB-', 'AB+'],
		'B+': ['B+', 'AB+'],
		'AB-': ['AB-', 'AB+'],
		'AB+': ['AB+']
	};

	return compatibility[this.bloodType]?.includes(recipientBloodType) || false;
};

// Static method to get blood compatibility
donationSchema.statics.getCompatibleBloodTypes = function (recipientBloodType) {
	const donorCompatibility = {
		'O-': ['O-'],
		'O+': ['O-', 'O+'],
		'A-': ['O-', 'A-'],
		'A+': ['O-', 'O+', 'A-', 'A+'],
		'B-': ['O-', 'B-'],
		'B+': ['O-', 'O+', 'B-', 'B+'],
		'AB-': ['O-', 'A-', 'B-', 'AB-'],
		'AB+': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
	};

	return donorCompatibility[recipientBloodType] || [];
};

module.exports = mongoose.model('Donation', donationSchema);
