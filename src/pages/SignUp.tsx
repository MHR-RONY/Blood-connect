import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, Phone, Calendar, UserCheck, Loader2, AlertCircle, Check, Eye, EyeOff, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";
import Header from "@/components/Header";
import BloodDropIcon from "@/components/BloodDropIcon";
import BloodDropLoader from "@/components/BloodDropLoader";
import OTPVerification from "@/components/OTPVerification";
import { validateSignUpForm, formatPhoneNumber, sanitizeInput } from "@/utils/validation";
import { authApi, tokenStorage, ApiError, User } from "@/services/api";
import type { SignUpFormData } from "@/utils/validation";

const SignUp = () => {
	const navigate = useNavigate();
	const { toast } = useToast();
	const { login } = useAuth();

	const [formData, setFormData] = useState<SignUpFormData>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
		dateOfBirth: "",
		gender: "",
		bloodType: "",
		weight: "",
		location: { city: "", area: "" },
		agreedToTerms: false,
		isAvailableDonor: true
	});

	const [isSubmitting, setIsSubmitting] = useState(false);
	const [emailChecking, setEmailChecking] = useState(false);
	const [emailExists, setEmailExists] = useState(false);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	// OTP verification state
	const [showOTPVerification, setShowOTPVerification] = useState(false);
	const [userEmail, setUserEmail] = useState("");

	// Real-time email validation
	useEffect(() => {
		const checkEmail = async () => {
			if (!formData.email || formData.email.length < 5) {
				setEmailExists(false);
				return;
			}

			// Basic email format validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(formData.email)) {
				return;
			}

			setEmailChecking(true);
			try {
				const response = await authApi.checkEmailExists(formData.email);
				setEmailExists(response.data?.exists || false);
			} catch (error) {
				console.error('Email check failed:', error);
			} finally {
				setEmailChecking(false);
			}
		};

		const debounceTimer = setTimeout(checkEmail, 500);
		return () => clearTimeout(debounceTimer);
	}, [formData.email]);

	const validateField = (name: string, value: string | boolean) => {
		const errors: Record<string, string> = {};

		switch (name) {
			case 'firstName':
				if (!String(value).trim()) errors.firstName = 'First name is required';
				else if (String(value).length < 2) errors.firstName = 'First name must be at least 2 characters';
				break;
			case 'lastName':
				if (!String(value).trim()) errors.lastName = 'Last name is required';
				else if (String(value).length < 2) errors.lastName = 'Last name must be at least 2 characters';
				break;
			case 'email':
				if (!String(value).trim()) errors.email = 'Email is required';
				else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value))) errors.email = 'Invalid email format';
				else if (emailExists) errors.email = 'Email already registered';
				break;
			case 'phone':
				if (!String(value).trim()) errors.phone = 'Phone number is required';
				else if (!/^01[3-9]\d{8}$/.test(String(value).replace(/[^\d]/g, ''))) {
					errors.phone = 'Enter valid Bangladeshi phone number (01XXXXXXXXX)';
				}
				break;
			case 'weight': {
				const weight = parseFloat(String(value));
				if (!String(value).trim()) errors.weight = 'Weight is required';
				else if (isNaN(weight) || weight < 45 || weight > 200) {
					errors.weight = 'Weight must be between 45kg and 200kg';
				}
				break;
			}
		}

		setFieldErrors(prev => ({
			...prev,
			...errors,
			...(Object.keys(errors).length === 0 && { [name]: '' })
		}));
	};

	const handleInputChange = (name: string, value: string | boolean) => {
		let processedValue: string | boolean = value;

		// Sanitize text inputs
		if (typeof value === 'string') {
			processedValue = sanitizeInput(value);
		}

		setFormData(prev => ({ ...prev, [name]: processedValue }));

		// Real-time validation for specific fields
		if (['firstName', 'lastName', 'email', 'phone', 'weight'].includes(name)) {
			setTimeout(() => validateField(name, processedValue), 300);
		}
	};

	const handleLocationChange = (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => {
		setFormData(prev => ({ ...prev, location }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Client-side validation
			const validation = validateSignUpForm(formData);

			if (!validation.isValid) {
				toast({
					title: "Validation Error",
					description: validation.errors[0],
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			if (emailExists) {
				toast({
					title: "Email Already Registered",
					description: "This email is already registered. Please use a different email or try logging in.",
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			// Ensure loading animation is visible for at least 1.5 seconds
			const startTime = Date.now();
			const minLoadingTime = 1500; // 1.5 seconds

			// Prepare data for API
			const apiData = {
				firstName: formData.firstName.trim(),
				lastName: formData.lastName.trim(),
				email: formData.email.toLowerCase().trim(),
				password: formData.password,
				phone: formatPhoneNumber(formData.phone),
				dateOfBirth: formData.dateOfBirth,
				gender: formData.gender,
				bloodType: formData.bloodType,
				weight: parseFloat(formData.weight),
				location: formData.location,
				isAvailableDonor: formData.isAvailableDonor,
			};

			// Submit to API
			const response = await authApi.signUp(apiData);

			// Debug logging
			console.log('Signup response:', response);
			console.log('Response data:', response.data);
			console.log('Has requiresVerification:', 'requiresVerification' in (response.data || {}));

			if (response.success && response.data) {
				// Check if user needs to verify email (new OTP flow)
				if ('requiresVerification' in response.data && response.data.requiresVerification) {
					// Success notification for registration
					toast({
						title: "Registration Successful! 📧",
						description: `Hi ${formData.firstName}! We've sent a verification code to ${response.data.email}. Please check your email.`,
					});

					// Calculate remaining time to show loading animation
					const elapsedTime = Date.now() - startTime;
					const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

					// Store email for OTP verification and show OTP screen
					setTimeout(() => {
						const otpData = response.data as { email: string; userId: string; requiresVerification: true };
						setUserEmail(otpData.email);
						setShowOTPVerification(true);
						setIsSubmitting(false);
					}, remainingTime);
				} else {
					// Old flow - direct login (for backward compatibility)
					const userData = response.data as { user: User; token: string };
					toast({
						title: "Account Created Successfully! 🎉",
						description: `Welcome to Blood Connect, ${formData.firstName}! Your account has been created and you're now logged in.`,
					});

					// Store token and login user - this will trigger auth state change
					login(userData.token, userData.user);

					// Calculate remaining time to show loading animation
					const elapsedTime = Date.now() - startTime;
					const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

					// Ensure loading is visible for at least 1.5 seconds
					setTimeout(() => {
						setIsSubmitting(false);
						navigate('/', { replace: true });
					}, remainingTime);
				}
			} else {
				// Handle case where response doesn't have expected structure
				const elapsedTime = Date.now() - startTime;
				const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

				setTimeout(() => {
					setIsSubmitting(false);
				}, remainingTime);

				toast({
					title: "Registration Error",
					description: "Account creation failed. Please try again.",
					variant: "destructive",
				});
			}

		} catch (error) {
			console.error('Signup error:', error);

			// Ensure loading animation was visible for at least 1.5 seconds even on error
			const elapsedTime = Date.now() - (Date.now() - 1500);
			const remainingTime = Math.max(0, 1500 - elapsedTime);

			setTimeout(() => {
				setIsSubmitting(false);
			}, remainingTime);

			if (error instanceof ApiError) {
				if (error.errors && error.errors.length > 0) {
					// Show field-specific errors
					error.errors.forEach(err => {
						toast({
							title: "Validation Error",
							description: err,
							variant: "destructive",
						});
					});
				} else {
					toast({
						title: "Registration Failed",
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
		}
	};

	const ErrorIndicator = ({ error }: { error?: string }) => {
		if (!error) return null;
		return (
			<div className="flex items-center gap-1 text-red-500 text-sm mt-1">
				<AlertCircle className="w-3 h-3" />
				<span>{error}</span>
			</div>
		);
	};

	const ValidationIcon = ({ isValidating, isValid, hasError }: {
		isValidating: boolean;
		isValid: boolean;
		hasError: boolean;
	}) => {
		if (isValidating) return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
		if (hasError) return <AlertCircle className="w-4 h-4 text-red-500" />;
		if (isValid) return <Check className="w-4 h-4 text-green-500" />;
		return null;
	};

	// Show OTP verification screen if needed
	if (showOTPVerification && userEmail) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 flex flex-col">
				<Header />

				<div className="flex-1 flex items-center justify-center p-6">
					<div className="w-full max-w-md">
						<OTPVerification
							email={userEmail}
							onVerificationSuccess={(token, user) => {
								// Store token and login user
								login(token, user);

								toast({
									title: "Email Verified Successfully! 🎉",
									description: `Welcome to Blood Connect, ${user.firstName}! Your account has been verified and you're now logged in.`,
								});

								// Navigate to dashboard
								navigate('/', { replace: true });
							}}
							onBackToSignup={() => {
								setShowOTPVerification(false);
								setUserEmail("");
							}}
							isLoading={isSubmitting}
							setIsLoading={setIsSubmitting}
						/>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 flex flex-col">
			<Header />

			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-4xl">
					<Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
						<CardHeader className="text-center pb-8">
							<div className="flex justify-center mb-4">
								<BloodDropIcon className="w-16 h-16 text-red-600" />
							</div>
							<CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
								Join Blood Connect
							</CardTitle>
							<CardDescription className="text-lg text-gray-600 dark:text-gray-300">
								Create your account to start saving lives
							</CardDescription>
						</CardHeader>

						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Personal Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="firstName" className="text-sm font-medium flex items-center gap-2">
											<UserIcon className="w-4 h-4" />
											First Name *
										</Label>
										<div className="relative">
											<Input
												id="firstName"
												type="text"
												placeholder="Enter your first name"
												value={formData.firstName}
												onChange={(e) => handleInputChange('firstName', e.target.value)}
												className={`${fieldErrors.firstName ? 'border-red-500' : ''}`}
												required
											/>
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												<ValidationIcon
													isValidating={false}
													isValid={!!formData.firstName && !fieldErrors.firstName}
													hasError={!!fieldErrors.firstName}
												/>
											</div>
										</div>
										<ErrorIndicator error={fieldErrors.firstName} />
									</div>

									<div className="space-y-2">
										<Label htmlFor="lastName" className="text-sm font-medium flex items-center gap-2">
											<UserIcon className="w-4 h-4" />
											Last Name *
										</Label>
										<div className="relative">
											<Input
												id="lastName"
												type="text"
												placeholder="Enter your last name"
												value={formData.lastName}
												onChange={(e) => handleInputChange('lastName', e.target.value)}
												className={`${fieldErrors.lastName ? 'border-red-500' : ''}`}
												required
											/>
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												<ValidationIcon
													isValidating={false}
													isValid={!!formData.lastName && !fieldErrors.lastName}
													hasError={!!fieldErrors.lastName}
												/>
											</div>
										</div>
										<ErrorIndicator error={fieldErrors.lastName} />
									</div>
								</div>

								{/* Contact Information */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
											<Mail className="w-4 h-4" />
											Email Address *
										</Label>
										<div className="relative">
											<Input
												id="email"
												type="email"
												placeholder="Enter your email"
												value={formData.email}
												onChange={(e) => handleInputChange('email', e.target.value)}
												className={`${fieldErrors.email || emailExists ? 'border-red-500' : ''}`}
												required
											/>
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												<ValidationIcon
													isValidating={emailChecking}
													isValid={!!formData.email && !fieldErrors.email && !emailExists}
													hasError={!!fieldErrors.email || emailExists}
												/>
											</div>
										</div>
										<ErrorIndicator error={fieldErrors.email || (emailExists ? 'Email already registered' : '')} />
									</div>

									<div className="space-y-2">
										<Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
											<Phone className="w-4 h-4" />
											Phone Number *
										</Label>
										<div className="relative">
											<Input
												id="phone"
												type="tel"
												placeholder="01XXXXXXXXX"
												value={formData.phone}
												onChange={(e) => handleInputChange('phone', e.target.value)}
												className={`${fieldErrors.phone ? 'border-red-500' : ''}`}
												required
											/>
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												<ValidationIcon
													isValidating={false}
													isValid={!!formData.phone && !fieldErrors.phone}
													hasError={!!fieldErrors.phone}
												/>
											</div>
										</div>
										<ErrorIndicator error={fieldErrors.phone} />
									</div>
								</div>

								{/* Password Fields */}
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-2">
										<Label htmlFor="password" className="text-sm font-medium flex items-center gap-2">
											<Lock className="w-4 h-4" />
											Password *
										</Label>
										<div className="relative">
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="Create a strong password"
												value={formData.password}
												onChange={(e) => handleInputChange('password', e.target.value)}
												className="pr-10"
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

									<div className="space-y-2">
										<Label htmlFor="confirmPassword" className="text-sm font-medium flex items-center gap-2">
											<Lock className="w-4 h-4" />
											Confirm Password *
										</Label>
										<div className="relative">
											<Input
												id="confirmPassword"
												type={showConfirmPassword ? "text" : "password"}
												placeholder="Confirm your password"
												value={formData.confirmPassword}
												onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
												className="pr-10"
												required
											/>
											<Button
												type="button"
												variant="ghost"
												size="sm"
												className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
											>
												{showConfirmPassword ? (
													<EyeOff className="h-4 w-4 text-muted-foreground" />
												) : (
													<Eye className="h-4 w-4 text-muted-foreground" />
												)}
											</Button>
										</div>
									</div>
								</div>

								{/* Personal Details */}
								<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
									<div className="space-y-2">
										<Label htmlFor="dateOfBirth" className="text-sm font-medium flex items-center gap-2">
											<Calendar className="w-4 h-4" />
											Date of Birth *
										</Label>
										<Input
											id="dateOfBirth"
											type="date"
											value={formData.dateOfBirth}
											onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
											max={new Date(Date.now() - 18 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="gender" className="text-sm font-medium flex items-center gap-2">
											<UserCheck className="w-4 h-4" />
											Gender *
										</Label>
										<Select
											value={formData.gender}
											onValueChange={(value) => handleInputChange('gender', value)}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="weight" className="text-sm font-medium">
											Weight (kg) *
										</Label>
										<div className="relative">
											<Input
												id="weight"
												type="number"
												placeholder="Weight in kg"
												value={formData.weight}
												onChange={(e) => handleInputChange('weight', e.target.value)}
												className={`${fieldErrors.weight ? 'border-red-500' : ''}`}
												min="45"
												max="200"
												required
											/>
											<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
												<ValidationIcon
													isValidating={false}
													isValid={!!formData.weight && !fieldErrors.weight}
													hasError={!!fieldErrors.weight}
												/>
											</div>
										</div>
										<ErrorIndicator error={fieldErrors.weight} />
									</div>
								</div>

								{/* Blood Type and Location */}
								<div className="space-y-6">
									<BloodTypeSelector
										selectedType={formData.bloodType}
										onSelect={(bloodType) => handleInputChange('bloodType', bloodType)}
									/>

									<LocationSelector
										onLocationChange={handleLocationChange}
									/>
								</div>

								{/* Donor Availability */}
								<div className="flex items-center space-x-2 p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
									<Checkbox
										id="isAvailableDonor"
										checked={formData.isAvailableDonor}
										onCheckedChange={(checked) => handleInputChange('isAvailableDonor', Boolean(checked))}
									/>
									<Label
										htmlFor="isAvailableDonor"
										className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										I am available to donate blood when needed
									</Label>
								</div>

								{/* Terms Agreement */}
								<div className="flex items-center space-x-2">
									<Checkbox
										id="agreedToTerms"
										checked={formData.agreedToTerms}
										onCheckedChange={(checked) => handleInputChange('agreedToTerms', Boolean(checked))}
										required
									/>
									<Label
										htmlFor="agreedToTerms"
										className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
									>
										I agree to the{' '}
										<Link to="/terms-of-service" className="text-red-600 hover:underline">
											Terms of Service
										</Link>
										{' '}and{' '}
										<Link to="/privacy-policy" className="text-red-600 hover:underline">
											Privacy Policy
										</Link>
									</Label>
								</div>

								{/* Submit Button */}
								<Button
									type="submit"
									className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
									disabled={isSubmitting || !formData.agreedToTerms || emailExists}
								>
									{isSubmitting ? (
										<BloodDropLoader size="sm" text="Creating Account..." />
									) : (
										'Create Account'
									)}
								</Button>

								{/* Login Link */}
								<div className="text-center">
									<span className="text-sm text-gray-600 dark:text-gray-300">
										Already have an account?{' '}
										<Link to="/login" className="text-red-600 hover:underline font-medium">
											Sign In
										</Link>
									</span>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default SignUp;