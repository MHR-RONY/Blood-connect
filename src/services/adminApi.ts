import config from '@/config/env';
import { ApiResponse, ApiError, tokenStorage } from './api';

const API_BASE_URL = config.API_BASE_URL;

// Types for admin dashboard data
export interface AdminDashboardStats {
	overview: {
		totalUsers: number;
		activeUsers: number;
		totalDonations: number;
		pendingRequests: number;
		activeEmergencies: number;
	};
	bloodTypeDistribution: Array<{
		_id: string;
		count: number;
		availableDonors: number;
	}>;
	locationDistribution: Array<{
		_id: string;
		count: number;
		donors: number;
	}>;
	donationStats: Record<string, number>;
	requestStats: Record<string, number>;
	recentUsers: Array<{
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
		createdAt: string;
	}>;
	recentActivity: {
		donations: Array<{
			_id: string;
			donor: {
				firstName: string;
				lastName: string;
			};
			createdAt: string;
			status: string;
		}>;
		requests: Array<{
			_id: string;
			requester: {
				firstName: string;
				lastName: string;
			};
			patient: {
				bloodType: string;
			};
			createdAt: string;
			status: string;
		}>;
		emergencies: Array<{
			_id: string;
			requester: {
				firstName: string;
				lastName: string;
			};
			patient: {
				bloodType: string;
			};
			emergency: {
				severity: string;
			};
			createdAt: string;
			status: string;
		}>;
	};
}

export interface AdminUser {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	bloodType: string;
	role: string;
	isActive: boolean;
	isBanned: boolean;
	banReason?: string;
	bannedBy?: {
		_id: string;
		firstName: string;
		lastName: string;
		email: string;
	};
	bannedAt?: string;
	isVerified: boolean;
	createdAt: string;
	location: {
		city: string;
		area: string;
	};
	donationCount?: number;
	lastLogin?: string;
	medicalHistory?: {
		hasChronicDiseases: boolean;
		diseases: string[];
		medications: string[];
		allergies: string[];
		isEligibleToDonate: boolean;
	};
}

export interface PaginationInfo {
	page: number;
	limit: number;
	total: number;
	pages: number;
}

export interface ChangePasswordRequest {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
}

export interface UserDonation {
	_id: string;
	donor: string;
	request: {
		patient: {
			bloodType: string;
		};
	};
	status: string;
	createdAt: string;
}

export interface UserBloodRequest {
	_id: string;
	requester: string;
	patient: {
		bloodType: string;
		name: string;
	};
	status: string;
	createdAt: string;
}

export interface UserEmergencyRequest {
	_id: string;
	patient: {
		name: string;
		bloodType: string;
	};
	emergency: {
		severity: string;
	};
	status: string;
	createdAt: string;
}

// Admin Donor Interface
export interface AdminDonor {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	bloodType: string;
	location: {
		city: string;
		area: string;
	};
	isAvailableDonor: boolean;
	donationCount: number;
	lastDonation?: string;
	totalDonations: number;
	createdAt: string;
	lastLogin?: string;
	isActive: boolean;
	isVerified: boolean;
	status: 'Available' | 'Unavailable';
}

// Blood Type Stats Interface
export interface BloodTypeStats {
	[key: string]: number;
}

// Helper function to handle API responses
const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
	const data = await response.json();

	if (!response.ok) {
		throw new ApiError(
			data.message || `HTTP error! status: ${response.status}`,
			response.status,
			data.errors || []
		);
	}

	return data;
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async <T>(
	endpoint: string,
	options: RequestInit = {}
): Promise<ApiResponse<T>> => {
	const token = tokenStorage.get();

	if (!token) {
		throw new ApiError('Authentication required', 401);
	}

	try {
		const response = await fetch(`${API_BASE_URL}${endpoint}`, {
			...options,
			headers: {
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
				...options.headers,
			},
		});

		return await handleApiResponse<T>(response);
	} catch (error) {
		if (error instanceof ApiError) {
			throw error;
		}
		throw new ApiError('Network error. Please check your connection.', 0);
	}
};

