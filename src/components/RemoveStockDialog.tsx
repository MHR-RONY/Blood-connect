import React, { useState } from 'react';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Minus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface RemoveStockDialogProps {
	bloodType: string;
	availableUnits: number;
	onRemoveStock: (bloodType: string, units: number, reason?: string) => Promise<{ success: boolean; error?: string }>;
}

const RemoveStockDialog: React.FC<RemoveStockDialogProps> = ({
	bloodType,
	availableUnits,
	onRemoveStock
}) => {
	const [open, setOpen] = useState(false);
	const [units, setUnits] = useState('');
	const [reason, setReason] = useState('Used for patient care');
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const reasonOptions = [
		'Used for patient care',
		'Emergency use',
		'Surgery requirement',
		'Transfer to other facility',
		'Quality control testing',
		'Expired - disposal',
		'Damaged unit',
		'Other'
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!units) {
			toast({
				title: 'Validation Error',
				description: 'Please enter the number of units to remove',
				variant: 'destructive',
			});
			return;
		}

		const unitsNumber = parseInt(units);
		if (unitsNumber <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Units must be a positive number',
				variant: 'destructive',
			});
			return;
		}

		if (unitsNumber > availableUnits) {
			toast({
				title: 'Validation Error',
				description: `Cannot remove ${unitsNumber} units. Only ${availableUnits} units available.`,
				variant: 'destructive',
			});
			return;
		}

		setLoading(true);

		try {
			const result = await onRemoveStock(bloodType, unitsNumber, reason);

			if (result.success) {
				toast({
					title: 'Stock Removed Successfully',
					description: `Removed ${units} units of ${bloodType} blood`,
				});

				// Reset form
				setUnits('');
				setReason('Used for patient care');
				setOpen(false);
			} else {
				toast({
					title: 'Error Removing Stock',
					description: result.error || 'Failed to remove stock',
					variant: 'destructive',
				});
			}
		} catch (error) {
			toast({
				title: 'Error',
				description: 'An unexpected error occurred',
				variant: 'destructive',
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline" size="sm">
					<Minus className="h-3 w-3 mr-1" />
					Remove
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Remove {bloodType} Blood Stock</DialogTitle>
					<DialogDescription>
						Remove blood units from inventory. Available: {availableUnits} units.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="units">Units to Remove *</Label>
						<Input
							id="units"
							type="number"
							min="1"
							max={availableUnits}
							value={units}
							onChange={(e) => setUnits(e.target.value)}
							placeholder={`Enter units (max: ${availableUnits})`}
						/>
						<p className="text-sm text-muted-foreground">
							Available units: {availableUnits}
						</p>
					</div>

					<div className="space-y-2">
						<Label htmlFor="reason">Reason for Removal</Label>
						<Select value={reason} onValueChange={setReason}>
							<SelectTrigger>
								<SelectValue placeholder="Select reason" />
							</SelectTrigger>
							<SelectContent>
								{reasonOptions.map((option) => (
									<SelectItem key={option} value={option}>
										{option}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					{reason === 'Other' && (
						<div className="space-y-2">
							<Label htmlFor="customReason">Custom Reason</Label>
							<Textarea
								id="customReason"
								value={reason === 'Other' ? '' : reason}
								onChange={(e) => setReason(e.target.value)}
								placeholder="Please specify the reason..."
								rows={3}
							/>
						</div>
					)}

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" variant="destructive" disabled={loading}>
							{loading ? 'Removing...' : 'Remove Stock'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default RemoveStockDialog;
