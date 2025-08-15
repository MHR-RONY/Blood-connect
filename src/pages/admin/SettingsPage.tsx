
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
	adminSettingsAPI,
	AdminInfo,
	SecuritySettings,
	SystemLog,
	SystemStatus
} from '@/services/adminSettingsAPI';
import {
	Settings,
	Bell,
	Shield,
	Users,
	Database,
	User,
	Phone,
	Mail,
	Building,
	Key,
	Eye,
	EyeOff,
	Save,
	RefreshCw,
	Download,
	Trash2,
	CheckCircle,
	AlertTriangle,
	Info,
	Loader2
} from 'lucide-react';

const SettingsPage = () => {
	const { toast } = useToast();
	const [loading, setLoading] = useState(false);
	const [dataLoading, setDataLoading] = useState(true);
	const [showPassword, setShowPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);

	// Admin Info State
	const [adminInfo, setAdminInfo] = useState<AdminInfo>({
		firstName: '',
		lastName: '',
		email: '',
		phone: '',
		systemName: '',
		organizationName: '',
		address: ''
	});

	// Security Settings State
	const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		twoFactorEnabled: false,
		sessionTimeout: 30
	});

	// System Logs and Status State
	const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
	const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

	// Load initial data
	const loadAdminData = useCallback(async () => {
		setDataLoading(true);
		try {
			const [adminResponse, logsResponse, statusResponse] = await Promise.all([
				adminSettingsAPI.getAdminInfo(),
				adminSettingsAPI.getSystemLogs(1, 50),
				adminSettingsAPI.getSystemStatus()
			]);

			if (adminResponse.success && adminResponse.data) {
				setAdminInfo(adminResponse.data);
			}

			if (logsResponse.success && logsResponse.data) {
				setSystemLogs(logsResponse.data);
			}

			if (statusResponse.success && statusResponse.data) {
				setSystemStatus(statusResponse.data);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to load admin settings data.",
				variant: "destructive",
			});
		} finally {
			setDataLoading(false);
		}
	}, [toast]);

	useEffect(() => {
		loadAdminData();
	}, [loadAdminData]);

	const handleSaveAdminInfo = async () => {
		setLoading(true);
		try {
			const response = await adminSettingsAPI.updateAdminInfo(adminInfo);
			if (response.success) {
				toast({
					title: "Success",
					description: response.message || "Admin information updated successfully.",
				});
			} else {
				throw new Error(response.error);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to update admin information.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleUpdatePassword = async () => {
		if (securitySettings.newPassword !== securitySettings.confirmPassword) {
			toast({
				title: "Error",
				description: "New passwords do not match.",
				variant: "destructive",
			});
			return;
		}

		if (securitySettings.newPassword.length < 8) {
			toast({
				title: "Error",
				description: "Password must be at least 8 characters long.",
				variant: "destructive",
			});
			return;
		}

		// Strong password validation to match backend requirements
		const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
		if (!passwordRegex.test(securitySettings.newPassword)) {
			toast({
				title: "Error",
				description: "Password must contain at least one lowercase letter, one uppercase letter, and one number.",
				variant: "destructive",
			});
			return;
		}

		if (!securitySettings.currentPassword.trim()) {
			toast({
				title: "Error",
				description: "Current password is required.",
				variant: "destructive",
			});
			return;
		}

		setLoading(true);
		try {
			const response = await adminSettingsAPI.updatePassword({
				currentPassword: securitySettings.currentPassword,
				newPassword: securitySettings.newPassword,
				confirmPassword: securitySettings.confirmPassword
			});

			if (response.success) {
				toast({
					title: "Success",
					description: response.message || "Password updated successfully.",
				});
				setSecuritySettings(prev => ({
					...prev,
					currentPassword: '',
					newPassword: '',
					confirmPassword: ''
				}));
			} else {
				throw new Error(response.error);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to update password.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleBackupDatabase = async () => {
		setLoading(true);
		try {
			const response = await adminSettingsAPI.createBackup();
			if (response.success) {
				toast({
					title: "Success",
					description: response.message || "Database backup completed successfully.",
				});
			} else {
				throw new Error(response.error);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Database backup failed.",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleExportLogs = async () => {
		try {
			const response = await adminSettingsAPI.exportLogs();
			if (response.success) {
				toast({
					title: "Success",
					description: "System logs exported successfully.",
				});
			} else {
				throw new Error(response.error);
			}
		} catch (error) {
			toast({
				title: "Error",
				description: error instanceof Error ? error.message : "Failed to export logs.",
				variant: "destructive",
			});
		}
	};

	const handleRefreshLogs = async () => {
		try {
			const response = await adminSettingsAPI.getSystemLogs(1, 50);
			if (response.success && response.data) {
				setSystemLogs(response.data);
				toast({
					title: "Success",
					description: "System logs refreshed successfully.",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "Failed to refresh logs.",
				variant: "destructive",
			});
		}
	};

	const getLogLevelIcon = (level: string) => {
		switch (level) {
			case 'error':
				return <AlertTriangle className="h-4 w-4 text-red-500" />;
			case 'warning':
				return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
			case 'info':
			default:
				return <Info className="h-4 w-4 text-blue-500" />;
		}
	};

	const getLogLevelBadge = (level: string) => {
		switch (level) {
			case 'error':
				return <Badge variant="destructive">Error</Badge>;
			case 'warning':
				return <Badge variant="secondary">Warning</Badge>;
			case 'info':
			default:
				return <Badge variant="default">Info</Badge>;
		}
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center gap-2">
				<Settings className="h-8 w-8" />
				<h1 className="text-3xl font-bold">Admin Settings</h1>
			</div>

			<Tabs defaultValue="admin-info" className="space-y-4">
				<TabsList className="grid w-full grid-cols-5">
					<TabsTrigger value="admin-info">Admin Info</TabsTrigger>
					<TabsTrigger value="security">Security</TabsTrigger>
					<TabsTrigger value="notifications">Notifications</TabsTrigger>
					<TabsTrigger value="system">System</TabsTrigger>
					<TabsTrigger value="logs">System Logs</TabsTrigger>
				</TabsList>

				{/* Admin Information Tab */}
				<TabsContent value="admin-info" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<User className="h-5 w-5" />
								Admin Information
							</CardTitle>
							<CardDescription>Update admin profile and system information</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="firstName">First Name</Label>
									<Input
										id="firstName"
										value={adminInfo.firstName}
										onChange={(e) => setAdminInfo(prev => ({ ...prev, firstName: e.target.value }))}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="lastName">Last Name</Label>
									<Input
										id="lastName"
										value={adminInfo.lastName}
										onChange={(e) => setAdminInfo(prev => ({ ...prev, lastName: e.target.value }))}
									/>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email" className="flex items-center gap-2">
									<Mail className="h-4 w-4" />
									Admin Email
								</Label>
								<Input
									id="email"
									type="email"
									value={adminInfo.email}
									onChange={(e) => setAdminInfo(prev => ({ ...prev, email: e.target.value }))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="phone" className="flex items-center gap-2">
									<Phone className="h-4 w-4" />
									Contact Phone
								</Label>
								<Input
									id="phone"
									value={adminInfo.phone}
									onChange={(e) => setAdminInfo(prev => ({ ...prev, phone: e.target.value }))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="systemName">System Name</Label>
								<Input
									id="systemName"
									value={adminInfo.systemName}
									onChange={(e) => setAdminInfo(prev => ({ ...prev, systemName: e.target.value }))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="organizationName" className="flex items-center gap-2">
									<Building className="h-4 w-4" />
									Organization Name
								</Label>
								<Input
									id="organizationName"
									value={adminInfo.organizationName}
									onChange={(e) => setAdminInfo(prev => ({ ...prev, organizationName: e.target.value }))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="address">Address</Label>
								<Input
									id="address"
									value={adminInfo.address}
									onChange={(e) => setAdminInfo(prev => ({ ...prev, address: e.target.value }))}
								/>
							</div>

							<Button onClick={handleSaveAdminInfo} disabled={loading} className="w-full md:w-auto">
								{loading ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Admin Information
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Security Settings Tab */}
				<TabsContent value="security" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Shield className="h-5 w-5" />
								Security Settings
							</CardTitle>
							<CardDescription>Update password and security preferences</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<Alert>
								<Key className="h-4 w-4" />
								<AlertDescription>
									For security reasons, you'll need to enter your current password to make changes.
								</AlertDescription>
							</Alert>

							<div className="space-y-2">
								<Label htmlFor="currentPassword">Current Password</Label>
								<div className="relative">
									<Input
										id="currentPassword"
										type={showPassword ? "text" : "password"}
										value={securitySettings.currentPassword}
										onChange={(e) => setSecuritySettings(prev => ({ ...prev, currentPassword: e.target.value }))}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowPassword(!showPassword)}
									>
										{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
							</div>

							<div className="space-y-2">
								<Label htmlFor="newPassword">New Password</Label>
								<div className="relative">
									<Input
										id="newPassword"
										type={showNewPassword ? "text" : "password"}
										value={securitySettings.newPassword}
										onChange={(e) => setSecuritySettings(prev => ({ ...prev, newPassword: e.target.value }))}
									/>
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
										onClick={() => setShowNewPassword(!showNewPassword)}
									>
										{showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
									</Button>
								</div>
								<p className="text-sm text-muted-foreground">
									Password must be at least 8 characters long and contain:
									<br />• At least one lowercase letter (a-z)
									<br />• At least one uppercase letter (A-Z)
									<br />• At least one number (0-9)
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="confirmPassword">Confirm New Password</Label>
								<Input
									id="confirmPassword"
									type="password"
									value={securitySettings.confirmPassword}
									onChange={(e) => setSecuritySettings(prev => ({ ...prev, confirmPassword: e.target.value }))}
								/>
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="space-y-0.5">
									<Label>Two-Factor Authentication</Label>
									<p className="text-sm text-muted-foreground">
										Add an extra layer of security to your account
									</p>
								</div>
								<Switch
									checked={securitySettings.twoFactorEnabled}
									onCheckedChange={(checked) => setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: checked }))}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
								<Input
									id="sessionTimeout"
									type="number"
									min="5"
									max="120"
									value={securitySettings.sessionTimeout}
									onChange={(e) => setSecuritySettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) }))}
								/>
							</div>

							<Button onClick={handleUpdatePassword} disabled={loading} className="w-full md:w-auto">
								{loading ? (
									<>
										<RefreshCw className="mr-2 h-4 w-4 animate-spin" />
										Updating...
									</>
								) : (
									<>
										<Shield className="mr-2 h-4 w-4" />
										Update Security Settings
									</>
								)}
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* Notifications Tab */}
				<TabsContent value="notifications" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Bell className="h-5 w-5" />
								Notification Settings
							</CardTitle>
							<CardDescription>Configure system notifications and alerts</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="space-y-0.5">
									<Label>Emergency Alerts</Label>
									<p className="text-sm text-muted-foreground">
										Send immediate alerts for critical blood requests
									</p>
								</div>
								<Switch defaultChecked />
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="space-y-0.5">
									<Label>Low Stock Alerts</Label>
									<p className="text-sm text-muted-foreground">
										Alert when blood inventory is running low
									</p>
								</div>
								<Switch defaultChecked />
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="space-y-0.5">
									<Label>Donor Reminders</Label>
									<p className="text-sm text-muted-foreground">
										Send reminders to eligible donors
									</p>
								</div>
								<Switch defaultChecked />
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="space-y-0.5">
									<Label>Request Updates</Label>
									<p className="text-sm text-muted-foreground">
										Notify about blood request status changes
									</p>
								</div>
								<Switch defaultChecked />
							</div>

							<div className="flex items-center justify-between p-4 border rounded-lg">
								<div className="space-y-0.5">
									<Label>System Maintenance</Label>
									<p className="text-sm text-muted-foreground">
										Notifications about system updates and maintenance
									</p>
								</div>
								<Switch defaultChecked />
							</div>

							<Button className="w-full md:w-auto">
								<Save className="mr-2 h-4 w-4" />
								Save Notification Settings
							</Button>
						</CardContent>
					</Card>
				</TabsContent>

				{/* System Settings Tab */}
				<TabsContent value="system" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								System Management
							</CardTitle>
							<CardDescription>System maintenance and data management</CardDescription>
						</CardHeader>
						<CardContent className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<Button
									variant="outline"
									onClick={handleBackupDatabase}
									disabled={loading}
									className="h-20 flex-col"
								>
									<Database className="mb-2 h-6 w-6" />
									Backup Database
								</Button>

								<Button variant="outline" className="h-20 flex-col">
									<Download className="mb-2 h-6 w-6" />
									Export Data
								</Button>

								<Button variant="outline" className="h-20 flex-col">
									<RefreshCw className="mb-2 h-6 w-6" />
									Clear Cache
								</Button>

								<Button variant="outline" className="h-20 flex-col">
									<Trash2 className="mb-2 h-6 w-6" />
									Clean Logs
								</Button>
							</div>

							<div className="space-y-4">
								<Label>System Status</Label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<CheckCircle className="h-5 w-5 text-green-600" />
											<p className="text-green-800 font-medium">Database Status</p>
										</div>
										<p className="text-green-600 text-sm">Connected and operational</p>
									</div>

									<div className="p-4 bg-green-50 border border-green-200 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<CheckCircle className="h-5 w-5 text-green-600" />
											<p className="text-green-800 font-medium">System Health</p>
										</div>
										<p className="text-green-600 text-sm">All services running normally</p>
									</div>

									<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Info className="h-5 w-5 text-blue-600" />
											<p className="text-blue-800 font-medium">Last Backup</p>
										</div>
										<p className="text-blue-600 text-sm">2 hours ago</p>
									</div>

									<div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
										<div className="flex items-center gap-2 mb-2">
											<Info className="h-5 w-5 text-blue-600" />
											<p className="text-blue-800 font-medium">System Uptime</p>
										</div>
										<p className="text-blue-600 text-sm">15 days, 8 hours</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>
				</TabsContent>

				{/* System Logs Tab */}
				<TabsContent value="logs" className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Database className="h-5 w-5" />
								System Logs
							</CardTitle>
							<CardDescription>Monitor system activity and troubleshoot issues</CardDescription>
							<div className="flex gap-2">
								<Button variant="outline" size="sm" onClick={handleExportLogs}>
									<Download className="mr-2 h-4 w-4" />
									Export Logs
								</Button>
								<Button variant="outline" size="sm">
									<RefreshCw className="mr-2 h-4 w-4" />
									Refresh
								</Button>
							</div>
						</CardHeader>
						<CardContent>
							<ScrollArea className="h-96 w-full">
								<div className="space-y-2">
									{systemLogs.map((log) => (
										<div key={log.id} className="flex items-start gap-3 p-3 border rounded-lg hover:bg-muted/50">
											<div className="mt-0.5">
												{getLogLevelIcon(log.level)}
											</div>
											<div className="flex-1 space-y-1">
												<div className="flex items-center gap-2">
													<span className="font-medium text-sm">{log.action}</span>
													{getLogLevelBadge(log.level)}
												</div>
												<p className="text-sm text-muted-foreground">{log.details}</p>
												<div className="flex items-center gap-4 text-xs text-muted-foreground">
													<span>{log.formattedTimestamp || new Date(log.createdAt).toLocaleString()}</span>
													<span>User: {log.user}</span>
												</div>
											</div>
										</div>
									))}
								</div>
							</ScrollArea>
						</CardContent>
					</Card>
				</TabsContent>
			</Tabs>
		</div>
	);
};

export default SettingsPage;
