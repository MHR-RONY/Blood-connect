// Environment validation and configuration check
import config from './env';

export const validateEnvironment = () => {
	const requiredEnvVars = {
		API_BASE_URL: config.API_BASE_URL,
	};

	const missingVars = Object.entries(requiredEnvVars)
		.filter(([, value]) => !value)
		.map(([key]) => key);

	if (missingVars.length > 0) {
		console.error('Missing required environment variables:', missingVars);
		throw new Error(`Missing environment variables: ${missingVars.join(', ')}`);
	}

	console.log('Environment configuration:');
	console.log('- Mode:', config.NODE_ENV);
	console.log('- API Base URL:', config.API_BASE_URL);
	console.log('- Is Production:', config.isProduction);
};

export const getApiUrl = (endpoint: string) => {
	return `${config.API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
};

export default {
	validateEnvironment,
	getApiUrl,
	...config,
};
