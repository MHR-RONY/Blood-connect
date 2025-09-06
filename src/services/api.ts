// API service for authentication and user management
import config from '@/config/env';

const API_BASE_URL = config.API_BASE_URL;

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
		public errors?: string[],
		public responseData?: Record<string, unknown>
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
			data.errors,
			data
		);
	}

	return data;
};

export const authApi = {
	// Sign up a new user
	signUp: async (userData: SignUpRequest): Promise<ApiResponse<
		| { user: User; token: string } // Old flow - direct login
		| { email: string; userId: string; requiresVerification: true } // New flow - OTP verification
	>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/register`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(userData),
			});

			return await handleApiResponse<
				| { user: User; token: string }
				| { email: string; userId: string; requiresVerification: true }
			>(response);
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

	// Verify OTP
	verifyOTP: async (email: string, otp: string): Promise<ApiResponse<{ user: User; token: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, otp }),
			});

			return await handleApiResponse<{ user: User; token: string }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Resend OTP
	resendOTP: async (email: string): Promise<ApiResponse<{ message: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			return await handleApiResponse<{ message: string }>(response);
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

	// Forgot password - send reset OTP
	forgotPassword: async (email: string): Promise<ApiResponse<{ email: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email }),
			});

			return await handleApiResponse<{ email: string }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Verify password reset OTP
	verifyResetOTP: async (email: string, otp: string): Promise<ApiResponse<{ resetToken: string; email: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/verify-reset-otp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ email, otp }),
			});

			return await handleApiResponse<{ resetToken: string; email: string }>(response);
		} catch (error) {
			if (error instanceof ApiError) {
				throw error;
			}
			throw new ApiError('Network error. Please check your connection.', 0);
		}
	},

	// Reset password with verified token
	resetPassword: async (resetToken: string, newPassword: string): Promise<ApiResponse<{ message: string }>> => {
		try {
			const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ resetToken, newPassword }),
			});

			return await handleApiResponse<{ message: string }>(response);
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
