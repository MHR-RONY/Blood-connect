import config from '@/config/env';
import { tokenStorage } from './api';

const API_BASE_URL = config.API_BASE_URL;

export interface EmergencyRequest {
	patient: {
		name: string;
		age: number;
		gender: 'male' | 'female' | 'other';
		bloodType: string;
		contactNumber: string;
	};
	emergency: {
		type: 'accident' | 'surgery' | 'massive-bleeding' | 'organ-failure' | 'pregnancy-complication' | 'blood-disorder' | 'other';
		severity: 'critical' | 'severe' | 'moderate';
		description: string;
		timeOfIncident: string;
	};
	hospital: {
		name: string;
		address: string;
		city: string;
		area: string;
		contactNumber: string;
		emergencyDepartment: string;
		doctorInCharge: {
			name: string;
		};
	};
	bloodRequirement: {
		units: number;
		requiredWithin: number;
	};
}

export interface EmergencyResponse {
	success: boolean;
	message: string;
	data?: {
		emergency: EmergencyRequest & {
			_id: string;
			requester: string;
			status: string;
			priority: number;
			createdAt: string;
			updatedAt: string;
		};
		broadcastStatus: string;
	};
}

class EmergencyAPI {
	private getAuthHeaders() {
		const token = tokenStorage.get();
		return {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`
		};
	}

	async createEmergencyRequest(requestData: EmergencyRequest): Promise<EmergencyResponse> {
		try {
			const response = await fetch(`${API_BASE_URL}/emergency`, {
				method: 'POST',
				headers: this.getAuthHeaders(),
				body: JSON.stringify(requestData),
			});

			const data = await response.json();

			if (response.ok) {
				return {
					success: true,
					message: data.message,
					data: {
						emergency: data.emergency,
						broadcastStatus: data.broadcastStatus
					}
				};
			} else {
				return {
					success: false,
					message: data.message || 'Failed to create emergency request'
				};
			}
		} catch (error) {
			console.error('Emergency request error:', error);
			return {
				success: false,
				message: 'Network error. Please check your connection and try again.'
			};
		}
	}

	async getEmergencyRequests(filters?: {
		bloodType?: string;
		city?: string;
		severity?: string;
		status?: string;
	}): Promise<EmergencyResponse> {
		try {
			const queryParams = new URLSearchParams();
			
			if (filters) {
				Object.entries(filters).forEach(([key, value]) => {
					if (value) queryParams.append(key, value);
				});
			}

			const response = await fetch(`${API_BASE_URL}/emergency?${queryParams}`, {
				method: 'GET',
				headers: this.getAuthHeaders(),
			});

			const data = await response.json();

			if (response.ok) {
				return {
					success: true,
					message: 'Emergency requests fetched successfully',
					data: data.emergencies
				};
			} else {
				return {
					success: false,
					message: data.message || 'Failed to fetch emergency requests'
				};
			}
		} catch (error) {
			console.error('Get emergency requests error:', error);
			return {
				success: false,
				message: 'Network error. Please check your connection and try again.'
			};
		}
	}

	async respondToEmergency(emergencyId: string, responseData: {
		willDonate: boolean;
		availableUnits?: number;
		estimatedArrival?: string;
		contactMethod?: string;
		message?: string;
	}): Promise<EmergencyResponse> {
		try {
			const response = await fetch(`${API_BASE_URL}/emergency/${emergencyId}/respond`, {
				method: 'POST',
				headers: this.getAuthHeaders(),
				body: JSON.stringify(responseData),
			});

			const data = await response.json();

			if (response.ok) {
				return {
					success: true,
					message: data.message,
					data: data.response
				};
			} else {
				return {
					success: false,
					message: data.message || 'Failed to respond to emergency'
				};
			}
		} catch (error) {
			console.error('Emergency response error:', error);
			return {
				success: false,
				message: 'Network error. Please check your connection and try again.'
			};
		}
	}
}

const emergencyAPI = new EmergencyAPI();
export default emergencyAPI;
