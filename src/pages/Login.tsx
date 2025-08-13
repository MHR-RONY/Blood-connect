import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Loader2, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { authApi, ApiError } from "@/services/api";
import Header from "@/components/Header";
import BloodDropIcon from "@/components/BloodDropIcon";

const Login = () => {
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

	// Get the page user was trying to access (we'll redirect to index instead)
	const from = '/';

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

			// Attempt login
			const response = await authApi.signIn(
				formData.email.toLowerCase().trim(),
				formData.password
			);

			if (response.success && response.data) {
				// Login successful
				login(response.data.token, response.data.user);

				toast({
					title: "Login Successful! 🎉",
					description: `Welcome back, ${response.data.user.firstName}!`,
				});

				// Redirect to index page after successful login
				setTimeout(() => {
					navigate('/', { replace: true });
				}, 1000);
			}

		} catch (error) {
			console.error('Login error:', error);

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
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-md mx-auto">
					<Card className="shadow-lg border-border/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-primary/10 p-3 rounded-full">
									<BloodDropIcon size="lg" />
								</div>
							</div>
							<CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
							<CardDescription className="text-base">
								Sign in to your BloodConnect account
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="email">Email Address</Label>
									<div className="relative">
										<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="email"
											type="email"
											className="pl-10"
											placeholder="Enter your email"
											value={formData.email}
											onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="password">Password</Label>
									<div className="relative">
										<Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
										<Input
											id="password"
											type={showPassword ? "text" : "password"}
											className="pl-10 pr-10"
											placeholder="Enter your password"
											value={formData.password}
											onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
											required
										/>
										<Button
											type="button"
											variant="ghost"
											size="sm"
											className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
											onClick={() => setShowPassword(!showPassword)}
										>
											{showPassword ? (
												<EyeOff className="h-4 w-4 text-muted-foreground" />
											) : (
												<Eye className="h-4 w-4 text-muted-foreground" />
											)}
										</Button>
									</div>
								</div>

								<div className="flex items-center justify-between">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="rememberMe"
											checked={formData.rememberMe}
											onCheckedChange={(checked) => setFormData(prev => ({ ...prev, rememberMe: checked as boolean }))}
										/>
										<Label htmlFor="rememberMe" className="text-sm">
											Remember me
										</Label>
									</div>
									<Link
										to="/forgot-password"
										className="text-sm text-primary hover:underline"
									>
										Forgot password?
									</Link>
								</div>

								<Button type="submit" className="w-full" size="lg">
									Sign In
								</Button>

								<div className="text-center text-sm text-muted-foreground">
									Don't have an account?{" "}
									<Link to="/signup" className="text-primary hover:underline font-medium">
										Sign up here
									</Link>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Login;