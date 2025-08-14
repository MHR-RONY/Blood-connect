
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Search, Calendar, MapPin, Phone, Eye } from 'lucide-react';
import BloodDropIcon from '@/components/BloodDropIcon';
import DonorDetailsDialog from '@/components/DonorDetailsDialog';
import { adminApi, AdminDonor, BloodTypeStats } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import BloodLoading from '@/components/ui/blood-loading';

const DonorsPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [donors, setDonors] = useState<AdminDonor[]>([]);
	const [bloodTypeStats, setBloodTypeStats] = useState<BloodTypeStats>({});
	const [loading, setLoading] = useState(false);
	const [selectedDonor, setSelectedDonor] = useState<AdminDonor | null>(null);
	const [donorDetailsOpen, setDonorDetailsOpen] = useState(false);
	const [pagination, setPagination] = useState({
		page: 1,
		total: 0,
		totalPages: 0
	});
	const { toast } = useToast();

	// Fetch donors from API
	const fetchDonors = useCallback(async (page: number = 1, search?: string) => {
		try {
			setLoading(true);
			const response = await adminApi.getDonors({
				page,
				limit: 10,
				search: search || undefined
			});

			if (response.success) {
				setDonors(response.data.donors);
				setBloodTypeStats(response.data.bloodTypeStats);
				setPagination({
					page: response.data.page,
					total: response.data.total,
					totalPages: response.data.totalPages
				});
			} else {
				toast({
					title: "Error",
					description: "Failed to fetch donors",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error('Error fetching donors:', error);
			toast({
				title: "Error",
				description: "Failed to fetch donors",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [toast]);

	// Search donors with debounce
	useEffect(() => {
		const timeoutId = setTimeout(() => {
			fetchDonors(1, searchTerm);
		}, 500);

		return () => clearTimeout(timeoutId);
	}, [searchTerm, fetchDonors]);

	// Initial load
	useEffect(() => {
		fetchDonors();
	}, [fetchDonors]);

	// Handle view donor details
	const handleViewDonor = (donor: AdminDonor) => {
		setSelectedDonor(donor);
		setDonorDetailsOpen(true);
	};

	// Handle contact donor
	const handleContactDonor = (donor: AdminDonor) => {
		// Create a mailto link
		const subject = encodeURIComponent('Blood Donation Request');
		const body = encodeURIComponent(`Dear ${donor.firstName} ${donor.lastName},\n\nWe hope this message finds you well. We are reaching out regarding a blood donation opportunity.\n\nBest regards,\nBlood Connect Team`);
		const mailtoLink = `mailto:${donor.email}?subject=${subject}&body=${body}`;

		// Open the default email client
		window.open(mailtoLink, '_blank');

		toast({
			title: 'Email Client Opened',
			description: `Opening email to contact ${donor.firstName} ${donor.lastName}`,
		});
	};

	const getStatusBadge = (donor: AdminDonor) => {
		if (!donor.isActive) {
			return <Badge variant="secondary">Inactive</Badge>;
		}
		return donor.isAvailableDonor ?
			<Badge className="bg-green-100 text-green-800">Available</Badge> :
			<Badge variant="secondary">Unavailable</Badge>;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	const getFullName = (donor: AdminDonor) => {
		return `${donor.firstName} ${donor.lastName}`;
	};

	const getLocation = (donor: AdminDonor) => {
		return `${donor.location.area}, ${donor.location.city}`;
	};

	if (loading && donors.length === 0) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<BloodLoading />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Donor Management</h1>
				<Button>
					<BloodDropIcon size="sm" className="mr-2" />
					Send Donation Request
				</Button>
			</div>

			{/* Blood Type Statistics */}
			<Card>
				<CardHeader>
					<CardTitle>Blood Type Distribution</CardTitle>
					<CardDescription>Available donors by blood type</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-4 md:grid-cols-8 gap-4">
						{['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bloodType) => (
							<div key={bloodType} className="text-center p-4 border rounded-lg">
								<div className="text-2xl font-bold text-red-600">{bloodType}</div>
								<div className="text-sm text-muted-foreground">
									{bloodTypeStats[bloodType] || 0} donors
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>All Donors</CardTitle>
					<CardDescription>
						Manage registered blood donors ({pagination.total} total donors)
					</CardDescription>
					<div className="flex items-center space-x-2">
						<Search className="h-4 w-4 text-muted-foreground" />
						<Input
							placeholder="Search donors..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="max-w-sm"
						/>
					</div>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="flex items-center justify-center py-8">
							<BloodLoading />
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Name</TableHead>
									<TableHead>Blood Type</TableHead>
									<TableHead>Location</TableHead>
									<TableHead>Last Donation</TableHead>
									<TableHead>Total Donations</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Contact</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{donors.length > 0 ? (
									donors.map((donor) => (
										<TableRow key={donor._id}>
											<TableCell className="font-medium">
												{getFullName(donor)}
											</TableCell>
											<TableCell>
												<Badge variant="outline" className="bg-red-50 text-red-700">
													{donor.bloodType}
												</Badge>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<MapPin className="h-3 w-3" />
													{getLocation(donor)}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Calendar className="h-3 w-3" />
													{donor.lastDonation ? formatDate(donor.lastDonation) : 'No recent donation'}
												</div>
											</TableCell>
											<TableCell>{donor.totalDonations || 0}</TableCell>
											<TableCell>{getStatusBadge(donor)}</TableCell>
											<TableCell>
												<div className="flex items-center gap-1">
													<Phone className="h-3 w-3" />
													{donor.phone}
												</div>
											</TableCell>
											<TableCell>
												<div className="flex gap-2">
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleViewDonor(donor)}
													>
														<Eye className="h-4 w-4 mr-1" />
														View
													</Button>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleContactDonor(donor)}
													>
														Contact
													</Button>
												</div>
											</TableCell>
										</TableRow>
									))
								) : (
									<TableRow>
										<TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
											No donors found
										</TableCell>
									</TableRow>
								)}
							</TableBody>
						</Table>
					)}

					{/* Pagination */}
					{pagination.totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-muted-foreground">
								Showing {donors.length} of {pagination.total} donors
							</div>
							<div className="flex gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchDonors(pagination.page - 1, searchTerm)}
									disabled={pagination.page === 1 || loading}
								>
									Previous
								</Button>
								<span className="flex items-center px-3 text-sm">
									Page {pagination.page} of {pagination.totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchDonors(pagination.page + 1, searchTerm)}
									disabled={pagination.page === pagination.totalPages || loading}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Donor Details Dialog */}
			<DonorDetailsDialog
				donor={selectedDonor}
				open={donorDetailsOpen}
				onOpenChange={setDonorDetailsOpen}
			/>
		</div>
	);
};

export default DonorsPage;
