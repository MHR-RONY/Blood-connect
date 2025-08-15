import React, { createContext, useEffect, useState, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { tokenStorage } from '@/services/api';

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

export interface AuthContextType {
	user: User | null;
	isAuthenticated: boolean;
	isLoading: boolean;
	login: (token: string, userData: User) => void;
	logout: () => void;
	checkAuth: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
	children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
	const [user, setUser] = useState<User | null>(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [hasCheckedAuth, setHasCheckedAuth] = useState(false);
	const navigate = useNavigate();
	const { toast } = useToast();

	// Check if user is authenticated on app load
	const checkAuth = async (): Promise<boolean> => {
		try {
			// Prevent multiple auth checks
			if (hasCheckedAuth && !isLoading) {
				return isAuthenticated;
			}

			const token = tokenStorage.get();

			if (!token) {
				setIsAuthenticated(false);
				setUser(null);
				setIsLoading(false);
				setHasCheckedAuth(true);
				return false;
			}

			// Verify token with backend
			const response = await fetch('http://localhost:3001/api/auth/me', {
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.ok) {
				const userData = await response.json();
				setUser(userData.data);
				setIsAuthenticated(true);
				setIsLoading(false);
				setHasCheckedAuth(true);
				return true;
			} else {
				// Token is invalid, remove it
				tokenStorage.remove();
				setIsAuthenticated(false);
				setUser(null);
				setIsLoading(false);
				setHasCheckedAuth(true);
				return false;
			}
		} catch (error) {
			console.error('Auth check failed:', error);
			tokenStorage.remove();
			setIsAuthenticated(false);
			setUser(null);
			setIsLoading(false);
			setHasCheckedAuth(true);
			return false;
		}
	};

	// Login function
	const login = (token: string, userData: User) => {
		tokenStorage.set(token);
		setUser(userData);
		setIsAuthenticated(true);
		setHasCheckedAuth(true);
		toast({
			title: "Welcome back! 👋",
			description: `Hello ${userData.firstName}! You're now logged in.`,
		});
	};

	// Logout function
	const logout = () => {
		tokenStorage.remove();
		setUser(null);
		setIsAuthenticated(false);
		setHasCheckedAuth(true);
		toast({
			title: "Logged out successfully",
			description: "You have been logged out. See you soon!",
		});
		navigate('/login');
	};

	// Check authentication on mount - only once
	useEffect(() => {
		const initAuth = async () => {
			if (!hasCheckedAuth) {
				try {
					const token = tokenStorage.get();

					if (!token) {
						setIsAuthenticated(false);
						setUser(null);
						setIsLoading(false);
						setHasCheckedAuth(true);
						return;
					}

					// Verify token with backend
					const response = await fetch('http://localhost:3001/api/auth/me', {
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token}`,
							'Content-Type': 'application/json',
						},
					});

					if (response.ok) {
						const userData = await response.json();
						setUser(userData.data);
						setIsAuthenticated(true);
					} else {
						// Token is invalid, remove it
						tokenStorage.remove();
						setIsAuthenticated(false);
						setUser(null);
					}
				} catch (error) {
					console.error('Auth check failed:', error);
					tokenStorage.remove();
					setIsAuthenticated(false);
					setUser(null);
				} finally {
					setIsLoading(false);
					setHasCheckedAuth(true);
				}
			}
		};
		initAuth();
	}, []); // Empty dependency array - only run once

	const value: AuthContextType = {
		user,
		isAuthenticated,
		isLoading,
		login,
		logout,
		checkAuth,
	};

	return (
		<AuthContext.Provider value={value}>
			{children}
		</AuthContext.Provider>
	);
};

// Custom hook to use the auth context
export const useAuth = () => {
	const context = React.useContext(AuthContext);
	if (context === undefined) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};
