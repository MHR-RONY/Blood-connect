
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Plus, Search, Info, Ban, CheckCircle, Filter, Eye, ShieldBan, ShieldCheck } from 'lucide-react';
import { adminApi, AdminUser, PaginationInfo } from '@/services/adminApi';
import { useToast } from '@/hooks/use-toast';
import BloodLoading from '@/components/ui/blood-loading';
import UserDetailsModal from '@/components/UserDetailsModal';
import BanConfirmationDialog from '@/components/BanConfirmationDialog';

const UsersPage = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'banned'>('all');
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [loading, setLoading] = useState(true);
	const [banLoading, setBanLoading] = useState<string | null>(null);
	const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
	const [showUserDetails, setShowUserDetails] = useState(false);
	const [showBanDialog, setShowBanDialog] = useState(false);
	const [selectedUserForBan, setSelectedUserForBan] = useState<AdminUser | null>(null);
	const [pagination, setPagination] = useState<PaginationInfo>({
		page: 1,
		limit: 20,
		total: 0,
		pages: 1
	});
	const { toast } = useToast();
	const searchTimeoutRef = useRef<NodeJS.Timeout>();
	const initialLoadRef = useRef(true);

	// Fetch users from API
	const fetchUsers = useCallback(async (page: number = 1, search: string = '', filter: string = 'all', showLoading: boolean = true) => {
		try {
			if (showLoading) {
				setLoading(true);
			}

			const params: {
				page: number;
				limit: number;
				search?: string;
				sortBy: string;
				sortOrder: string;
				isActive?: boolean;
				isBanned?: boolean;
			} = {
				page,
				limit: 20,
				search: search || undefined,
				sortBy: 'createdAt',
				sortOrder: 'desc'
			};

			// Add filter parameters
			if (filter === 'active') {
				params.isActive = true;
				params.isBanned = false;
			} else if (filter === 'banned') {
				params.isBanned = true;
			}

			const response = await adminApi.getUsers(params);

			if (response.success) {
				setUsers(response.data.users);
				setPagination(response.data.pagination);
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description: response.message || "Failed to fetch users"
				});
			}
		} catch (error: unknown) {
			console.error('Error fetching users:', error);
			toast({
				variant: "destructive",
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to fetch users"
			});
		} finally {
			if (showLoading) {
				setLoading(false);
			}
			initialLoadRef.current = false;
		}
	}, [toast]);

	// Load users on component mount
	useEffect(() => {
		fetchUsers(1, '', statusFilter);
	}, [fetchUsers, statusFilter]);

	// Handle search with debounce
	const handleSearchChange = (value: string) => {
		setSearchTerm(value);

		// Clear existing timeout
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		// Only show loading for initial load or if it's been more than 300ms since last search
		const showLoading = initialLoadRef.current;

		// Set new timeout
		searchTimeoutRef.current = setTimeout(() => {
			fetchUsers(1, value, statusFilter, showLoading);
		}, 300);
	};

	// Handle filter change
	const handleFilterChange = (filter: 'all' | 'active' | 'banned') => {
		setStatusFilter(filter);
		fetchUsers(1, searchTerm, filter, true);
	};

	// Handle ban/unban user
	const handleBanUser = async (user: AdminUser) => {
		setSelectedUserForBan(user);
		setShowBanDialog(true);
	};

	// Handle ban confirmation from dialog
	const handleBanConfirm = async (banReason: string) => {
		if (!selectedUserForBan) return;

		const action = selectedUserForBan.isBanned ? 'unban' : 'ban';

		try {
			setBanLoading(selectedUserForBan._id);

			const response = await adminApi.banUser(selectedUserForBan._id, {
				isBanned: !selectedUserForBan.isBanned,
				banReason: banReason || undefined
			});

			if (response.success) {
				// Update the user in the local state
				setUsers(users.map(u =>
					u._id === selectedUserForBan._id
						? { ...u, ...response.data.user }
						: u
				));

				toast({
					title: "Success",
					description: `User ${action}ned successfully`
				});

				// Close dialog
				setShowBanDialog(false);
				setSelectedUserForBan(null);
			} else {
				toast({
					variant: "destructive",
					title: "Error",
					description: response.message || `Failed to ${action} user`
				});
			}
		} catch (error) {
			toast({
				variant: "destructive",
				title: "Error",
				description: error instanceof Error ? error.message : `Failed to ${action} user`
			});
		} finally {
			setBanLoading(null);
		}
	};

	// Clean up timeout on unmount
	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, []);

	const getStatusBadge = (isActive: boolean, isBanned: boolean) => {
		if (isBanned) {
			return <Badge variant="destructive" className="flex items-center gap-1">
				<Ban className="h-3 w-3" />
				Banned
			</Badge>;
		}
		return isActive ?
			<Badge className="bg-green-100 text-green-800 flex items-center gap-1">
				<CheckCircle className="h-3 w-3" />
				Active
			</Badge> :
			<Badge variant="secondary">Inactive</Badge>;
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString();
	};

	if (loading) {
		return <BloodLoading message="Loading users" />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-3xl font-bold">User Management</h1>
				<Dialog>
					<DialogTrigger asChild>
						<Button>
							<Plus className="mr-2 h-4 w-4" />
							Add User
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>Add New User</DialogTitle>
							<DialogDescription>
								Create a new user account in the system.
							</DialogDescription>
						</DialogHeader>
						<div className="space-y-4">
							<Input placeholder="Full Name" />
							<Input placeholder="Email" type="email" />
							<Input placeholder="Phone Number" />
							<Input placeholder="Blood Type" />
							<Button className="w-full">Create User</Button>
						</div>
					</DialogContent>
				</Dialog>
			</div>

			<Card>
				<CardHeader>
					<CardTitle>All Users</CardTitle>
					<CardDescription>Manage registered users in the system</CardDescription>
					<div className="flex items-center justify-between gap-4">
						<div className="flex items-center space-x-2">
							<Search className="h-4 w-4 text-muted-foreground" />
							<Input
								placeholder="Search users..."
								value={searchTerm}
								onChange={(e) => handleSearchChange(e.target.value)}
								className="max-w-sm"
							/>
						</div>
						<div className="flex items-center space-x-2">
							<Filter className="h-4 w-4 text-muted-foreground" />
							<Select value={statusFilter} onValueChange={handleFilterChange}>
								<SelectTrigger className="w-[140px]">
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Users</SelectItem>
									<SelectItem value="active">Active Users</SelectItem>
									<SelectItem value="banned">Banned Users</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Phone</TableHead>
								<TableHead>Blood Type</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Join Date</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.length > 0 ? (
								users.map((user) => (
									<TableRow key={user._id}>
										<TableCell className="font-medium">{`${user.firstName} ${user.lastName}`}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>{user.phone || 'N/A'}</TableCell>
										<TableCell>
											<Badge variant="outline">{user.bloodType || 'N/A'}</Badge>
										</TableCell>
										<TableCell>{user.role || 'user'}</TableCell>
										<TableCell>{getStatusBadge(user.isActive, user.isBanned)}</TableCell>
										<TableCell>{formatDate(user.createdAt)}</TableCell>
										<TableCell>
											<div className="flex items-center space-x-2">
												<Button
													variant="ghost"
													size="icon"
													onClick={() => {
														setSelectedUserId(user._id);
														setShowUserDetails(true);
													}}
													title="View user details"
												>
													<Eye className="h-4 w-4" />
												</Button>
												{user.role !== 'admin' && (
													<Button
														variant="ghost"
														size="icon"
														onClick={() => handleBanUser(user)}
														disabled={banLoading === user._id}
														title={user.isBanned ? 'Unban user' : 'Ban user'}
														className={user.isBanned ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'}
													>
														{banLoading === user._id ? (
															<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
														) : user.isBanned ? (
															<ShieldCheck className="h-4 w-4" />
														) : (
															<ShieldBan className="h-4 w-4" />
														)}
													</Button>
												)}
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
										{searchTerm ? 'No users found matching your search.' : 'No users found.'}
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>

					{/* Pagination Info */}
					{pagination.total > 0 && (
						<div className="flex items-center justify-between px-2 py-4">
							<div className="text-sm text-muted-foreground">
								Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
							</div>
							<div className="flex items-center space-x-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchUsers(pagination.page - 1, searchTerm, statusFilter)}
									disabled={pagination.page <= 1 || loading}
								>
									Previous
								</Button>
								<span className="text-sm">
									Page {pagination.page} of {pagination.pages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchUsers(pagination.page + 1, searchTerm, statusFilter)}
									disabled={pagination.page >= pagination.pages || loading}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			{/* User Details Modal */}
			{selectedUserId && (
				<UserDetailsModal
					isOpen={showUserDetails}
					onClose={() => {
						setShowUserDetails(false);
						setSelectedUserId(null);
					}}
					userId={selectedUserId}
					onUserUpdate={(updatedUser) => {
						setUsers(users.map(user =>
							user._id === updatedUser._id ? updatedUser : user
						));
					}}
				/>
			)}

			{/* Ban Confirmation Dialog */}
			<BanConfirmationDialog
				isOpen={showBanDialog}
				onClose={() => {
					setShowBanDialog(false);
					setSelectedUserForBan(null);
				}}
				onConfirm={handleBanConfirm}
				user={selectedUserForBan}
				isLoading={banLoading === selectedUserForBan?._id}
				isBanning={!selectedUserForBan?.isBanned}
			/>
		</div>
	);
};

export default UsersPage;
