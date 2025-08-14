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

	const handleBanUser = async (banReason: string) => {
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
				setBanReason('');
				setShowBanDialog(false);

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
				<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
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
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						{user.firstName} {user.lastName}
					</DialogTitle>
					<DialogDescription>
						Detailed user information and activity history
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* User Status and Actions */}
					<div className="flex items-center justify-between p-4 bg-muted rounded-lg">
						<div className="flex items-center gap-4">
							{getStatusBadge(user.isActive, user.isBanned)}
							<Badge variant="outline">{user.role}</Badge>
							<Badge variant="outline" className="flex items-center gap-1">
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
								>
									<CheckCircle className="h-4 w-4 mr-2" />
									Unban User
								</Button>
							) : (
								<Button
									variant="destructive"
									size="sm"
									disabled={banLoading}
									onClick={() => setBanDialogOpen(true)}
								>
									<Ban className="h-4 w-4 mr-2" />
									Ban User
								</Button>
							)}
						</div>
					</div>

					{/* Ban Information */}
					{user.isBanned && (
						<Card className="border-red-200 bg-red-50">
							<CardHeader>
								<CardTitle className="text-red-800 flex items-center gap-2">
									<Ban className="h-5 w-5" />
									Banned User
								</CardTitle>
							</CardHeader>
							<CardContent className="space-y-2">
								<p><strong>Reason:</strong> {user.banReason}</p>
								<p><strong>Banned on:</strong> {user.bannedAt ? formatDate(user.bannedAt) : 'N/A'}</p>
								{user.bannedBy && (
									<p><strong>Banned by:</strong> {user.bannedBy.firstName} {user.bannedBy.lastName} ({user.bannedBy.email})</p>
								)}
							</CardContent>
						</Card>
					)}

					<Tabs defaultValue="profile" className="w-full">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="profile">Profile</TabsTrigger>
							<TabsTrigger value="donations">Donations ({stats.donationCount})</TabsTrigger>
							<TabsTrigger value="requests">Requests ({stats.requestCount})</TabsTrigger>
							<TabsTrigger value="emergencies">Emergencies ({stats.emergencyCount})</TabsTrigger>
						</TabsList>

						<TabsContent value="profile" className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<User className="h-4 w-4" />
											Personal Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div className="flex items-center gap-2">
											<Mail className="h-4 w-4 text-muted-foreground" />
											<span>{user.email}</span>
										</div>
										<div className="flex items-center gap-2">
											<Phone className="h-4 w-4 text-muted-foreground" />
											<span>{user.phone}</span>
										</div>
										<div className="flex items-center gap-2">
											<MapPin className="h-4 w-4 text-muted-foreground" />
											<span>{user.location.area}, {user.location.city}</span>
										</div>
										<div className="flex items-center gap-2">
											<Calendar className="h-4 w-4 text-muted-foreground" />
											<span>Joined {formatDate(user.createdAt)}</span>
										</div>
										{user.lastLogin && (
											<div className="flex items-center gap-2">
												<Activity className="h-4 w-4 text-muted-foreground" />
												<span>Last login {formatDate(user.lastLogin)}</span>
											</div>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Heart className="h-4 w-4" />
											Medical Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
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
														<strong>Diseases:</strong> {user.medicalHistory.diseases.join(', ')}
													</div>
												)}
												{user.medicalHistory.allergies.length > 0 && (
													<div>
														<strong>Allergies:</strong> {user.medicalHistory.allergies.join(', ')}
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
									<CardTitle>Donation History</CardTitle>
									<CardDescription>Recent blood donations by this user</CardDescription>
								</CardHeader>
								<CardContent>
									{donations.length > 0 ? (
										<div className="space-y-3">
											{donations.map((donation) => (
												<div key={donation._id} className="flex items-center justify-between p-3 border rounded-lg">
													<div>
														<p className="font-medium">Blood Type: {donation.request.patient.bloodType}</p>
														<p className="text-sm text-muted-foreground">
															{formatDate(donation.createdAt)}
														</p>
													</div>
													<Badge variant={donation.status === 'completed' ? 'default' : 'secondary'}>
														{donation.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-8">
											No donations found
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="requests">
							<Card>
								<CardHeader>
									<CardTitle>Blood Requests</CardTitle>
									<CardDescription>Blood requests made by this user</CardDescription>
								</CardHeader>
								<CardContent>
									{requests.length > 0 ? (
										<div className="space-y-3">
											{requests.map((request) => (
												<div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
													<div>
														<p className="font-medium">Patient: {request.patient.name}</p>
														<p className="text-sm">Blood Type: {request.patient.bloodType}</p>
														<p className="text-sm text-muted-foreground">
															{formatDate(request.createdAt)}
														</p>
													</div>
													<Badge variant={request.status === 'fulfilled' ? 'default' : 'secondary'}>
														{request.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-8">
											No blood requests found
										</p>
									)}
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="emergencies">
							<Card>
								<CardHeader>
									<CardTitle>Emergency Requests</CardTitle>
									<CardDescription>Emergency blood requests made by this user</CardDescription>
								</CardHeader>
								<CardContent>
									{emergencyRequests.length > 0 ? (
										<div className="space-y-3">
											{emergencyRequests.map((request) => (
												<div key={request._id} className="flex items-center justify-between p-3 border rounded-lg">
													<div>
														<p className="font-medium">Patient: {request.patient.name}</p>
														<p className="text-sm">Blood Type: {request.patient.bloodType}</p>
														<p className="text-sm">Severity: {request.emergency.severity}</p>
														<p className="text-sm text-muted-foreground">
															{formatDate(request.createdAt)}
														</p>
													</div>
													<Badge variant={request.status === 'fulfilled' ? 'default' : 'destructive'}>
														{request.status}
													</Badge>
												</div>
											))}
										</div>
									) : (
										<p className="text-center text-muted-foreground py-8">
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
			/>
		</Dialog>
	);
};

export default UserDetailsModal;
