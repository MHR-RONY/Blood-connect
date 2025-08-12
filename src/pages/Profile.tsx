import { useState } from "react";
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
	TrendingUp
} from "lucide-react";

const Profile = () => {
	const [isEditing, setIsEditing] = useState(false);
	const [profileData, setProfileData] = useState({
		name: "Alex Johnson",
		email: "alex.johnson@email.com",
		phone: "+1 (555) 123-4567",
		bloodType: "O+",
		location: "New York, NY",
		birthDate: "1990-05-15",
		emergencyContact: "Jane Johnson - +1 (555) 987-6543",
		medicalNotes: "No known allergies",
		bio: "Passionate about helping others through blood donation. Regular donor since 2020."
	});

	// Mock data
	const donationHistory = [
		{
			id: 1,
			date: "2024-01-15",
			type: "Whole Blood",
			location: "City Hospital",
			status: "Completed",
			units: 1,
			points: 100
		},
		{
			id: 2,
			date: "2023-11-10",
			type: "Platelets",
			location: "Community Center",
			status: "Completed",
			units: 1,
			points: 150
		},
		{
			id: 3,
			date: "2023-09-05",
			type: "Whole Blood",
			location: "Blood Drive Mobile",
			status: "Completed",
			units: 1,
			points: 100
		}
	];

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

	const getStatusColor = (status: string) => {
		switch (status) {
			case "Completed": return "success";
			case "Fulfilled": return "success";
			case "Pending": return "secondary";
			case "Critical": return "destructive";
			default: return "secondary";
		}
	};

	const getUrgencyColor = (urgency: string) => {
		switch (urgency) {
			case "Critical": return "destructive";
			case "High": return "emergency";
			case "Medium": return "secondary";
			default: return "secondary";
		}
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
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
													<span>Born {profileData.birthDate}</span>
												</div>
												<Separator />
												<div>
													<h4 className="font-medium mb-2">Bio</h4>
													<p className="text-muted-foreground text-sm">{profileData.bio}</p>
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
											<span className="text-sm font-medium">Emergency Contact</span>
											<span className="text-sm text-muted-foreground">{profileData.emergencyContact}</span>
										</div>
										<div>
											<span className="text-sm font-medium">Medical Notes</span>
											<p className="text-sm text-muted-foreground mt-1">{profileData.medicalNotes}</p>
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
										Your complete blood donation record
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{donationHistory.map((donation) => (
											<div key={donation.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
												<div className="flex items-center space-x-4">
													<div className="bg-primary/10 p-2 rounded-full">
														<Droplets className="h-4 w-4 text-primary" />
													</div>
													<div>
														<div className="font-medium">{donation.date}</div>
														<div className="text-sm text-muted-foreground">
															{donation.type} • {donation.location}
														</div>
													</div>
												</div>
												<div className="text-right space-y-1">
													<Badge variant={getStatusColor(donation.status) as any}>
														{donation.status}
													</Badge>
													<div className="text-sm text-muted-foreground">
														{donation.units} unit(s) • +{donation.points} points
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
														<Badge variant={getUrgencyColor(request.urgency) as any}>
															{request.urgency}
														</Badge>
													</div>
													<Badge variant={getStatusColor(request.status) as any}>
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
													<Badge variant={getStatusColor(donation.status) as any}>
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
		</div>
	);
};

export default Profile;