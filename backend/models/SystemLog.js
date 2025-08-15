const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
	level: {
		type: String,
		enum: ['info', 'warning', 'error'],
		required: true,
		default: 'info'
	},
	action: {
		type: String,
		required: true,
		maxlength: [100, 'Action cannot exceed 100 characters']
	},
	user: {
		type: String,
		required: true,
		maxlength: [100, 'User cannot exceed 100 characters']
	},
	details: {
		type: String,
		required: true,
		maxlength: [500, 'Details cannot exceed 500 characters']
	},
	metadata: {
		type: mongoose.Schema.Types.Mixed,
		default: {}
	},
	ipAddress: {
		type: String,
		maxlength: [45, 'IP address cannot exceed 45 characters'] // IPv6 support
	},
	userAgent: {
		type: String,
		maxlength: [500, 'User agent cannot exceed 500 characters']
	}
}, {
	timestamps: true,
	toJSON: { virtuals: true },
	toObject: { virtuals: true }
});

// Indexes for efficient searching
systemLogSchema.index({ level: 1, createdAt: -1 });
systemLogSchema.index({ action: 1, createdAt: -1 });
systemLogSchema.index({ user: 1, createdAt: -1 });
systemLogSchema.index({ createdAt: -1 });

// Virtual for formatted timestamp
systemLogSchema.virtual('formattedTimestamp').get(function () {
	return this.createdAt.toLocaleString('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false
	});
});

// Static method to create log entry
systemLogSchema.statics.createLog = async function (level, action, user, details, metadata = {}, req = null) {
	const logData = {
		level,
		action,
		user,
		details,
		metadata
	};

	// Add request-specific data if available
	if (req) {
		logData.ipAddress = req.ip || req.connection.remoteAddress;
		logData.userAgent = req.get('User-Agent');
	}

	return await this.create(logData);
};

// Static method to get logs with filters
systemLogSchema.statics.getFilteredLogs = async function (filters = {}, pagination = {}) {
	const { level, action, user, startDate, endDate } = filters;
	const { page = 1, limit = 50 } = pagination;

	// Build query
	const query = {};

	if (level) query.level = level;
	if (action) query.action = new RegExp(action, 'i');
	if (user) query.user = new RegExp(user, 'i');

	if (startDate || endDate) {
		query.createdAt = {};
		if (startDate) query.createdAt.$gte = new Date(startDate);
		if (endDate) query.createdAt.$lte = new Date(endDate);
	}

	const skip = (page - 1) * limit;

	const [logs, total] = await Promise.all([
		this.find(query)
			.sort({ createdAt: -1 })
			.skip(skip)
			.limit(limit),
		this.countDocuments(query)
	]);

	return {
		logs,
		pagination: {
			currentPage: page,
			totalPages: Math.ceil(total / limit),
			totalItems: total,
			itemsPerPage: limit
		}
	};
};

// Static method to clean old logs
systemLogSchema.statics.cleanOldLogs = async function (daysToKeep = 90) {
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

	const result = await this.deleteMany({
		createdAt: { $lt: cutoffDate },
		level: { $in: ['info', 'warning'] } // Keep error logs longer
	});

	return result.deletedCount;
};

// Auto-cleanup middleware
systemLogSchema.pre('save', function (next) {
	// Truncate details if too long
	if (this.details && this.details.length > 500) {
		this.details = this.details.substring(0, 497) + '...';
	}
	next();
});

module.exports = mongoose.model('SystemLog', systemLogSchema);
