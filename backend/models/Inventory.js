const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
	bloodType: {
		type: String,
		required: true,
		enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
		unique: true
	},
	units: {
		type: Number,
		required: true,
		min: 0,
		default: 0
	},
	batches: [{
		batchId: {
			type: String,
			required: true
		},
		units: {
			type: Number,
			required: true,
			min: 1
		},
		expiryDate: {
			type: Date,
			required: true
		},
		donationDate: {
			type: Date,
			default: Date.now
		},
		donorId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		location: {
			type: String,
			default: 'Main Storage'
		},
		status: {
			type: String,
			enum: ['available', 'reserved', 'expired', 'used'],
			default: 'available'
		}
	}],
	thresholds: {
		critical: {
			type: Number,
			default: 5
		},
		low: {
			type: Number,
			default: 15
		},
		good: {
			type: Number,
			default: 30
		}
	},
	lastUpdated: {
		type: Date,
		default: Date.now
	},
	updatedBy: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User'
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Calculate total available units
inventorySchema.virtual('availableUnits').get(function () {
	return this.batches
		.filter(batch => batch.status === 'available' && batch.expiryDate > new Date())
		.reduce((total, batch) => total + batch.units, 0);
});

// Calculate expired units
inventorySchema.virtual('expiredUnits').get(function () {
	return this.batches
		.filter(batch => batch.expiryDate <= new Date())
		.reduce((total, batch) => total + batch.units, 0);
});

// Get status based on available units
inventorySchema.virtual('status').get(function () {
	const available = this.availableUnits;

	// If no units available and no batches, consider it as 'Empty' instead of 'Critical'
	// This prevents showing urgent alerts for blood types that haven't been stocked yet
	if (available === 0 && this.batches.length === 0) return 'Empty';

	if (available <= this.thresholds.critical) return 'Critical';
	if (available <= this.thresholds.low) return 'Low';
	if (available <= this.thresholds.good) return 'Medium';
	return 'Good';
});

// Get next expiry date
inventorySchema.virtual('nextExpiryDate').get(function () {
	const availableBatches = this.batches
		.filter(batch => batch.status === 'available' && batch.expiryDate > new Date())
		.sort((a, b) => a.expiryDate - b.expiryDate);

	return availableBatches.length > 0 ? availableBatches[0].expiryDate : null;
});

// Update units when batches change
inventorySchema.pre('save', function (next) {
	this.units = this.availableUnits;
	this.lastUpdated = new Date();
	next();
});

// Create indexes
inventorySchema.index({ 'batches.expiryDate': 1 });
inventorySchema.index({ 'batches.status': 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
