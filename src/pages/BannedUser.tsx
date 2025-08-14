import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ban, Mail, Phone, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BannedUser = () => {
	const navigate = useNavigate();

	// Get ban information from localStorage if available
	const banInfo = JSON.parse(localStorage.getItem('banInfo') || '{}');

	const handleContactAdmin = () => {
		window.location.href = 'mailto:admin@bloodconnect.com?subject=Account Ban Appeal&body=Hello Admin,%0D%0A%0D%0AI would like to appeal my account ban. Please review my case.%0D%0A%0D%0AThank you.';
	};

	const handleLogout = () => {
		localStorage.removeItem('authToken');
		localStorage.removeItem('user');
		localStorage.removeItem('banInfo');
		navigate('/login');
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
			<Card className="w-full max-w-md border-red-200 shadow-lg">
				<CardHeader className="text-center space-y-4">
					<div className="flex justify-center">
						<div className="relative">
							<Ban className="h-16 w-16 text-red-500" />
							<div className="absolute -top-1 -right-1">
								<AlertTriangle className="h-6 w-6 text-orange-500 fill-orange-100" />
							</div>
						</div>
					</div>
					<div>
						<CardTitle className="text-2xl font-bold text-red-700">
							Account Suspended
						</CardTitle>
						<CardDescription className="text-gray-600 mt-2">
							Your account has been temporarily suspended from Blood Connect
						</CardDescription>
					</div>
				</CardHeader>

				<CardContent className="space-y-6">
					{/* Ban Information */}
					{banInfo.banReason && (
						<div className="space-y-3">
							<h3 className="font-semibold text-gray-900">Suspension Details</h3>
							<div className="bg-red-50 border border-red-200 rounded-lg p-3">
								<p className="text-sm text-red-800">
									<strong>Reason:</strong> {banInfo.banReason}
								</p>
								{banInfo.bannedAt && (
									<p className="text-sm text-red-700 mt-1">
										<strong>Date:</strong> {new Date(banInfo.bannedAt).toLocaleDateString()}
									</p>
								)}
							</div>
						</div>
					)}

					{/* Status Badge */}
					<div className="flex justify-center">
						<Badge variant="destructive" className="px-4 py-2">
							<Ban className="h-4 w-4 mr-2" />
							Account Suspended
						</Badge>
					</div>

					{/* Information */}
					<div className="space-y-3">
						<h3 className="font-semibold text-gray-900">What does this mean?</h3>
						<ul className="text-sm text-gray-600 space-y-2">
							<li className="flex items-start">
								<span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								You cannot access your Blood Connect account
							</li>
							<li className="flex items-start">
								<span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								You cannot donate or request blood through the platform
							</li>
							<li className="flex items-start">
								<span className="inline-block w-2 h-2 bg-red-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
								All your active requests have been paused
							</li>
						</ul>
					</div>

					{/* Contact Information */}
					<div className="space-y-3">
						<h3 className="font-semibold text-gray-900">Need Help?</h3>
						<p className="text-sm text-gray-600">
							If you believe this suspension was made in error or would like to appeal,
							please contact our administrative team.
						</p>

						<div className="space-y-2">
							<Button
								onClick={handleContactAdmin}
								className="w-full bg-blue-600 hover:bg-blue-700"
							>
								<Mail className="h-4 w-4 mr-2" />
								Contact Admin via Email
							</Button>

							<div className="text-center">
								<p className="text-sm text-gray-500">or call us at</p>
								<div className="flex items-center justify-center mt-1">
									<Phone className="h-4 w-4 mr-2 text-gray-400" />
									<span className="text-sm font-medium text-gray-700">+880 1700-000000</span>
								</div>
							</div>
						</div>
					</div>

					{/* Logout Button */}
					<div className="pt-4 border-t border-gray-200">
						<Button
							variant="outline"
							onClick={handleLogout}
							className="w-full"
						>
							Return to Login
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default BannedUser;
