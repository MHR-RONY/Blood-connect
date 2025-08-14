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
import { CalendarIcon, Package } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface AddStockDialogProps {
	onAddStock: (bloodType: string, units: number, expiryDate: string, donorId?: string, location?: string) => Promise<{ success: boolean; error?: string }>;
}

const AddStockDialog: React.FC<AddStockDialogProps> = ({ onAddStock }) => {
	const [open, setOpen] = useState(false);
	const [bloodType, setBloodType] = useState('');
	const [units, setUnits] = useState('');
	const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
	const [location, setLocation] = useState('Main Storage');
	const [loading, setLoading] = useState(false);
	const { toast } = useToast();

	const resetForm = () => {
		setBloodType('');
		setUnits('');
		setExpiryDate(undefined);
		setLocation('Main Storage');
	};

	const handleOpenChange = (newOpen: boolean) => {
		setOpen(newOpen);
		if (newOpen) {
			// Reset form when opening dialog
			resetForm();
		}
	};

	const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Debug logging
		console.log('Form submission debug:', {
			bloodType,
			units,
			expiryDate,
			bloodTypeEmpty: !bloodType,
			unitsEmpty: !units,
			expiryDateEmpty: !expiryDate
		});

		if (!bloodType || bloodType === '' || !units || !expiryDate) {
			toast({
				title: 'Validation Error',
				description: `Please fill in all required fields. Missing: ${!bloodType ? 'Blood Type ' : ''}${!units ? 'Units ' : ''}${!expiryDate ? 'Expiry Date' : ''}`,
				variant: 'destructive',
			});
			return;
		}

		const unitsNumber = parseInt(units);
		if (isNaN(unitsNumber) || unitsNumber <= 0) {
			toast({
				title: 'Validation Error',
				description: 'Units must be a positive number',
				variant: 'destructive',
			});
			return;
		}

		if (expiryDate <= new Date()) {
			toast({
				title: 'Validation Error',
				description: 'Expiry date must be in the future',
				variant: 'destructive',
			});
			return;
		}

		setLoading(true);

		try {
			console.log('Calling onAddStock with:', {
				bloodType,
				units: unitsNumber,  // This should be a number
				expiryDate: expiryDate.toISOString(),
				location
			});

			const result = await onAddStock(
				bloodType,
				unitsNumber,  // Pass as number, not string
				expiryDate.toISOString(),
				undefined,    // donorId
				location
			);

			if (result.success) {
				toast({
					title: 'Stock Added Successfully',
					description: `Added ${units} units of ${bloodType} blood`,
				});

				// Reset form and close dialog
				resetForm();
				setOpen(false);
			} else {
				toast({
					title: 'Error Adding Stock',
					description: result.error || 'Failed to add stock',
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
		<Dialog open={open} onOpenChange={handleOpenChange}>
			<DialogTrigger asChild>
				<Button>
					<Package className="mr-2 h-4 w-4" />
					Add Stock
				</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px]">
				<DialogHeader>
					<DialogTitle>Add Blood Stock</DialogTitle>
					<DialogDescription>
						Add new blood units to the inventory. Please ensure all information is accurate.
					</DialogDescription>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-2">
							<Label htmlFor="bloodType">Blood Type *</Label>
							<Select value={bloodType} onValueChange={(value) => {
								console.log('Blood type selected:', value);
								setBloodType(value);
							}}>
								<SelectTrigger className={bloodType ? '' : 'text-muted-foreground'}>
									<SelectValue placeholder="Select blood type" />
								</SelectTrigger>
								<SelectContent>
									{bloodTypes.map((type) => (
										<SelectItem key={type} value={type}>
											{type}
										</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="space-y-2">
							<Label htmlFor="units">Units *</Label>
							<Input
								id="units"
								type="number"
								min="1"
								step="1"
								value={units}
								onChange={(e) => {
									console.log('Units changed:', e.target.value);
									setUnits(e.target.value);
								}}
								placeholder="Number of units"
								className={units ? '' : 'text-muted-foreground'}
							/>
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="expiryDate">Expiry Date *</Label>
						<div className="relative">
							<Input
								id="expiryDate"
								type="date"
								value={expiryDate ? format(expiryDate, 'yyyy-MM-dd') : ''}
								onChange={(e) => {
									if (e.target.value) {
										setExpiryDate(new Date(e.target.value));
									} else {
										setExpiryDate(undefined);
									}
								}}
								min={format(new Date(Date.now() + 24 * 60 * 60 * 1000), 'yyyy-MM-dd')} // Tomorrow
								className="w-full"
								placeholder="Select expiry date"
							/>
							<CalendarIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
						</div>
					</div>

					<div className="space-y-2">
						<Label htmlFor="location">Storage Location</Label>
						<Select value={location} onValueChange={setLocation}>
							<SelectTrigger>
								<SelectValue placeholder="Select location" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="Main Storage">Main Storage</SelectItem>
								<SelectItem value="Emergency Storage">Emergency Storage</SelectItem>
								<SelectItem value="Mobile Unit">Mobile Unit</SelectItem>
								<SelectItem value="Branch Office">Branch Office</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className="flex justify-end space-x-2 pt-4">
						<Button
							type="button"
							variant="outline"
							onClick={() => setOpen(false)}
							disabled={loading}
						>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? 'Adding...' : 'Add Stock'}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
};

export default AddStockDialog;
