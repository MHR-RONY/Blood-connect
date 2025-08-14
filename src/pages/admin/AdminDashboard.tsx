
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, AlertTriangle, TrendingUp, Calendar, DollarSign, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { adminApi, AdminDashboardStats } from '@/services/adminApi';
import BloodDropIcon from '@/components/BloodDropIcon';
import BloodLoading from '@/components/ui/blood-loading';

const AdminDashboard = () => {
	const { toast } = useToast();
	const [dashboardData, setDashboardData] = useState<AdminDashboardStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [period, setPeriod] = useState(30);

	// Fetch dashboard data
	const fetchDashboardData = async () => {
		try {
			setIsLoading(true);
			const response = await adminApi.getDashboardStats(period);

			if (response.success && response.data) {
				setDashboardData(response.data);
			} else {
				throw new Error(response.message || 'Failed to fetch dashboard data');
			}
		} catch (error) {
			console.error('Dashboard fetch error:', error);
			toast({
				title: "Error Loading Dashboard",
				description: error instanceof Error ? error.message : "Failed to load dashboard data",
				variant: "destructive",
			});
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		fetchDashboardData();
	}, [period]); // eslint-disable-line react-hooks/exhaustive-deps

	// Format numbers for display
	const formatNumber = (num: number): string => {
		if (num >= 1000000) {
			return (num / 1000000).toFixed(1) + 'M';
		} else if (num >= 1000) {
			return (num / 1000).toFixed(1) + 'K';
		}
		return num.toString();
	};

	// Format currency
	const formatCurrency = (amount: number): string => {
		return `৳${formatNumber(amount)}`;
	};

	// Calculate percentage change (placeholder logic for now)
	const calculateChange = (current: number, total: number): string => {
		if (total === 0) return "+0%";
		const percentage = ((current / total) * 100);
		return `+${percentage.toFixed(1)}%`;
	};

	// Format relative time
	const formatRelativeTime = (dateString: string): string => {
		const date = new Date(dateString);
		const now = new Date();
		const diffInMs = now.getTime() - date.getTime();
		const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
		const diffInHours = Math.floor(diffInMinutes / 60);
		const diffInDays = Math.floor(diffInHours / 24);

		if (diffInMinutes < 60) {
			return `${diffInMinutes} minutes ago`;
		} else if (diffInHours < 24) {
			return `${diffInHours} hours ago`;
		} else {
			return `${diffInDays} days ago`;
		}
	};

	// Loading state
	if (isLoading) {
		return <BloodLoading message="Loading dashboard data" />;
	}

	if (!dashboardData) {
		return (
			<div className="flex items-center justify-center min-h-[400px]">
				<div className="text-center">
					<AlertTriangle className="w-8 h-8 text-destructive mx-auto mb-4" />
					<p className="text-muted-foreground">Failed to load dashboard data</p>
					<Button onClick={fetchDashboardData} className="mt-4">
						Try Again
					</Button>
				</div>
			</div>
		);
	}

	const stats = [
		{
			title: "Total Users",
			value: formatNumber(dashboardData.overview.totalUsers),
			change: calculateChange(dashboardData.overview.activeUsers, dashboardData.overview.totalUsers),
			icon: Users,
			color: "text-blue-600"
		},
		{
			title: "Active Donors",
			value: formatNumber(dashboardData.overview.activeUsers),
			change: `${dashboardData.overview.activeUsers}/${dashboardData.overview.totalUsers}`,
			icon: Droplets,
			color: "text-red-600"
		},
		{
			title: "Pending Requests",
			value: formatNumber(dashboardData.overview.pendingRequests),
			change: dashboardData.overview.pendingRequests > 0 ? "Needs attention" : "All clear",
			icon: ClipboardList,
			color: "text-yellow-600"
		},
		{
			title: "Emergency Cases",
			value: formatNumber(dashboardData.overview.activeEmergencies),
			change: dashboardData.overview.activeEmergencies > 0 ? "⚠️ Active" : "✅ None",
			icon: AlertTriangle,
			color: "text-orange-600"
		},
		{
			title: "Total Donations",
			value: formatNumber(dashboardData.overview.totalDonations),
			change: `Completed: ${dashboardData.overview.totalDonations}`,
			icon: DollarSign,
			color: "text-green-600"
		}
	];

	// Combine all recent activities
	const allRecentActivities = [
		...dashboardData.recentActivity.donations.map(donation => ({
			id: donation._id,
			action: "Blood donated",
			user: `${donation.donor.firstName} ${donation.donor.lastName}`,
			time: formatRelativeTime(donation.createdAt),
			type: "donation"
		})),
		...dashboardData.recentActivity.requests.map(request => ({
			id: request._id,
			action: `Blood request (${request.patient.bloodType})`,
			user: `${request.requester.firstName} ${request.requester.lastName}`,
			time: formatRelativeTime(request.createdAt),
			type: "request"
		})),
		...dashboardData.recentActivity.emergencies.map(emergency => ({
			id: emergency._id,
			action: `Emergency: ${emergency.patient.bloodType} needed`,
			user: `${emergency.requester.firstName} ${emergency.requester.lastName}`,
			time: formatRelativeTime(emergency.createdAt),
			type: "emergency"
		})),
		...dashboardData.recentUsers.map(user => ({
			id: user._id,
			action: "New user registered",
			user: `${user.firstName} ${user.lastName}`,
			time: formatRelativeTime(user.createdAt),
			type: "registration"
		}))
	].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold">Admin Dashboard</h1>
					<p className="text-muted-foreground mt-1">
						Showing data for the last {period} days
					</p>
				</div>
				<div className="flex items-center gap-2">
					<select
						value={period}
						onChange={(e) => setPeriod(Number(e.target.value))}
						className="px-3 py-2 border border-border rounded-md bg-background"
					>
						<option value={7}>Last 7 days</option>
						<option value={30}>Last 30 days</option>
						<option value={90}>Last 90 days</option>
						<option value={365}>Last year</option>
					</select>
					<Button>
						<Calendar className="mr-2 h-4 w-4" />
						Generate Report
					</Button>
				</div>
			</div>

			{/* Stats Cards */}
			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
				{stats.map((stat, index) => (
					<Card key={index}>
						<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
							<CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
							<stat.icon className={`h-4 w-4 ${stat.color}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{stat.value}</div>
							<p className="text-xs text-muted-foreground">
								<span className="flex items-center gap-1">
									<TrendingUp className="h-3 w-3" />
									{stat.change} from last month
								</span>
							</p>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
				{/* Recent Activities */}
				<Card className="col-span-4">
					<CardHeader>
						<CardTitle>Recent Activities</CardTitle>
						<CardDescription>Latest activities in the system</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{allRecentActivities.map((activity) => (
								<div key={activity.id} className="flex items-center space-x-4">
									<div className={`w-2 h-2 rounded-full ${activity.type === 'emergency' ? 'bg-red-500' :
										activity.type === 'donation' ? 'bg-green-500' :
											activity.type === 'request' ? 'bg-blue-500' :
												'bg-gray-500'
										}`} />
									<div className="flex-1 space-y-1">
										<p className="text-sm font-medium">{activity.action}</p>
										<p className="text-sm text-muted-foreground">by {activity.user}</p>
									</div>
									<div className="text-sm text-muted-foreground">{activity.time}</div>
								</div>
							))}
						</div>
					</CardContent>
				</Card>

				{/* Quick Actions */}
				<Card className="col-span-3">
					<CardHeader>
						<CardTitle>Quick Actions</CardTitle>
						<CardDescription>Common administrative tasks</CardDescription>
					</CardHeader>
					<CardContent className="space-y-2">
						<Button className="w-full justify-start" variant="outline">
							<Users className="mr-2 h-4 w-4" />
							Add New User
						</Button>
						<Button className="w-full justify-start" variant="outline">
							<Droplets className="mr-2 h-4 w-4" />
							Register Donor
						</Button>
						<Button className="w-full justify-start" variant="outline">
							<ClipboardList className="mr-2 h-4 w-4" />
							Create Request
						</Button>
						<Button className="w-full justify-start" variant="outline">
							<AlertTriangle className="mr-2 h-4 w-4" />
							Emergency Alert
						</Button>
					</CardContent>
				</Card>
			</div>

			{/* Developer Credit */}
			<div className="mt-8 text-center text-xs text-muted-foreground">
				BloodConnect Admin Panel - Developed by{" "}
				<a
					href="https://www.mhrrony.com"
					target="_blank"
					rel="noopener noreferrer"
					className="text-primary hover:underline"
				>
					mhrrony
				</a>
			</div>
		</div>
	);
};

export default AdminDashboard;
