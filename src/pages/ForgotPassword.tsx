import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, ArrowLeft, Loader2, AlertCircle, Check, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi, ApiError } from "@/services/api";
import Header from "@/components/Header";
import BloodDropIcon from "@/components/BloodDropIcon";
import BloodDropLoader from "@/components/BloodDropLoader";
import OTPVerification from "@/components/OTPVerification";

type Step = 'email' | 'otp' | 'newPassword' | 'success';

const ForgotPassword = () => {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [currentStep, setCurrentStep] = useState<Step>('email');
	const [email, setEmail] = useState('');
	const [resetToken, setResetToken] = useState('');
	const [newPassword, setNewPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [emailError, setEmailError] = useState('');

	const handleEmailSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setEmailError('');

		try {
			// Basic email validation
			if (!email.trim()) {
				setEmailError('Email is required');
				setIsSubmitting(false);
				return;
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				setEmailError('Please enter a valid email address');
				setIsSubmitting(false);
				return;
			}

			const response = await authApi.forgotPassword(email.toLowerCase().trim());

			if (response.success) {
				toast({
					title: "Reset Code Sent! 📧",
					description: "We've sent a password reset code to your email. Please check your inbox.",
				});
				setCurrentStep('otp');
			}
		} catch (error) {
			console.error('Forgot password error:', error);
			
			if (error instanceof ApiError) {
				toast({
					title: "Error",
					description: error.message,
					variant: "destructive",
				});
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

	const handleOTPVerification = async (otp: string) => {
		setIsSubmitting(true);

		try {
			const response = await authApi.verifyResetOTP(email, otp);

			if (response.success && response.data) {
				setResetToken(response.data.resetToken);
				toast({
					title: "Code Verified! ✅",
					description: "Please enter your new password below.",
				});
				setCurrentStep('newPassword');
			}
		} catch (error) {
			console.error('OTP verification error:', error);
			
			if (error instanceof ApiError) {
				toast({
					title: "Verification Failed",
					description: error.message,
					variant: "destructive",
				});
			} else {
				toast({
					title: "Network Error",
					description: "Failed to verify code. Please try again.",
					variant: "destructive",
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handlePasswordReset = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			// Validation
			if (!newPassword.trim()) {
				toast({
					title: "Validation Error",
					description: "Please enter a new password",
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			if (newPassword.length < 6) {
				toast({
					title: "Validation Error",
					description: "Password must be at least 6 characters long",
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
				toast({
					title: "Validation Error",
					description: "Password must contain at least one uppercase letter, one lowercase letter, and one number",
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			if (newPassword !== confirmPassword) {
				toast({
					title: "Validation Error",
					description: "Passwords do not match",
					variant: "destructive",
				});
				setIsSubmitting(false);
				return;
			}

			const response = await authApi.resetPassword(resetToken, newPassword);

			if (response.success) {
				toast({
					title: "Password Reset Successfully! 🎉",
					description: "Your password has been changed. You can now log in with your new password.",
				});
				setCurrentStep('success');
			}
		} catch (error) {
			console.error('Password reset error:', error);
			
			if (error instanceof ApiError) {
				toast({
					title: "Reset Failed",
					description: error.message,
					variant: "destructive",
				});
			} else {
				toast({
					title: "Network Error",
					description: "Failed to reset password. Please try again.",
					variant: "destructive",
				});
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const renderEmailStep = () => (
		<Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
			<CardHeader className="text-center pb-8">
				<div className="flex justify-center mb-4">
					<BloodDropIcon className="w-16 h-16 text-red-600" />
				</div>
				<CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
					Forgot Password
				</CardTitle>
				<CardDescription className="text-lg text-gray-600 dark:text-gray-300">
					Enter your email address to reset your password
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handleEmailSubmit} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
							<Mail className="w-4 h-4" />
							Email Address
						</Label>
						<div className="relative">
							<Input
								id="email"
								type="email"
								placeholder="Enter your registered email"
								value={email}
								onChange={(e) => {
									setEmail(e.target.value);
									setEmailError('');
								}}
								className={emailError ? 'border-red-500' : ''}
								required
							/>
							{email && !emailError && (
								<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
									<Check className="w-4 h-4 text-green-500" />
								</div>
							)}
							{emailError && (
								<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
									<AlertCircle className="w-4 h-4 text-red-500" />
								</div>
							)}
						</div>
						{emailError && (
							<div className="flex items-center gap-1 text-red-500 text-sm">
								<AlertCircle className="w-3 h-3" />
								<span>{emailError}</span>
							</div>
						)}
					</div>

					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<BloodDropLoader size="sm" text="Sending Reset Code..." />
						) : (
							'Send Reset Code'
						)}
					</Button>

					<div className="text-center">
						<Link to="/login" className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 inline-flex items-center gap-1">
							<ArrowLeft className="w-4 h-4" />
							Back to Login
						</Link>
					</div>
				</form>
			</CardContent>
		</Card>
	);

	const renderOTPStep = () => (
		<Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
			<CardHeader className="text-center pb-8">
				<div className="flex justify-center mb-4">
					<BloodDropIcon className="w-16 h-16 text-red-600" />
				</div>
				<CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
					Enter Reset Code
				</CardTitle>
				<CardDescription className="text-lg text-gray-600 dark:text-gray-300">
					We've sent a 6-digit code to {email}
				</CardDescription>
			</CardHeader>

			<CardContent>
				<OTPVerification
					email={email}
					onVerificationSuccess={(otp) => handleOTPVerification(otp)}
					onBackToSignup={() => setCurrentStep('email')}
					isLoading={isSubmitting}
					setIsLoading={setIsSubmitting}
					isPasswordReset={true}
				/>
			</CardContent>
		</Card>
	);

	const renderPasswordStep = () => (
		<Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
			<CardHeader className="text-center pb-8">
				<div className="flex justify-center mb-4">
					<BloodDropIcon className="w-16 h-16 text-red-600" />
				</div>
				<CardTitle className="text-3xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent">
					Set New Password
				</CardTitle>
				<CardDescription className="text-lg text-gray-600 dark:text-gray-300">
					Choose a strong password for your account
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form onSubmit={handlePasswordReset} className="space-y-6">
					<div className="space-y-2">
						<Label htmlFor="newPassword">New Password</Label>
						<div className="relative">
							<Input
								id="newPassword"
								type={showNewPassword ? "text" : "password"}
								placeholder="Enter new password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								required
								className="pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowNewPassword(!showNewPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="confirmPassword">Confirm New Password</Label>
						<div className="relative">
							<Input
								id="confirmPassword"
								type={showConfirmPassword ? "text" : "password"}
								placeholder="Confirm new password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								required
								className="pr-10"
							/>
							<button
								type="button"
								onClick={() => setShowConfirmPassword(!showConfirmPassword)}
								className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
							>
								{showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
							</button>
						</div>
					</div>

					<div className="text-xs text-gray-600 dark:text-gray-300 space-y-1">
						<p>Password requirements:</p>
						<ul className="list-disc list-inside space-y-1">
							<li>At least 6 characters long</li>
							<li>Contains uppercase and lowercase letters</li>
							<li>Contains at least one number</li>
						</ul>
					</div>

					<Button
						type="submit"
						className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<BloodDropLoader size="sm" text="Resetting Password..." />
						) : (
							'Reset Password'
						)}
					</Button>
				</form>
			</CardContent>
		</Card>
	);

	const renderSuccessStep = () => (
		<Card className="shadow-2xl border-0 backdrop-blur-sm bg-white/95 dark:bg-gray-950/95">
			<CardHeader className="text-center pb-8">
				<div className="flex justify-center mb-4">
					<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
						<Check className="w-8 h-8 text-green-600" />
					</div>
				</div>
				<CardTitle className="text-3xl font-bold text-green-600">
					Password Reset Successfully!
				</CardTitle>
				<CardDescription className="text-lg text-gray-600 dark:text-gray-300">
					Your password has been changed successfully
				</CardDescription>
			</CardHeader>

			<CardContent className="text-center">
				<p className="text-gray-600 dark:text-gray-300 mb-6">
					You can now log in to your account with your new password.
				</p>

				<Button
					onClick={() => navigate('/login')}
					className="w-full bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white py-3 text-lg font-semibold"
				>
					Go to Login
				</Button>
			</CardContent>
		</Card>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 'email':
				return renderEmailStep();
			case 'otp':
				return renderOTPStep();
			case 'newPassword':
				return renderPasswordStep();
			case 'success':
				return renderSuccessStep();
			default:
				return renderEmailStep();
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-950/20 dark:to-pink-950/20 flex flex-col">
			<Header />

			<div className="flex-1 flex items-center justify-center p-6">
				<div className="w-full max-w-md">
					{renderCurrentStep()}
				</div>
			</div>
		</div>
	);
};

export default ForgotPassword;