export const adminApi = {
	// Get admin dashboard statistics
	getDashboardStats: async (period: number = 30): Promise<ApiResponse<AdminDashboardStats>> => {
		return makeAuthenticatedRequest<AdminDashboardStats>(`/admin/dashboard?period=${period}`);
	},

	// Get all users with filters and pagination
	getUsers: async (params: {
		role?: string;
		isActive?: boolean;
		isBanned?: boolean;
		bloodType?: string;
		city?: string;
		search?: string;
		page?: number;
		limit?: number;
		sortBy?: string;
		sortOrder?: string;
	} = {}): Promise<ApiResponse<{ users: AdminUser[]; pagination: PaginationInfo }>> => {
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== '') {
				queryParams.append(key, value.toString());
			}
		});

		const queryString = queryParams.toString();
		const endpoint = queryString ? `/admin/users?${queryString}` : '/admin/users';

		return makeAuthenticatedRequest<{ users: AdminUser[]; pagination: PaginationInfo }>(endpoint);
	},

	// Get detailed user information
	getUserDetails: async (userId: string): Promise<ApiResponse<{
		user: AdminUser;
		donations: UserDonation[];
		requests: UserBloodRequest[];
		emergencyRequests: UserEmergencyRequest[];
		stats: {
			donationCount: number;
			requestCount: number;
			emergencyCount: number;
		};
	}>> => {
		return makeAuthenticatedRequest<{
			user: AdminUser;
			donations: UserDonation[];
			requests: UserBloodRequest[];
			emergencyRequests: UserEmergencyRequest[];
			stats: {
				donationCount: number;
				requestCount: number;
				emergencyCount: number;
			};
		}>(`/admin/users/${userId}`);
	},

	// Ban or unban user
	banUser: async (userId: string, data: {
		isBanned: boolean;
		banReason?: string;
	}): Promise<ApiResponse<{ message: string; user: AdminUser }>> => {
		return makeAuthenticatedRequest<{ message: string; user: AdminUser }>(`/admin/users/${userId}/ban`, {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	},

	// Change admin password
	changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse<{ message: string }>> => {
		return makeAuthenticatedRequest<{ message: string }>('/admin/change-password', {
			method: 'PUT',
			body: JSON.stringify(data),
		});
	},

	// Delete user (admin only)
	deleteUser: async (userId: string): Promise<ApiResponse<{ message: string }>> => {
		return makeAuthenticatedRequest<{ message: string }>(`/admin/users/${userId}`, {
			method: 'DELETE',
		});
	},

	// Update user status (admin only)
	updateUserStatus: async (userId: string, updates: {
		isActive?: boolean;
		isVerified?: boolean;
		role?: string;
	}): Promise<ApiResponse<{ message: string; user: AdminUser }>> => {
		return makeAuthenticatedRequest<{ message: string; user: AdminUser }>(`/admin/users/${userId}`, {
			method: 'PUT',
			body: JSON.stringify(updates),
		});
	},

	// Get all donors with filters and pagination
	getDonors: async (params: {
		page?: number;
		limit?: number;
		search?: string;
		bloodType?: string;
		status?: string;
		isActive?: boolean;
	} = {}): Promise<ApiResponse<{
		donors: AdminDonor[];
		total: number;
		page: number;
		totalPages: number;
		bloodTypeStats: BloodTypeStats;
	}>> => {
		const queryParams = new URLSearchParams();
		if (params.page) queryParams.append('page', params.page.toString());
		if (params.limit) queryParams.append('limit', params.limit.toString());
		if (params.search) queryParams.append('search', params.search);
		if (params.bloodType) queryParams.append('bloodType', params.bloodType);
		if (params.status) queryParams.append('status', params.status);
		if (params.isActive !== undefined) queryParams.append('isActive', params.isActive.toString());

		return makeAuthenticatedRequest<{
			donors: AdminDonor[];
			total: number;
			page: number;
			totalPages: number;
			bloodTypeStats: BloodTypeStats;
		}>(`/admin/donors?${queryParams}`);
	},

	// Get donor details
	getDonorDetails: async (donorId: string): Promise<ApiResponse<{
		donor: AdminDonor;
		donations: UserDonation[];
		hospitalDonations: Array<{
			_id: string;
			bloodType: string;
			unitsNeeded: number;
			urgencyLevel: string;
			status: string;
			donationDate: string;
			hospital?: string;
			createdAt: string;
		}>;
		stats: {
			totalDonations: number;
			hospitalDonations: number;
			availableDonorRegistrations: number;
		};
	}>> => {
		return makeAuthenticatedRequest<{
			donor: AdminDonor;
			donations: UserDonation[];
			hospitalDonations: Array<{
				_id: string;
				bloodType: string;
				unitsNeeded: number;
				urgencyLevel: string;
				status: string;
				donationDate: string;
				hospital?: string;
				createdAt: string;
			}>;
			stats: {
				totalDonations: number;
				hospitalDonations: number;
				availableDonorRegistrations: number;
			};
		}>(`/admin/donors/${donorId}`);
	},
};