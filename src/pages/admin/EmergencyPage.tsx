import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import emergencyAPI from '@/services/emergencyAPI';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Clock, Phone, MapPin, Send, Package, Eye, CheckCircle, Loader2, User, Hospital, Calendar } from 'lucide-react';

interface EmergencyRequestData {
	_id: string;
	patient: {
		name: string;
		age: number;
		gender: string;
		bloodType: string;
		contactNumber: string;
	};
	emergency: {
		type: string;
		severity: string;
		description: string;
		timeOfIncident: string;
	};
	hospital: {
		name: string;
		address: string;
		city: string;
		area: string;
		contactNumber: string;
		emergencyDepartment: string;
		doctorInCharge: {
			name: string;
		};
	};
	bloodRequirement: {
		units: number;
		requiredWithin: number;
	};
	status: string;
	priority: number;
	createdAt: string;
	updatedAt: string;
	requester: string;
}

const EmergencyPage = () => {
	const [emergencyRequests, setEmergencyRequests] = useState<EmergencyRequestData[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedRequest, setSelectedRequest] = useState<EmergencyRequestData | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [isUpdating, setIsUpdating] = useState(false);
	const { toast } = useToast();

	useEffect(() => {
		const loadData = async () => {
			setLoading(true);
			try {
				const response = await emergencyAPI.getEmergencyRequests({
					status: 'active'
				});

				if (response.success && Array.isArray(response.data)) {
					setEmergencyRequests(response.data);
				} else {
					toast({
						title: "Error",
						description: "Failed to fetch emergency requests",
						variant: "destructive",
					});
				}
			} catch (error) {
				toast({
					title: "Error",
					description: "Failed to load emergency data",
					variant: "destructive",
				});
			} finally {
				setLoading(false);
			}
		};

		loadData();
	}, [toast]);

	const updateEmergencyStatus = async (emergencyId: string, newStatus: string) => {
		setIsUpdating(true);
		try {
			// This would need a backend endpoint for updating emergency status
			// For now, we'll simulate the update
			setEmergencyRequests(prev =>
				prev.map(req =>
					req._id === emergencyId
						? { ...req, status: newStatus }
						: req
				)
			);

			toast({
				title: "Status Updated",
				description: `Emergency marked as ${newStatus}`,
			});
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to update emergency status",
				variant: "destructive",
			});
		} finally {
			setIsUpdating(false);
		}
	};

	const calculateStats = () => {
		const activeEmergencies = emergencyRequests.filter(req => req.status === 'active');
		const criticalCases = activeEmergencies.filter(req => req.emergency?.severity === 'critical');
		const totalUnits = activeEmergencies.reduce((sum, req) => sum + (req.bloodRequirement?.units || 0), 0);

		return {
			activeCount: activeEmergencies.length,
			criticalCount: criticalCases.length,
			totalUnits,
			avgResponseTime: "15 min" // This would be calculated from real data
		};
	};

	const calculateTimeRemaining = (requiredWithin: number, createdAt: string) => {
		const created = new Date(createdAt);
		const deadline = new Date(created.getTime() + requiredWithin * 60 * 60 * 1000);
		const now = new Date();
		const diff = deadline.getTime() - now.getTime();

		if (diff <= 0) return "Expired";

		const hours = Math.floor(diff / (1000 * 60 * 60));
		const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

		if (hours > 0) return `${hours}h ${minutes}m`;
		return `${minutes}m`;
	};

	const getPriorityFromSeverity = (severity: string): string => {
		switch (severity) {
			case 'critical': return 'Critical';
			case 'severe': return 'High';
			case 'moderate': return 'Medium';
			default: return 'Low';
		}
	};

	const getPriorityBadge = (severity: string) => {
		const priority = getPriorityFromSeverity(severity);
		switch (priority) {
			case 'Critical':
				return <Badge variant="destructive" className="animate-pulse">
					<AlertTriangle className="w-3 h-3 mr-1" />Critical
				</Badge>;
			case 'High':
				return <Badge className="bg-orange-100 text-orange-800">
					<AlertTriangle className="w-3 h-3 mr-1" />High
				</Badge>;
			case 'Medium':
				return <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>;
			default:
				return <Badge variant="secondary">{priority}</Badge>;
		}
	};

	const stats = calculateStats();

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<AlertTriangle className="h-8 w-8 text-red-600" />
					<h1 className="text-3xl font-bold">Emergency Management</h1>
				</div>
				<Button variant="destructive">
					<Send className="mr-2 h-4 w-4" />
					Send Alert
				</Button>
			</div>

			{/* Emergency Stats */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card className="border-red-200">
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Active Emergencies</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.activeCount}</div>
						<p className="text-xs text-muted-foreground">Requiring immediate attention</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
						<Clock className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats.criticalCount}</div>
						<p className="text-xs text-muted-foreground">Less than 3 hours</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Units Needed</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.totalUnits}</div>
						<p className="text-xs text-muted-foreground">Total units required</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Response Time</CardTitle>
						<Clock className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats.avgResponseTime}</div>
						<p className="text-xs text-muted-foreground">Average response</p>
					</CardContent>
				</Card>
			</div>

			{/* Emergency Requests Table */}
			<Card>
				<CardHeader>
					<CardTitle>Active Emergency Requests</CardTitle>
					<CardDescription>All current emergency blood requests requiring immediate attention</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Priority</TableHead>
								<TableHead>Hospital</TableHead>
								<TableHead>Patient</TableHead>
								<TableHead>Blood Type</TableHead>
								<TableHead>Units Needed</TableHead>
								<TableHead>Time Left</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Contact</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{loading ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center py-8">
										<Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
										Loading emergency requests...
									</TableCell>
								</TableRow>
							) : emergencyRequests.length === 0 ? (
								<TableRow>
									<TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
										No active emergency requests
									</TableCell>
								</TableRow>
							) : (
								emergencyRequests.map((request) => (
									<TableRow
										key={request._id}
										className={request.emergency.severity === 'critical' ? 'bg-red-50' : ''}
									>
										<TableCell>{getPriorityBadge(request.emergency.severity)}</TableCell>
										<TableCell className="font-medium">{request.hospital.name}</TableCell>
										<TableCell>{request.patient.name}</TableCell>
										<TableCell>
											<Badge variant="outline" className="bg-red-50 text-red-700">
												{request.patient.bloodType}
											</Badge>
										</TableCell>
										<TableCell className="font-bold">{request.bloodRequirement.units} units</TableCell>
										<TableCell>
											<div className="flex items-center gap-1 text-red-600 font-medium">
												<Clock className="h-3 w-3" />
												{calculateTimeRemaining(request.bloodRequirement.requiredWithin, request.createdAt)}
											</div>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-1">
												<MapPin className="h-3 w-3" />
												{request.hospital.city}, {request.hospital.area}
											</div>
										</TableCell>
										<TableCell>
											<Button
												variant="outline"
												size="sm"
												onClick={() => window.open(`tel:${request.hospital.contactNumber}`, '_self')}
											>
												<Phone className="h-3 w-3 mr-1" />
												Call
											</Button>
										</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<Button
													size="sm"
													variant="destructive"
													onClick={() => {
														toast({
															title: "Alert Sent",
															description: "Donors have been notified about this emergency",
														});
													}}
												>
													Alert Donors
												</Button>
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														setSelectedRequest(request);
														setIsDetailsOpen(true);
													}}
												>
													<Eye className="h-3 w-3 mr-1" />
													Details
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Emergency Details Modal */}
			<Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="flex items-center gap-2">
							<AlertTriangle className="h-5 w-5 text-red-600" />
							Emergency Request Details
						</DialogTitle>
						<DialogDescription>
							Complete information about the emergency blood request
						</DialogDescription>
					</DialogHeader>

					{selectedRequest && (
						<div className="space-y-6">
							{/* Status Update Section */}
							<Card className="border-red-200 bg-red-50">
								<CardHeader>
									<CardTitle className="text-red-800">Request Status</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="flex items-center justify-between">
										<div className="flex items-center gap-2">
											<span>Current Status:</span>
											<Badge variant={selectedRequest.status === 'active' ? 'destructive' : 'default'}>
												{selectedRequest.status.toUpperCase()}
											</Badge>
										</div>
										<div className="flex gap-2">
											<Select
												defaultValue={selectedRequest.status}
												onValueChange={(value) => updateEmergencyStatus(selectedRequest._id, value)}
												disabled={isUpdating}
											>
												<SelectTrigger className="w-40">
													<SelectValue />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="active">Active</SelectItem>
													<SelectItem value="fulfilled">Fulfilled</SelectItem>
													<SelectItem value="partial">Partially Fulfilled</SelectItem>
													<SelectItem value="cancelled">Cancelled</SelectItem>
												</SelectContent>
											</Select>
											<Button
												variant="outline"
												size="sm"
												disabled={isUpdating}
												onClick={() => updateEmergencyStatus(selectedRequest._id, 'fulfilled')}
											>
												{isUpdating ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
												Mark Complete
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Patient Information */}
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<User className="h-4 w-4" />
											Patient Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div>
											<label className="text-sm font-medium text-muted-foreground">Name</label>
											<p className="font-medium">{selectedRequest.patient.name}</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-muted-foreground">Age</label>
												<p className="font-medium">{selectedRequest.patient.age} years</p>
											</div>
											<div>
												<label className="text-sm font-medium text-muted-foreground">Gender</label>
												<p className="font-medium capitalize">{selectedRequest.patient.gender}</p>
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Blood Type</label>
											<div className="mt-1">
												<Badge variant="outline" className="bg-red-50 text-red-700 text-lg px-3 py-1">
													{selectedRequest.patient.bloodType}
												</Badge>
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Contact</label>
											<div className="flex items-center gap-2 mt-1">
												<p className="font-medium">{selectedRequest.patient.contactNumber}</p>
												<Button
													size="sm"
													variant="outline"
													onClick={() => window.open(`tel:${selectedRequest.patient.contactNumber}`, '_self')}
												>
													<Phone className="h-3 w-3" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<Hospital className="h-4 w-4" />
											Hospital Information
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-3">
										<div>
											<label className="text-sm font-medium text-muted-foreground">Hospital</label>
											<p className="font-medium">{selectedRequest.hospital.name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Address</label>
											<p className="text-sm">{selectedRequest.hospital.address}</p>
										</div>
										<div className="grid grid-cols-2 gap-4">
											<div>
												<label className="text-sm font-medium text-muted-foreground">City</label>
												<p className="font-medium">{selectedRequest.hospital.city}</p>
											</div>
											<div>
												<label className="text-sm font-medium text-muted-foreground">Area</label>
												<p className="font-medium">{selectedRequest.hospital.area}</p>
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Doctor in Charge</label>
											<p className="font-medium">{selectedRequest.hospital.doctorInCharge.name}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Emergency Dept</label>
											<div className="flex items-center gap-2 mt-1">
												<p className="font-medium">{selectedRequest.hospital.emergencyDepartment}</p>
												<Button
													size="sm"
													variant="outline"
													onClick={() => window.open(`tel:${selectedRequest.hospital.contactNumber}`, '_self')}
												>
													<Phone className="h-3 w-3" />
												</Button>
											</div>
										</div>
									</CardContent>
								</Card>
							</div>

							{/* Emergency Details */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<AlertTriangle className="h-4 w-4" />
										Emergency Details
									</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">Type</label>
											<p className="font-medium capitalize">{selectedRequest.emergency.type.replace('-', ' ')}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Severity</label>
											<div className="mt-1">
												{getPriorityBadge(selectedRequest.emergency.severity)}
											</div>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Time of Incident</label>
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												<p className="text-sm">{new Date(selectedRequest.emergency.timeOfIncident).toLocaleString()}</p>
											</div>
										</div>
									</div>
									<div>
										<label className="text-sm font-medium text-muted-foreground">Description</label>
										<p className="mt-1 p-3 bg-gray-50 rounded-md">{selectedRequest.emergency.description}</p>
									</div>
								</CardContent>
							</Card>

							{/* Blood Requirement */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2">
										<Package className="h-4 w-4" />
										Blood Requirement
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
										<div>
											<label className="text-sm font-medium text-muted-foreground">Units Needed</label>
											<p className="text-2xl font-bold text-red-600">{selectedRequest.bloodRequirement.units}</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Required Within</label>
											<p className="text-lg font-medium">{selectedRequest.bloodRequirement.requiredWithin} hours</p>
										</div>
										<div>
											<label className="text-sm font-medium text-muted-foreground">Time Remaining</label>
											<div className="flex items-center gap-1 text-red-600 font-medium">
												<Clock className="h-4 w-4" />
												<p className="text-lg">{calculateTimeRemaining(selectedRequest.bloodRequirement.requiredWithin, selectedRequest.createdAt)}</p>
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Action Buttons */}
							<div className="flex justify-end gap-3 pt-4">
								<Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
									Close
								</Button>
								<Button variant="destructive">
									<Send className="h-4 w-4 mr-2" />
									Broadcast to Donors
								</Button>
								<Button onClick={() => updateEmergencyStatus(selectedRequest._id, 'fulfilled')}>
									<CheckCircle className="h-4 w-4 mr-2" />
									Mark as Fulfilled
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default EmergencyPage;
