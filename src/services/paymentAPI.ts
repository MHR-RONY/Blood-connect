import config from '@/config/env';
import { tokenStorage } from './api';

const api = {
	// Initiate payment
	initiatePayment: async (paymentData: {
		amount: number;
		purpose: string;
		donorName: string;
		donorEmail: string;
		donorPhone: string;
		message?: string;
		isAnonymous?: boolean;
	}) => {
		const token = tokenStorage.get();

		if (!token) {
			throw new Error('No authentication token found. Please login again.');
		}

		console.log('Initiating payment with token:', token ? 'Token exists' : 'No token');
		console.log('API URL:', `${config.API_BASE_URL}/payment/initiate`);

		const response = await fetch(`${config.API_BASE_URL}/payment/initiate`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(paymentData),
		});

		console.log('Payment response status:', response.status);

		if (!response.ok) {
			const error = await response.json();
			console.error('Payment error:', error);
			throw new Error(error.message || 'Failed to initiate payment');
		}

		return response.json();
	},

	// Get payment status
	getPaymentStatus: async (transactionId: string) => {
		const response = await fetch(`${config.API_BASE_URL}/payment/status/${transactionId}`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${tokenStorage.get()}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to get payment status');
		}

		return response.json();
	},

	// Get user's payment history
	getPaymentHistory: async () => {
		const response = await fetch(`${config.API_BASE_URL}/payment/history`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${tokenStorage.get()}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to get payment history');
		}

		return response.json();
	},

	// Verify payment completion
	verifyPayment: async (transactionId: string, validationId: string) => {
		const response = await fetch(`${config.API_BASE_URL}/payment/verify`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${tokenStorage.get()}`,
			},
			body: JSON.stringify({ transactionId, validationId }),
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to verify payment');
		}

		return response.json();
	},

	// Manually validate a specific transaction
	validateTransaction: async (transactionId: string) => {
		const response = await fetch(`${config.API_BASE_URL}/payment/validate/${transactionId}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${tokenStorage.get()}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to validate transaction');
		}

		return response.json();
	},

	// Validate all pending transactions for the user
	validateAllPendingTransactions: async () => {
		const response = await fetch(`${config.API_BASE_URL}/payment/validate-all`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${tokenStorage.get()}`,
			},
		});

		if (!response.ok) {
			const error = await response.json();
			throw new Error(error.message || 'Failed to validate pending transactions');
		}

		return response.json();
	},
};

export default api;
