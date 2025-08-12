import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	AlertTriangle,
	Phone,
	MapPin,
	Clock,
	Zap,
	Hospital,
	Users,
	Siren,
	HeartHandshake,
	Shield
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodDropIcon from "@/components/BloodDropIcon";

const Emergency = () => {
	const emergencySteps = [
		{
			step: "1",
			title: "Call Emergency Hotline",
			description: "Dial 999 immediately for urgent blood needs",
			icon: <Phone className="h-8 w-8" />
		},
		{
			step: "2",
			title: "Provide Patient Information",
			description: "Share patient details, blood type, and location",
			icon: <Users className="h-8 w-8" />
		},
		{
			step: "3",
			title: "Wait for Response",
			description: "Our emergency team will coordinate with nearby donors",
			icon: <Clock className="h-8 w-8" />
		},
		{
			step: "4",
			title: "Get Blood Delivered",
			description: "Blood will be arranged and delivered to the hospital",
			icon: <BloodDropIcon className="h-8 w-8" />
		}
	];

	const emergencyContacts = [
		{
			service: "National Emergency",
			number: "999",
			description: "General emergency services",
			available: "24/7"
		},
		{
			service: "Blood Bank Emergency",
			number: "+880-1234-567890",
			description: "Direct blood bank hotline",
			available: "24/7"
		},
		{
			service: "Ambulance Service",
			number: "199",
			description: "Emergency ambulance service",
			available: "24/7"
		},
		{
			service: "Fire Service",
			number: "998",
			description: "Fire and rescue emergency",
			available: "24/7"
		}
	];

	const bloodBanks = [
		{
			name: "Dhaka Medical College Blood Bank",
			address: "Ramna, Dhaka-1000",
			phone: "+880-2-8619103",
			availability: "24/7",
			services: ["All blood types", "Plasma", "Platelets"]
		},
		{
			name: "National Institute of Cardiovascular Blood Bank",
			address: "Sher-E-Bangla Nagar, Dhaka-1207",
			phone: "+880-2-9898603",
			availability: "24/7",
			services: ["All blood types", "Rare blood types"]
		},
		{
			name: "Chittagong Medical College Blood Bank",
			address: "Chittagong-4203",
			phone: "+880-31-620302",
			availability: "24/7",
			services: ["All blood types", "Emergency supply"]
		}
	];

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-12">
						<div className="flex justify-center mb-4">
							<div className="bg-red-100 p-4 rounded-full animate-pulse">
								<AlertTriangle className="h-12 w-12 text-red-600" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-4">Emergency Blood Services</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							When every second counts, we're here to help. Get immediate assistance for urgent blood needs.
						</p>
					</div>

					{/* Emergency Hotline */}
					<Card className="border-red-200 bg-red-50 mb-8">
						<CardContent className="text-center py-8">
							<Siren className="h-16 w-16 text-red-600 mx-auto mb-4 animate-pulse" />
							<h2 className="text-3xl font-bold text-red-700 mb-2">Emergency Hotline</h2>
							<p className="text-6xl font-bold text-red-800 mb-4">999</p>
							<p className="text-xl text-red-600 mb-6">Available 24/7 for urgent blood requests</p>
							<Button size="lg" className="bg-red-600 hover:bg-red-700 text-white">
								<Phone className="h-5 w-5 mr-2" />
								Call Now for Emergency
							</Button>
						</CardContent>
					</Card>

					{/* Emergency Process */}
					<Card className="mb-8">
						<CardHeader>
							<CardTitle className="text-2xl flex items-center">
								<Zap className="h-6 w-6 mr-2 text-yellow-500" />
								Emergency Response Process
							</CardTitle>
							<CardDescription>
								Follow these steps for fastest emergency blood assistance
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
								{emergencySteps.map((step, index) => (
									<div key={index} className="text-center">
										<div className="flex flex-col items-center">
											<div className="bg-primary/10 p-4 rounded-full mb-4">
												<div className="text-primary">{step.icon}</div>
											</div>
											<Badge variant="outline" className="mb-2 text-lg px-3 py-1">
												Step {step.step}
											</Badge>
											<h3 className="font-semibold text-lg mb-2">{step.title}</h3>
											<p className="text-sm text-muted-foreground">{step.description}</p>
										</div>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Emergency Contacts */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Phone className="h-6 w-6 mr-2" />
									Emergency Contacts
								</CardTitle>
								<CardDescription>
									Important numbers for different emergency services
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{emergencyContacts.map((contact, index) => (
									<div key={index} className="flex items-center justify-between p-4 border rounded-lg">
										<div>
											<h3 className="font-semibold text-foreground">{contact.service}</h3>
											<p className="text-sm text-muted-foreground">{contact.description}</p>
											<Badge variant="outline" className="mt-1">
												{contact.available}
											</Badge>
										</div>
										<div className="text-right">
											<p className="text-2xl font-bold text-primary">{contact.number}</p>
										</div>
									</div>
								))}
							</CardContent>
						</Card>

						{/* Blood Banks */}
						<Card>
							<CardHeader>
								<CardTitle className="flex items-center">
									<Hospital className="h-6 w-6 mr-2" />
									24/7 Blood Banks
								</CardTitle>
								<CardDescription>
									Major blood banks with round-the-clock availability
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{bloodBanks.map((bank, index) => (
									<div key={index} className="border rounded-lg p-4">
										<div className="flex items-start justify-between mb-2">
											<h3 className="font-semibold text-foreground">{bank.name}</h3>
											<Badge className="bg-green-100 text-green-800">
												{bank.availability}
											</Badge>
										</div>
										<div className="space-y-1 text-sm text-muted-foreground">
											<p className="flex items-center">
												<MapPin className="h-4 w-4 mr-1" />
												{bank.address}
											</p>
											<p className="flex items-center">
												<Phone className="h-4 w-4 mr-1" />
												{bank.phone}
											</p>
										</div>
										<div className="mt-2">
											<p className="text-xs font-medium text-muted-foreground mb-1">Services:</p>
											<div className="flex flex-wrap gap-1">
												{bank.services.map((service, serviceIndex) => (
													<Badge key={serviceIndex} variant="outline" className="text-xs">
														{service}
													</Badge>
												))}
											</div>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					</div>

					{/* Important Notes */}
					<Card className="mt-8 border-yellow-200 bg-yellow-50">
						<CardHeader>
							<CardTitle className="flex items-center text-yellow-800">
								<Shield className="h-6 w-6 mr-2" />
								Important Emergency Guidelines
							</CardTitle>
						</CardHeader>
						<CardContent className="text-yellow-700">
							<ul className="space-y-2">
								<li className="flex items-start">
									<span className="font-bold mr-2">•</span>
									For life-threatening emergencies, call 999 immediately
								</li>
								<li className="flex items-start">
									<span className="font-bold mr-2">•</span>
									Have patient's blood type, quantity needed, and hospital location ready
								</li>
								<li className="flex items-start">
									<span className="font-bold mr-2">•</span>
									Keep patient's medical documents and ID available
								</li>
								<li className="flex items-start">
									<span className="font-bold mr-2">•</span>
									Emergency blood supply is prioritized for critical cases
								</li>
								<li className="flex items-start">
									<span className="font-bold mr-2">•</span>
									Our emergency team works with hospitals and blood banks for fastest response
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Quick Actions */}
					<div className="mt-8 text-center">
						<h2 className="text-2xl font-bold mb-6">Quick Emergency Actions</h2>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<Button size="lg" variant="destructive" className="h-auto p-6 flex flex-col space-y-2">
								<Phone className="h-8 w-8" />
								<span className="text-lg font-semibold">Call Emergency</span>
								<span className="text-sm opacity-90">999</span>
							</Button>
							<Button size="lg" variant="outline" className="h-auto p-6 flex flex-col space-y-2">
								<Hospital className="h-8 w-8" />
								<span className="text-lg font-semibold">Find Blood Bank</span>
								<span className="text-sm opacity-90">Nearest locations</span>
							</Button>
							<Button size="lg" variant="outline" className="h-auto p-6 flex flex-col space-y-2">
								<HeartHandshake className="h-8 w-8" />
								<span className="text-lg font-semibold">Emergency Request</span>
								<span className="text-sm opacity-90">Submit urgent request</span>
							</Button>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default Emergency;
