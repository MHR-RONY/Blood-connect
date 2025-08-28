const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
	transactionId: {
		type: String,
		required: true,
		unique: true,
		index: true
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},
	amount: {
		type: Number,
		required: true,
		min: 1
	},
	currency: {
		type: String,
		default: 'BDT'
	},
	purpose: {
		type: String,
		enum: ['emergency', 'equipment', 'awareness', 'research', 'general', 'infrastructure'],
		default: 'general'
	},
	donorName: {
		type: String,
		required: true
	},
	donorEmail: {
		type: String,
		required: true
	},
	donorPhone: {
		type: String,
		required: true
	},
	message: {
		type: String,
		maxlength: 500
	},
	isAnonymous: {
		type: Boolean,
		default: false
	},
	status: {
		type: String,
		enum: ['PENDING', 'SUCCESS', 'FAILED', 'CANCELLED', 'REFUNDED'],
		default: 'PENDING'
	},
	paymentMethod: {
		type: String // Will be populated after payment (card, mobile banking, etc.)
	},
	sessionkey: {
		type: String // SSLCommerz session key
	},
	validationId: {
		type: String // SSLCommerz validation ID after successful payment
	},
	bankTransactionId: {
		type: String // Bank's transaction ID
	},
	cardType: {
		type: String // Type of card used (if applicable)
	},
	gatewayResponse: {
		type: mongoose.Schema.Types.Mixed // Store the full gateway response
	},
	ipnReceived: {
		type: Boolean,
		default: false
	},
	ipnData: {
		type: mongoose.Schema.Types.Mixed // Store IPN data
	},
	refundInfo: {
		refundId: String,
		refundAmount: Number,
		refundDate: Date,
		refundReason: String
	},
	createdAt: {
		type: Date,
		default: Date.now
	},
	updatedAt: {
		type: Date,
		default: Date.now
	},
	completedAt: {
		type: Date // When payment was successfully completed
	}
}, {
	timestamps: true
});

// Indexes for better query performance
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ purpose: 1, createdAt: -1 });

// Virtual for formatted amount
paymentSchema.virtual('formattedAmount').get(function () {
	return `৳${this.amount.toLocaleString()}`;
});

// Method to update payment status
paymentSchema.methods.updateStatus = function (status, additionalData = {}) {
	this.status = status;
	this.updatedAt = new Date();

	if (status === 'SUCCESS') {
		this.completedAt = new Date();
	}

	Object.assign(this, additionalData);
	return this.save();
};

// Static method to get payment statistics
paymentSchema.statics.getStats = async function (startDate, endDate) {
	const pipeline = [
		{
			$match: {
				createdAt: {
					$gte: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
					$lte: endDate || new Date()
				}
			}
		},
		{
			$group: {
				_id: '$status',
				count: { $sum: 1 },
				totalAmount: { $sum: '$amount' }
			}
		}
	];

	return this.aggregate(pipeline);
};

// Static method to get donations by purpose
paymentSchema.statics.getDonationsByPurpose = async function () {
	return this.aggregate([
		{ $match: { status: 'SUCCESS' } },
		{
			$group: {
				_id: '$purpose',
				count: { $sum: 1 },
				totalAmount: { $sum: '$amount' }
			}
		},
		{ $sort: { totalAmount: -1 } }
	]);
};

// Pre-save middleware to update updatedAt
paymentSchema.pre('save', function (next) {
	this.updatedAt = new Date();
	next();
});

module.exports = mongoose.model('Payment', paymentSchema);
