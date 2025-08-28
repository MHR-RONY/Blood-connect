import { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowLeft, Download, Share2 } from 'lucide-react';
import BloodDropIcon from '@/components/BloodDropIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import paymentAPI from '@/services/paymentAPI';
import { useToast } from '@/hooks/use-toast';

interface PaymentDetails {
	transactionId: string;
	amount: number;
	donorName: string;
	purpose: string;
	message?: string;
	status: string;
	createdAt: string;
}

const PaymentSuccess = () => {
	const [searchParams] = useSearchParams();
	const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
	const [loading, setLoading] = useState(true);
	const [countdown, setCountdown] = useState(5);
	const navigate = useNavigate();
	const { toast } = useToast();

	const transactionId = searchParams.get('tran_id');
	const validationId = searchParams.get('val_id');
	const amount = searchParams.get('amount');
	const bankTranId = searchParams.get('bank_tran_id');

	useEffect(() => {
		const fetchPaymentDetails = async () => {
			if (transactionId) {
				try {
					const response = await paymentAPI.getPaymentStatus(transactionId);
					setPaymentDetails(response.data);

					// Show success toast
					toast({
						title: "Payment Successful!",
						description: `Your donation of ৳${amount} has been processed successfully.`,
					});

					// Auto redirect to dashboard after 5 seconds with countdown
					const timer = setInterval(() => {
						setCountdown((prev) => {
							if (prev <= 1) {
								clearInterval(timer);
								navigate('/dashboard', { state: { activeTab: 'payments' } });
								return 0;
							}
							return prev - 1;
						});
					}, 1000);

					return () => clearInterval(timer);

				} catch (error) {
					console.error('Error fetching payment details:', error);
					toast({
						title: "Error",
						description: "Unable to fetch payment details. Redirecting to dashboard...",
						variant: "destructive",
					});

					// Redirect to dashboard even if there's an error
					setTimeout(() => {
						navigate('/dashboard', { state: { activeTab: 'payments' } });
					}, 3000);
				} finally {
					setLoading(false);
				}
			} else {
				// No transaction ID, redirect to dashboard immediately
				navigate('/dashboard', { state: { activeTab: 'payments' } });
			}
		};

		fetchPaymentDetails();
	}, [transactionId, navigate, toast, amount]);

	const handleGoToDashboard = () => {
		navigate('/dashboard', { state: { activeTab: 'payments' } });
	};

	const handleDownloadReceipt = () => {
		// Implement receipt download functionality
		console.log('Download receipt for transaction:', transactionId);
	};

	const handleShareDonation = () => {
		if (navigator.share) {
			navigator.share({
				title: 'Blood Connect Donation',
				text: `I just made a donation to Blood Connect! Join me in saving lives.`,
				url: window.location.origin,
			});
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-medical/20">
				<Header />
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-2xl mx-auto">
						<Card className="text-center">
							<CardContent className="pt-6">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
								<p>Verifying payment...</p>
							</CardContent>
						</Card>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					{/* Success Message */}
					<Card className="text-center border-green-200 bg-green-50/50 mb-6">
						<CardContent className="pt-6">
							<div className="flex justify-center mb-4">
								<div className="bg-green-100 p-3 rounded-full">
									<CheckCircle className="h-12 w-12 text-green-600" />
								</div>
							</div>
							<h1 className="text-2xl font-bold text-green-800 mb-2">
								Payment Successful!
							</h1>
							<p className="text-green-700 mb-4">
								Thank you for your generous donation. Your contribution will help save lives.
							</p>
							{countdown > 0 && (
								<p className="text-sm text-green-600">
									Redirecting to your dashboard in {countdown} seconds...
								</p>
							)}
						</CardContent>
					</Card>

					{/* Payment Details */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BloodDropIcon className="h-5 w-5" />
								Donation Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Transaction ID</p>
									<p className="font-mono font-medium">{transactionId}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Amount</p>
									<p className="font-bold text-lg">৳{amount?.toLocaleString()}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Status</p>
									<Badge variant="default" className="bg-green-100 text-green-800">
										Completed
									</Badge>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Date</p>
									<p>{new Date().toLocaleDateString()}</p>
								</div>
							</div>

							{paymentDetails && (
								<div className="border-t pt-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">Donor Name</p>
											<p>{paymentDetails.donorName}</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">Purpose</p>
											<p className="capitalize">{paymentDetails.purpose}</p>
										</div>
									</div>
									{paymentDetails.message && (
										<div className="mt-4">
											<p className="text-sm text-muted-foreground">Message</p>
											<p className="italic">{paymentDetails.message}</p>
										</div>
									)}
								</div>
							)}
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
						<Button onClick={handleDownloadReceipt} variant="outline" className="w-full">
							<Download className="mr-2 h-4 w-4" />
							Download Receipt
						</Button>
						<Button onClick={handleShareDonation} variant="outline" className="w-full">
							<Share2 className="mr-2 h-4 w-4" />
							Share Donation
						</Button>
						<Button onClick={handleGoToDashboard} className="w-full">
							Go to Dashboard Now
						</Button>
					</div>

					{/* Navigation */}
					<div className="text-center">
						<Button asChild variant="outline">
							<Link to="/" className="inline-flex items-center">
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Home
							</Link>
						</Button>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default PaymentSuccess;
