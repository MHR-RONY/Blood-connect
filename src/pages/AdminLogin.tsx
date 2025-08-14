import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Loader2, Eye, EyeOff, Shield, UserCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authApi, ApiError } from "@/services/api";
import Header from "@/components/Header";
import BloodDropIcon from "@/components/BloodDropIcon";

const AdminLogin = () => {
	const navigate = useNavigate();
	const location = useLocation();
	const { toast } = useToast();
	const { login } = useAuth();

	const [formData, setFormData] = useState({
		email: "",
		password: "",
		rememberMe: false
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);

	// Redirect to admin dashboard after successful login
	const from = '/admin';

	const handleInputChange = (name: string, value: string | boolean) => {
		setFormData(prev => ({ ...prev, [name]: value }));
		// Clear field error when user starts typing
		if (fieldErrors[name]) {
			setFieldErrors(prev => ({ ...prev, [name]: '' }));
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setFieldErrors({});

		try {
			// Basic validation
			const errors: Record<string, string> = {};

			if (!formData.email.trim()) {
				errors.email = 'Email is required';
			} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
				errors.email = 'Please enter a valid email address';
			}

			if (!formData.password.trim()) {
				errors.password = 'Password is required';
			}

			if (Object.keys(errors).length > 0) {
				setFieldErrors(errors);
				toast({
					title: "Validation Error",
					description: "Please fix the errors below and try again.",
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			// Attempt admin login
			const response = await authApi.signIn(
				formData.email.toLowerCase().trim(),
				formData.password
			);

			if (response.success && response.data) {
				// Check if user has admin privileges
				if (response.data.user.role !== 'admin') {
					toast({
						title: "Access Denied",
						description: "You don't have administrator privileges. Please use regular login.",
						variant: "destructive",
					});
					setIsSubmitting(false);
					return;
				}

				// Admin login successful
				login(response.data.token, response.data.user);

				toast({
					title: "Admin Login Successful! 👑",
					description: `Welcome back, Administrator ${response.data.user.firstName}!`,
				});

				// Redirect to admin dashboard after successful login
				setTimeout(() => {
					navigate('/admin', { replace: true });
				}, 1000);
			}

		} catch (error) {
			console.error('Admin login error:', error);

			if (error instanceof ApiError) {
				if (error.status === 401) {
					toast({
						title: "Invalid Credentials",
						description: "The email or password you entered is incorrect. Please try again.",
						variant: "destructive",
					});
				} else if (error.errors && error.errors.length > 0) {
					// Show field-specific errors
					error.errors.forEach(err => {
						toast({
							title: "Login Error",
							description: err,
							variant: "destructive",
						});
					});
				} else {
					toast({
						title: "Login Failed",
						description: error.message,
						variant: "destructive",
					});
				}
			} else {
				toast({
					title: "Network Error",
					description: "Failed to connect to server. Please check your internet connection and try again.",
					variant: "destructive",
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-950/20 dark:to-blue-950/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-md mx-auto">
					<Card className="shadow-xl border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
						<CardHeader className="text-center pb-8">
							<div className="flex justify-center mb-6">
								<div className="bg-gradient-to-br from-red-500 to-blue-600 p-4 rounded-full shadow-lg">
									<Shield className="h-8 w-8 text-white" />
								</div>
							</div>
							<CardTitle className="text-2xl font-bold bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
								Administrator Portal
							</CardTitle>
							<CardDescription className="text-base">
								Secure access for BloodConnect administrators
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="email" className="text-sm font-medium">
										Admin Email
									</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
										<Input
											id="email"
											type="email"
											placeholder="admin@bloodconnect.com"
											value={formData.email}
											onChange={(e) => handleInputChange('email', e.target.value)}
											className={`pl-10 ${fieldErrors.email ? 'border-destructive' : ''}`}
											disabled={isSubmitting}
											autoComplete="email"
										/>
									</div>
									{fieldErrors.email && (
										<p className="text-sm text-destructive">{fieldErrors.email}</p>
									)}
								</div>

								<div className="space-y-2">
									<Label htmlFor="password" className="text-sm font-medium">
										Admin Password
									</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
										<Input
											id="password"
											type={showPassword ? "text" : "password"}
											placeholder="Enter admin password"
											value={formData.password}
											onChange={(e) => handleInputChange('password', e.target.value)}
											className={`pl-10 pr-10 ${fieldErrors.password ? 'border-destructive' : ''}`}
											disabled={isSubmitting}
											autoComplete="current-password"
										/>
										<button
											type="button"
											onClick={() => setShowPassword(!showPassword)}
											className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
											disabled={isSubmitting}
										>
											{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
										</button>
									</div>
									{fieldErrors.password && (
										<p className="text-sm text-destructive">{fieldErrors.password}</p>
									)}
								</div>

								<div className="flex items-center space-x-2">
									<Checkbox
										id="rememberMe"
										checked={formData.rememberMe}
										onCheckedChange={(checked) => handleInputChange('rememberMe', !!checked)}
										disabled={isSubmitting}
									/>
									<Label
										htmlFor="rememberMe"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										Keep me signed in
									</Label>
								</div>

								<Button
									type="submit"
									className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white shadow-lg"
									disabled={isSubmitting}
								>
									{isSubmitting ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Authenticating...
										</>
									) : (
										<>
											<UserCheck className="mr-2 h-4 w-4" />
											Sign In as Admin
										</>
									)}
								</Button>
							</form>

							<div className="mt-6 pt-6 border-t border-border/50">
								<div className="text-center space-y-2">
									<p className="text-sm text-muted-foreground">
										Not an administrator?
									</p>
									<Link
										to="/login"
										className="text-sm text-primary hover:underline font-medium"
									>
										Sign in to regular account
									</Link>
								</div>

								<div className="mt-4 text-center">
									<Link
										to="/"
										className="text-sm text-muted-foreground hover:text-foreground"
									>
										← Back to home
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Security Notice */}
					<div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
						<div className="flex items-start space-x-3">
							<Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
							<div className="text-sm">
								<p className="font-medium text-amber-800 dark:text-amber-200">
									Security Notice
								</p>
								<p className="text-amber-700 dark:text-amber-300 mt-1">
									This is a secure administrator portal. All login attempts are monitored and logged.
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default AdminLogin;
