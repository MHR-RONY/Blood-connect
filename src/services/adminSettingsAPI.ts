import config from '@/config/env';
import { tokenStorage } from './api';

const API_BASE_URL = config.API_BASE_URL;

export interface AdminInfo {
	firstName: string;
	lastName: string;
	email: string;
	phone: string;
	systemName: string;
	organizationName: string;
	address: string;
}

export interface SecuritySettings {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	twoFactorEnabled: boolean;
	sessionTimeout: number;
}

export interface SystemLog {
	id: string;
	level: 'info' | 'warning' | 'error';
	action: string;
	user: string;
	details: string;
	createdAt: string;
	formattedTimestamp: string;
}

export interface SystemStatus {
	database: {
		status: string;
		lastBackup: string;
		health: string;
	};
	system: {
		uptime: string;
		status: string;
		health: string;
	};
	statistics: {
		activeUsers: number;
		totalDonations: number;
		activeRequests: number;
		lastActivity: string;
	};
}

export interface ApiResponse<T> {
	success: boolean;
	message?: string;
	data?: T;
	error?: string;
	pagination?: {
		currentPage: number;
		totalPages: number;
		totalItems: number;
		itemsPerPage: number;
	};
}

const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
	const token = tokenStorage.get();

	const response = await fetch(url, {
		...options,
		headers: {
			'Content-Type': 'application/json',
			'Authorization': `Bearer ${token}`,
			...options.headers,
		},
	});

	if (!response.ok) {
		const errorData = await response.json().catch(() => ({}));
		throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
	}

	return response.json();
};

export const adminSettingsAPI = {
	// Get admin information
	getAdminInfo: async (): Promise<ApiResponse<AdminInfo>> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/settings/info`);
			return { success: true, data: response.data };
		} catch (error) {
			console.error('Get admin info error:', error);
			const message = error instanceof Error ? error.message : 'Failed to fetch admin information';
			return { success: false, error: message };
		}
	},

	// Update admin information
	updateAdminInfo: async (adminInfo: AdminInfo): Promise<ApiResponse<AdminInfo>> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/settings/info`, {
				method: 'PUT',
				body: JSON.stringify(adminInfo),
			});
			return { success: true, data: response.data, message: response.message };
		} catch (error) {
			console.error('Update admin info error:', error);
			const message = error instanceof Error ? error.message : 'Failed to update admin information';
			return { success: false, error: message };
		}
	},

	// Update admin password
	updatePassword: async (passwordData: Pick<SecuritySettings, 'currentPassword' | 'newPassword' | 'confirmPassword'>): Promise<ApiResponse<void>> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/settings/password`, {
				method: 'PUT',
				body: JSON.stringify(passwordData),
			});
			return { success: true, message: response.message };
		} catch (error) {
			console.error('Update password error:', error);
			const message = error instanceof Error ? error.message : 'Failed to update password';
			return { success: false, error: message };
		}
	},

	// Get system logs
	getSystemLogs: async (page: number = 1, limit: number = 50, level?: string): Promise<ApiResponse<SystemLog[]>> => {
		try {
			const params = new URLSearchParams({
				page: page.toString(),
				limit: limit.toString(),
			});

			if (level) {
				params.append('level', level);
			}

			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/settings/logs?${params}`);
			return {
				success: true,
				data: response.data,
				pagination: response.pagination
			};
		} catch (error) {
			console.error('Get system logs error:', error);
			const message = error instanceof Error ? error.message : 'Failed to fetch system logs';
			return { success: false, error: message };
		}
	},

	// Create database backup
	createBackup: async (): Promise<ApiResponse<void>> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/settings/backup`, {
				method: 'POST',
			});
			return { success: true, message: response.message };
		} catch (error) {
			console.error('Create backup error:', error);
			const message = error instanceof Error ? error.message : 'Failed to create database backup';
			return { success: false, error: message };
		}
	},

	// Get system status
	getSystemStatus: async (): Promise<ApiResponse<SystemStatus>> => {
		try {
			const response = await makeAuthenticatedRequest(`${API_BASE_URL}/admin/settings/system-status`);
			return { success: true, data: response.data };
		} catch (error) {
			console.error('Get system status error:', error);
			const message = error instanceof Error ? error.message : 'Failed to fetch system status';
			return { success: false, error: message };
		}
	},

	// Export system logs as CSV
	exportLogs: async (): Promise<{ success: boolean; error?: string }> => {
		try {
			const logsResponse = await adminSettingsAPI.getSystemLogs(1, 1000); // Get all logs

			if (!logsResponse.success || !logsResponse.data) {
				throw new Error('Failed to fetch logs for export');
			}

			const csvContent = [
				['Timestamp', 'Level', 'Action', 'User', 'Details'].join(','),
				...logsResponse.data.map(log => [
					log.formattedTimestamp,
					log.level,
					`"${log.action}"`,
					`"${log.user}"`,
					`"${log.details.replace(/"/g, '""')}"`
				].join(','))
			].join('\n');

			const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
			const link = document.createElement('a');
			const url = URL.createObjectURL(blob);

			link.setAttribute('href', url);
			link.setAttribute('download', `system-logs-${new Date().toISOString().split('T')[0]}.csv`);
			link.style.visibility = 'hidden';

			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			URL.revokeObjectURL(url);

			return { success: true };
		} catch (error) {
			console.error('Export logs error:', error);
			const message = error instanceof Error ? error.message : 'Failed to export logs';
			return { success: false, error: message };
		}
	}
};
