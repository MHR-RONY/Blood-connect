import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import emergencyAPI, { EmergencyRequest } from "@/services/emergencyAPI";
import {
	AlertTriangle,
	Phone,
	MapPin,
	Clock,
	Zap,
	Hospital,
	User,
	Siren,
	Loader2
} from "lucide-react";
import BloodDropIcon from "@/components/BloodDropIcon";
import BloodTypeSelector from "@/components/BloodTypeSelector";

const EmergencyRequestPage = () => {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { toast } = useToast();

	const [formData, setFormData] = useState({
		patient: {
			name: "",
			age: "",
			gender: "",
			bloodType: "",
			contactNumber: ""
		},
		emergency: {
			type: "",
			severity: "",
			description: "",
			timeOfIncident: new Date().toISOString()
		},
		hospital: {
			name: "",
			address: "",
			city: "",
			area: "",
			contactNumber: "",
			emergencyDepartment: "",
			doctorInCharge: {
				name: ""
			}
		},
		bloodRequirement: {
			units: "",
			requiredWithin: ""
		},
		consentGiven: false
	});

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!formData.consentGiven) {
			toast({
				title: "Consent Required",
				description: "Please confirm emergency consent to proceed.",
				variant: "destructive",
			});
			return;
		}

		setIsSubmitting(true);

		try {
			// Prepare data for API
			const requestData: EmergencyRequest = {
				patient: {
					name: formData.patient.name,
					age: parseInt(formData.patient.age),
					gender: formData.patient.gender as 'male' | 'female' | 'other',
					bloodType: formData.patient.bloodType,
					contactNumber: formData.patient.contactNumber
				},
				emergency: {
					type: formData.emergency.type as 'accident' | 'surgery' | 'massive-bleeding' | 'organ-failure' | 'pregnancy-complication' | 'blood-disorder' | 'other',
					severity: formData.emergency.severity as 'critical' | 'severe' | 'moderate',
					description: formData.emergency.description,
					timeOfIncident: formData.emergency.timeOfIncident
				},
				hospital: {
					name: formData.hospital.name,
					address: formData.hospital.address,
					city: formData.hospital.city,
					area: formData.hospital.area,
					contactNumber: formData.hospital.contactNumber,
					emergencyDepartment: formData.hospital.emergencyDepartment,
					doctorInCharge: {
						name: formData.hospital.doctorInCharge.name
					}
				},
				bloodRequirement: {
					units: parseInt(formData.bloodRequirement.units),
					requiredWithin: parseInt(formData.bloodRequirement.requiredWithin)
				}
			};

			const response = await emergencyAPI.createEmergencyRequest(requestData);

			if (response.success) {
				toast({
					title: "Emergency Alert Sent! 🚨",
					description: `Your emergency request has been broadcast to eligible donors. ${response.data?.broadcastStatus}`,
					duration: 8000,
				});

				// Reset form
				setFormData({
					patient: { name: "", age: "", gender: "", bloodType: "", contactNumber: "" },
					emergency: { type: "", severity: "", description: "", timeOfIncident: new Date().toISOString() },
					hospital: { name: "", address: "", city: "", area: "", contactNumber: "", emergencyDepartment: "", doctorInCharge: { name: "" } },
					bloodRequirement: { units: "", requiredWithin: "" },
					consentGiven: false
				});
			} else {
				toast({
					title: "Request Failed",
					description: response.message,
					variant: "destructive",
				});
			}
		} catch (error) {
			toast({
				title: "Error",
				description: "An unexpected error occurred. Please try again.",
				variant: "destructive",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-emergency/5 to-destructive/5">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-3xl mx-auto">
					{/* Emergency Header */}
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<div className="bg-emergency/20 p-4 rounded-full animate-pulse">
								<Siren className="h-12 w-12 text-emergency" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-emergency mb-2">EMERGENCY BLOOD REQUEST</h1>
						<p className="text-lg text-muted-foreground">
							Critical blood requirement - Immediate donor response needed
						</p>
						<div className="bg-emergency/10 border border-emergency/20 rounded-lg p-4 mt-4">
							<div className="flex items-center justify-center space-x-2 text-emergency">
								<Clock className="h-5 w-5" />
								<span className="font-semibold">This request will be sent to all nearby donors immediately</span>
							</div>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Critical Information */}
						<Card className="shadow-lg border-emergency/20 bg-gradient-to-r from-emergency/5 to-destructive/5">
							<CardHeader>
								<CardTitle className="flex items-center text-emergency">
									<AlertTriangle className="h-6 w-6 mr-2" />
									Critical Information
								</CardTitle>
								<CardDescription>
									<strong>Emergency protocols activated.</strong> This information will be shared with verified donors immediately.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<BloodTypeSelector
									selectedType={formData.patient.bloodType}
									onSelect={(type) => setFormData(prev => ({
										...prev,
										patient: { ...prev.patient, bloodType: type }
									}))}
									label="URGENT: Required Blood Type"
								/>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="unitsNeeded" className="text-emergency font-semibold">
											Units Needed (CRITICAL)
										</Label>
										<Select
											value={formData.bloodRequirement.units}
											onValueChange={(value) => setFormData(prev => ({
												...prev,
												bloodRequirement: { ...prev.bloodRequirement, units: value }
											}))}
											required
										>
											<SelectTrigger className="border-emergency/30">
												<SelectValue placeholder="Select units needed" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">1 Unit (URGENT)</SelectItem>
												<SelectItem value="2">2 Units (CRITICAL)</SelectItem>
												<SelectItem value="3">3 Units (CRITICAL)</SelectItem>
												<SelectItem value="4">4 Units (CRITICAL)</SelectItem>
												<SelectItem value="5">5 Units (CRITICAL)</SelectItem>
												<SelectItem value="6">6+ Units (CRITICAL)</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="requiredWithin" className="text-emergency font-semibold">
											Required Within (Hours)
										</Label>
										<Select
											value={formData.bloodRequirement.requiredWithin}
											onValueChange={(value) => setFormData(prev => ({
												...prev,
												bloodRequirement: { ...prev.bloodRequirement, requiredWithin: value }
											}))}
											required
										>
											<SelectTrigger className="border-emergency/30">
												<SelectValue placeholder="Hours" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="1">1 Hour (IMMEDIATE)</SelectItem>
												<SelectItem value="3">3 Hours (URGENT)</SelectItem>
												<SelectItem value="6">6 Hours (CRITICAL)</SelectItem>
												<SelectItem value="12">12 Hours</SelectItem>
												<SelectItem value="24">24 Hours</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="patientName" className="text-emergency font-semibold">
											Patient Name
										</Label>
										<Input
											id="patientName"
											className="border-emergency/30"
											value={formData.patient.name}
											onChange={(e) => setFormData(prev => ({
												...prev,
												patient: { ...prev.patient, name: e.target.value }
											}))}
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="patientAge" className="text-emergency font-semibold">
											Patient Age
										</Label>
										<Input
											id="patientAge"
											type="number"
											className="border-emergency/30"
											value={formData.patient.age}
											onChange={(e) => setFormData(prev => ({
												...prev,
												patient: { ...prev.patient, age: e.target.value }
											}))}
											min="0"
											max="150"
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="patientGender" className="text-emergency font-semibold">
											Patient Gender
										</Label>
										<Select
											value={formData.patient.gender}
											onValueChange={(value) => setFormData(prev => ({
												...prev,
												patient: { ...prev.patient, gender: value }
											}))}
											required
										>
											<SelectTrigger className="border-emergency/30">
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">Male</SelectItem>
												<SelectItem value="female">Female</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="patientContact" className="text-emergency font-semibold">
											Patient Contact
										</Label>
										<Input
											id="patientContact"
											type="tel"
											className="border-emergency/30"
											value={formData.patient.contactNumber}
											onChange={(e) => setFormData(prev => ({
												...prev,
												patient: { ...prev.patient, contactNumber: e.target.value }
											}))}
											placeholder="Patient's phone number"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="emergencyType" className="text-emergency font-semibold">
											Emergency Type
										</Label>
										<Select
											value={formData.emergency.type}
											onValueChange={(value) => setFormData(prev => ({
												...prev,
												emergency: { ...prev.emergency, type: value }
											}))}
											required
										>
											<SelectTrigger className="border-emergency/30">
												<SelectValue placeholder="Select emergency type" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="accident">Accident</SelectItem>
												<SelectItem value="surgery">Surgery</SelectItem>
												<SelectItem value="massive-bleeding">Massive Bleeding</SelectItem>
												<SelectItem value="organ-failure">Organ Failure</SelectItem>
												<SelectItem value="pregnancy-complication">Pregnancy Complication</SelectItem>
												<SelectItem value="blood-disorder">Blood Disorder</SelectItem>
												<SelectItem value="other">Other</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="emergencySeverity" className="text-emergency font-semibold">
											Severity Level
										</Label>
										<Select
											value={formData.emergency.severity}
											onValueChange={(value) => setFormData(prev => ({
												...prev,
												emergency: { ...prev.emergency, severity: value }
											}))}
											required
										>
											<SelectTrigger className="border-emergency/30">
												<SelectValue placeholder="Select severity" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="critical">Critical (Life-threatening)</SelectItem>
												<SelectItem value="severe">Severe (Urgent care needed)</SelectItem>
												<SelectItem value="moderate">Moderate (Important but stable)</SelectItem>
											</SelectContent>
										</Select>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emergencyDetails" className="text-emergency font-semibold">
										Emergency Details
									</Label>
									<Textarea
										id="emergencyDetails"
										className="border-emergency/30"
										placeholder="Brief description of the emergency (surgery, accident, etc.)..."
										value={formData.emergency.description}
										onChange={(e) => setFormData(prev => ({
											...prev,
											emergency: { ...prev.emergency, description: e.target.value }
										}))}
										required
									/>
								</div>
							</CardContent>
						</Card>

						{/* Hospital Location */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<Hospital className="h-5 w-5 mr-2 text-primary" />
									Hospital Location
								</CardTitle>
								<CardDescription>
									Where donors should arrive for blood donation
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="hospitalName">Hospital/Medical Facility</Label>
									<Input
										id="hospitalName"
										value={formData.hospital.name}
										onChange={(e) => setFormData(prev => ({
											...prev,
											hospital: { ...prev.hospital, name: e.target.value }
										}))}
										placeholder="Enter hospital name"
										required
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="hospitalAddress">Hospital Address</Label>
									<Input
										id="hospitalAddress"
										value={formData.hospital.address}
										onChange={(e) => setFormData(prev => ({
											...prev,
											hospital: { ...prev.hospital, address: e.target.value }
										}))}
										placeholder="Full address of hospital"
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="hospitalCity">City</Label>
										<Input
											id="hospitalCity"
											value={formData.hospital.city}
											onChange={(e) => setFormData(prev => ({
												...prev,
												hospital: { ...prev.hospital, city: e.target.value }
											}))}
											placeholder="City"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="hospitalArea">Area</Label>
										<Input
											id="hospitalArea"
											value={formData.hospital.area}
											onChange={(e) => setFormData(prev => ({
												...prev,
												hospital: { ...prev.hospital, area: e.target.value }
											}))}
											placeholder="Area/District"
											required
										/>
									</div>
								</div>

								<div className="space-y-2">
									<Label htmlFor="emergencyDept">Emergency Department Contact</Label>
									<Input
										id="emergencyDept"
										value={formData.hospital.emergencyDepartment}
										onChange={(e) => setFormData(prev => ({
											...prev,
											hospital: { ...prev.hospital, emergencyDepartment: e.target.value }
										}))}
										placeholder="Emergency department phone or contact"
										required
									/>
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
								<CardDescription>
									Primary contact for immediate coordination
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div className="space-y-2">
										<Label htmlFor="doctorName">Doctor in Charge</Label>
										<Input
											id="doctorName"
											value={formData.hospital.doctorInCharge.name}
											onChange={(e) => setFormData(prev => ({
												...prev,
												hospital: {
													...prev.hospital,
													doctorInCharge: { ...prev.hospital.doctorInCharge, name: e.target.value }
												}
											}))}
											placeholder="Doctor's name"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="hospitalContact">Hospital Contact</Label>
										<Input
											id="hospitalContact"
											type="tel"
											value={formData.hospital.contactNumber}
											onChange={(e) => setFormData(prev => ({
												...prev,
												hospital: { ...prev.hospital, contactNumber: e.target.value }
											}))}
											placeholder="Hospital main number"
											required
										/>
									</div>
									<div className="space-y-2">
										<Label htmlFor="timeOfIncident">Time of Incident</Label>
										<Input
											id="timeOfIncident"
											type="datetime-local"
											value={formData.emergency.timeOfIncident.slice(0, 16)}
											onChange={(e) => setFormData(prev => ({
												...prev,
												emergency: { ...prev.emergency, timeOfIncident: new Date(e.target.value).toISOString() }
											}))}
											required
										/>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Consent and Submit */}
						<Card className="shadow-lg border-emergency/20 bg-emergency/5">
							<CardContent className="pt-6">
								<div className="space-y-6">
									<div className="flex items-start space-x-3">
										<Checkbox
											id="consentGiven"
											checked={formData.consentGiven}
											onCheckedChange={(checked) => setFormData(prev => ({ ...prev, consentGiven: checked as boolean }))}
											required
										/>
										<Label htmlFor="consentGiven" className="text-sm leading-relaxed">
											<strong>EMERGENCY CONSENT:</strong> I confirm this is a genuine medical emergency
											and authorize the immediate broadcast of this request to all verified donors.
											I understand that false emergency requests may result in legal consequences and
											account suspension.
										</Label>
									</div>

									<div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
										<div className="flex items-start space-x-3">
											<AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
											<div className="text-sm">
												<p className="font-semibold text-destructive mb-1">Critical Alert System</p>
												<p className="text-muted-foreground">
													This emergency request will trigger immediate SMS, email, and push notifications
													to all compatible donors within a 50km radius. Please ensure all information is accurate.
												</p>
											</div>
										</div>
									</div>

									<div className="text-center">
										<Button
											type="submit"
											size="lg"
											variant="emergency"
											className="w-full md:w-auto px-12 py-4 text-lg font-semibold"
											disabled={!formData.consentGiven || isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Loader2 className="h-5 w-5 mr-2 animate-spin" />
													SENDING ALERT...
												</>
											) : (
												<>
													<Zap className="h-5 w-5 mr-2" />
													SEND EMERGENCY ALERT
												</>
											)}
										</Button>
										<p className="text-xs text-muted-foreground mt-2">
											Emergency alerts are sent immediately and cannot be cancelled
										</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Emergency Resources */}
						<Card className="shadow-lg border-border/50">
							<CardHeader>
								<CardTitle className="flex items-center">
									<BloodDropIcon size="md" className="mr-2" />
									Emergency Resources
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
									<div className="p-4 bg-medical rounded-lg">
										<Phone className="h-6 w-6 text-primary mx-auto mb-2" />
										<h4 className="font-semibold text-sm">Blood Bank Hotline</h4>
										<p className="text-xs text-muted-foreground">1-800-RED-CROSS</p>
									</div>
									<div className="p-4 bg-medical rounded-lg">
										<Siren className="h-6 w-6 text-emergency mx-auto mb-2" />
										<h4 className="font-semibold text-sm">Medical Emergency</h4>
										<p className="text-xs text-muted-foreground">Call 911</p>
									</div>
									<div className="p-4 bg-medical rounded-lg">
										<MapPin className="h-6 w-6 text-primary mx-auto mb-2" />
										<h4 className="font-semibold text-sm">Find Blood Banks</h4>
										<p className="text-xs text-muted-foreground">Nearest facilities</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</form>
				</div>
			</div>
		</div>
	);
};

export default EmergencyRequestPage;