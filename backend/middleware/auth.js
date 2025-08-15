const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authenticate = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (!token) {
			return res.status(401).json({ message: 'Access denied. No token provided.' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.id).select('-password');

		if (!user) {
			return res.status(401).json({ message: 'Invalid token. User not found.' });
		}

		if (!user.isActive) {
			return res.status(401).json({
				success: false,
				message: 'Account has been deactivated.'
			});
		}

		if (user.isBanned) {
			return res.status(403).json({
				success: false,
				message: 'Account has been suspended',
				isBanned: true,
				banInfo: {
					banReason: user.banReason,
					bannedAt: user.bannedAt
				}
			});
		}

		req.user = user;
		next();
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token.' });
		}
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token has expired.' });
		}
		res.status(500).json({ message: 'Token verification failed.' });
	}
};

const authorize = (...roles) => {
	return (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required.' });
		}

		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				message: 'Access denied. Insufficient permissions.'
			});
		}

		next();
	};
};

const optionalAuth = async (req, res, next) => {
	try {
		const token = req.header('Authorization')?.replace('Bearer ', '');

		if (token) {
			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const user = await User.findById(decoded.id).select('-password');

			if (user && user.isActive) {
				req.user = user;
			}
		}

		next();
	} catch (error) {
		// Continue without authentication if token is invalid
		next();
	}
};

const adminAuth = (req, res, next) => {
	if (!req.user) {
		return res.status(401).json({ message: 'Authentication required.' });
	}

	if (req.user.role !== 'admin') {
		return res.status(403).json({
			message: 'Access denied. Admin privileges required.'
		});
	}

	next();
};

module.exports = {
	authenticate,
	authorize,
	optionalAuth,
	adminAuth
};
