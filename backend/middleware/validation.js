const { validationResult } = require('express-validator');

const validate = (req, res, next) => {
	const errors = validationResult(req);

	if (!errors.isEmpty()) {
		console.log('Validation errors for request:', req.method, req.originalUrl);
		console.log('Request body:', JSON.stringify(req.body, null, 2));

		const formattedErrors = errors.array().map(error => ({
			field: error.path || error.param,
			message: error.msg,
			value: error.value
		}));

		console.log('Validation errors:', JSON.stringify(formattedErrors, null, 2));

		return res.status(400).json({
			message: 'Validation failed',
			errors: formattedErrors
		});
	}

	next();
};

module.exports = validate;
