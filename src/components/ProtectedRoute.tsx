import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
	children: React.ReactNode;
	requireAuth?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
	children,
	requireAuth = true
}) => {
	const { isAuthenticated, isLoading, checkAuth } = useAuth();
	const location = useLocation();
	const { toast } = useToast();
	const [showLoginPrompt, setShowLoginPrompt] = useState(false);

	useEffect(() => {
		const verifyAuth = async () => {
			if (requireAuth && !isLoading) {
				const authResult = await checkAuth();

				if (!authResult) {
					// Show login prompt popup
					setShowLoginPrompt(true);
					toast({
						title: "Authentication Required 🔐",
						description: "Please login to access this page. Redirecting to login...",
						variant: "destructive",
					});

					// Redirect after a short delay to show the popup
					setTimeout(() => {
						setShowLoginPrompt(false);
					}, 2000);
				}
			}
		};

		verifyAuth();
	}, [requireAuth, isLoading, checkAuth, toast]);

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20">
				<div className="text-center">
					<Loader2 className="w-12 h-12 animate-spin text-red-600 mx-auto mb-4" />
					<p className="text-lg text-gray-600 dark:text-gray-300">
						Checking authentication...
					</p>
				</div>
			</div>
		);
	}

	// If authentication is required but user is not authenticated, redirect to login
	if (requireAuth && !isAuthenticated) {
		return <Navigate to="/login" replace />;
	}

	// If user is authenticated but trying to access login/signup, redirect to dashboard
	if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
		return <Navigate to="/dashboard" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
