import { tokenStorage, ApiResponse } from './api';

const API_BASE_URL = 'http://localhost:3001/api';

// Types for donation data
export interface HospitalDonationRequest {
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
  donationDate: string;
  hospital?: string;
  contactPhone: string;
  medicalConditions?: string;
  notes?: string;
}

export interface AvailableDonorRequest {
  isAvailable: boolean;
  availableUntil?: string;
  preferredTimeSlots?: string[];
  maxDistanceKm?: number;
  emergencyContact?: boolean;
  notes?: string;
}

export interface HospitalDonation {
  _id: string;
  user: string;
  bloodType: string;
  unitsNeeded: number;
  urgencyLevel: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  donationDate: string;
  hospital?: string;
  contactPhone: string;
  medicalConditions?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableDonor {
  _id: string;
  user: {
    firstName: string;
    lastName: string;
    bloodType: string;
    phone: string;
    location: {
      city: string;
      area: string;
    };
  };
  isActive: boolean;
  availableUntil?: string;
  preferredTimeSlots?: string[];
  maxDistanceKm?: number;
  emergencyContact: boolean;
  notes?: string;
  lastActiveAt: string;
  createdAt: string;
}

// Hospital Donation API
export const hospitalDonationAPI = {
  submit: async (donationData: HospitalDonationRequest): Promise<ApiResponse<HospitalDonation>> => {
    const response = await fetch(`${API_BASE_URL}/donations/hospital`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStorage.get()}`
      },
      body: JSON.stringify(donationData)
    });

    if (!response.ok) {
      throw new Error('Failed to submit hospital donation request');
    }

    return response.json();
  },

  getUserHistory: async (): Promise<ApiResponse<HospitalDonation[]>> => {
    const response = await fetch(`${API_BASE_URL}/donations/hospital/user`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenStorage.get()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch donation history');
    }

    return response.json();
  }
};

// Available Donor API
export const availableDonorAPI = {
  register: async (donorData: AvailableDonorRequest): Promise<ApiResponse<AvailableDonor>> => {
    const response = await fetch(`${API_BASE_URL}/donors/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStorage.get()}`
      },
      body: JSON.stringify(donorData)
    });

    if (!response.ok) {
      throw new Error('Failed to register as available donor');
    }

    return response.json();
  },

  getAvailableDonors: async (filters?: { bloodType?: string; city?: string; page?: number }): Promise<ApiResponse<{ donors: AvailableDonor[]; total: number; page: number; totalPages: number }>> => {
    const params = new URLSearchParams();
    if (filters?.bloodType) params.append('bloodType', filters.bloodType);
    if (filters?.city) params.append('city', filters.city);
    if (filters?.page) params.append('page', filters.page.toString());

    const response = await fetch(`${API_BASE_URL}/donors/available?${params}`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available donors');
    }

    return response.json();
  },

  getProfile: async (): Promise<ApiResponse<AvailableDonor>> => {
    const response = await fetch(`${API_BASE_URL}/donors/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenStorage.get()}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch donor profile');
    }

    return response.json();
  },

  updateAvailability: async (isActive: boolean): Promise<ApiResponse<AvailableDonor>> => {
    const response = await fetch(`${API_BASE_URL}/donors/availability`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenStorage.get()}`
      },
      body: JSON.stringify({ isActive })
    });

    if (!response.ok) {
      throw new Error('Failed to update availability');
    }

    return response.json();
  }
};
