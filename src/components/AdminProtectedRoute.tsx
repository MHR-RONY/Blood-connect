import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield } from 'lucide-react';

interface AdminProtectedRouteProps {
	children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
	const { user, isAuthenticated, isLoading } = useAuth();
	const location = useLocation();
	const { toast } = useToast();

	useEffect(() => {
		// Show toast notification when user tries to access admin route without proper permissions
		if (!isLoading && (!isAuthenticated || user?.role !== 'admin')) {
			toast({
				title: "Access Denied 🚫",
				description: "Administrator privileges required to access this page.",
				variant: "destructive",
			});
		}
	}, [isLoading, isAuthenticated, user?.role, toast]);

	// Show loading spinner while checking authentication
	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-950/20 dark:to-blue-950/20">
				<div className="text-center">
					<div className="bg-gradient-to-br from-red-500 to-blue-600 p-4 rounded-full shadow-lg w-16 h-16 mx-auto mb-4 flex items-center justify-center">
						<Shield className="w-8 h-8 text-white" />
					</div>
					<Loader2 className="w-8 h-8 animate-spin text-red-600 mx-auto mb-4" />
					<p className="text-lg text-gray-600 dark:text-gray-300">
						Verifying administrator privileges...
					</p>
				</div>
			</div>
		);
	}

	// If user is not authenticated, redirect to admin login
	if (!isAuthenticated) {
		return <Navigate to="/admin/login" replace />;
	}

	// If user is authenticated but not an admin, redirect to admin login with error message
	if (user?.role !== 'admin') {
		return <Navigate to="/admin/login" replace />;
	}

	return <>{children}</>;
};

export default AdminProtectedRoute;
