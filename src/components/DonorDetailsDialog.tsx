import React from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
	User,
	Phone,
	Mail,
	MapPin,
	Calendar,
	Droplets,
	Heart,
	Activity,
	CheckCircle,
	XCircle,
	Clock,
	UserCheck
} from 'lucide-react';
import { AdminDonor } from '@/services/adminApi';
import { format } from 'date-fns';

interface DonorDetailsDialogProps {
	donor: AdminDonor | null;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const DonorDetailsDialog: React.FC<DonorDetailsDialogProps> = ({
	donor,
	open,
	onOpenChange,
}) => {
	if (!donor) return null;

	const formatDate = (dateString: string) => {
		try {
			return format(new Date(dateString), 'PPP');
		} catch {
			return 'Invalid date';
		}
	};

	const getStatusIcon = (status: string, isActive: boolean) => {
		if (!isActive) return <XCircle className="h-4 w-4 text-red-500" />;
		if (status === 'Available') return <CheckCircle className="h-4 w-4 text-green-500" />;
		return <Clock className="h-4 w-4 text-yellow-500" />;
	};

	const getStatusColor = (status: string, isActive: boolean) => {
		if (!isActive) return 'bg-red-100 text-red-800 border-red-200';
		if (status === 'Available') return 'bg-green-100 text-green-800 border-green-200';
		return 'bg-yellow-100 text-yellow-800 border-yellow-200';
	};

	const getVerificationBadge = (isVerified: boolean) => {
		return isVerified ? (
			<Badge className="bg-blue-100 text-blue-800 border-blue-200">
				<UserCheck className="h-3 w-3 mr-1" />
				Verified
			</Badge>
		) : (
			<Badge variant="outline" className="bg-gray-100 text-gray-600">
				<Clock className="h-3 w-3 mr-1" />
				Pending Verification
			</Badge>
		);
	};

	const getDonationStatus = () => {
		if (donor.totalDonations === 0) {
			return { text: 'New Donor', color: 'bg-blue-100 text-blue-800' };
		} else if (donor.totalDonations >= 10) {
			return { text: 'Regular Donor', color: 'bg-green-100 text-green-800' };
		} else if (donor.totalDonations >= 5) {
			return { text: 'Active Donor', color: 'bg-orange-100 text-orange-800' };
		} else {
			return { text: 'Occasional Donor', color: 'bg-gray-100 text-gray-600' };
		}
	};

	const donationStatus = getDonationStatus();

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<User className="h-5 w-5" />
						Donor Profile - {donor.firstName} {donor.lastName}
					</DialogTitle>
					<DialogDescription>
						Complete information about this blood donor
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* Status Badges */}
					<div className="flex flex-wrap gap-2">
						<Badge className={getStatusColor(donor.status, donor.isActive)}>
							{getStatusIcon(donor.status, donor.isActive)}
							<span className="ml-1">
								{donor.isActive ? donor.status : 'Inactive'}
							</span>
						</Badge>
						{getVerificationBadge(donor.isVerified)}
						<Badge className={donationStatus.color}>
							<Heart className="h-3 w-3 mr-1" />
							{donationStatus.text}
						</Badge>
						<Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
							<Droplets className="h-3 w-3 mr-1" />
							{donor.bloodType}
						</Badge>
					</div>

					<Separator />

					{/* Personal Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<User className="h-5 w-5" />
							Personal Information
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<User className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Full Name:</span>
								</div>
								<p className="pl-6">{donor.firstName} {donor.lastName}</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Mail className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Email:</span>
								</div>
								<p className="pl-6 break-all">{donor.email}</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Phone className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Phone:</span>
								</div>
								<p className="pl-6">{donor.phone}</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<MapPin className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Location:</span>
								</div>
								<p className="pl-6">{donor.location.area}, {donor.location.city}</p>
							</div>
						</div>
					</div>

					<Separator />

					{/* Donation Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Heart className="h-5 w-5" />
							Donation History
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div className="text-center p-4 bg-red-50 rounded-lg border">
								<div className="text-2xl font-bold text-red-600">{donor.totalDonations}</div>
								<div className="text-sm text-red-700">Total Donations</div>
							</div>

							<div className="text-center p-4 bg-blue-50 rounded-lg border">
								<div className="text-2xl font-bold text-blue-600">{donor.bloodType}</div>
								<div className="text-sm text-blue-700">Blood Type</div>
							</div>

							<div className="text-center p-4 bg-green-50 rounded-lg border">
								<div className="text-2xl font-bold text-green-600">
									{donor.isAvailableDonor ? 'Yes' : 'No'}
								</div>
								<div className="text-sm text-green-700">Available to Donate</div>
							</div>
						</div>

						<div className="space-y-2">
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-muted-foreground" />
								<span className="font-medium">Last Donation:</span>
							</div>
							<p className="pl-6">
								{donor.lastDonation ? formatDate(donor.lastDonation) : 'No donations recorded'}
							</p>
						</div>
					</div>

					<Separator />

					{/* Account Information */}
					<div className="space-y-4">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Activity className="h-5 w-5" />
							Account Information
						</h3>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Calendar className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Member Since:</span>
								</div>
								<p className="pl-6">{formatDate(donor.createdAt)}</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Activity className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Last Login:</span>
								</div>
								<p className="pl-6">
									{donor.lastLogin ? formatDate(donor.lastLogin) : 'Never logged in'}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<CheckCircle className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Account Status:</span>
								</div>
								<p className="pl-6">
									{donor.isActive ? 'Active' : 'Inactive'} • {donor.isVerified ? 'Verified' : 'Unverified'}
								</p>
							</div>

							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Heart className="h-4 w-4 text-muted-foreground" />
									<span className="font-medium">Donor ID:</span>
								</div>
								<p className="pl-6 font-mono text-sm">{donor._id}</p>
							</div>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-2 pt-4">
					<Button variant="outline" onClick={() => onOpenChange(false)}>
						Close
					</Button>
					<Button>
						<Phone className="h-4 w-4 mr-2" />
						Contact Donor
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
};

export default DonorDetailsDialog;
