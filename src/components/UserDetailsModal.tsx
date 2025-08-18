import React, { useState, useEffect, useCallback } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
	User,
	Phone,
	Mail,
	MapPin,
	Calendar,
	Activity,
	Heart,
	Ban,
	CheckCircle,
	AlertTriangle,
	Droplets
} from 'lucide-react';
import { adminApi, AdminUser, UserDonation, UserBloodRequest, UserEmergencyRequest } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import BloodLoading from '@/components/ui/blood-loading';
import BanConfirmationDialog from '@/components/BanConfirmationDialog';

interface UserDetailsModalProps {
	isOpen: boolean;
	onClose: () => void;
	userId: string;
	onUserUpdate: (user: AdminUser) => void;
}

const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
	isOpen,
	onClose,
	userId,
	onUserUpdate
}) => {
	const [user, setUser] = useState<AdminUser | null>(null);
	const [donations, setDonations] = useState<UserDonation[]>([]);
	const [requests, setRequests] = useState<UserBloodRequest[]>([]);
	const [emergencyRequests, setEmergencyRequests] = useState<UserEmergencyRequest[]>([]);
	const [stats, setStats] = useState({ donationCount: 0, requestCount: 0, emergencyCount: 0 });
	const [loading, setLoading] = useState(false);
	const [banReason, setBanReason] = useState('');
	const [banLoading, setBanLoading] = useState(false);
	const [showBanDialog, setShowBanDialog] = useState(false);
	const [banDialogOpen, setBanDialogOpen] = useState(false);
	const { toast } = useToast();

	const fetchUserDetails = useCallback(async () => {
		try {
			setLoading(true);
			const response = await adminApi.getUserDetails(userId);

			if (response.success) {
				setUser(response.data.user);
				setDonations(response.data.donations);
				setRequests(response.data.requests);
				setEmergencyRequests(response.data.emergencyRequests);
				setStats(response.data.stats);
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description: response.message || "Failed to fetch user details"
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to fetch user details"
			});
		} finally {
			setLoading(false);
		}
	}, [userId, toast]);

	useEffect(() => {
		if (isOpen && userId) {
			fetchUserDetails();
		}
	}, [isOpen, userId, fetchUserDetails]);

	const handleBanConfirm = async (banReason: string) => {
		if (!user) return;

		const isBanned = !user.isBanned;

		try {
			setBanLoading(true);
			const response = await adminApi.banUser(userId, {
				isBanned,
				banReason: isBanned ? banReason.trim() : undefined
			});

			if (response.success) {
				const updatedUser = { ...user, ...response.data.user };
				setUser(updatedUser);
				onUserUpdate(updatedUser);
				setBanDialogOpen(false);

				toast({
					title: "Success",
					description: response.message
				});
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description: response.message || `Failed to ${isBanned ? 'ban' : 'unban'} user`
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: error instanceof Error ? error.message : `Failed to ${isBanned ? 'ban' : 'unban'} user`
			});
		} finally {
			setBanLoading(false);
		}
	};

	const getStatusBadge = (isActive: boolean, isBanned: boolean) => {
		if (isBanned) {
			return <Badge variant="destructive" className="flex items-center gap-1">
				<Ban className="h-3 w-3" />
				Banned
			</Badge>;
		}
		return isActive ?
			<Badge className="bg-green-100 text-green-800 flex items-center gap-1">
				<CheckCircle className="h-3 w-3" />
				Active
			</Badge> :
			<Badge variant="secondary" className="flex items-center gap-1">
				<AlertTriangle className="h-3 w-3" />
				Inactive
			</Badge>;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	};

	if (loading) {
		return (
			<Dialog open={isOpen} onOpenChange={onClose}>
				<DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-[85vh] md:h-[80vh] overflow-y-auto p-4 sm:p-6">
					<div className="flex justify-center py-8">
						<BloodLoading message="Loading user details" />
					</div>
				</DialogContent>
			</Dialog>
		);
	}

	if (!user) return null;

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-[85vh] md:h-[80vh] overflow-y-auto p-4 sm:p-6">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
						<User className="h-4 w-4 sm:h-5 sm:w-5" />
						{user.firstName} {user.lastName}
					</DialogTitle>
					<DialogDescription className="text-sm">
						Detailed user information and activity history
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 sm:space-y-6">
					{/* User Status and Actions */}
					<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-lg">
						<div className="flex flex-wrap items-center gap-2 sm:gap-4">
							{getStatusBadge(user.isActive, user.isBanned)}
							<Badge variant="outline" className="text-xs sm:text-sm">{user.role}</Badge>
							<Badge variant="outline" className="flex items-center gap-1 text-xs sm:text-sm">
								<Droplets className="h-3 w-3" />
								{user.bloodType}
							</Badge>
						</div>

						<div className="flex gap-2">
							{user.isBanned ? (
								<Button
									variant="outline"
									size="sm"
									disabled={banLoading}
									onClick={() => setBanDialogOpen(true)}
									className="text-xs sm:text-sm"
								>
									<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
									<span className="hidden sm:inline">Unban User</span>
									<span className="sm:hidden">Unban</span>
								</Button>
							) : (
								<Button
									variant="destructive"
									size="sm"
									disabled={banLoading}
									onClick={() => setBanDialogOpen(true)}
									className="text-xs sm:text-sm"
								>
									<Ban className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
									<span className="hidden sm:inline">Ban User</span>
									<span className="sm:hidden">Ban</span>
								</Button>
							)}
						</div>
					</div>

					{/* Ban Information */}
					{user.isBanned && (
						<Card className="border-red-200 bg-red-50">
							<CardHeader>
								<CardTitle className="text-red-800 flex items-center gap-2 text-sm sm:text-base">
									<Ban className="h-4 w-4 sm:h-5 sm:w-5" />
									Banned User
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2 text-sm sm:text-base">
								<p><strong>Reason:</strong> {user.banReason}</p>
								<p><strong>Banned on:</strong> {user.bannedAt ? formatDate(user.bannedAt) : 'N/A'}</p>
								{user.bannedBy && (
									<p><strong>Banned by:</strong> {user.bannedBy.firstName} {user.bannedBy.lastName} ({user.bannedBy.email})</p>
								)}
							</CardContent>
						</Card>
					)}

					<Tabs defaultValue="profile" className="w-full">
						<TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto">
							<TabsTrigger value="profile" className="text-xs sm:text-sm p-2 sm:p-3">
								<span className="hidden sm:inline">Profile</span>
								<span className="sm:hidden">Info</span>
							</TabsTrigger>
							<TabsTrigger value="donations" className="text-xs sm:text-sm p-2 sm:p-3">
								<span className="hidden sm:inline">Donations ({stats.donationCount})</span>
								<span className="sm:hidden">Dona. ({stats.donationCount})</span>
							</TabsTrigger>
							<TabsTrigger value="requests" className="text-xs sm:text-sm p-2 sm:p-3">
								<span className="hidden sm:inline">Requests ({stats.requestCount})</span>
								<span className="sm:hidden">Req. ({stats.requestCount})</span>
							</TabsTrigger>
							<TabsTrigger value="emergencies" className="text-xs sm:text-sm p-2 sm:p-3">
								<span className="hidden sm:inline">Emergencies ({stats.emergencyCount})</span>
								<span className="sm:hidden">Emer. ({stats.emergencyCount})</span>
							</TabsTrigger>
						</TabsList>

						<TabsContent value="profile" className="space-y-3 sm:space-y-4">
							<div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-sm sm:text-base">
											<User className="h-4 w-4" />
											Personal Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2 sm:space-y-3">
										<div className="flex items-start sm:items-center gap-2 text-sm sm:text-base">
											<Mail className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
											<span className="break-all">{user.email}</span>
										</div>
										<div className="flex items-center gap-2 text-sm sm:text-base">
											<Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
											<span>{user.phone}</span>
										</div>
										<div className="flex items-start sm:items-center gap-2 text-sm sm:text-base">
											<MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
											<span className="break-words">{user.location.area}, {user.location.city}</span>
										</div>
										<div className="flex items-start sm:items-center gap-2 text-sm sm:text-base">
											<Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
											<span className="break-words">Joined {formatDate(user.createdAt)}</span>
										</div>
										{user.lastLogin && (
											<div className="flex items-start sm:items-center gap-2 text-sm sm:text-base">
												<Activity className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5 sm:mt-0" />
												<span className="break-words">Last login {formatDate(user.lastLogin)}</span>
											</div>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2 text-sm sm:text-base">
											<Heart className="h-4 w-4" />
											Medical Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-2 sm:space-y-3 text-sm sm:text-base">
										<div>
											<strong>Blood Type:</strong> {user.bloodType}
										</div>
										<div>
											<strong>Total Donations:</strong> {user.donationCount || 0}
										</div>
										<div>
											<strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}
										</div>
										{user.medicalHistory && (
											<>
												<div>
													<strong>Chronic Diseases:</strong> {user.medicalHistory.hasChronicDiseases ? 'Yes' : 'No'}
												</div>
												<div>
													<strong>Eligible to Donate:</strong> {user.medicalHistory.isEligibleToDonate ? 'Yes' : 'No'}
												</div>
												{user.medicalHistory.diseases.length > 0 && (
													<div>
														<strong>Diseases:</strong> <span className="break-words">{user.medicalHistory.diseases.join(', ')}</span>
													</div>
												)}
												{user.medicalHistory.allergies.length > 0 && (
													<div>
														<strong>Allergies:</strong> <span className="break-words">{user.medicalHistory.allergies.join(', ')}</span>
													</div>
												)}
											</>
										)}
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="donations">
							<Card>
								<CardHeader>
									<CardTitle className="text-sm sm:text-base">Donation History</CardTitle>
									<CardDescription className="text-xs sm:text-sm">Recent blood donations by this user</CardDescription>
								</CardHeader>
								<CardContent>
									{donations.length > 0 ? (
										<div className="space-y-3">
											{donations.map((donation) => (
												<div key={donation._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
													<div className="flex-1">
														<p className="font-medium text-sm sm:text-base">Blood Type: {donation.request.patient.bloodType}</p>
														<p className="text-xs sm:text-sm text-muted-foreground">
															{formatDate(donation.createdAt)}
														</p>
													</div>
													<Badge variant={donation.status === 'completed' ? 'default' : 'secondary'} className="self-start sm:self-center text-xs">
														{donation.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
											No donations found
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="requests">
							<Card>
								<CardHeader>
									<CardTitle className="text-sm sm:text-base">Blood Requests</CardTitle>
									<CardDescription className="text-xs sm:text-sm">Blood requests made by this user</CardDescription>
								</CardHeader>
								<CardContent>
									{requests.length > 0 ? (
										<div className="space-y-3">
											{requests.map((request) => (
												<div key={request._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
													<div className="flex-1">
														<p className="font-medium text-sm sm:text-base break-words">Patient: {request.patient.name}</p>
														<p className="text-xs sm:text-sm">Blood Type: {request.patient.bloodType}</p>
														<p className="text-xs sm:text-sm text-muted-foreground">
															{formatDate(request.createdAt)}
														</p>
													</div>
													<Badge variant={request.status === 'fulfilled' ? 'default' : 'secondary'} className="self-start sm:self-center text-xs">
														{request.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
											No blood requests found
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="emergencies">
							<Card>
								<CardHeader>
									<CardTitle className="text-sm sm:text-base">Emergency Requests</CardTitle>
									<CardDescription className="text-xs sm:text-sm">Emergency blood requests made by this user</CardDescription>
								</CardHeader>
								<CardContent>
									{emergencyRequests.length > 0 ? (
										<div className="space-y-3">
											{emergencyRequests.map((request) => (
												<div key={request._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-0 p-3 border rounded-lg">
													<div className="flex-1">
														<p className="font-medium text-sm sm:text-base break-words">Patient: {request.patient.name}</p>
														<p className="text-xs sm:text-sm">Blood Type: {request.patient.bloodType}</p>
														<p className="text-xs sm:text-sm">Severity: {request.emergency.severity}</p>
														<p className="text-xs sm:text-sm text-muted-foreground">
															{formatDate(request.createdAt)}
														</p>
													</div>
													<Badge variant={request.status === 'fulfilled' ? 'default' : 'destructive'} className="self-start sm:self-center text-xs">
														{request.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-8 text-sm sm:text-base">
											No emergency requests found
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</DialogContent>

			<BanConfirmationDialog
				isOpen={banDialogOpen}
				onClose={() => setBanDialogOpen(false)}
				onConfirm={handleBanConfirm}
				user={user}
				isLoading={banLoading}
				isBanning={!user?.isBanned}
			/>
		</Dialog>
	);
};

export default UserDetailsModal;
