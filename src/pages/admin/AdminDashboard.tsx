
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, ClipboardList, AlertTriangle, TrendingUp, Calendar, DollarSign, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/button';
import BloodDropIcon from '@/components/BloodDropIcon';

const AdminDashboard = () => {
	const stats = [
		{
			title: "Total Users",
			value: "1,234",
			change: "+12%",
			icon: Users,
			color: "text-blue-600"
		},
		{
			title: "Active Donors",
			value: "456",
			change: "+5%",
			icon: Droplets,
			color: "text-red-600"
		},
		{
			title: "Pending Requests",
			value: "23",
			change: "-8%",
			icon: ClipboardList,
			color: "text-yellow-600"
		},
		{
			title: "Emergency Cases",
			value: "3",
			change: "+2",
			icon: AlertTriangle,
			color: "text-orange-600"
		},
		{
			title: "Total Donations",
			value: "৳26,500",
			change: "+15%",
			icon: DollarSign,
			color: "text-green-600"
		}
	];

	const recentActivities = [
		{
			id: 1,
			action: "New donation request",
			user: "John Doe",
			time: "2 minutes ago",
			type: "request"
		},
		{
			id: 2,
			action: "Blood donated",
			user: "Jane Smith",
			time: "15 minutes ago",
			type: "donation"
		},
		{
			id: 3,
			action: "Emergency request",
			user: "Emergency Hospital",
			time: "1 hour ago",
			type: "emergency"
		},
		{
			id: 4,
			action: "New user registered",
			user: "Mike Johnson",
			time: "2 hours ago",
			type: "registration"
		}
	];

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Admin Dashboard</h1>
				<Button>
					<Calendar className="mr-2 h-4 w-4" />
					Generate Report
				</Button>
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
							{recentActivities.map((activity) => (
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
