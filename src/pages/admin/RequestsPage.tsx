
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Clock, CheckCircle, XCircle, Calendar, Eye, User, Phone, Mail, AlertTriangle } from 'lucide-react';
import { adminBloodRequestAPI, AdminBloodRequest } from '@/services/adminBloodRequestAPI';
import { useToast } from '@/hooks/use-toast';
import BloodLoading from '@/components/ui/blood-loading';

// Request Details Dialog Component
const RequestDetailsDialog = ({
	request,
	onStatusUpdate,
	adminMessage,
	setAdminMessage,
	adminNotes,
	setAdminNotes,
	actionLoading,
	getUrgencyBadge,
	getStatusBadge
}: {
	request: AdminBloodRequest;
	onStatusUpdate: (requestId: string, status: 'fulfilled' | 'cancelled' | 'partially-fulfilled') => Promise<void>;
	adminMessage: string;
	setAdminMessage: (message: string) => void;
	adminNotes: string;
	setAdminNotes: (notes: string) => void;
	actionLoading: boolean;
	getUrgencyBadge: (urgency: string) => JSX.Element;
	getStatusBadge: (status: string) => JSX.Element;
}) => {
	return (
		<div className="space-y-4 sm:space-y-6">
			{/* Patient Information */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center text-sm sm:text-base">
							<User className="h-4 w-4 mr-2" />
							Patient Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 sm:space-y-3">
						<div>
							<Label className="text-xs sm:text-sm font-medium">Name</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-words">{request.patient.name}</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Age</Label>
							<p className="text-xs sm:text-sm text-muted-foreground">{request.patient.age} years</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Blood Type</Label>
							<Badge variant="outline" className="bg-red-50 text-red-700 text-xs">
								{request.patient.bloodType}
							</Badge>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Contact</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-all">{request.patient.contactNumber}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="flex items-center text-sm sm:text-base">
							<Phone className="h-4 w-4 mr-2" />
							Requester Information
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 sm:space-y-3">
						<div>
							<Label className="text-xs sm:text-sm font-medium">Name</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-words">
								{request.requester.firstName} {request.requester.lastName}
							</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Email</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-all">{request.requester.email}</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Phone</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-all">{request.requester.phone}</p>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Hospital & Requirement Info */}
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
				<Card>
					<CardHeader>
						<CardTitle className="text-sm sm:text-base">Hospital Information</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 sm:space-y-3">
						<div>
							<Label className="text-xs sm:text-sm font-medium">Hospital</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-words">{request.hospital.name}</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Address</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-words">{request.hospital.address}</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Doctor</Label>
							<p className="text-xs sm:text-sm text-muted-foreground break-words">Dr. {request.hospital.doctorName}</p>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle className="text-sm sm:text-base">Blood Requirement</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 sm:space-y-3">
						<div>
							<Label className="text-xs sm:text-sm font-medium">Units Needed</Label>
							<p className="text-xs sm:text-sm text-muted-foreground">{request.bloodRequirement.units} units</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Urgency</Label>
							<div>{getUrgencyBadge(request.bloodRequirement.urgency)}</div>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Required By</Label>
							<p className="text-xs sm:text-sm text-muted-foreground">
								{new Date(request.bloodRequirement.requiredBy).toLocaleDateString()}
							</p>
						</div>
						<div>
							<Label className="text-xs sm:text-sm font-medium">Status</Label>
							<div>{getStatusBadge(request.status)}</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Admin Actions */}
			{request.status === 'pending' && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm sm:text-base">Admin Actions</CardTitle>
						<CardDescription className="text-xs sm:text-sm">
							Update the status of this blood request and provide feedback to the requester
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-3 sm:space-y-4">
						<div>
							<Label htmlFor="adminMessage" className="text-xs sm:text-sm font-medium">Message to Requester</Label>
							<Textarea
								id="adminMessage"
								placeholder="Enter a message for the requester..."
								value={adminMessage}
								onChange={(e) => setAdminMessage(e.target.value)}
								className="mt-1 text-xs sm:text-sm"
								rows={3}
							/>
						</div>
						<div>
							<Label htmlFor="adminNotes" className="text-xs sm:text-sm font-medium">Internal Notes</Label>
							<Textarea
								id="adminNotes"
								placeholder="Add internal notes (not visible to requester)..."
								value={adminNotes}
								onChange={(e) => setAdminNotes(e.target.value)}
								className="mt-1 text-xs sm:text-sm"
								rows={3}
							/>
						</div>
						<div className="flex flex-col sm:flex-row gap-2">
							<Button
								onClick={() => onStatusUpdate(request._id, 'fulfilled')}
								disabled={actionLoading}
								className="bg-green-600 hover:bg-green-700 text-xs sm:text-sm"
								size="sm"
							>
								<CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
								<span className="hidden sm:inline">Fulfill Request</span>
								<span className="sm:hidden">Fulfill</span>
							</Button>
							<Button
								onClick={() => onStatusUpdate(request._id, 'partially-fulfilled')}
								disabled={actionLoading}
								variant="outline"
								className="text-xs sm:text-sm"
								size="sm"
							>
								<span className="hidden sm:inline">Partially Fulfill</span>
								<span className="sm:hidden">Partial</span>
							</Button>
							<Button
								onClick={() => onStatusUpdate(request._id, 'cancelled')}
								disabled={actionLoading}
								variant="destructive"
								className="text-xs sm:text-sm"
								size="sm"
							>
								<XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
								<span className="hidden sm:inline">Decline Request</span>
								<span className="sm:hidden">Decline</span>
							</Button>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Display admin feedback if exists */}
			{(request.adminMessage || request.adminNotes) && (
				<Card>
					<CardHeader>
						<CardTitle className="text-sm sm:text-base">Admin Feedback</CardTitle>
					</CardHeader>
					<CardContent className="space-y-2 sm:space-y-3">
						{request.adminMessage && (
							<div>
								<Label className="text-xs sm:text-sm font-medium">Message to Requester</Label>
								<p className="text-xs sm:text-sm text-muted-foreground break-words">{request.adminMessage}</p>
							</div>
						)}
						{request.adminNotes && (
							<div>
								<Label className="text-xs sm:text-sm font-medium">Internal Notes</Label>
								<p className="text-xs sm:text-sm text-muted-foreground break-words">{request.adminNotes}</p>
							</div>
						)}
						{request.processedBy && (
							<div>
								<Label className="text-xs sm:text-sm font-medium">Processed By</Label>
								<p className="text-xs sm:text-sm text-muted-foreground break-words">
									{request.processedBy.firstName} {request.processedBy.lastName} on{' '}
									{new Date(request.processedAt!).toLocaleDateString()}
								</p>
							</div>
						)}
					</CardContent>
				</Card>
			)}
		</div>
	);
};

const RequestsPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState('');
	const [urgencyFilter, setUrgencyFilter] = useState('');
	const [bloodTypeFilter, setBloodTypeFilter] = useState('');
	const [requests, setRequests] = useState<AdminBloodRequest[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRequest, setSelectedRequest] = useState<AdminBloodRequest | null>(null);
	const [actionLoading, setActionLoading] = useState(false);
	const [adminMessage, setAdminMessage] = useState('');
	const [adminNotes, setAdminNotes] = useState('');
	const { toast } = useToast();

	const fetchRequests = useCallback(async () => {
		setLoading(true);
		try {
			const result = await adminBloodRequestAPI.getAll({
				status: statusFilter || undefined,
				urgency: urgencyFilter || undefined,
				bloodType: bloodTypeFilter || undefined,
				limit: 50
			});

			if (result.success) {
				setRequests(result.data?.requests || []);
			} else {
				toast({
					title: "Error",
					description: result.error || "Failed to fetch blood requests",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error('Error fetching blood requests:', error);
			toast({
				title: "Error",
				description: "Failed to fetch blood requests",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	}, [statusFilter, urgencyFilter, bloodTypeFilter, toast]);

	// Fetch blood requests on component mount
	useEffect(() => {
		fetchRequests();
	}, [fetchRequests]);

	const handleStatusUpdate = async (
		requestId: string,
		newStatus: 'fulfilled' | 'cancelled' | 'partially-fulfilled'
	) => {
		setActionLoading(true);
		try {
			const result = await adminBloodRequestAPI.updateStatus(
				requestId,
				newStatus,
				adminMessage || undefined,
				adminNotes || undefined
			);

			if (result.success) {
				toast({
					title: "Success",
					description: `Blood request ${newStatus} successfully`,
				});

				// Refresh the requests list
				await fetchRequests();

				// Reset form
				setAdminMessage('');
				setAdminNotes('');
				setSelectedRequest(null);
			} else {
				toast({
					title: "Error",
					description: result.error || `Failed to ${newStatus} blood request`,
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error('Error updating blood request status:', error);
			toast({
				title: "Error",
				description: `Failed to ${newStatus} blood request`,
				variant: "destructive",
			});
		} finally {
			setActionLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status.toLowerCase()) {
			case 'pending':
				return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
			case 'fulfilled':
				return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Fulfilled</Badge>;
			case 'cancelled':
				return <Badge className="bg-red-100 text-red-800"><XCircle className="w-3 h-3 mr-1" />Cancelled</Badge>;
			case 'partially-fulfilled':
				return <Badge className="bg-blue-100 text-blue-800"><CheckCircle className="w-3 h-3 mr-1" />Partially Fulfilled</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const getUrgencyBadge = (urgency: string) => {
		switch (urgency.toLowerCase()) {
			case 'critical':
				return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Critical</Badge>;
			case 'high':
				return <Badge className="bg-orange-100 text-orange-800">High</Badge>;
			case 'medium':
				return <Badge className="bg-blue-100 text-blue-800">Medium</Badge>;
			case 'low':
				return <Badge className="bg-green-100 text-green-800">Low</Badge>;
			default:
				return <Badge variant="secondary">{urgency}</Badge>;
		}
	};

	const pendingRequests = requests.filter(req => req.status === 'pending');
	const fulfilledRequests = requests.filter(req => req.status === 'fulfilled');

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Blood Requests</h1>
				<Button>
					Create New Request
				</Button>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Requests</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{requests.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Pending</CardTitle>
						<Clock className="h-4 w-4 text-yellow-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-yellow-600">{pendingRequests.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Fulfilled</CardTitle>
						<CheckCircle className="h-4 w-4 text-green-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-green-600">{fulfilledRequests.length}</div>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
						<XCircle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">1</div>
					</CardContent>
				</Card>
			</div>

			<Tabs defaultValue="all" className="space-y-4">
				<TabsList>
					<TabsTrigger value="all">All Requests</TabsTrigger>
					<TabsTrigger value="pending">Pending</TabsTrigger>
					<TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
				</TabsList>

				<TabsContent value="all" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle>All Blood Requests</CardTitle>
							<div className="flex items-center space-x-2">
								<Search className="h-4 w-4 text-muted-foreground" />
								<Input
									placeholder="Search requests..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="max-w-sm"
								/>
							</div>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Patient</TableHead>
										<TableHead>Blood Type</TableHead>
										<TableHead>Units</TableHead>
										<TableHead>Hospital</TableHead>
										<TableHead>Date</TableHead>
										<TableHead>Urgency</TableHead>
										<TableHead>Status</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{loading ? (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-8">
												<BloodLoading />
											</TableCell>
										</TableRow>
									) : requests.length === 0 ? (
										<TableRow>
											<TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
												No blood requests found
											</TableCell>
										</TableRow>
									) : (
										requests.map((request) => (
											<TableRow key={request._id}>
												<TableCell className="font-medium">{request.patient.name}</TableCell>
												<TableCell>
													<Badge variant="outline" className="bg-red-50 text-red-700">
														{request.patient.bloodType}
													</Badge>
												</TableCell>
												<TableCell>{request.bloodRequirement.units}</TableCell>
												<TableCell>{request.hospital.name}</TableCell>
												<TableCell>
													<div className="flex items-center gap-1">
														<Calendar className="h-3 w-3" />
														{new Date(request.createdAt).toLocaleDateString()}
													</div>
												</TableCell>
												<TableCell>{getUrgencyBadge(request.bloodRequirement.urgency)}</TableCell>
												<TableCell>{getStatusBadge(request.status)}</TableCell>
												<TableCell>
													<div className="flex items-center space-x-2">
														<Dialog>
															<DialogTrigger asChild>
																<Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
																	<Eye className="h-3 w-3 mr-1" />
																	View
																</Button>
															</DialogTrigger>
															<DialogContent className="w-[95vw] max-w-4xl h-[90vh] sm:h-[85vh] md:h-[80vh] overflow-y-auto p-4 sm:p-6">
																<DialogHeader>
																	<DialogTitle className="text-base sm:text-lg">Blood Request Details</DialogTitle>
																	<DialogDescription className="text-sm">
																		View and manage blood request from {request.patient.name}
																	</DialogDescription>
																</DialogHeader>
																{selectedRequest && (
																	<RequestDetailsDialog
																		request={selectedRequest}
																		onStatusUpdate={handleStatusUpdate}
																		adminMessage={adminMessage}
																		setAdminMessage={setAdminMessage}
																		adminNotes={adminNotes}
																		setAdminNotes={setAdminNotes}
																		actionLoading={actionLoading}
																		getUrgencyBadge={getUrgencyBadge}
																		getStatusBadge={getStatusBadge}
																	/>
																)}
															</DialogContent>
														</Dialog>
														{request.status === 'pending' && (
															<Button
																size="sm"
																onClick={() => handleStatusUpdate(request._id, 'fulfilled')}
																disabled={actionLoading}
															>
																<CheckCircle className="h-3 w-3 mr-1" />
																Fulfill
															</Button>
														)}
													</div>
												</TableCell>
											</TableRow>
										))
									)}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="pending">
					<Card>
						<CardHeader>
							<CardTitle>Pending Requests</CardTitle>
							<CardDescription>Requests waiting for blood donors</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Patient</TableHead>
										<TableHead>Blood Type</TableHead>
										<TableHead>Units</TableHead>
										<TableHead>Hospital</TableHead>
										<TableHead>Urgency</TableHead>
										<TableHead>Actions</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{pendingRequests.map((request) => (
										<TableRow key={request._id}>
											<TableCell className="font-medium">{request.patient.name}</TableCell>
											<TableCell>
												<Badge variant="outline" className="bg-red-50 text-red-700">
													{request.patient.bloodType}
												</Badge>
											</TableCell>
											<TableCell>{request.bloodRequirement.units}</TableCell>
											<TableCell>{request.hospital.name}</TableCell>
											<TableCell>{getUrgencyBadge(request.bloodRequirement.urgency)}</TableCell>
											<TableCell>
												<Button size="sm">
													Find Donors
												</Button>
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>

				<TabsContent value="fulfilled">
					<Card>
						<CardHeader>
							<CardTitle>Fulfilled Requests</CardTitle>
							<CardDescription>Successfully completed blood requests</CardDescription>
						</CardHeader>
						<CardContent>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead>Patient</TableHead>
										<TableHead>Blood Type</TableHead>
										<TableHead>Units</TableHead>
										<TableHead>Hospital</TableHead>
										<TableHead>Completion Date</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{fulfilledRequests.map((request) => (
										<TableRow key={request._id}>
											<TableCell className="font-medium">{request.patient.name}</TableCell>
											<TableCell>
												<Badge variant="outline" className="bg-red-50 text-red-700">
													{request.patient.bloodType}
												</Badge>
											</TableCell>
											<TableCell>{request.bloodRequirement.units}</TableCell>
											<TableCell>{request.hospital.name}</TableCell>
											<TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default RequestsPage;
