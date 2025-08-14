const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	firstName: {
		type: String,
		required: [true, 'First name is required'],
		trim: true,
		maxlength: [50, 'First name cannot exceed 50 characters']
	},
	lastName: {
		type: String,
		required: [true, 'Last name is required'],
		trim: true,
		maxlength: [50, 'Last name cannot exceed 50 characters']
	},
	email: {
		type: String,
		required: [true, 'Email is required'],
		unique: true,
		lowercase: true,
		match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
	},
	password: {
		type: String,
		required: [true, 'Password is required'],
		minlength: [6, 'Password must be at least 6 characters'],
		select: false
	},
	phone: {
		type: String,
		required: [true, 'Phone number is required'],
		match: [/^01[3-9]\d{8}$/, 'Please enter a valid Bangladeshi phone number (01XXXXXXXXX)']
	},
	dateOfBirth: {
		type: Date,
		required: [true, 'Date of birth is required'],
		validate: {
			validator: function (date) {
				const age = (new Date() - date) / (1000 * 60 * 60 * 24 * 365);
				return age >= 16 && age <= 65;
			},
			message: 'Age must be between 16 and 65 years'
		}
	},
	gender: {
		type: String,
		required: [true, 'Gender is required'],
		enum: ['male', 'female', 'other', 'prefer-not-to-say']
	},
	bloodType: {
		type: String,
		required: [true, 'Blood type is required'],
		enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
	},
	weight: {
		type: Number,
		required: [true, 'Weight is required'],
		min: [45, 'Weight must be at least 45 kg'],
		max: [200, 'Weight cannot exceed 200 kg']
	},
	location: {
		city: {
			type: String,
			required: [true, 'City is required'],
			trim: true
		},
		area: {
			type: String,
			required: [true, 'Area is required'],
			trim: true
		},
		coordinates: {
			lat: { type: Number },
			lng: { type: Number }
		}
	},
	isAvailableDonor: {
		type: Boolean,
		default: true
	},
	profilePicture: {
		type: String,
		default: null
	},
	role: {
		type: String,
		enum: ['user', 'admin', 'moderator'],
		default: 'user'
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	verificationToken: String,
	passwordResetToken: String,
	passwordResetExpires: Date,
	lastDonationDate: {
		type: Date,
		default: null
	},
	donationCount: {
		type: Number,
		default: 0
	},
	medicalHistory: {
		hasChronicDiseases: {
			type: Boolean,
			default: false
		},
		diseases: [String],
		medications: [String],
		allergies: [String],
		lastBloodTest: Date,
		isEligibleToDonate: {
			type: Boolean,
			default: true
		}
	},
	preferences: {
		emailNotifications: {
			type: Boolean,
			default: true
		},
		smsNotifications: {
			type: Boolean,
			default: true
		},
		emergencyAlerts: {
			type: Boolean,
			default: true
		}
	},
	rating: {
		average: {
			type: Number,
			default: 0,
			min: 0,
			max: 5
		},
		count: {
			type: Number,
			default: 0
		}
	},
	isActive: {
		type: Boolean,
		default: true
	},
	isBanned: {
		type: Boolean,
		default: false
	},
	banReason: {
		type: String,
		default: null
	},
	bannedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		default: null
	},
	bannedAt: {
		type: Date,
		default: null
	},
	lastLogin: {
		type: Date,
		default: Date.now
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function () {
	return `${this.firstName} ${this.lastName}`;
});

// Virtual for age
userSchema.virtual('age').get(function () {
	return Math.floor((new Date() - this.dateOfBirth) / (1000 * 60 * 60 * 24 * 365));
});

// Virtual for eligibility to donate (based on last donation date)
userSchema.virtual('canDonate').get(function () {
	if (!this.lastDonationDate) return true;
	const daysSinceLastDonation = (new Date() - this.lastDonationDate) / (1000 * 60 * 60 * 24);
	return daysSinceLastDonation >= 56; // 8 weeks
});

// Index for location-based searches
userSchema.index({ 'location.city': 1, 'location.area': 1, bloodType: 1, isAvailableDonor: 1 });
// Note: email index is automatically created by unique: true in schema definition
userSchema.index({ createdAt: -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function (next) {
	if (!this.isModified('password')) return next();

	try {
		const salt = await bcrypt.genSalt(12);
		this.password = await bcrypt.hash(this.password, salt);
		next();
	} catch (error) {
		next(error);
	}
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
	return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update last donation date
userSchema.methods.recordDonation = function () {
	this.lastDonationDate = new Date();
	this.donationCount += 1;
	return this.save();
};

// Method to check if user can donate based on eligibility criteria
userSchema.methods.checkDonationEligibility = function () {
	const reasons = [];

	// Age check
	if (this.age < 18 || this.age > 65) {
		reasons.push('Age must be between 18 and 65 years');
	}

	// Weight check
	if (this.weight < 50) {
		reasons.push('Weight must be at least 50 kg');
	}

	// Last donation check
	if (!this.canDonate) {
		reasons.push('Must wait at least 8 weeks between donations');
	}

	// Medical eligibility check
	if (!this.medicalHistory.isEligibleToDonate) {
		reasons.push('Medical history indicates ineligibility');
	}

	return {
		eligible: reasons.length === 0,
		reasons: reasons
	};
};

module.exports = mongoose.model('User', userSchema);
