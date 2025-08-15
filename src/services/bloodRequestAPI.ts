import config from '@/config/env';
import { tokenStorage } from './api';

const API_BASE_URL = config.API_BASE_URL;

export interface BloodRequestData {
	patient: {
		name: string;
		age: number;
		gender: 'male' | 'female' | 'other';
		bloodType: string;
		contactNumber: string;
		relationship: 'self' | 'family' | 'friend' | 'hospital' | 'doctor' | 'other';
	};
	hospital: {
		name: string;
		address: string;
		city: string;
		area: string;
		contactNumber: string;
		doctorName: string;
		coordinates?: {
			lat: number;
			lng: number;
		};
	};
	bloodRequirement: {
		units: number;
		urgency: 'low' | 'medium' | 'high' | 'critical';
		requiredBy: string; // ISO date string
		purpose: string;
		medicalCondition?: string;
	};
	additionalNotes?: string;
}

export interface BloodRequest {
	_id: string;
	requester: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	patient: {
		name: string;
		age: number;
		gender: string;
		bloodType: string;
		contactNumber: string;
		relationship: string;
	};
	hospital: {
		name: string;
		address: string;
		city: string;
		area: string;
		contactNumber: string;
		doctorName: string;
	};
	bloodRequirement: {
		units: number;
		urgency: string;
		requiredBy: string;
		purpose: string;
		medicalCondition?: string;
	};
	status: string;
	priority: number;
	createdAt: string;
	updatedAt: string;
	additionalNotes?: string;
}

// Get auth token from localStorage
const getAuthToken = () => {
	return tokenStorage.get();
};

// Make authenticated API calls
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
	const token = getAuthToken();
	const response = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': token ? `Bearer ${token}` : '',
			...options.headers,
		},
	});

	if (!response.ok) {
		let errorMessage = 'Request failed';
		try {
			const error = await response.json();
			console.error('API Error Response:', error);

			// Log detailed validation errors
			if (error.errors && Array.isArray(error.errors)) {
				console.error('Validation errors:', error.errors);
				errorMessage = error.errors.map((err: { path?: string; param?: string; msg: string }) =>
					`${err.path || err.param}: ${err.msg}`).join(', ');
			} else {
				errorMessage = error.message || error.errors?.[0]?.msg || `HTTP ${response.status}: ${response.statusText}`;
			}
		} catch (parseError) {
			console.error('Failed to parse error response:', parseError);
			errorMessage = `HTTP ${response.status}: ${response.statusText}`;
		}
		throw new Error(errorMessage);
	}

	return response.json();
};

export const bloodRequestAPI = {
	// Create a new blood request
	create: async (requestData: BloodRequestData): Promise<{ success: boolean; data?: BloodRequest; error?: string }> => {
		try {
			console.log('Creating blood request:', requestData);

			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/requests`, {
				method: 'POST',
				body: JSON.stringify(requestData),
			});

			return { success: true, data: response.request };
		} catch (error) {
			console.error('Create blood request error:', error);
			const message = error instanceof Error ? error.message : 'Failed to create blood request';
			return { success: false, error: message };
		}
	},

	// Get user's blood requests
	getUserRequests: async (): Promise<{ success: boolean; data?: BloodRequest[]; error?: string }> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/requests/my/requests`);
			return { success: true, data: response.requests };
		} catch (error) {
			console.error('Get user requests error:', error);
			const message = error instanceof Error ? error.message : 'Failed to fetch blood requests';
			return { success: false, error: message };
		}
	},

	// Get a specific blood request by ID
	getById: async (requestId: string): Promise<{ success: boolean; data?: BloodRequest; error?: string }> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/requests/${requestId}`);
			return { success: true, data: response.data };
		} catch (error) {
			console.error('Get blood request error:', error);
			const message = error instanceof Error ? error.message : 'Failed to fetch blood request';
			return { success: false, error: message };
		}
	},

	// Update blood request status
	updateStatus: async (requestId: string, status: string): Promise<{ success: boolean; data?: BloodRequest; error?: string }> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/requests/${requestId}/status`, {
				method: 'PATCH',
				body: JSON.stringify({ status }),
			});
			return { success: true, data: response.data };
		} catch (error) {
			console.error('Update blood request status error:', error);
			const message = error instanceof Error ? error.message : 'Failed to update blood request status';
			return { success: false, error: message };
		}
	},

	// Cancel blood request
	cancel: async (requestId: string): Promise<{ success: boolean; error?: string }> => {
		try {
			await makeAuthenticatedRequest(`${API_BASE_URL}/requests/${requestId}`, {
				method: 'DELETE',
			});
			return { success: true };
		} catch (error) {
			console.error('Cancel blood request error:', error);
			const message = error instanceof Error ? error.message : 'Failed to cancel blood request';
			return { success: false, error: message };
		}
	}
};
