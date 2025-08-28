import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import BloodDropIcon from '@/components/BloodDropIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentCancelled = () => {
	const [searchParams] = useSearchParams();

	const transactionId = searchParams.get('tran_id');

	useEffect(() => {
		// Log the cancelled payment attempt for analytics
		console.log('Payment cancelled:', { transactionId });
	}, [transactionId]);

	const handleRetryPayment = () => {
		// Redirect back to donation page
		window.location.href = '/donation';
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					{/* Cancellation Message */}
					<Card className="text-center border-yellow-200 bg-yellow-50/50 mb-6">
						<CardContent className="pt-6">
							<div className="flex justify-center mb-4">
								<div className="bg-yellow-100 p-3 rounded-full">
									<AlertCircle className="h-12 w-12 text-yellow-600" />
								</div>
							</div>
							<h1 className="text-2xl font-bold text-yellow-800 mb-2">
								Payment Cancelled
							</h1>
							<p className="text-yellow-700">
								Your payment was cancelled. No amount has been charged.
							</p>
						</CardContent>
					</Card>

					{/* Your Donation Still Matters */}
					<Card className="mb-6">
						<CardContent className="pt-6 text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-primary/10 p-3 rounded-full">
									<BloodDropIcon className="h-8 w-8" />
								</div>
							</div>
							<h2 className="text-xl font-semibold mb-2">Your Donation Still Matters</h2>
							<p className="text-muted-foreground mb-4">
								Every donation, no matter the size, helps save lives. Consider trying again
								or explore other ways to support our blood donation initiatives.
							</p>

							<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
								<div className="text-center p-4 bg-background rounded-lg border">
									<div className="text-2xl font-bold text-primary">৳500</div>
									<div className="text-sm text-muted-foreground">Helps 1 patient</div>
								</div>
								<div className="text-center p-4 bg-background rounded-lg border">
									<div className="text-2xl font-bold text-primary">৳1,000</div>
									<div className="text-sm text-muted-foreground">Supports blood drive</div>
								</div>
								<div className="text-center p-4 bg-background rounded-lg border">
									<div className="text-2xl font-bold text-primary">৳2,500</div>
									<div className="text-sm text-muted-foreground">Funds equipment</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Alternative Ways to Help */}
					<Card className="mb-6">
						<CardContent className="pt-6">
							<h3 className="text-lg font-semibold mb-4">Other Ways to Help</h3>
							<div className="space-y-3">
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span>Donate blood at our nearest donation center</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span>Volunteer with our blood drive campaigns</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span>Spread awareness about blood donation importance</span>
								</div>
								<div className="flex items-center gap-3">
									<div className="w-2 h-2 bg-primary rounded-full"></div>
									<span>Register as a potential donor in our database</span>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<Button onClick={handleRetryPayment} className="w-full">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Donation Again
						</Button>
						<Button asChild variant="outline" className="w-full">
							<Link to="/donate-blood">
								Donate Blood Instead
							</Link>
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

export default PaymentCancelled;
