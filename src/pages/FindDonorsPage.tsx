import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { availableDonorAPI } from "@/services/donationAPI";
import {
	MapPin,
	Phone,
	Mail,
	Clock,
	Filter,
	Search,
	Star,
	Award,
	Calendar,
	Navigation,
	Copy,
	MessageCircle,
	User
} from "lucide-react";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";
import BloodDropIcon from "@/components/BloodDropIcon";
import BloodLoading from "@/components/ui/blood-loading";

const FindDonorsPage = () => {
	const [filters, setFilters] = useState({
		bloodType: "",
		location: { city: "", area: "" },
		availability: "any",
		searchRadius: "10",
		searchQuery: ""
	});

	const [donors, setDonors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [selectedDonor, setSelectedDonor] = useState(null);
	const [isContactModalOpen, setIsContactModalOpen] = useState(false);

	// Fetch available donors from API
	useEffect(() => {
		const fetchDonors = async () => {
			setLoading(true);
			try {
				const response = await availableDonorAPI.getAvailableDonors({
					bloodType: filters.bloodType || undefined,
					city: filters.location.city || undefined
				});

				if (response.success) {
					// Transform API data to match UI structure
					const transformedDonors = response.data.map((donor) => {
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						const d = donor as any;
						return {
							id: d._id,
							name: d.user?.firstName && d.user?.lastName
								? `${d.user.firstName} ${d.user.lastName}`
								: d.donorInfo?.name || "Anonymous Donor",
							bloodType: d.user?.bloodType || d.bloodInfo?.bloodType || d.bloodType || "Unknown",
							location: d.user?.location
								? `${d.user.location.area}, ${d.user.location.city}`
								: d.donorInfo?.address || d.donorInfo?.city || "Location not specified",
							distance: "Within city", // Default since we don't have geolocation
							lastDonation: d.medicalHistory?.lastDonation || "No recent donation",
							totalDonations: 1, // Default for available donors
							rating: 4.5, // Default rating
							availability: d.isActive ? "Available" : "Busy",
							phone: d.user?.phone || d.donorInfo?.phone || "Not provided",
							email: d.user?.email || d.donorInfo?.email || "Not provided",
							verified: true, // All registered users are verified
							emergencyContact: d.hasEmergencyContact || false,
							notes: d.notes,
							registeredAt: d.registeredAt,
							schedule: d.availability?.schedule || "anytime",
							contactPreference: d.availability?.contactPreference || "phone"
						};
					});
					setDonors(transformedDonors);
				} else {
					setError("Failed to fetch available donors");
				}
			} catch (err) {
				console.error("Error fetching donors:", err);
				setError("Error loading donors. Please try again.");
				setDonors([]); // Set empty array as fallback
			} finally {
				setLoading(false);
			}
		};

		fetchDonors();
	}, [filters.bloodType, filters.location.city]); // Re-fetch when filters change

	const handleLocationChange = (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => {
		setFilters(prev => ({ ...prev, location }));
	};

	const handleContactDonor = (donor) => {
		setSelectedDonor(donor);
		setIsContactModalOpen(true);
	};

	const copyToClipboard = (text: string) => {
		navigator.clipboard.writeText(text);
		// You can add a toast notification here if needed
	};

	const filteredDonors = donors.filter(donor => {
		if (filters.bloodType && donor.bloodType !== filters.bloodType) return false;
		if (filters.availability && filters.availability !== "any" && donor.availability !== filters.availability) return false;
		if (filters.searchQuery && !donor.name.toLowerCase().includes(filters.searchQuery.toLowerCase())) return false;
		return true;
	});

	const getAvailabilityColor = (availability: string) => {
		switch (availability) {
			case "Available": return "bg-success text-success-foreground";
			case "Busy": return "bg-secondary text-secondary-foreground";
			default: return "bg-muted text-muted-foreground";
		}
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-7xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<div className="bg-primary/10 p-4 rounded-full">
								<Search className="h-10 w-10 text-primary" />
							</div>
						</div>
						<h1 className="text-3xl font-bold text-foreground mb-2">Find Blood Donors</h1>
						<p className="text-lg text-muted-foreground">
							Connect with verified blood donors in your area
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
						{/* Filters Sidebar */}
						<div className="lg:col-span-1">
							<Card className="sticky top-24">
								<CardHeader>
									<CardTitle className="flex items-center">
										<Filter className="h-5 w-5 mr-2 text-primary" />
										Search Filters
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-6">
									{/* Search Bar */}
									<div className="space-y-2">
										<label className="text-sm font-medium">Search by Name</label>
										<div className="relative">
											<Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												placeholder="Enter donor name..."
												className="pl-10"
												value={filters.searchQuery}
												onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
											/>
										</div>
									</div>

									{/* Blood Type Filter */}
									<BloodTypeSelector
										selectedType={filters.bloodType}
										onSelect={(type) => setFilters(prev => ({ ...prev, bloodType: type }))}
										label="Filter by Blood Type"
									/>

									{/* Location Filter */}
									<LocationSelector onLocationChange={handleLocationChange} />

									{/* Availability Filter */}
									<div className="space-y-2">
										<label className="text-sm font-medium">Availability</label>
										<Select
											value={filters.availability}
											onValueChange={(value) => setFilters(prev => ({ ...prev, availability: value }))}
										>
											<SelectTrigger>
												<SelectValue placeholder="Any availability" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="any">Any availability</SelectItem>
												<SelectItem value="Available">Available</SelectItem>
												<SelectItem value="Busy">Busy</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Clear Filters */}
									<Button
										variant="outline"
										className="w-full"
										onClick={() => setFilters({
											bloodType: "",
											location: { city: "", area: "" },
											availability: "any",
											searchRadius: "10",
											searchQuery: ""
										})}
									>
										Clear All Filters
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Donors List */}
						<div className="lg:col-span-3">
							{loading ? (
								<BloodLoading message="Finding available donors" />
							) : (
								<div className="space-y-6">
									{/* Results Header */}
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-xl font-semibold">
												{filteredDonors.length} Donors Found
											</h2>
											<p className="text-sm text-muted-foreground">
												Showing available donors in your area
											</p>
										</div>
										<Select defaultValue="distance">
											<SelectTrigger className="w-[180px]">
												<SelectValue placeholder="Sort by" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="distance">Nearest First</SelectItem>
												<SelectItem value="rating">Highest Rated</SelectItem>
												<SelectItem value="donations">Most Donations</SelectItem>
												<SelectItem value="recent">Recently Active</SelectItem>
											</SelectContent>
										</Select>
									</div>

									{/* Donors Grid */}
									<div className="space-y-4">
										{filteredDonors.map((donor) => (
											<Card key={donor.id} className="hover:shadow-lg transition-shadow">
												<CardContent className="p-6">
													<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
														{/* Donor Info */}
														<div className="md:col-span-2 space-y-4">
															<div className="flex items-start justify-between">
																<div className="space-y-2">
																	<div className="flex items-center space-x-2">
																		<h3 className="text-lg font-semibold">{donor.name}</h3>
																		{donor.verified && (
																			<Badge variant="secondary" className="text-xs">
																				✓ Verified
																			</Badge>
																		)}
																		{donor.emergencyContact && (
																			<Badge variant="destructive" className="text-xs">
																				Emergency Contact
																			</Badge>
																		)}
																	</div>
																	<div className="flex items-center space-x-4 text-sm text-muted-foreground">
																		<div className="flex items-center">
																			<MapPin className="h-4 w-4 mr-1" />
																			{donor.location} • {donor.distance}
																		</div>
																	</div>
																</div>
																<div className="text-right">
																	<Badge
																		variant="outline"
																		className={`${getAvailabilityColor(donor.availability)} border-0`}
																	>
																		{donor.availability}
																	</Badge>
																</div>
															</div>

															<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
																<div className="text-center p-3 bg-primary/5 rounded-lg">
																	<div className="text-xl font-bold text-primary">{donor.bloodType}</div>
																	<div className="text-xs text-muted-foreground">Blood Type</div>
																</div>
																<div className="text-center p-3 bg-success/5 rounded-lg">
																	<div className="text-xl font-bold text-success">{donor.totalDonations}</div>
																	<div className="text-xs text-muted-foreground">Donations</div>
																</div>
																<div className="text-center p-3 bg-secondary/50 rounded-lg">
																	<div className="flex items-center justify-center text-xl font-bold">
																		<Star className="h-4 w-4 text-yellow-500 mr-1" />
																		{donor.rating}
																	</div>
																	<div className="text-xs text-muted-foreground">Rating</div>
																</div>
																<div className="text-center p-3 bg-muted/50 rounded-lg">
																	<div className="text-sm font-bold">{donor.lastDonation}</div>
																	<div className="text-xs text-muted-foreground">Last Donation</div>
																</div>
															</div>

															<div className="flex items-center space-x-4 text-sm">
																<div className="flex items-center text-muted-foreground">
																	<Phone className="h-4 w-4 mr-1" />
																	{donor.phone}
																</div>
																<div className="flex items-center text-muted-foreground">
																	<Mail className="h-4 w-4 mr-1" />
																	{donor.email}
																</div>
															</div>
														</div>

														{/* Action Buttons */}
														<div className="flex flex-col space-y-3">
															<Button
																className="w-full"
																disabled={donor.availability === "Busy"}
																onClick={() => handleContactDonor(donor)}
															>
																<BloodDropIcon size="sm" className="mr-2" />
																Contact Donor
															</Button>
															<Button variant="outline" className="w-full">
																<Navigation className="h-4 w-4 mr-2" />
																Get Directions
															</Button>
															<Button variant="medical" className="w-full">
																<Award className="h-4 w-4 mr-2" />
																View Profile
															</Button>
															{donor.emergencyContact && (
																<Button variant="destructive" className="w-full">
																	<Phone className="h-4 w-4 mr-2" />
																	Emergency Call
																</Button>
															)}
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>

									{filteredDonors.length === 0 && (
										<Card>
											<CardContent className="text-center py-12">
												<Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
												<h3 className="text-lg font-semibold mb-2">No donors found</h3>
												<p className="text-muted-foreground mb-4">
													Try adjusting your search filters or expanding your search radius.
												</p>
												<Button variant="outline">
													Expand Search Area
												</Button>
											</CardContent>
										</Card>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
			<Footer />

			{/* Contact Donor Modal */}
			<Dialog open={isContactModalOpen} onOpenChange={setIsContactModalOpen}>
				<DialogContent className="sm:max-w-[420px] max-h-[80vh] flex flex-col">
					<DialogHeader className="flex-shrink-0">
						<DialogTitle className="flex items-center space-x-2">
							<User className="h-5 w-5" />
							<span>Contact Donor</span>
						</DialogTitle>
						<DialogDescription>
							Get in touch with the blood donor for your request
						</DialogDescription>
					</DialogHeader>

					{selectedDonor && (
						<div className="flex-1 overflow-y-auto space-y-4 pr-2">
							{/* Donor Basic Info */}
							<div className="flex items-center space-x-3 p-3 bg-primary/5 rounded-lg">
								<div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
									<User className="h-5 w-5 text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<h3 className="text-base font-semibold truncate">{selectedDonor.name}</h3>
									<div className="flex items-center space-x-2">
										<Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
											{selectedDonor.bloodType}
										</Badge>
										<Badge variant={selectedDonor.availability === "Available" ? "default" : "secondary"} className="text-xs">
											{selectedDonor.availability}
										</Badge>
									</div>
								</div>
							</div>

							{/* Contact Information */}
							<div className="space-y-3">
								<h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
									Contact Information
								</h4>

								{/* Phone */}
								<div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
									<div className="flex items-center space-x-2 min-w-0 flex-1">
										<Phone className="h-3 w-3 text-muted-foreground flex-shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium">Phone</p>
											<p className="text-xs text-muted-foreground truncate">{selectedDonor.phone}</p>
										</div>
									</div>
									<div className="flex space-x-1 flex-shrink-0">
										<Button
											size="sm"
											variant="outline"
											className="h-7 w-7 p-0"
											onClick={() => copyToClipboard(selectedDonor.phone)}
										>
											<Copy className="h-3 w-3" />
										</Button>
										<Button
											size="sm"
											className="h-7 px-2"
											onClick={() => window.open(`tel:${selectedDonor.phone}`)}
										>
											<Phone className="h-3 w-3" />
										</Button>
									</div>
								</div>

								{/* Email */}
								<div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
									<div className="flex items-center space-x-2 min-w-0 flex-1">
										<Mail className="h-3 w-3 text-muted-foreground flex-shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium">Email</p>
											<p className="text-xs text-muted-foreground truncate">{selectedDonor.email}</p>
										</div>
									</div>
									<div className="flex space-x-1 flex-shrink-0">
										<Button
											size="sm"
											variant="outline"
											className="h-7 w-7 p-0"
											onClick={() => copyToClipboard(selectedDonor.email)}
										>
											<Copy className="h-3 w-3" />
										</Button>
										<Button
											size="sm"
											className="h-7 px-2"
											onClick={() => window.open(`mailto:${selectedDonor.email}`)}
										>
											<Mail className="h-3 w-3" />
										</Button>
									</div>
								</div>

								{/* Location */}
								<div className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50">
									<div className="flex items-center space-x-2 min-w-0 flex-1">
										<MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium">Location</p>
											<p className="text-xs text-muted-foreground truncate">{selectedDonor.location}</p>
										</div>
									</div>
									<Button
										size="sm"
										variant="outline"
										className="h-7 w-7 p-0 flex-shrink-0"
										onClick={() => copyToClipboard(selectedDonor.location)}
									>
										<Copy className="h-3 w-3" />
									</Button>
								</div>
							</div>

							{/* Additional Info */}
							<div className="space-y-3">
								<h4 className="font-medium text-xs text-muted-foreground uppercase tracking-wide">
									Donor Information
								</h4>

								<div className="grid grid-cols-2 gap-2">
									<div className="text-center p-2 bg-muted/30 rounded-lg">
										<div className="text-sm font-bold">{selectedDonor.totalDonations}</div>
										<div className="text-xs text-muted-foreground">Donations</div>
									</div>
									<div className="text-center p-2 bg-muted/30 rounded-lg">
										<div className="flex items-center justify-center text-sm font-bold">
											<Star className="h-3 w-3 text-yellow-500 mr-1" />
											{selectedDonor.rating}
										</div>
										<div className="text-xs text-muted-foreground">Rating</div>
									</div>
								</div>

								{selectedDonor.lastDonation && (
									<div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
										<Calendar className="h-3 w-3 text-muted-foreground flex-shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium">Last Donation</p>
											<p className="text-xs text-muted-foreground">{selectedDonor.lastDonation}</p>
										</div>
									</div>
								)}

								{selectedDonor.schedule && (
									<div className="flex items-center space-x-2 p-2 bg-muted/30 rounded-lg">
										<Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
										<div className="min-w-0 flex-1">
											<p className="text-xs font-medium">Preferred Contact Time</p>
											<p className="text-xs text-muted-foreground capitalize">{selectedDonor.schedule}</p>
										</div>
									</div>
								)}
							</div>

							{selectedDonor.emergencyContact && (
								<div className="p-2 bg-destructive/10 border border-destructive/20 rounded-lg">
									<div className="flex items-center space-x-2 text-destructive">
										<Phone className="h-3 w-3 flex-shrink-0" />
										<span className="text-xs font-medium">Emergency Contact Available</span>
									</div>
									<p className="text-xs text-muted-foreground mt-1">
										This donor is available for emergency blood requests
									</p>
								</div>
							)}
						</div>
					)}

					{/* Action Buttons - Fixed at bottom */}
					{selectedDonor && (
						<div className="flex space-x-2 pt-3 border-t flex-shrink-0">
							<Button
								className="flex-1 h-8 text-xs"
								onClick={() => window.open(`tel:${selectedDonor.phone}`)}
							>
								<Phone className="h-3 w-3 mr-1" />
								Call
							</Button>
							<Button
								variant="outline"
								className="flex-1 h-8 text-xs"
								onClick={() => window.open(`sms:${selectedDonor.phone}`)}
							>
								<MessageCircle className="h-3 w-3 mr-1" />
								SMS
							</Button>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default FindDonorsPage;