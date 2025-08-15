import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { dashboardAPI, DashboardData } from "@/services/dashboardAPI";
import { hospitalDonationAPI } from "@/services/donationAPI";
import { availableDonorAPI } from "@/services/donationAPI";
import { useAuth } from "@/contexts/AuthContext";
import {
	Heart,
	Calendar,
	MapPin,
	Award,
	Bell,
	User,
	Activity,
	Droplets,
	Clock,
	Users,
	TrendingUp,
	Loader2
} from "lucide-react";

const Dashboard = () => {
	const [activeTab, setActiveTab] = useState("overview");
	const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
	const [loading, setLoading] = useState(true);
	const [donationHistory, setDonationHistory] = useState<Array<{
		id: string;
		date: string;
		type: string;
		location: string;
		status: string;
		units: number;
		points: number;
		bloodType: string;
		urgencyLevel: string;
	}>>([]);
	const { toast } = useToast();
	const { user } = useAuth();

	// Fetch dashboard data
	useEffect(() => {
		const fetchDashboardData = async () => {
			if (!user) return;

			setLoading(true);
			try {
				const response = await dashboardAPI.getUserDashboard();
				setDashboardData({
					stats: response.stats!,
					recentDonations: response.recentDonations || [],
					myRequests: response.myRequests || [],
					nearbyRequests: response.nearbyRequests || []
				});
			} catch (error) {
				console.error('Error fetching dashboard data:', error);
				toast({
					title: "Error",
					description: "Failed to load dashboard data. Please try again.",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		fetchDashboardData();
	}, [user, toast]);

	// Fetch additional donation history
	useEffect(() => {
		const fetchDonationHistory = async () => {
			if (!user) return;

			try {
				// Fetch both hospital donations and available donor registrations
				const [hospitalResponse, donorResponse] = await Promise.all([
					hospitalDonationAPI.getUserHistory().catch(() => ({ success: false, data: [] })),
					availableDonorAPI.getProfile().catch(() => ({ success: false, data: null }))
				]);

				const allDonations = [];

				// Transform hospital donations
				if (hospitalResponse.success) {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					const hospitalDonations = hospitalResponse.data.map((donation: any) => ({
						id: donation._id,
						date: new Date(donation.submittedAt).toLocaleDateString(),
						type: "Hospital Donation",
						location: donation.appointmentDetails?.donationCenter || "Hospital",
						status: donation.status === 'pending' ? 'Pending' :
							donation.status === 'approved' ? 'Approved' : 'Completed',
						units: Math.round((donation.bloodInfo?.quantity || 450) / 450),
						points: donation.status === 'approved' ? 100 : 0,
						bloodType: donation.bloodInfo?.bloodType || user.bloodType,
						urgencyLevel: 'medium'
					}));
					allDonations.push(...hospitalDonations);
				}

				// Transform donor registration
				if (donorResponse.success && donorResponse.data) {
					const d = donorResponse.data;
					const donorRegistration = {
						id: `donor-${d._id}`,
						date: new Date(d.registeredAt || d.createdAt || Date.now()).toLocaleDateString(),
						type: "Available Donor Registration",
						location: "Emergency Contact Registry",
						status: d.isActive ? "Active" : "Inactive",
						units: 0,
						points: d.isActive ? 50 : 0,
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
			}
		};

		fetchDonationHistory();
	}, [user]);

	const calculateNextEligible = () => {
		if (!dashboardData?.stats.lastDonationDate) {
			return "Eligible now";
		}
		const lastDonation = new Date(dashboardData.stats.lastDonationDate);
		const nextEligible = new Date(lastDonation);
		nextEligible.setDate(nextEligible.getDate() + 56); // 8 weeks minimum gap

		const now = new Date();
		const diffTime = nextEligible.getTime() - now.getTime();
		const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays <= 0) {
			return "Eligible now";
		}
		return `${diffDays} days`;
	};

	const getDonorLevel = (totalDonations: number) => {
		if (totalDonations >= 50) return "Platinum Donor";
		if (totalDonations >= 25) return "Gold Donor";
		if (totalDonations >= 15) return "Silver Donor";
		if (totalDonations >= 5) return "Bronze Donor";
		return "New Donor";
	};

	const getLevelProgress = (totalDonations: number) => {
		if (totalDonations >= 50) return 100;
		if (totalDonations >= 25) return ((totalDonations - 25) / 25) * 100;
		if (totalDonations >= 15) return ((totalDonations - 15) / 10) * 100;
		if (totalDonations >= 5) return ((totalDonations - 5) / 10) * 100;
		return (totalDonations / 5) * 100;
	};

	const getUrgencyColor = (urgency: string): "default" | "secondary" | "destructive" | "outline" => {
		switch (urgency.toLowerCase()) {
			case "critical": return "destructive";
			case "high": return "destructive";
			case "medium": return "secondary";
			case "low": return "outline";
			default: return "secondary";
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-medical/20 flex flex-col">
				<Header />
				<div className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
					<div className="flex items-center space-x-2">
						<Loader2 className="h-6 w-6 animate-spin" />
						<span>Loading dashboard...</span>
					</div>
				</div>
				<Footer />
			</div>
		);
	}

	if (!dashboardData || !user) {
		return (
			<div className="min-h-screen bg-medical/20 flex flex-col">
				<Header />
				<div className="flex-1 container mx-auto px-4 py-8">
					<p>Error loading dashboard data. Please try again.</p>
				</div>
				<Footer />
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-medical/20 flex flex-col">
			<Header />
			<div className="flex-1 container mx-auto px-4 py-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-foreground mb-2">
						Welcome back, {user.firstName} {user.lastName}!
					</h1>
					<p className="text-muted-foreground">
						Thank you for being a lifesaver. Your contributions make a real difference.
					</p>
				</div>

				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
					<TabsList className="grid w-full grid-cols-5">
						<TabsTrigger value="overview">Overview</TabsTrigger>
						<TabsTrigger value="donations">My Donations</TabsTrigger>
						<TabsTrigger value="requests">My Requests</TabsTrigger>
						<TabsTrigger value="nearby">Nearby Requests</TabsTrigger>
						<TabsTrigger value="achievements">Achievements</TabsTrigger>
					</TabsList>

					<TabsContent value="overview" className="space-y-6">
						{/* Stats Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Completed Donations</CardTitle>
									<Droplets className="h-4 w-4 text-primary" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{dashboardData.stats.totalDonations}</div>
									<p className="text-xs text-muted-foreground">
										Actual blood donations completed
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Total Activity</CardTitle>
									<Activity className="h-4 w-4 text-primary" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{donationHistory.length}</div>
									<p className="text-xs text-muted-foreground">
										Donations + registrations + requests
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Lives Impacted</CardTitle>
									<Heart className="h-4 w-4 text-primary" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{dashboardData.stats.totalDonations * 3}</div>
									<p className="text-xs text-muted-foreground">
										Each completed donation helps 3 people
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Donor Points</CardTitle>
									<Award className="h-4 w-4 text-primary" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{dashboardData.stats.totalDonations * 100 + (donationHistory.filter(d => d.status === 'Active').length * 50)}</div>
									<p className="text-xs text-muted-foreground">
										{getDonorLevel(dashboardData.stats.totalDonations)} status
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Additional Info Cards */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Next Donation Eligible</CardTitle>
									<Calendar className="h-4 w-4 text-primary" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{calculateNextEligible()}</div>
									<p className="text-xs text-muted-foreground">
										{dashboardData.stats.canDonate ? "You can donate now!" : "Until eligible again"}
									</p>
								</CardContent>
							</Card>

							<Card>
								<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
									<CardTitle className="text-sm font-medium">Pending Activities</CardTitle>
									<Clock className="h-4 w-4 text-orange-500" />
								</CardHeader>
								<CardContent>
									<div className="text-2xl font-bold">{donationHistory.filter(d => d.status === 'Pending' || d.status === 'pending').length}</div>
									<p className="text-xs text-muted-foreground">
										Hospital donations awaiting approval
									</p>
								</CardContent>
							</Card>
						</div>

						{/* Progress to Next Level */}
						<Card>
							<CardHeader>
								<CardTitle>Progress to Next Level</CardTitle>
								<CardDescription>
									{getDonorLevel(dashboardData.stats.totalDonations) === "Platinum Donor" ?
										"You've reached the highest level!" :
										`Donate ${dashboardData.stats.totalDonations < 5 ? 5 - dashboardData.stats.totalDonations :
											dashboardData.stats.totalDonations < 15 ? 15 - dashboardData.stats.totalDonations :
												dashboardData.stats.totalDonations < 25 ? 25 - dashboardData.stats.totalDonations : 50 - dashboardData.stats.totalDonations
										} more times to reach the next level`
									}
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<div className="flex justify-between text-sm">
										<span>Current: {getDonorLevel(dashboardData.stats.totalDonations)}</span>
										<span>Next: {getDonorLevel(dashboardData.stats.totalDonations) === "Platinum Donor" ? "Max Level" : getDonorLevel(dashboardData.stats.totalDonations + 1)}</span>
									</div>
									<Progress value={getLevelProgress(dashboardData.stats.totalDonations)} className="h-3" />
									<p className="text-xs text-muted-foreground">
										{dashboardData.stats.totalDonations} donations completed
									</p>
								</div>
							</CardContent>
						</Card>

						{/* Nearby Requests */}
						<Card>
							<CardHeader>
								<CardTitle>Urgent Blood Requests Near You</CardTitle>
								<CardDescription>
									Help save lives in your community
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.nearbyRequests.slice(0, 3).map((request) => (
										<div key={request._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="space-y-1">
												<div className="flex items-center space-x-2">
													<Badge variant="outline" className="font-semibold">
														{request.patient.bloodType}
													</Badge>
													<Badge variant={getUrgencyColor(request.bloodRequirement.urgency)}>
														{request.bloodRequirement.urgency}
													</Badge>
												</div>
												<div className="text-sm text-muted-foreground">
													{request.hospital.name} • {request.hospital.city} • {new Date(request.createdAt).toLocaleDateString()}
												</div>
												<div className="text-sm font-medium">{request.bloodRequirement.units} units needed</div>
											</div>
											<Button size="sm" variant={request.bloodRequirement.urgency === "critical" ? "destructive" : "default"}>
												Respond
											</Button>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="donations" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Donation History</CardTitle>
								<CardDescription>
									Your complete donation record and upcoming eligibility
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.recentDonations.slice(0, 3).map((donation, index) => (
										<div key={index} className="flex items-center justify-between p-4 border border-border rounded-lg">
											<div className="flex items-center space-x-4">
												<div className="bg-success/10 p-2 rounded-full">
													<Droplets className="h-4 w-4 text-success" />
												</div>
												<div>
													<div className="font-medium">{new Date(donation.donationDate).toLocaleDateString()}</div>
													<div className="text-sm text-muted-foreground">{donation.location.name}</div>
												</div>
											</div>
											<div className="text-right">
												<Badge variant="secondary">{donation.status}</Badge>
												<div className="text-sm text-muted-foreground mt-1">
													{donation.amount}ml donated
												</div>
											</div>
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="requests" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>My Blood Requests</CardTitle>
								<CardDescription>
									Blood requests you have created
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.myRequests && dashboardData.myRequests.length > 0 ? (
										dashboardData.myRequests.map((request) => (
											<div key={request._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
												<div className="space-y-1">
													<div className="flex items-center space-x-2">
														<Badge variant="outline" className="font-semibold">
															{request.patient.bloodType}
														</Badge>
														<Badge variant={getUrgencyColor(request.bloodRequirement.urgency)}>
															{request.bloodRequirement.urgency}
														</Badge>
														<Badge variant={request.status === 'fulfilled' ? 'default' : request.status === 'active' ? 'secondary' : 'outline'}>
															{request.status}
														</Badge>
													</div>
													<div className="text-sm text-muted-foreground">
														{request.hospital.name} • {new Date(request.createdAt).toLocaleDateString()}
													</div>
													<div className="text-sm font-medium">{request.bloodRequirement.units} units needed</div>
												</div>
												<Button size="sm" variant="outline">
													View Details
												</Button>
											</div>
										))
									) : (
										<div className="text-center py-8 text-muted-foreground">
											<p>You haven't created any blood requests yet.</p>
											<p className="text-sm mt-2">When you need blood, your requests will appear here.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="nearby" className="space-y-6">
						<Card>
							<CardHeader>
								<CardTitle>Nearby Blood Requests</CardTitle>
								<CardDescription>
									Blood requests you can help with in your area
								</CardDescription>
							</CardHeader>
							<CardContent>
								<div className="space-y-4">
									{dashboardData.nearbyRequests && dashboardData.nearbyRequests.length > 0 ? (
										dashboardData.nearbyRequests.map((request) => (
											<div key={request._id} className="flex items-center justify-between p-4 border border-border rounded-lg">
												<div className="space-y-1">
													<div className="flex items-center space-x-2">
														<Badge variant="outline" className="font-semibold">
															{request.patient.bloodType}
														</Badge>
														<Badge variant={getUrgencyColor(request.bloodRequirement.urgency)}>
															{request.bloodRequirement.urgency}
														</Badge>
													</div>
													<div className="text-sm text-muted-foreground">
														{request.hospital.name} • {request.hospital.city} • {new Date(request.createdAt).toLocaleDateString()}
													</div>
													<div className="text-sm font-medium">{request.bloodRequirement.units} units needed</div>
												</div>
												<Button size="sm" variant={request.bloodRequirement.urgency === "critical" ? "destructive" : "default"}>
													Respond
												</Button>
											</div>
										))
									) : (
										<div className="text-center py-8 text-muted-foreground">
											<p>No compatible blood requests in your area right now.</p>
											<p className="text-sm mt-2">We'll notify you when someone needs your blood type.</p>
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="achievements" className="space-y-6">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
							<Card>
								<CardHeader>
									<CardTitle>Donor Badges</CardTitle>
									<CardDescription>Your achievements and milestones</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 gap-4">
										<div className="text-center p-4 border border-border rounded-lg">
											<Award className="h-8 w-8 text-primary mx-auto mb-2" />
											<div className="font-semibold text-sm">First Donation</div>
											<div className="text-xs text-muted-foreground">Completed</div>
										</div>
										<div className="text-center p-4 border border-border rounded-lg">
											<Users className="h-8 w-8 text-primary mx-auto mb-2" />
											<div className="font-semibold text-sm">5 Lives Saved</div>
											<div className="text-xs text-muted-foreground">Completed</div>
										</div>
										<div className="text-center p-4 border border-border rounded-lg">
											<TrendingUp className="h-8 w-8 text-primary mx-auto mb-2" />
											<div className="font-semibold text-sm">Regular Donor</div>
											<div className="text-xs text-muted-foreground">Completed</div>
										</div>
										<div className="text-center p-4 border border-muted rounded-lg opacity-50">
											<Droplets className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
											<div className="font-semibold text-sm">20 Donations</div>
											<div className="text-xs text-muted-foreground">8 more needed</div>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle>Impact Summary</CardTitle>
									<CardDescription>The difference you've made</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-sm">Emergency surgeries supported</span>
											<span className="font-semibold">8</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Cancer patients helped</span>
											<span className="font-semibold">15</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-sm">Accident victims assisted</span>
											<span className="font-semibold">13</span>
										</div>
										<div className="pt-4 border-t border-border">
											<div className="flex items-center justify-between text-lg font-semibold">
												<span>Total lives impacted</span>
												<span className="text-primary">{dashboardData.stats.totalDonations * 3}</span>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>
					</TabsContent>
				</Tabs>
			</div>
			<Footer />
		</div>
	);
};

export default Dashboard;