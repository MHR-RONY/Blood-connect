import config from '@/config/env';
import { tokenStorage } from './api';

const API_BASE_URL = config.API_BASE_URL;

export interface DashboardStats {
	totalDonations: number;
	lastDonationDate?: string;
	canDonate: boolean;
	rating: number;
	bloodType: string;
	location: {
		area: string;
		city: string;
	};
}

export interface RecentDonation {
	_id: string;
	donor: string;
	bloodType: string;
	amount: number;
	donationDate: string;
	status: string;
	location: {
		name: string;
		address: string;
		city: string;
	};
}

export interface UserBloodRequest {
	_id: string;
	patient: {
		name: string;
		bloodType: string;
	};
	hospital: {
		name: string;
	};
	bloodRequirement: {
		units: number;
		urgency: string;
	};
	status: string;
	createdAt: string;
}

export interface NearbyRequest {
	_id: string;
	patient: {
		bloodType: string;
	};
	hospital: {
		name: string;
		city: string;
	};
	bloodRequirement: {
		urgency: string;
		units: number;
	};
	requester: {
		firstName: string;
		lastName: string;
	};
	createdAt: string;
	priority: number;
}

export interface DashboardData {
	stats: DashboardStats;
	recentDonations: RecentDonation[];
	myRequests: UserBloodRequest[];
	nearbyRequests: NearbyRequest[];
}

export interface ApiResponse<T> {
	success?: boolean;
	message: string;
	data?: T;
	stats?: DashboardStats;
	recentDonations?: RecentDonation[];
	myRequests?: UserBloodRequest[];
	nearbyRequests?: NearbyRequest[];
}

export const dashboardAPI = {
	getUserDashboard: async (): Promise<ApiResponse<DashboardData>> => {
		const response = await fetch(`${API_BASE_URL}/users/dashboard`, {
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${tokenStorage.get()}`
			}
		});

		if (!response.ok) {
			throw new Error('Failed to fetch dashboard data');
		}

		return response.json();
	}
};
