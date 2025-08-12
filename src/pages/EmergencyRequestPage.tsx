import { useState } from "react";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
	AlertTriangle,
	Phone,
	MapPin,
	Clock,
	Zap,
	Hospital,
	User,
	Siren
} from "lucide-react";
import BloodDropIcon from "@/components/BloodDropIcon";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";

const EmergencyRequestPage = () => {
	const [formData, setFormData] = useState({
		bloodType: "",
		unitsNeeded: "",
		patientName: "",
		hospitalName: "",
		contactName: "",
		contactPhone: "",
		location: { city: "", area: "" },
		emergencyDetails: "",
		consentGiven: false
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Emergency request submitted:", formData);
		// Here you would send the emergency alert to your backend
	};

	const handleLocationChange = (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => {
		setFormData(prev => ({ ...prev, location }));
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
									selectedType={formData.bloodType}
									onSelect={(type) => setFormData(prev => ({ ...prev, bloodType: type }))}
									label="URGENT: Required Blood Type"
								/>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label htmlFor="unitsNeeded" className="text-emergency font-semibold">
											Units Needed (CRITICAL)
										</Label>
										<Select
											value={formData.unitsNeeded}
											onValueChange={(value) => setFormData(prev => ({ ...prev, unitsNeeded: value }))}
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
												<SelectItem value="5+">5+ Units (CRITICAL)</SelectItem>
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
											value={formData.patientName}
											onChange={(e) => setFormData(prev => ({ ...prev, patientName: e.target.value }))}
											required
										/>
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
										value={formData.emergencyDetails}
										onChange={(e) => setFormData(prev => ({ ...prev, emergencyDetails: e.target.value }))}
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
										value={formData.hospitalName}
										onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
										placeholder="Enter hospital name and address"
										required
									/>
								</div>

								<LocationSelector onLocationChange={handleLocationChange} />
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
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
										<Label htmlFor="contactPhone">Emergency Phone</Label>
										<Input
											id="contactPhone"
											type="tel"
											value={formData.contactPhone}
											onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
											placeholder="24/7 reachable number"
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
											disabled={!formData.consentGiven}
										>
											<Zap className="h-5 w-5 mr-2" />
											SEND EMERGENCY ALERT
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