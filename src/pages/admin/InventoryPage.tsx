import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '@/components/ui/table';
import { Package, AlertTriangle, Calendar, Trash2, RefreshCw } from 'lucide-react';
import { useInventory, useInventoryStats } from '@/hooks/useInventory';
import AddStockDialog from '@/components/AddStockDialog';
import RemoveStockDialog from '@/components/RemoveStockDialog';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const InventoryPage = () => {
	const { inventory, loading, error, refreshInventory, addStock, removeStock, removeExpired } = useInventory();
	const { stats, loading: statsLoading, refreshStats } = useInventoryStats();
	const [removingExpired, setRemovingExpired] = useState(false);
	const { toast } = useToast();

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'Good':
				return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Good Stock</Badge>;
			case 'Medium':
				return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">Medium Stock</Badge>;
			case 'Low':
				return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300">Low Stock</Badge>;
			case 'Critical':
				return <Badge variant="destructive">Critical</Badge>;
			default:
				return <Badge variant="secondary">{status}</Badge>;
		}
	};

	const handleRemoveExpired = async () => {
		setRemovingExpired(true);
		try {
			const result = await removeExpired();
			if (result.success) {
				toast({
					title: 'Expired Stock Removed',
					description: result.data?.summary || 'Successfully removed expired blood units',
				});
				refreshStats();
			} else {
				toast({
					title: 'Error',
					description: result.error || 'Failed to remove expired stock',
					variant: 'destructive',
				});
			}
		} finally {
			setRemovingExpired(false);
		}
	};

	const handleRefresh = () => {
		refreshInventory();
		refreshStats();
		toast({
			title: 'Refreshed',
			description: 'Inventory data has been updated',
		});
	};

	if (loading || statsLoading) {
		return (
			<div className="flex items-center justify-center h-64">
				<div className="text-center">
					<RefreshCw className="h-8 w-8 animate-spin mx-auto mb-2" />
					<p>Loading inventory...</p>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="h-4 w-4" />
				<AlertDescription>
					Error loading inventory: {error}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">Blood Inventory</h1>
				<div className="flex gap-2">
					<Button variant="outline" onClick={handleRefresh}>
						<RefreshCw className="mr-2 h-4 w-4" />
						Refresh
					</Button>
					{stats && stats.expiredUnits > 0 && (
						<Button
							variant="destructive"
							onClick={handleRemoveExpired}
							disabled={removingExpired}
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Remove Expired ({stats.expiredUnits})
						</Button>
					)}
					<AddStockDialog onAddStock={addStock} />
				</div>
			</div>

			{/* Summary Cards */}
			<div className="grid gap-4 md:grid-cols-4">
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Total Units</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalUnits || 0}</div>
						<p className="text-xs text-muted-foreground">All blood types</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Blood Types</CardTitle>
						<Package className="h-4 w-4 text-muted-foreground" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold">{stats?.totalBloodTypes || 8}</div>
						<p className="text-xs text-muted-foreground">Available types</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Low Stock</CardTitle>
						<AlertTriangle className="h-4 w-4 text-orange-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-orange-600">{stats?.lowStockCount || 0}</div>
						<p className="text-xs text-muted-foreground">Need attention</p>
					</CardContent>
				</Card>
				<Card>
					<CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
						<CardTitle className="text-sm font-medium">Critical</CardTitle>
						<AlertTriangle className="h-4 w-4 text-red-600" />
					</CardHeader>
					<CardContent>
						<div className="text-2xl font-bold text-red-600">{stats?.criticalCount || 0}</div>
						<p className="text-xs text-muted-foreground">Urgent restocking</p>
					</CardContent>
				</Card>
			</div>

			{/* Expiry Alerts */}
			{stats && stats.expiringIn7Days > 0 && (
				<Alert>
					<AlertTriangle className="h-4 w-4" />
					<AlertDescription>
						{stats.expiringIn7Days} units are expiring within the next 7 days. Please prioritize their use.
					</AlertDescription>
				</Alert>
			)}

			{/* Blood Type Grid */}
			<Card>
				<CardHeader>
					<CardTitle>Blood Type Overview</CardTitle>
					<CardDescription>Current stock levels by blood type</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						{inventory.map((item) => (
							<div key={item.bloodType} className="border rounded-lg p-4 space-y-2">
								<div className="flex items-center justify-between">
									<div className="text-xl font-bold text-red-600">{item.bloodType}</div>
									{getStatusBadge(item.status)}
								</div>
								<div className="text-2xl font-bold">{item.availableUnits} units</div>
								<div className="text-sm text-muted-foreground">
									{item.nextExpiryDate ? (
										<>Next expiry: {format(new Date(item.nextExpiryDate), 'MMM dd, yyyy')}</>
									) : (
										'No stock available'
									)}
								</div>
								<div className="flex space-x-1">
									<AddStockDialog onAddStock={addStock} />
									{item.availableUnits > 0 && (
										<RemoveStockDialog
											bloodType={item.bloodType}
											availableUnits={item.availableUnits}
											onRemoveStock={removeStock}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Detailed Inventory Table */}
			<Card>
				<CardHeader>
					<CardTitle>Detailed Inventory</CardTitle>
					<CardDescription>Complete inventory information with expiry tracking</CardDescription>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Blood Type</TableHead>
								<TableHead>Available Units</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Next Expiry</TableHead>
								<TableHead>Last Updated</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{inventory.map((item) => (
								<TableRow key={item.bloodType}>
									<TableCell>
										<Badge variant="outline" className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-lg px-3 py-1">
											{item.bloodType}
										</Badge>
									</TableCell>
									<TableCell className="font-medium text-lg">{item.availableUnits} units</TableCell>
									<TableCell>{getStatusBadge(item.status)}</TableCell>
									<TableCell>
										{item.nextExpiryDate ? (
											<div className="flex items-center gap-1">
												<Calendar className="h-3 w-3" />
												{format(new Date(item.nextExpiryDate), 'MMM dd, yyyy')}
											</div>
										) : (
											<span className="text-muted-foreground">No stock</span>
										)}
									</TableCell>
									<TableCell>
										{format(new Date(item.lastUpdated), 'MMM dd, yyyy')}
										{item.updatedBy && (
											<div className="text-xs text-muted-foreground">
												by {item.updatedBy.name}
											</div>
										)}
									</TableCell>
									<TableCell>
										<div className="flex items-center space-x-2">
											<AddStockDialog onAddStock={addStock} />
											{item.availableUnits > 0 && (
												<RemoveStockDialog
													bloodType={item.bloodType}
													availableUnits={item.availableUnits}
													onRemoveStock={removeStock}
												/>
											)}
										</div>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>
		</div>
	);
};

export default InventoryPage;
