const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		const formattedErrors = errors.array().map(error => ({
			field: error.path || error.param,
			message: error.msg,
			value: error.value
		}));

		return res.status(400).json({
			message: 'Validation failed',
			errors: formattedErrors
		});
	}

	next();
};

module.exports = validate;
