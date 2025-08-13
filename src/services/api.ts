// API service for authentication and user management

const API_BASE_URL = 'http://localhost:3001/api';

export interface SignUpRequest {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
	phone: string;
	dateOfBirth: string;
	gender: string;
	bloodType: string;
	weight: number;
	location: {
		city: string;
		area: string;
		coordinates?: {
			lat: number;
			lng: number;
		};
	};
	isAvailableDonor: boolean;
}

export interface ApiResponse<T = unknown> {
	success: boolean;
	message: string;
	data?: T;
	errors?: string[];
}

export interface User {
	_id: string;
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	dateOfBirth: string;
	gender: string;
	bloodType: string;
	weight: number;
	location: {
		city: string;
		area: string;
		coordinates?: {
			lat: number;
			lng: number;
		};
	};
	isAvailableDonor: boolean;
	role: string;
	createdAt: string;
	updatedAt: string;
}

class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public errors?: string[]
	) {
		super(message);
		this.name = 'ApiError';
	}
}

const handleApiResponse = async <T>(response: Response): Promise<ApiResponse<T>> => {
	const data = await response.json();

	if (!response.ok) {
		throw new ApiError(
			data.message || 'An error occurred',
			response.status,
			data.errors
		);
	}

	return data;
};

export const authApi = {
	// Sign up a new user
	signUp: async (userData: SignUpRequest): Promise<ApiResponse<{ user: User; token: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			return await handleApiResponse<{ user: User; token: string }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Sign in user
	signIn: async (email: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/login`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, password }),
			});

			return await handleApiResponse<{ user: User; token: string }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Check if email exists
	checkEmailExists: async (email: string): Promise<ApiResponse<{ exists: boolean }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/check-email?email=${encodeURIComponent(email)}`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
			});

			return await handleApiResponse<{ exists: boolean }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Verify phone number
	verifyPhone: async (phone: string): Promise<ApiResponse<{ isValid: boolean }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/verify-phone`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ phone }),
			});

			return await handleApiResponse<{ isValid: boolean }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},
};

export const userApi = {
	// Get user profile
	getProfile: async (token: string): Promise<ApiResponse<User>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/users/profile`, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
			});

			return await handleApiResponse<User>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Update user profile
	updateProfile: async (token: string, userData: Partial<SignUpRequest>): Promise<ApiResponse<User>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/users/profile`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify(userData),
			});

			return await handleApiResponse<User>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},
};

// Storage utilities for JWT token
export const tokenStorage = {
	set: (token: string) => {
		localStorage.setItem('bloodconnect_token', token);
	},

	get: (): string | null => {
		return localStorage.getItem('bloodconnect_token');
	},

	remove: () => {
		localStorage.removeItem('bloodconnect_token');
	},

	isValid: (token: string): boolean => {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} catch {
			return false;
		}
	},
};

export { ApiError };
