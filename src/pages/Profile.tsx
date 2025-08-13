import { useState, useEffect } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { hospitalDonationAPI, availableDonorAPI } from "@/services/donationAPI";
import { Loader2 } from "lucide-react";
import {
	User,
	Edit,
	Camera,
	Droplets,
	Calendar,
	MapPin,
	Phone,
	Mail,
	Shield,
	Bell,
	Eye,
	DollarSign,
	Clock,
	CheckCircle,
	AlertCircle,
	TrendingUp,
	Users
} from "lucide-react";

const Profile = () => {
	const { user, isLoading } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [donationHistory, setDonationHistory] = useState([]);
	const [loadingDonations, setLoadingDonations] = useState(false);
	const [profileData, setProfileData] = useState({
		name: "",
		email: "",
		phone: "",
		bloodType: "",
		location: "",
		birthDate: "",
		emergencyContact: "",
		medicalNotes: "",
		bio: "",
		weight: 0,
		gender: "",
		isAvailableDonor: true,
		memberSince: ""
	});

	// Update profile data when user data is available
	useEffect(() => {
		if (user) {
			setProfileData({
				name: `${user.firstName} ${user.lastName}`,
				email: user.email,
				phone: user.phone,
				bloodType: user.bloodType,
				location: `${user.location.area}, ${user.location.city}`,
				birthDate: user.dateOfBirth,
				emergencyContact: "",
				medicalNotes: "",
				bio: "",
				weight: user.weight,
				gender: user.gender,
				isAvailableDonor: user.isAvailableDonor,
				memberSince: user.createdAt
			});
		}
	}, [user]);

	// Fetch donation history from API
	useEffect(() => {
		const fetchDonationHistory = async () => {
			if (!user) return;
			
			setLoadingDonations(true);
			try {
				// Fetch both hospital donations and available donor registrations
				const [hospitalResponse, donorResponse] = await Promise.all([
					hospitalDonationAPI.getUserHistory().catch(() => ({ success: false, data: [] })),
					availableDonorAPI.getProfile().catch(() => ({ success: false, data: null }))
				]);

				const allDonations = [];

				// Transform hospital donations
				if (hospitalResponse.success) {
					const hospitalDonations = hospitalResponse.data.map((donation) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const d = donation as any;
						return {
							id: `hospital-${d._id}`,
							date: new Date(d.createdAt || d.submittedAt || Date.now()).toLocaleDateString(),
							type: "Hospital Donation",
							location: d.appointmentDetails?.donationCenter || d.donationCenter || "Hospital",
							status: d.status ? d.status.charAt(0).toUpperCase() + d.status.slice(1) : "Pending",
							units: Math.round((d.bloodInfo?.quantity || 450) / 450),
							points: d.status === 'completed' ? 100 : 0,
							bloodType: d.bloodInfo?.bloodType || d.bloodType || "Unknown",
							urgencyLevel: d.urgencyLevel || 'medium'
						};
					});
					allDonations.push(...hospitalDonations);
				}

				// Transform available donor registration
				if (donorResponse.success && donorResponse.data) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const d = donorResponse.data as any;
					const donorRegistration = {
						id: `donor-${d._id}`,
						date: new Date(d.registeredAt || d.createdAt || Date.now()).toLocaleDateString(),
						type: "Available Donor Registration",
						location: "Emergency Contact Registry",
						status: d.isActive ? "Active" : "Inactive",
						units: 0, // Registration doesn't donate units yet
						points: d.isActive ? 50 : 0, // Points for being available
						bloodType: d.bloodInfo?.bloodType || d.bloodType || user.bloodType || "Unknown",
						urgencyLevel: 'emergency'
					};
					allDonations.push(donorRegistration);
				}

				// Sort by date (newest first)
				allDonations.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
				
				setDonationHistory(allDonations);
			} catch (error) {
				console.error('Error fetching donation history:', error);
				// Set empty array on error
				setDonationHistory([]);
			} finally {
				setLoadingDonations(false);
			}
		};

		fetchDonationHistory();
	}, [user]);

	const bloodRequests = [
		{
			id: 1,
			date: "2024-02-01",
			bloodType: "O+",
			units: 2,
			hospital: "General Hospital",
			status: "Fulfilled",
			urgency: "High"
		},
		{
			id: 2,
			date: "2024-01-20",
			bloodType: "O+",
			units: 1,
			hospital: "Children's Hospital",
			status: "Pending",
			urgency: "Critical"
		}
	];

	const moneyDonations = [
		{
			id: 1,
			date: "2024-01-30",
			amount: 1000,
			purpose: "Emergency Blood Drive",
			method: "Credit Card",
			status: "Completed"
		},
		{
			id: 2,
			date: "2023-12-15",
			amount: 500,
			purpose: "Medical Equipment",
			method: "bKash",
			status: "Completed"
		},
		{
			id: 3,
			date: "2023-11-20",
			amount: 2500,
			purpose: "General Fund",
			method: "Bank Transfer",
			status: "Completed"
		}
	];

	const stats = {
		totalDonations: donationHistory.length,
		totalUnits: donationHistory.reduce((sum, d) => sum + d.units, 0),
		totalMoneyDonated: moneyDonations.reduce((sum, d) => sum + d.amount, 0),
		livesImpacted: donationHistory.length * 3,
		points: donationHistory.reduce((sum, d) => sum + d.points, 0),
		level: "Gold Donor"
	};

	const getStatusColor = (status: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
			case "Completed": return "default";
			case "Fulfilled": return "default";
			case "Pending": return "secondary";
			case "Critical": return "destructive";
			default: return "secondary";
		}
	};

	const getUrgencyColor = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (urgency) {
			case "Critical": return "destructive";
			case "High": return "destructive";
			case "Medium": return "secondary";
			default: return "secondary";
		}
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			{isLoading ? (
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
							<p className="text-lg text-muted-foreground">Loading profile...</p>
						</div>
					</div>
				</div>
			) : !user ? (
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-6xl mx-auto flex items-center justify-center min-h-[400px]">
						<div className="text-center">
							<AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
							<p className="text-lg text-muted-foreground">Unable to load profile data.</p>
						</div>
					</div>
				</div>
			) : (
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-6xl mx-auto">
					{/* Profile Header */}
					<Card className="mb-8">
						<CardContent className="pt-6">
							<div className="flex flex-col md:flex-row items-start md:items-center gap-6">
								<div className="relative">
									<Avatar className="h-24 w-24">
										<AvatarImage src="/placeholder-avatar.jpg" alt={profileData.name} />
										<AvatarFallback className="text-xl">
											{profileData.name.split(' ').map(n => n[0]).join('')}
										</AvatarFallback>
									</Avatar>
									<Button
										size="icon"
										variant="secondary"
										className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full"
									>
										<Camera className="h-4 w-4" />
									</Button>
								</div>

								<div className="flex-1">
									<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
										<div>
											<h1 className="text-3xl font-bold text-foreground">{profileData.name}</h1>
											<div className="flex items-center gap-4 mt-2 text-muted-foreground">
												<div className="flex items-center gap-1">
													<Droplets className="h-4 w-4 text-primary" />
													<span className="font-semibold">{profileData.bloodType}</span>
												</div>
												<div className="flex items-center gap-1">
													<MapPin className="h-4 w-4" />
													<span>{profileData.location}</span>
												</div>
												<Badge variant="secondary" className="text-primary">
													{stats.level}
												</Badge>
											</div>
										</div>

										<Button
											onClick={() => setIsEditing(!isEditing)}
											variant={isEditing ? "secondary" : "default"}
										>
											<Edit className="h-4 w-4 mr-2" />
											{isEditing ? "Cancel" : "Edit Profile"}
										</Button>
									</div>
								</div>
							</div>

							{/* Quick Stats */}
							<div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6 pt-6 border-t border-border">
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">{stats.totalDonations}</div>
									<div className="text-sm text-muted-foreground">Blood Donations</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-success">৳{stats.totalMoneyDonated.toLocaleString()}</div>
									<div className="text-sm text-muted-foreground">Money Donated</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-emergency">{stats.livesImpacted}</div>
									<div className="text-sm text-muted-foreground">Lives Impacted</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-primary">{stats.points}</div>
									<div className="text-sm text-muted-foreground">Points Earned</div>
								</div>
								<div className="text-center">
									<div className="text-2xl font-bold text-foreground">{stats.totalUnits}</div>
									<div className="text-sm text-muted-foreground">Units Donated</div>
								</div>
							</div>
						</CardContent>
					</Card>

					<Tabs defaultValue="info" className="space-y-6">
						<TabsList className="grid w-full grid-cols-4">
							<TabsTrigger value="info">Personal Info</TabsTrigger>
							<TabsTrigger value="donations">Blood Donations</TabsTrigger>
							<TabsTrigger value="requests">Blood Requests</TabsTrigger>
							<TabsTrigger value="money">Money Donations</TabsTrigger>
						</TabsList>

						<TabsContent value="info" className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<User className="h-5 w-5 mr-2" />
											Personal Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										{isEditing ? (
											<div className="space-y-4">
												<div className="space-y-2">
													<Label htmlFor="name">Full Name</Label>
													<Input
														id="name"
														value={profileData.name}
														onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="email">Email</Label>
													<Input
														id="email"
														type="email"
														value={profileData.email}
														onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="phone">Phone</Label>
													<Input
														id="phone"
														value={profileData.phone}
														onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="location">Location</Label>
													<Input
														id="location"
														value={profileData.location}
														onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="bio">Bio</Label>
													<Textarea
														id="bio"
														value={profileData.bio}
														onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
														rows={3}
													/>
												</div>
												<Button onClick={() => setIsEditing(false)} className="w-full">
													Save Changes
												</Button>
											</div>
										) : (
											<div className="space-y-4">
												<div className="flex items-center gap-3">
													<Mail className="h-4 w-4 text-muted-foreground" />
													<span>{profileData.email}</span>
												</div>
												<div className="flex items-center gap-3">
													<Phone className="h-4 w-4 text-muted-foreground" />
													<span>{profileData.phone}</span>
												</div>
												<div className="flex items-center gap-3">
													<MapPin className="h-4 w-4 text-muted-foreground" />
													<span>{profileData.location}</span>
												</div>
												<div className="flex items-center gap-3">
													<Calendar className="h-4 w-4 text-muted-foreground" />
													<span>Born {new Date(profileData.birthDate).toLocaleDateString()}</span>
												</div>
												<div className="flex items-center gap-3">
													<User className="h-4 w-4 text-muted-foreground" />
													<span>Member since {new Date(profileData.memberSince).toLocaleDateString()}</span>
												</div>
												<Separator />
												<div>
													<h4 className="font-medium mb-2">Bio</h4>
													<p className="text-muted-foreground text-sm">
														{profileData.bio || "No bio provided yet."}
													</p>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center">
											<Shield className="h-5 w-5 mr-2" />
											Medical Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Blood Type</span>
											<Badge variant="outline" className="text-primary border-primary">
												{profileData.bloodType}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Weight</span>
											<span className="text-sm text-muted-foreground">{profileData.weight} kg</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Gender</span>
											<span className="text-sm text-muted-foreground">{profileData.gender}</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Available for Donation</span>
											<Badge variant={profileData.isAvailableDonor ? "default" : "secondary"}>
												{profileData.isAvailableDonor ? "Available" : "Not Available"}
											</Badge>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm font-medium">Emergency Contact</span>
											<span className="text-sm text-muted-foreground">
												{profileData.emergencyContact || "Not provided"}
											</span>
										</div>
										<div>
											<span className="text-sm font-medium">Medical Notes</span>
											<p className="text-sm text-muted-foreground mt-1">
												{profileData.medicalNotes || "No medical notes provided"}
											</p>
										</div>
										<Separator />
										<div className="space-y-2">
											<h4 className="font-medium">Donation Eligibility</h4>
											<div className="flex items-center gap-2">
												<CheckCircle className="h-4 w-4 text-success" />
												<span className="text-sm">Eligible for donation</span>
											</div>
											<div className="text-xs text-muted-foreground">
												Next eligible date: March 15, 2024
											</div>
										</div>
									</CardContent>
								</Card>
							</div>
						</TabsContent>

						<TabsContent value="donations" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<Droplets className="h-5 w-5 mr-2 text-primary" />
										Blood Donation History
									</CardTitle>
									<CardDescription>
										Your complete blood donation record including hospital appointments and emergency donor registrations
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{loadingDonations ? (
											<div className="flex items-center justify-center py-8">
												<Loader2 className="h-6 w-6 animate-spin" />
												<span className="ml-2">Loading donation history...</span>
											</div>
										) : donationHistory.length === 0 ? (
											<div className="text-center py-8 text-muted-foreground">
												<Droplets className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
												<p>No donation history found.</p>
												<p className="text-sm">Submit a donation request to see your history here.</p>
											</div>
										) : (
											donationHistory.map((donation) => (
												<div key={donation.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
													<div className="flex items-center space-x-4">
														<div className={`p-2 rounded-full ${
															donation.type === 'Available Donor Registration' 
																? 'bg-green-100 dark:bg-green-900' 
																: 'bg-primary/10'
														}`}>
															{donation.type === 'Available Donor Registration' ? (
																<Users className="h-4 w-4 text-green-600 dark:text-green-400" />
															) : (
																<Droplets className="h-4 w-4 text-primary" />
															)}
														</div>
														<div>
															<div className="font-medium">{donation.date}</div>
															<div className="text-sm text-muted-foreground">
																{donation.type} • {donation.location}
															</div>
														</div>
													</div>
													<div className="text-right space-y-1">
														<Badge variant={getStatusColor(donation.status)}>
															{donation.status}
														</Badge>
														<div className="text-sm text-muted-foreground">
															{donation.type === 'Available Donor Registration' 
																? `Emergency donor • +${donation.points} points`
																: `${donation.units} unit(s) • +${donation.points} points`
															}
														</div>
													</div>
												</div>
											))
										)}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="requests" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<AlertCircle className="h-5 w-5 mr-2 text-emergency" />
										Blood Requests History
									</CardTitle>
									<CardDescription>
										Blood requests you've made for yourself or others
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{bloodRequests.map((request) => (
											<div key={request.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
												<div className="flex items-center space-x-4">
													<div className="bg-emergency/10 p-2 rounded-full">
														<Droplets className="h-4 w-4 text-emergency" />
													</div>
													<div>
														<div className="font-medium">{request.date}</div>
														<div className="text-sm text-muted-foreground">
															{request.hospital} • {request.units} unit(s)
														</div>
													</div>
												</div>
												<div className="text-right space-y-1">
													<div className="flex gap-2">
														<Badge variant="outline">
															{request.bloodType}
														</Badge>
														<Badge variant={getUrgencyColor(request.urgency)}>
															{request.urgency}
														</Badge>
													</div>
													<Badge variant={getStatusColor(request.status)}>
														{request.status}
													</Badge>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</TabsContent>

						<TabsContent value="money" className="space-y-6">
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center">
										<DollarSign className="h-5 w-5 mr-2 text-success" />
										Money Donation History
									</CardTitle>
									<CardDescription>
										Your financial contributions to blood donation causes
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{moneyDonations.map((donation) => (
											<div key={donation.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
												<div className="flex items-center space-x-4">
													<div className="bg-success/10 p-2 rounded-full">
														<DollarSign className="h-4 w-4 text-success" />
													</div>
													<div>
														<div className="font-medium">{donation.date}</div>
														<div className="text-sm text-muted-foreground">
															{donation.purpose} • {donation.method}
														</div>
													</div>
												</div>
												<div className="text-right space-y-1">
													<div className="font-semibold text-success">
														৳{donation.amount.toLocaleString()}
													</div>
													<Badge variant={getStatusColor(donation.status)}>
														{donation.status}
													</Badge>
												</div>
											</div>
										))}
									</div>

									<div className="mt-6 pt-6 border-t border-border">
										<div className="flex items-center justify-between text-lg font-semibold">
											<span>Total Money Donated</span>
											<span className="text-success">৳{stats.totalMoneyDonated.toLocaleString()}</span>
										</div>
									</div>
								</CardContent>
							</Card>
						</TabsContent>
					</Tabs>
				</div>
			</div>
			)}
		</div>
	);
};

export default Profile;