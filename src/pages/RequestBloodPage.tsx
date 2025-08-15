import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CalendarIcon, MapPin, Clock, AlertTriangle, Hospital, User, Phone } from "lucide-react";
import { format } from "date-fns";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";
import BloodDropIcon from "@/components/BloodDropIcon";
import { cn } from "@/lib/utils";
import { bloodRequestAPI, BloodRequestData } from "@/services/bloodRequestAPI";
import { useToast } from "@/hooks/use-toast";

const RequestBloodPage = () => {
	const navigate = useNavigate();
	const { toast } = useToast();

	const [formData, setFormData] = useState({
		bloodType: "",
		urgency: "",
		unitsNeeded: "",
		requiredBy: undefined as Date | undefined,
		patientName: "",
		patientAge: "",
		medicalCondition: "",
		hospitalName: "",
		doctorName: "",
		contactName: "",
		contactPhone: "",
		contactEmail: "",
		location: { city: "", area: "" },
		additionalNotes: ""
	});

	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Validation
		if (!formData.bloodType || !formData.urgency || !formData.unitsNeeded || !formData.requiredBy ||
			!formData.patientName || !formData.patientAge || !formData.hospitalName || !formData.doctorName ||
			!formData.contactName || !formData.contactPhone || !formData.location.city || !formData.location.area) {
			toast({
				title: "Missing Information",
				description: "Please fill in all required fields including location",
				variant: "destructive",
			});
			return;
		}

		// Validate phone number format (basic validation)
		const phoneRegex = /^(\+88)?0?1[3-9]\d{8}$/;
		if (!phoneRegex.test(formData.contactPhone)) {
			toast({
				title: "Invalid Phone Number",
				description: "Please enter a valid Bangladeshi mobile number (e.g., 01712345678 or +8801712345678)",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Ensure phone number has proper format
			let phoneNumber = formData.contactPhone;
			if (!phoneNumber.startsWith('+88')) {
				if (phoneNumber.startsWith('0')) {
					phoneNumber = '+88' + phoneNumber;
				} else if (phoneNumber.startsWith('1')) {
					phoneNumber = '+880' + phoneNumber;
				} else {
					phoneNumber = '+88' + phoneNumber;
				}
			}

			// Prepare data according to the API schema
			const requestData: BloodRequestData = {
				patient: {
					name: formData.patientName,
					age: parseInt(formData.patientAge),
					gender: 'other', // Default to 'other' since we don't have gender selection
					bloodType: formData.bloodType,
					contactNumber: phoneNumber,
					relationship: 'self' // Default to 'self' since we don't have relationship selection
				},
				hospital: {
					name: formData.hospitalName,
					address: `${formData.location.area}, ${formData.location.city}`,
					city: formData.location.city,
					area: formData.location.area,
					contactNumber: phoneNumber, // Using same contact for now
					doctorName: formData.doctorName
				},
				bloodRequirement: {
					units: parseInt(formData.unitsNeeded),
					urgency: formData.urgency as 'low' | 'medium' | 'high' | 'critical',
					requiredBy: formData.requiredBy!.toISOString(),
					purpose: 'other' // Use 'other' as default since it's in the validation list
				},
				additionalNotes: formData.additionalNotes || formData.medicalCondition
			};

			console.log("Submitting blood request:", requestData);

			const result = await bloodRequestAPI.create(requestData);

			if (result.success) {
				toast({
					title: "Request Submitted Successfully",
					description: "Your blood request has been submitted. You can track its status in your profile.",
				});

				// Reset form
				setFormData({
					bloodType: "",
					urgency: "",
					unitsNeeded: "",
					requiredBy: undefined,
					patientName: "",
					patientAge: "",
					medicalCondition: "",
					hospitalName: "",
					doctorName: "",
					contactName: "",
					contactPhone: "",
					contactEmail: "",
					location: { city: "", area: "" },
					additionalNotes: ""
				});

				// Navigate to profile page to see the request
				setTimeout(() => {
					navigate('/profile');
				}, 2000);

			} else {
				toast({
					title: "Submission Failed",
					description: result.error || "Failed to submit blood request. Please try again.",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error submitting blood request:", error);
			toast({
				title: "Error",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLocationChange = (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => {
		setFormData(prev => ({ ...prev, location }));
	};

	const urgencyLevels = [
		{
			value: "critical",
			label: "Critical",
			description: "Life-threatening emergency, needed within hours",
			color: "text-destructive",
			bgColor: "bg-destructive/10 border-destructive/20"
		},
		{
			value: "high",
			label: "High",
			description: "Urgent need, required within 24 hours",
			color: "text-emergency",
			bgColor: "bg-emergency/10 border-emergency/20"
		},
		{
			value: "medium",
			label: "Medium",
			description: "Planned surgery or treatment, needed within a week",
			color: "text-primary",
			bgColor: "bg-primary/10 border-primary/20"
		},
		{
			value: "low",
			label: "Low",
			description: "Future planning, flexible timeline",
			color: "text-muted-foreground",
			bgColor: "bg-muted border-border"
		}
	];

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<div className="bg-primary/10 p-4 rounded-full">
								<BloodDropIcon size="xl" />
							</div>
						</div>
						<h1 className="text-3xl font-bold text-foreground mb-2">Request Blood</h1>
						<p className="text-lg text-muted-foreground">
							Submit a blood request and connect with donors in your area
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-8">
						{/* Urgency Level */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<AlertTriangle className="h-5 w-5 mr-2 text-primary" />
									Request Urgency
								</CardTitle>
								<CardDescription>
									Please select the urgency level for this blood request
								</CardDescription>
							</CardHeader>
							<CardContent>
								<RadioGroup
									value={formData.urgency}
									onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}
									className="space-y-4"
								>
									{urgencyLevels.map((level) => (
										<div key={level.value} className={cn("border rounded-lg p-4", level.bgColor)}>
											<div className="flex items-center space-x-3">
												<RadioGroupItem value={level.value} id={level.value} />
												<div className="flex-1">
													<Label htmlFor={level.value} className={cn("font-semibold", level.color)}>
														{level.label}
													</Label>
													<p className="text-sm text-muted-foreground mt-1">
														{level.description}
													</p>
												</div>
											</div>
										</div>
									))}
								</RadioGroup>
							</CardContent>
						</Card>

						{/* Blood Requirements */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<BloodDropIcon size="md" className="mr-2" />
									Blood Requirements
								</CardTitle>
								<CardDescription>
									Specify the blood type and quantity needed
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<BloodTypeSelector
									selectedType={formData.bloodType}
									onSelect={(type) => setFormData(prev => ({ ...prev, bloodType: type }))}
									label="Required Blood Type"
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="unitsNeeded">Units Needed</Label>
										<Select
											value={formData.unitsNeeded}
											onValueChange={(value) => setFormData(prev => ({ ...prev, unitsNeeded: value }))}
										>
											<SelectTrigger>
												<SelectValue placeholder="Select units" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">1 Unit</SelectItem>
												<SelectItem value="2">2 Units</SelectItem>
												<SelectItem value="3">3 Units</SelectItem>
												<SelectItem value="4">4 Units</SelectItem>
												<SelectItem value="5+">5+ Units</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label>Required By Date</Label>
										<Popover>
											<PopoverTrigger asChild>
												<Button
													variant="outline"
													className={cn(
														"w-full justify-start text-left font-normal",
														!formData.requiredBy && "text-muted-foreground"
													)}
												>
													<CalendarIcon className="mr-2 h-4 w-4" />
													{formData.requiredBy ? (
														format(formData.requiredBy, "PPP")
													) : (
														<span>Select date</span>
													)}
												</Button>
											</PopoverTrigger>
											<PopoverContent className="w-auto p-0">
												<Calendar
													mode="single"
													selected={formData.requiredBy}
													onSelect={(date) => setFormData(prev => ({ ...prev, requiredBy: date }))}
													disabled={(date) => date < new Date()}
													initialFocus
												/>
											</PopoverContent>
										</Popover>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Patient Information */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<User className="h-5 w-5 mr-2 text-primary" />
									Patient Information
								</CardTitle>
								<CardDescription>
									Details about the patient requiring blood
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="patientName">Patient Name</Label>
										<Input
											id="patientName"
											value={formData.patientName}
											onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="patientAge">Patient Age</Label>
										<Input
											id="patientAge"
											type="number"
											value={formData.patientAge}
											onChange={(e) => setFormData(prev => ({ ...prev, patientAge: e.target.value }))}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="medicalCondition">Medical Condition/Reason</Label>
									<Textarea
										id="medicalCondition"
										placeholder="Brief description of the medical condition or reason for blood requirement..."
										value={formData.medicalCondition}
										onChange={(e) => setFormData(prev => ({ ...prev, medicalCondition: e.target.value }))}
										required
									/>
								</div>
							</CardContent>
						</Card>

						{/* Hospital Information */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<Hospital className="h-5 w-5 mr-2 text-primary" />
									Hospital Information
								</CardTitle>
								<CardDescription>
									Details about the medical facility
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="hospitalName">Hospital/Medical Facility</Label>
										<Input
											id="hospitalName"
											value={formData.hospitalName}
											onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="doctorName">Attending Doctor</Label>
										<Input
											id="doctorName"
											value={formData.doctorName}
											onChange={(e) => setFormData(prev => ({ ...prev, doctorName: e.target.value }))}
											required
										/>
									</div>
								</div>

								<LocationSelector onLocationChange={handleLocationChange} />
							</CardContent>
						</Card>

						{/* Contact Information */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<Phone className="h-5 w-5 mr-2 text-primary" />
									Contact Information
								</CardTitle>
								<CardDescription>
									Primary contact for this blood request
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="contactName">Contact Name</Label>
										<Input
											id="contactName"
											value={formData.contactName}
											onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="contactPhone">Phone Number</Label>
										<Input
											id="contactPhone"
											type="tel"
											value={formData.contactPhone}
											onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="contactEmail">Email Address</Label>
										<Input
											id="contactEmail"
											type="email"
											value={formData.contactEmail}
											onChange={(e) => setFormData(prev => ({ ...prev, contactEmail: e.target.value }))}
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="additionalNotes">Additional Notes (Optional)</Label>
									<Textarea
										id="additionalNotes"
										placeholder="Any additional information that might help donors..."
										value={formData.additionalNotes}
										onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Submit Button */}
						<Card className="shadow-lg border-border/50">
							<CardContent className="pt-6">
								<div className="text-center space-y-4">
									<p className="text-sm text-muted-foreground">
										By submitting this request, you confirm that all information provided is accurate
										and you have proper authorization to make this blood request.
									</p>
									<Button
										type="submit"
										size="lg"
										className="w-full md:w-auto px-12"
										variant={formData.urgency === "critical" ? "emergency" : "default"}
										disabled={isSubmitting}
									>
										{isSubmitting ? (
											<>
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
												Submitting...
											</>
										) : formData.urgency === "critical" ? (
											<>
												<AlertTriangle className="h-4 w-4 mr-2" />
												Submit Critical Request
											</>
										) : (
											<>
												<BloodDropIcon size="sm" className="mr-2" />
												Submit Blood Request
											</>
										)}
									</Button>
								</div>
							</CardContent>
						</Card>
					</form>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default RequestBloodPage;