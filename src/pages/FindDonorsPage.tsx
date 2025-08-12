import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
	Navigation
} from "lucide-react";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";
import BloodDropIcon from "@/components/BloodDropIcon";

const FindDonorsPage = () => {
	const [filters, setFilters] = useState({
		bloodType: "",
		location: { city: "", area: "" },
		availability: "any",
		searchRadius: "10",
		searchQuery: ""
	});

	const [donors] = useState([
		{
			id: 1,
			name: "Sarah Johnson",
			bloodType: "O+",
			location: "Downtown, New York",
			distance: "2.3 km",
			lastDonation: "2024-01-15",
			totalDonations: 15,
			rating: 4.9,
			availability: "Available",
			phone: "+1 (555) 123-4567",
			email: "sarah.j@email.com",
			verified: true,
			emergencyContact: true
		},
		{
			id: 2,
			name: "Michael Chen",
			bloodType: "A+",
			location: "Midtown, New York",
			distance: "3.7 km",
			lastDonation: "2024-02-01",
			totalDonations: 8,
			rating: 4.7,
			availability: "Available",
			phone: "+1 (555) 234-5678",
			email: "m.chen@email.com",
			verified: true,
			emergencyContact: false
		},
		{
			id: 3,
			name: "Emma Rodriguez",
			bloodType: "B+",
			location: "Brooklyn, New York",
			distance: "5.2 km",
			lastDonation: "2023-12-20",
			totalDonations: 22,
			rating: 5.0,
			availability: "Busy",
			phone: "+1 (555) 345-6789",
			email: "emma.r@email.com",
			verified: true,
			emergencyContact: true
		},
		{
			id: 4,
			name: "David Kim",
			bloodType: "AB+",
			location: "Queens, New York",
			distance: "7.8 km",
			lastDonation: "2024-01-30",
			totalDonations: 12,
			rating: 4.8,
			availability: "Available",
			phone: "+1 (555) 456-7890",
			email: "david.k@email.com",
			verified: false,
			emergencyContact: true
		},
		{
			id: 5,
			name: "Lisa Thompson",
			bloodType: "O-",
			location: "Manhattan, New York",
			distance: "4.1 km",
			lastDonation: "2024-02-10",
			totalDonations: 18,
			rating: 4.9,
			availability: "Available",
			phone: "+1 (555) 567-8901",
			email: "lisa.t@email.com",
			verified: true,
			emergencyContact: true
		},
		{
			id: 6,
			name: "Robert Wilson",
			bloodType: "A-",
			location: "Bronx, New York",
			distance: "9.5 km",
			lastDonation: "2024-01-05",
			totalDonations: 7,
			rating: 4.6,
			availability: "Available",
			phone: "+1 (555) 678-9012",
			email: "robert.w@email.com",
			verified: true,
			emergencyContact: false
		}
	]);

	const handleLocationChange = (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => {
		setFilters(prev => ({ ...prev, location }));
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
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default FindDonorsPage;