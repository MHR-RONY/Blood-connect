import config from '@/config/env';
import { tokenStorage } from './api';

const API_BASE_URL = config.API_BASE_URL;

export interface PaginationInfo {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemsPerPage: number;
}

export interface AdminBloodRequest {
	_id: string;
	requester: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		phone: string;
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
	adminMessage?: string;
	adminNotes?: string;
	processedBy?: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	processedAt?: string;
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
			console.error('Admin API Error Response:', error);

			// Log detailed validation errors
			if (error.errors && Array.isArray(error.errors)) {
				console.error('Validation errors:', error.errors);
				errorMessage = error.errors.map((err: { field?: string; param?: string; message: string }) =>
					`${err.field || err.param}: ${err.message}`).join(', ');
			} else {
				errorMessage = error.message || `HTTP ${response.status}: ${response.statusText}`;
			}
		} catch (parseError) {
			console.error('Failed to parse error response:', parseError);
			errorMessage = `HTTP ${response.status}: ${response.statusText}`;
		}
		throw new Error(errorMessage);
	}

	return response.json();
};

export const adminBloodRequestAPI = {
	// Get all blood requests for admin
	getAll: async (params: {
		status?: string;
		bloodType?: string;
		city?: string;
		urgency?: string;
		page?: number;
		limit?: number;
	} = {}): Promise<{ success: boolean; data?: { requests: AdminBloodRequest[], pagination: PaginationInfo }; error?: string }> => {
		try {
			const queryParams = new URLSearchParams();
			Object.entries(params).forEach(([key, value]) => {
				if (value !== undefined && value !== '') {
					queryParams.append(key, value.toString());
				}
			});

			const response = await makeAuthenticatedRequest(
				`${API_BASE_URL}/admin/requests?${queryParams.toString()}`
			);

			return {
				success: true,
				data: {
					requests: response.requests,
					pagination: response.pagination
				}
			};
		} catch (error) {
			console.error('Get admin blood requests error:', error);
			const message = error instanceof Error ? error.message : 'Failed to fetch blood requests';
			return { success: false, error: message };
		}
	},

	// Update blood request status (fulfill/decline)
	updateStatus: async (
		requestId: string,
		status: 'fulfilled' | 'cancelled' | 'partially-fulfilled',
		adminMessage?: string,
		adminNotes?: string
	): Promise<{ success: boolean; data?: AdminBloodRequest; error?: string }> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/requests/${requestId}/status`, {
				method: 'PATCH',
				body: JSON.stringify({
					status,
					adminMessage,
					adminNotes
				}),
			});

			return { success: true, data: response.request };
		} catch (error) {
			console.error('Update blood request status error:', error);
			const message = error instanceof Error ? error.message : 'Failed to update blood request status';
			return { success: false, error: message };
		}
	},

	// Fulfill a blood request
	fulfill: async (
		requestId: string,
		adminMessage?: string,
		adminNotes?: string
	): Promise<{ success: boolean; data?: AdminBloodRequest; error?: string }> => {
		return adminBloodRequestAPI.updateStatus(requestId, 'fulfilled', adminMessage, adminNotes);
	},

	// Decline a blood request
	decline: async (
		requestId: string,
		adminMessage?: string,
		adminNotes?: string
	): Promise<{ success: boolean; data?: AdminBloodRequest; error?: string }> => {
		return adminBloodRequestAPI.updateStatus(requestId, 'cancelled', adminMessage, adminNotes);
	},

	// Partially fulfill a blood request
	partiallyFulfill: async (
		requestId: string,
		adminMessage?: string,
		adminNotes?: string
	): Promise<{ success: boolean; data?: AdminBloodRequest; error?: string }> => {
		return adminBloodRequestAPI.updateStatus(requestId, 'partially-fulfilled', adminMessage, adminNotes);
	}
};
