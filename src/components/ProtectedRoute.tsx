import React, { useEffect } from 'react';
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
	const { isAuthenticated, isLoading } = useAuth();
	const location = useLocation();
	const { toast } = useToast();

	useEffect(() => {
		// Show toast notification when user tries to access protected route without authentication
		if (requireAuth && !isLoading && !isAuthenticated) {
			toast({
				title: "Authentication Required 🔐",
				description: "Please login to access this page.",
				variant: "destructive",
			});
		}
	}, [requireAuth, isLoading, isAuthenticated, toast]);

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

	// If user is authenticated but trying to access login/signup, redirect to index page
	if (!requireAuth && isAuthenticated && (location.pathname === '/login' || location.pathname === '/signup')) {
		return <Navigate to="/" replace />;
	}

	return <>{children}</>;
};

export default ProtectedRoute;
