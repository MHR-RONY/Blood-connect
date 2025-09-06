import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, RotateCcw, CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authApi, ApiError, User } from "@/services/api";

interface OTPVerificationProps {
	email: string;
	onVerificationSuccess: ((token: string, user: User) => void) | ((otp: string) => void);
	onBackToSignup: () => void;
	isLoading: boolean;
	setIsLoading: (loading: boolean) => void;
	isPasswordReset?: boolean;
}

const OTPVerification = ({
	email,
	onVerificationSuccess,
	onBackToSignup,
	isLoading,
	setIsLoading,
	isPasswordReset = false
}: OTPVerificationProps) => {
	const [otp, setOtp] = useState(['', '', '', '', '', '']);
	const [isResending, setIsResending] = useState(false);
	const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
	const { toast } = useToast();
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	// Timer for OTP expiration
	useEffect(() => {
		if (timeLeft > 0) {
			const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
			return () => clearTimeout(timer);
		}
	}, [timeLeft]);

	const formatTime = (seconds: number) => {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
	};

	const handleOtpChange = (index: number, value: string) => {
		if (value.length > 1) return; // Prevent multiple characters
		if (!/^\d*$/.test(value)) return; // Only allow digits

		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);

		// Auto-focus next input
		if (value && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}

		// Auto-submit when all 6 digits are entered
		if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
			handleVerifyOtp(newOtp.join(''));
		}
	};

	const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Backspace' && !otp[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent) => {
		e.preventDefault();
		const pastedData = e.clipboardData.getData('text').replace(/\D/g, '');

		if (pastedData.length === 6) {
			const newOtp = pastedData.split('');
			setOtp(newOtp);
			// Auto-submit when pasted
			handleVerifyOtp(pastedData);
		}
	};

	const handleVerifyOtp = async (otpCode?: string) => {
		const codeToVerify = otpCode || otp.join('');

		if (codeToVerify.length !== 6) {
			toast({
				title: "Invalid OTP",
				description: "Please enter all 6 digits",
				variant: "destructive",
			});
			return;
		}

		setIsLoading(true);

		try {
			if (isPasswordReset) {
				// For password reset, just pass the OTP back to parent
				(onVerificationSuccess as (otp: string) => void)(codeToVerify);
			} else {
				// For email verification during signup
				const response = await authApi.verifyOTP(email, codeToVerify);

				if (response.success && response.data) {
					toast({
						title: "Email Verified Successfully! 🎉",
						description: "Welcome to BloodConnect! Your account is now active.",
					});

					(onVerificationSuccess as (token: string, user: User) => void)(response.data.token, response.data.user);
				} else {
					toast({
						title: "Verification Failed",
						description: response.message || "Invalid OTP code. Please try again.",
						variant: "destructive",
					});

					// Clear OTP on failure
					setOtp(['', '', '', '', '', '']);
					inputRefs.current[0]?.focus();
				}
			}
		} catch (error) {
			const errorMessage = error instanceof ApiError
				? error.message
				: "Failed to verify OTP. Please try again.";

			toast({
				title: "Verification Error",
				description: errorMessage,
				variant: "destructive",
			});

			// Clear OTP on error
			setOtp(['', '', '', '', '', '']);
			inputRefs.current[0]?.focus();
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendOtp = async () => {
		setIsResending(true);

		try {
			const response = await authApi.resendOTP(email);

			if (response.success) {
				toast({
					title: "OTP Resent Successfully",
					description: "A new verification code has been sent to your email.",
				});

				// Reset timer
				setTimeLeft(600);

				// Clear current OTP
				setOtp(['', '', '', '', '', '']);
				inputRefs.current[0]?.focus();
			} else {
				toast({
					title: "Resend Failed",
					description: response.message || "Failed to resend OTP. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error) {
			const errorMessage = error instanceof ApiError
				? error.message
				: "Failed to resend verification code. Please try again.";

			toast({
				title: "Resend Error",
				description: errorMessage,
				variant: "destructive",
			});
		} finally {
			setIsResending(false);
		}
	};

	return (
		<Card className="w-full max-w-md mx-auto">
			<CardHeader className="text-center space-y-4">
				<div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
					<Mail className="h-8 w-8 text-red-600" />
				</div>
				<div>
					<CardTitle className="text-2xl font-bold">Verify Your Email</CardTitle>
					<CardDescription className="text-base">
						We've sent a 6-digit verification code to
						<br />
						<span className="font-semibold text-gray-900">{email}</span>
					</CardDescription>
				</div>
			</CardHeader>

			<CardContent className="space-y-6">
				{/* OTP Input */}
				<div className="space-y-4">
					<Label className="text-sm font-medium text-center block">
						Enter Verification Code
					</Label>
					<div className="flex justify-center space-x-2">
						{otp.map((digit, index) => (
							<Input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								inputMode="numeric"
								maxLength={1}
								value={digit}
								onChange={(e) => handleOtpChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								onPaste={index === 0 ? handlePaste : undefined}
								className="w-12 h-12 text-center text-lg font-semibold border-2 focus:border-red-500"
								disabled={isLoading}
							/>
						))}
					</div>
				</div>

				{/* Timer */}
				<div className="text-center">
					<p className="text-sm text-gray-600">
						Code expires in: <span className="font-semibold text-red-600">{formatTime(timeLeft)}</span>
					</p>
				</div>

				{/* Verify Button */}
				<Button
					onClick={() => handleVerifyOtp()}
					disabled={otp.some(digit => !digit) || isLoading}
					className="w-full bg-red-600 hover:bg-red-700"
				>
					{isLoading ? (
						<>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Verifying...
						</>
					) : (
						<>
							<CheckCircle className="mr-2 h-4 w-4" />
							Verify Email
						</>
					)}
				</Button>

				{/* Resend OTP */}
				<div className="text-center space-y-2">
					<p className="text-sm text-gray-600">Didn't receive the code?</p>
					<Button
						variant="outline"
						onClick={handleResendOtp}
						disabled={isResending || timeLeft > 540} // Can resend after 1 minute
						className="text-red-600 border-red-200 hover:bg-red-50"
					>
						{isResending ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Sending...
							</>
						) : (
							<>
								<RotateCcw className="mr-2 h-4 w-4" />
								Resend Code
							</>
						)}
					</Button>
				</div>

				{/* Back to Signup */}
				<div className="text-center">
					<Button
						variant="ghost"
						onClick={onBackToSignup}
						className="text-gray-600 hover:text-gray-800"
						disabled={isLoading}
					>
						← Back to Sign Up
					</Button>
				</div>
			</CardContent>
		</Card>
	);
};

export default OTPVerification;
