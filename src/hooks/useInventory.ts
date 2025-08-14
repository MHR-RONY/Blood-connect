import { useState, useEffect } from 'react';
import config from '../config';

const API_BASE_URL = config.API_BASE_URL;

interface InventoryBatch {
	batchId: string;
	units: number;
	expiryDate: string;
	donationDate: string;
	donorId?: string;
	location: string;
	status: 'available' | 'reserved' | 'expired' | 'used';
}

interface InventoryItem {
	_id: string;
	bloodType: string;
	units: number;
	availableUnits: number;
	expiredUnits: number;
	status: 'Good' | 'Medium' | 'Low' | 'Critical';
	nextExpiryDate: string | null;
	batches: InventoryBatch[];
	allBatches: InventoryBatch[];
	thresholds: {
		critical: number;
		low: number;
		good: number;
	};
	lastUpdated: string;
	updatedBy?: {
		name: string;
		email: string;
	};
}

interface InventoryStats {
	totalUnits: number;
	totalBloodTypes: number;
	criticalCount: number;
	lowStockCount: number;
	expiredUnits: number;
	expiringIn7Days: number;
	byBloodType: Record<string, {
		units: number;
		status: string;
		nextExpiry: string | null;
		expired: number;
		expiringIn7Days: number;
	}>;
}

// Get auth token from localStorage
const getAuthToken = () => {
	return localStorage.getItem('bloodconnect_token');
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
			errorMessage = error.message || error.errors?.[0]?.msg || `HTTP ${response.status}: ${response.statusText}`;
		} catch (parseError) {
			console.error('Failed to parse error response:', parseError);
			errorMessage = `HTTP ${response.status}: ${response.statusText}`;
		}
		throw new Error(errorMessage);
	}

	return response.json();
};

// Custom hook for inventory data
export const useInventory = () => {
	const [inventory, setInventory] = useState<InventoryItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchInventory = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await makeAuthenticatedRequest(`${API_BASE_URL}/inventory`);
			setInventory(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch inventory');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchInventory();
	}, []);

	const addStock = async (bloodType: string, units: number, expiryDate: string, donorId?: string, location?: string) => {
		try {
			// Ensure units is a number
			const unitsNumber = typeof units === 'string' ? parseInt(units) : units;

			const requestBody = {
				bloodType,
				units: unitsNumber,  // Make sure this is a number
				expiryDate,
				...(donorId && { donorId }),
				...(location && { location })
			};

			console.log('API Request body:', requestBody);

			await makeAuthenticatedRequest(`${API_BASE_URL}/inventory/add-stock`, {
				method: 'POST',
				body: JSON.stringify(requestBody),
			});
			await fetchInventory(); // Refresh data
			return { success: true };
		} catch (err) {
			console.error('Add stock error:', err);
			const message = err instanceof Error ? err.message : 'Failed to add stock';
			return { success: false, error: message };
		}
	};

	const removeStock = async (bloodType: string, units: number, reason?: string) => {
		try {
			await makeAuthenticatedRequest(`${API_BASE_URL}/inventory/remove-stock`, {
				method: 'POST',
				body: JSON.stringify({
					bloodType,
					units,
					reason
				}),
			});
			await fetchInventory(); // Refresh data
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to remove stock';
			return { success: false, error: message };
		}
	};

	const updateThresholds = async (bloodType: string, critical: number, low: number, good: number) => {
		try {
			await makeAuthenticatedRequest(`${API_BASE_URL}/inventory/${bloodType}/thresholds`, {
				method: 'PUT',
				body: JSON.stringify({
					critical,
					low,
					good
				}),
			});
			await fetchInventory(); // Refresh data
			return { success: true };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to update thresholds';
			return { success: false, error: message };
		}
	};

	const removeExpired = async () => {
		try {
			const result = await makeAuthenticatedRequest(`${API_BASE_URL}/inventory/expired`, {
				method: 'DELETE',
			});
			await fetchInventory(); // Refresh data
			return { success: true, data: result };
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Failed to remove expired stock';
			return { success: false, error: message };
		}
	};

	return {
		inventory,
		loading,
		error,
		refreshInventory: fetchInventory,
		addStock,
		removeStock,
		updateThresholds,
		removeExpired,
	};
};

// Custom hook for inventory statistics
export const useInventoryStats = () => {
	const [stats, setStats] = useState<InventoryStats | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchStats = async () => {
		try {
			setLoading(true);
			setError(null);
			const data = await makeAuthenticatedRequest(`${API_BASE_URL}/inventory/stats`);
			setStats(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to fetch inventory stats');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchStats();
	}, []);

	return {
		stats,
		loading,
		error,
		refreshStats: fetchStats,
	};
};
