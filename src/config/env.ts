// Environment configuration
const config = {
	API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
	NODE_ENV: import.meta.env.MODE,
	isDevelopment: import.meta.env.MODE === 'development',
	isProduction: import.meta.env.MODE === 'production',
};

export default config;
