import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ban, AlertTriangle, User } from 'lucide-react';
import { AdminUser } from '@/services/adminApi';

interface BanConfirmationDialogProps {
	isOpen: boolean;
	onClose: () => void;
	onConfirm: (banReason: string) => void;
	user: AdminUser | null;
	isLoading: boolean;
	isBanning: boolean; // true for ban, false for unban
}

const BanConfirmationDialog: React.FC<BanConfirmationDialogProps> = ({
	isOpen,
	onClose,
	onConfirm,
	user,
	isLoading,
	isBanning
}) => {
	const [banReason, setBanReason] = useState('');

	const handleSubmit = () => {
		if (isBanning && !banReason.trim()) {
			return;
		}
		onConfirm(banReason.trim());
		setBanReason('');
	};

	const handleClose = () => {
		setBanReason('');
		onClose();
	};

	if (!user) return null;

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<div className={`p-2 rounded-full ${isBanning ? 'bg-red-100' : 'bg-green-100'}`}>
							{isBanning ? (
								<Ban className="h-6 w-6 text-red-600" />
							) : (
								<User className="h-6 w-6 text-green-600" />
							)}
						</div>
						<div>
							<DialogTitle className={`text-xl ${isBanning ? 'text-red-700' : 'text-green-700'}`}>
								{isBanning ? 'Ban User' : 'Unban User'}
							</DialogTitle>
							<DialogDescription className="text-sm text-gray-600">
								{isBanning ? 'This action will suspend the user account' : 'This will restore user access'}
							</DialogDescription>
						</div>
					</div>
				</DialogHeader>

				<div className="space-y-4">
					{/* User Information */}
					<div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<div>
								<h4 className="font-semibold text-gray-900">
									{user.firstName} {user.lastName}
								</h4>
								<p className="text-sm text-gray-600">{user.email}</p>
								<p className="text-sm text-gray-500">{user.phone}</p>
							</div>
							<div className="text-right">
								<Badge variant="outline" className="mb-2">
									{user.bloodType}
								</Badge>
								<p className="text-xs text-gray-500">{user.role}</p>
							</div>
						</div>
					</div>

					{/* Current Ban Status */}
					{user.isBanned && (
						<div className="bg-red-50 border border-red-200 rounded-lg p-3">
							<div className="flex items-start gap-2">
								<AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
								<div>
									<p className="text-sm font-medium text-red-800">Currently Banned</p>
									{user.banReason && (
										<p className="text-sm text-red-700 mt-1">
											<strong>Reason:</strong> {user.banReason}
										</p>
									)}
									{user.bannedAt && (
										<p className="text-xs text-red-600 mt-1">
											Banned on: {new Date(user.bannedAt).toLocaleDateString()}
										</p>
									)}
								</div>
							</div>
						</div>
					)}

					{/* Ban Reason Input (only for banning) */}
					{isBanning && (
						<div className="space-y-2">
							<Label htmlFor="banReason" className="text-sm font-medium text-gray-700">
								Ban Reason <span className="text-red-500">*</span>
							</Label>
							<Textarea
								id="banReason"
								value={banReason}
								onChange={(e) => setBanReason(e.target.value)}
								placeholder="Please provide a clear reason for banning this user..."
								rows={4}
								className="resize-none"
							/>
							<p className="text-xs text-gray-500">
								This reason will be visible to the user and stored for record keeping.
							</p>
						</div>
					)}

					{/* Unban Confirmation */}
					{!isBanning && (
						<div className="bg-green-50 border border-green-200 rounded-lg p-4">
							<div className="flex items-start gap-2">
								<User className="h-5 w-5 text-green-600 mt-0.5" />
								<div>
									<p className="text-sm font-medium text-green-800">
										Restore Account Access
									</p>
									<p className="text-sm text-green-700 mt-1">
										This user will be able to login and use all platform features again.
									</p>
								</div>
							</div>
						</div>
					)}

					{/* Warning */}
					<div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
						<div className="flex items-start gap-2">
							<AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
							<p className="text-xs text-amber-800">
								{isBanning
									? "This action will immediately prevent the user from logging in and accessing their account."
									: "Make sure you want to restore this user's access before confirming."
								}
							</p>
						</div>
					</div>
				</div>

				<DialogFooter className="gap-2">
					<Button
						variant="outline"
						onClick={handleClose}
						disabled={isLoading}
					>
						Cancel
					</Button>
					<Button
						onClick={handleSubmit}
						disabled={isLoading || (isBanning && !banReason.trim())}
						className={isBanning
							? "bg-red-600 hover:bg-red-700 text-white"
							: "bg-green-600 hover:bg-green-700 text-white"
						}
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
								{isBanning ? 'Banning...' : 'Unbanning...'}
							</div>
						) : (
							<>
								{isBanning ? (
									<>
										<Ban className="h-4 w-4 mr-2" />
										Ban User
									</>
								) : (
									<>
										<User className="h-4 w-4 mr-2" />
										Unban User
									</>
								)}
							</>
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export default BanConfirmationDialog;
