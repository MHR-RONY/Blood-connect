import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { hospitalDonationAPI, availableDonorAPI } from "@/services/donationAPI";
import {
	Droplets,
	Heart,
	MapPin,
	Clock,
	User,
	Phone,
	Mail,
	Calendar,
	AlertTriangle,
	Shield,
	Award,
	Users,
	Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";

const BloodDonatePage = () => {
	const { user } = useAuth();
	const { toast } = useToast();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [donationData, setDonationData] = useState({
		bloodType: "",
		quantity: "450", // Standard unit
		donationType: "", // "hospital" or "people"
		urgency: "medium", // Urgency level for hospital donations
		emergencyContact: "",
		emergencyPhone: "",
		lastDonation: "",
		medications: "",
		medicalConditions: "",
		donationCenter: "",
		preferredDate: "",
		preferredTime: "",
		availability: "", // For "people" option
		contactPreference: "", // For "people" option
		notes: "",
		termsAccepted: false,
		eligibilityConfirmed: false
	});

	const bloodQuantities = [
		{ value: "450", label: "450ml (Standard)", description: "Full donation" },
		{ value: "350", label: "350ml", description: "Reduced donation" },
		{ value: "250", label: "250ml", description: "Minimum donation" }
	];

	const donationCenters = [
		{ value: "dhaka-medical", label: "Dhaka Medical College Hospital", address: "Dhaka" },
		{ value: "square-hospital", label: "Square Hospital", address: "Panthapath, Dhaka" },
		{ value: "apollo-hospital", label: "Apollo Hospitals", address: "Bashundhara, Dhaka" },
		{ value: "red-crescent", label: "Bangladesh Red Crescent", address: "Multiple Locations" }
	];

	const timeSlots = [
		"9:00 AM - 10:00 AM",
		"10:00 AM - 11:00 AM",
		"11:00 AM - 12:00 PM",
		"2:00 PM - 3:00 PM",
		"3:00 PM - 4:00 PM",
		"4:00 PM - 5:00 PM"
	];

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!user) {
			toast({
				title: "Authentication Required",
				description: "Please login to submit a donation request.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			if (donationData.donationType === "hospital") {
				// Submit hospital donation request
				const hospitalRequest = {
					bloodType: donationData.bloodType,
					unitsNeeded: parseInt(donationData.quantity) / 450, // Convert ml to units
					urgencyLevel: donationData.urgency as 'low' | 'medium' | 'high' | 'critical',
					donationDate: donationData.preferredDate,
					hospital: donationData.donationCenter,
					contactPhone: donationData.emergencyPhone || user.phone,
					medicalConditions: donationData.medicalConditions,
					notes: donationData.notes,
				};

				await hospitalDonationAPI.submit(hospitalRequest);

				toast({
					title: "Donation Request Submitted! 🩸",
					description: "Your hospital donation appointment has been submitted. You'll receive confirmation once approved by our admin team.",
				});

			} else if (donationData.donationType === "people") {
				// Register as available donor
				const donorRequest = {
					isAvailable: true,
					availableUntil: donationData.availability,
					preferredTimeSlots: donationData.preferredTime ? [donationData.preferredTime] : undefined,
					maxDistanceKm: 50, // Default distance
					emergencyContact: donationData.emergencyContact === "yes",
					notes: donationData.notes,
				};

				await availableDonorAPI.register(donorRequest);

				toast({
					title: "Registered as Available Donor! 👥",
					description: "You have been registered as an available donor. People in need can now contact you directly.",
				});
			}

			// Reset form
			setDonationData({
				bloodType: "",
				quantity: "450",
				donationType: "",
				urgency: "medium",
				emergencyContact: "",
				emergencyPhone: "",
				lastDonation: "",
				medications: "",
				medicalConditions: "",
				donationCenter: "",
				preferredDate: "",
				preferredTime: "",
				availability: "",
				contactPreference: "",
				notes: "",
				termsAccepted: false,
				eligibilityConfirmed: false
			});

		} catch (error) {
			console.error('Submission error:', error);
			toast({
				title: "Submission Failed",
				description: "There was an error submitting your request. Please try again later.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	const isFormValid = () => {
		const baseValidation = donationData.bloodType &&
			donationData.donationType &&
			donationData.termsAccepted &&
			donationData.eligibilityConfirmed;

		if (!baseValidation) return false;

		// Additional validation based on donation type
		if (donationData.donationType === "hospital") {
			return donationData.donationCenter &&
				donationData.preferredDate &&
				donationData.preferredTime;
		} else if (donationData.donationType === "people") {
			return donationData.availability &&
				donationData.contactPreference;
		}

		return false;
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<div className="bg-primary/10 p-4 rounded-full">
								<Droplets className="h-12 w-12 text-primary" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-2">Donate Blood</h1>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Join our life-saving mission. Choose to schedule a hospital appointment or make yourself available for emergency donations. Your blood donation can save up to 3 lives.
						</p>
					</div>

					{/* Impact Stats */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Users className="h-8 w-8 text-primary" />
								</div>
								<div className="text-2xl font-bold text-primary">15,000+</div>
								<div className="text-sm text-muted-foreground">Active Donors</div>
							</CardContent>
						</Card>
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Heart className="h-8 w-8 text-success" />
								</div>
								<div className="text-2xl font-bold text-success">45,000+</div>
								<div className="text-sm text-muted-foreground">Lives Saved</div>
							</CardContent>
						</Card>
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Droplets className="h-8 w-8 text-emergency" />
								</div>
								<div className="text-2xl font-bold text-emergency">500+</div>
								<div className="text-sm text-muted-foreground">Units This Month</div>
							</CardContent>
						</Card>
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Award className="h-8 w-8 text-primary" />
								</div>
								<div className="text-2xl font-bold text-primary">25+</div>
								<div className="text-sm text-muted-foreground">Donation Centers</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Donation Form */}
						<div className="lg:col-span-2">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Blood Type & Quantity */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center">
											<Droplets className="h-5 w-5 mr-2 text-primary" />
											Blood Information
										</CardTitle>
										<CardDescription>
											Select your blood type and donation quantity
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="space-y-4">
											<div>
												<Label className="text-base font-medium mb-3 block">Blood Type</Label>
												<BloodTypeSelector
													selectedType={donationData.bloodType}
													onSelect={(value) => setDonationData(prev => ({ ...prev, bloodType: value }))}
												/>
											</div>

											<div>
												<Label className="text-base font-medium mb-3 block">Donation Quantity</Label>
												<RadioGroup
													value={donationData.quantity}
													onValueChange={(value) => setDonationData(prev => ({ ...prev, quantity: value }))}
													className="grid grid-cols-1 gap-3"
												>
													{bloodQuantities.map((qty) => (
														<div key={qty.value} className="flex items-center space-x-2 p-3 border rounded-lg">
															<RadioGroupItem value={qty.value} id={qty.value} />
															<Label htmlFor={qty.value} className="flex-1">
																<div className="font-medium">{qty.label}</div>
																<div className="text-xs text-muted-foreground">{qty.description}</div>
															</Label>
														</div>
													))}
												</RadioGroup>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Emergency Contact */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center">
											<Phone className="h-5 w-5 mr-2 text-primary" />
											Emergency Contact
										</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="emergencyContact">Emergency Contact Email</Label>
												<Input
													id="emergencyContact"
													type="email"
													value={donationData.emergencyContact}
													onChange={(e) => setDonationData(prev => ({ ...prev, emergencyContact: e.target.value }))}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
												<Input
													id="emergencyPhone"
													type="tel"
													value={donationData.emergencyPhone}
													onChange={(e) => setDonationData(prev => ({ ...prev, emergencyPhone: e.target.value }))}
												/>
											</div>
										</div>
									</CardContent>
								</Card>

								{/* Medical Information */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center">
											<Shield className="h-5 w-5 mr-2 text-primary" />
											Medical Information
										</CardTitle>
										<CardDescription>
											Help us ensure safe donation
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="lastDonation">Last Blood Donation Date</Label>
											<Input
												id="lastDonation"
												type="date"
												value={donationData.lastDonation}
												onChange={(e) => setDonationData(prev => ({ ...prev, lastDonation: e.target.value }))}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="medications">Current Medications</Label>
											<Textarea
												id="medications"
												placeholder="List any medications you're currently taking..."
												value={donationData.medications}
												onChange={(e) => setDonationData(prev => ({ ...prev, medications: e.target.value }))}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="medicalConditions">Medical Conditions</Label>
											<Textarea
												id="medicalConditions"
												placeholder="List any medical conditions or allergies..."
												value={donationData.medicalConditions}
												onChange={(e) => setDonationData(prev => ({ ...prev, medicalConditions: e.target.value }))}
											/>
										</div>
									</CardContent>
								</Card>

								{/* Appointment Details */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center">
											<Calendar className="h-5 w-5 mr-2 text-primary" />
											Donation Options
										</CardTitle>
										<CardDescription>
											Choose how you want to donate blood
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										{/* Donation Type Selection */}
										<div className="space-y-4">
											<Label className="text-base font-medium">Donation Type</Label>
											<RadioGroup
												value={donationData.donationType}
												onValueChange={(value) => setDonationData(prev => ({ ...prev, donationType: value }))}
												className="grid grid-cols-1 gap-4"
											>
												<div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
													<div className="flex items-start space-x-3">
														<RadioGroupItem value="hospital" id="hospital" className="mt-1" />
														<Label htmlFor="hospital" className="flex-1 cursor-pointer">
															<div className="flex items-center gap-2 mb-2">
																<MapPin className="h-5 w-5 text-primary" />
																<span className="font-semibold text-lg">Donate via Hospital</span>
															</div>
															<p className="text-sm text-muted-foreground mb-2">
																Schedule an appointment at a donation center or hospital. Perfect for regular donations with professional medical supervision.
															</p>
															<div className="flex flex-wrap gap-2">
																<Badge variant="outline">Scheduled</Badge>
																<Badge variant="outline">Professional supervision</Badge>
																<Badge variant="outline">Medical facilities</Badge>
															</div>
														</Label>
													</div>
												</div>

												<div className="border rounded-lg p-4 hover:bg-accent/50 transition-colors">
													<div className="flex items-start space-x-3">
														<RadioGroupItem value="people" id="people" className="mt-1" />
														<Label htmlFor="people" className="flex-1 cursor-pointer">
															<div className="flex items-center gap-2 mb-2">
																<Users className="h-5 w-5 text-emergency" />
																<span className="font-semibold text-lg">Donate when People Need</span>
															</div>
															<p className="text-sm text-muted-foreground mb-2">
																Make yourself available for emergency donations. People in need will contact you directly when they require your blood type.
															</p>
															<div className="flex flex-wrap gap-2">
																<Badge variant="outline">On-demand</Badge>
																<Badge variant="outline">Emergency response</Badge>
																<Badge variant="outline">Direct contact</Badge>
															</div>
														</Label>
													</div>
												</div>
											</RadioGroup>
										</div>

										{/* Conditional Forms based on donation type */}
										{donationData.donationType === "hospital" && (
											<div className="space-y-4 border-t pt-4">
												<h4 className="font-semibold text-lg flex items-center gap-2">
													<Calendar className="h-5 w-5 text-primary" />
													Appointment Details
												</h4>
												<p className="text-sm text-muted-foreground">
													Choose your preferred donation time and location
												</p>

												<div className="space-y-2">
													<Label htmlFor="donationCenter">Donation Center</Label>
													<Select value={donationData.donationCenter} onValueChange={(value) => setDonationData(prev => ({ ...prev, donationCenter: value }))}>
														<SelectTrigger>
															<SelectValue placeholder="Select donation center" />
														</SelectTrigger>
														<SelectContent>
															{donationCenters.map((center) => (
																<SelectItem key={center.value} value={center.value}>
																	<div>
																		<div className="font-medium">{center.label}</div>
																		<div className="text-xs text-muted-foreground">{center.address}</div>
																	</div>
																</SelectItem>
															))}
														</SelectContent>
													</Select>
												</div>

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
													<div className="space-y-2">
														<Label htmlFor="preferredDate">Preferred Date</Label>
														<Input
															id="preferredDate"
															type="date"
															min={new Date().toISOString().split('T')[0]}
															value={donationData.preferredDate}
															onChange={(e) => setDonationData(prev => ({ ...prev, preferredDate: e.target.value }))}
														/>
													</div>

													<div className="space-y-2">
														<Label htmlFor="preferredTime">Preferred Time</Label>
														<Select value={donationData.preferredTime} onValueChange={(value) => setDonationData(prev => ({ ...prev, preferredTime: value }))}>
															<SelectTrigger>
																<SelectValue placeholder="Select time slot" />
															</SelectTrigger>
															<SelectContent>
																{timeSlots.map((time) => (
																	<SelectItem key={time} value={time}>{time}</SelectItem>
																))}
															</SelectContent>
														</Select>
													</div>
												</div>

												<div className="space-y-2">
													<Label htmlFor="notes">Additional Notes</Label>
													<Textarea
														id="notes"
														placeholder="Any special requirements or notes..."
														value={donationData.notes}
														onChange={(e) => setDonationData(prev => ({ ...prev, notes: e.target.value }))}
													/>
												</div>
											</div>
										)}

										{donationData.donationType === "people" && (
											<div className="space-y-4 border-t pt-4">
												<h4 className="font-semibold text-lg flex items-center gap-2">
													<Users className="h-5 w-5 text-emergency" />
													Availability Details
												</h4>
												<p className="text-sm text-muted-foreground">
													Set your availability for emergency blood donations
												</p>

												<div className="space-y-2">
													<Label htmlFor="availability">When are you available?</Label>
													<Select value={donationData.availability} onValueChange={(value) => setDonationData(prev => ({ ...prev, availability: value }))}>
														<SelectTrigger>
															<SelectValue placeholder="Select your availability" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="anytime">Available Anytime</SelectItem>
															<SelectItem value="weekdays">Weekdays Only</SelectItem>
															<SelectItem value="weekends">Weekends Only</SelectItem>
															<SelectItem value="mornings">Morning Hours (6AM-12PM)</SelectItem>
															<SelectItem value="afternoons">Afternoon Hours (12PM-6PM)</SelectItem>
															<SelectItem value="evenings">Evening Hours (6PM-10PM)</SelectItem>
															<SelectItem value="emergencies">Emergency Cases Only</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-2">
													<Label htmlFor="contactPreference">Preferred Contact Method</Label>
													<Select value={donationData.contactPreference} onValueChange={(value) => setDonationData(prev => ({ ...prev, contactPreference: value }))}>
														<SelectTrigger>
															<SelectValue placeholder="How should people contact you?" />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="phone">Phone Call</SelectItem>
															<SelectItem value="sms">SMS/Text Message</SelectItem>
															<SelectItem value="both">Phone & SMS</SelectItem>
															<SelectItem value="emergency-only">Emergency Cases Only</SelectItem>
														</SelectContent>
													</Select>
												</div>

												<div className="space-y-2">
													<Label htmlFor="notes">Additional Information</Label>
													<Textarea
														id="notes"
														placeholder="Any conditions, preferences, or additional information for people who might contact you..."
														value={donationData.notes}
														onChange={(e) => setDonationData(prev => ({ ...prev, notes: e.target.value }))}
														rows={4}
													/>
												</div>

												<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
													<div className="flex items-start gap-3">
														<Users className="h-5 w-5 text-blue-600 mt-0.5" />
														<div>
															<h5 className="font-medium text-blue-900 mb-1">How it works:</h5>
															<ul className="text-sm text-blue-800 space-y-1">
																<li>• Your information will be listed on the Find Donors page</li>
																<li>• People in need can see your blood type and location</li>
																<li>• They will contact you directly when they need blood</li>
																<li>• You can choose to accept or decline each request</li>
															</ul>
														</div>
													</div>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Terms and Conditions */}
								<Card className="shadow-lg border-border/50">
									<CardContent className="pt-6 space-y-4">
										<div className="flex items-start space-x-2">
											<Checkbox
												id="eligibilityConfirmed"
												checked={donationData.eligibilityConfirmed}
												onCheckedChange={(checked) => setDonationData(prev => ({ ...prev, eligibilityConfirmed: checked as boolean }))}
											/>
											<Label htmlFor="eligibilityConfirmed" className="text-sm leading-relaxed">
												I confirm that I am between 18-65 years old, weigh at least 50kg,
												am in good health, and have not donated blood in the last 3 months.
											</Label>
										</div>

										<div className="flex items-start space-x-2">
											<Checkbox
												id="termsAccepted"
												checked={donationData.termsAccepted}
												onCheckedChange={(checked) => setDonationData(prev => ({ ...prev, termsAccepted: checked as boolean }))}
											/>
											<Label htmlFor="termsAccepted" className="text-sm leading-relaxed">
												I agree to the <span className="text-primary underline cursor-pointer">terms and conditions</span> and
												<span className="text-primary underline cursor-pointer"> privacy policy</span>.
												I consent to medical screening before donation.
											</Label>
										</div>

										<Button
											type="submit"
											size="lg"
											className="w-full"
											disabled={!isFormValid() || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Loader2 className="h-5 w-5 mr-2 animate-spin" />
													Submitting...
												</>
											) : (
												<>
													<Droplets className="h-5 w-5 mr-2" />
													{donationData.donationType === "hospital"
														? "Submit Hospital Donation Request"
														: donationData.donationType === "people"
															? "Register as Available Donor"
															: "Submit Donation Application"
													}
												</>
											)}
										</Button>
									</CardContent>
								</Card>
							</form>
						</div>

						{/* Sidebar */}
						<div className="space-y-6">
							{/* Eligibility Requirements */}
							<Card className="shadow-lg border-border/50">
								<CardHeader>
									<CardTitle className="text-lg">Eligibility Requirements</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center space-x-2 text-sm">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>Age: 18-65 years</span>
									</div>
									<div className="flex items-center space-x-2 text-sm">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>Weight: Minimum 50kg</span>
									</div>
									<div className="flex items-center space-x-2 text-sm">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>Good general health</span>
									</div>
									<div className="flex items-center space-x-2 text-sm">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>No blood donation in last 3 months</span>
									</div>
									<div className="flex items-center space-x-2 text-sm">
										<div className="w-2 h-2 bg-primary rounded-full"></div>
										<span>No recent illness or medication</span>
									</div>
								</CardContent>
							</Card>

							{/* Donation Process */}
							<Card className="shadow-lg border-border/50">
								<CardHeader>
									<CardTitle className="text-lg">Donation Process</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start space-x-3">
										<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">1</div>
										<div>
											<div className="font-medium text-sm">Registration</div>
											<div className="text-xs text-muted-foreground">Complete forms and health questionnaire</div>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">2</div>
										<div>
											<div className="font-medium text-sm">Medical Screening</div>
											<div className="text-xs text-muted-foreground">Quick health check and blood typing</div>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">3</div>
										<div>
											<div className="font-medium text-sm">Blood Donation</div>
											<div className="text-xs text-muted-foreground">10-15 minutes donation process</div>
										</div>
									</div>
									<div className="flex items-start space-x-3">
										<div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mt-0.5">4</div>
										<div>
											<div className="font-medium text-sm">Recovery</div>
											<div className="text-xs text-muted-foreground">Rest and refreshments provided</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Contact Info */}
							<Card className="shadow-lg border-border/50">
								<CardHeader>
									<CardTitle className="text-lg">Need Help?</CardTitle>
								</CardHeader>
								<CardContent className="space-y-3">
									<div className="flex items-center space-x-2 text-sm">
										<Phone className="h-4 w-4 text-primary" />
										<span>+880-1234-567890</span>
									</div>
									<div className="flex items-center space-x-2 text-sm">
										<Mail className="h-4 w-4 text-primary" />
										<span>donate@bloodconnect.bd</span>
									</div>
									<div className="flex items-center space-x-2 text-sm">
										<Clock className="h-4 w-4 text-primary" />
										<span>24/7 Emergency Support</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default BloodDonatePage;