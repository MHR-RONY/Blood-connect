import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { XCircle, ArrowLeft, RefreshCw, HelpCircle } from 'lucide-react';
import BloodDropIcon from '@/components/BloodDropIcon';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const PaymentFailed = () => {
	const [searchParams] = useSearchParams();

	const transactionId = searchParams.get('tran_id');
	const error = searchParams.get('error');

	useEffect(() => {
		// Log the failed payment attempt for analytics
		console.log('Payment failed:', { transactionId, error });
	}, [transactionId, error]);

	const handleRetryPayment = () => {
		// Redirect back to donation page
		window.location.href = '/donation';
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					{/* Failure Message */}
					<Card className="text-center border-red-200 bg-red-50/50 mb-6">
						<CardContent className="pt-6">
							<div className="flex justify-center mb-4">
								<div className="bg-red-100 p-3 rounded-full">
									<XCircle className="h-12 w-12 text-red-600" />
								</div>
							</div>
							<h1 className="text-2xl font-bold text-red-800 mb-2">
								Payment Failed
							</h1>
							<p className="text-red-700">
								We're sorry, but your payment could not be processed. Please try again.
							</p>
						</CardContent>
					</Card>

					{/* Error Details */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<BloodDropIcon className="h-5 w-5" />
								Transaction Details
							</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-muted-foreground">Transaction ID</p>
									<p className="font-mono font-medium">{transactionId || 'N/A'}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Status</p>
									<p className="text-red-600 font-medium">Failed</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Date</p>
									<p>{new Date().toLocaleDateString()}</p>
								</div>
								<div>
									<p className="text-sm text-muted-foreground">Time</p>
									<p>{new Date().toLocaleTimeString()}</p>
								</div>
							</div>

							{error && (
								<div className="border-t pt-4">
									<p className="text-sm text-muted-foreground">Error Details</p>
									<p className="text-red-600 text-sm">{error}</p>
								</div>
							)}
						</CardContent>
					</Card>

					{/* Common Issues */}
					<Card className="mb-6">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<HelpCircle className="h-5 w-5" />
								Common Issues
							</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-2 text-sm">
								<li className="flex items-start gap-2">
									<span className="text-muted-foreground">•</span>
									<span>Insufficient funds in your account</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-muted-foreground">•</span>
									<span>Card limit exceeded</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-muted-foreground">•</span>
									<span>Network connectivity issues</span>
								</li>
								<li className="flex items-start gap-2">
									<span className="text-muted-foreground">•</span>
									<span>Incorrect payment information</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
						<Button onClick={handleRetryPayment} className="w-full">
							<RefreshCw className="mr-2 h-4 w-4" />
							Try Again
						</Button>
						<Button asChild variant="outline" className="w-full">
							<Link to="/contact">
								Contact Support
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

export default PaymentFailed;
