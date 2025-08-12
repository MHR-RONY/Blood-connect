import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Scale, UserCheck, Shield, AlertTriangle, Mail, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const TermsOfService = () => {
	const sections = [
		{
			title: "Acceptance of Terms",
			icon: <UserCheck className="h-6 w-6" />,
			content: [
				"By accessing and using BloodConnect, you accept and agree to be bound by these Terms of Service",
				"If you do not agree to these terms, you may not use our services",
				"These terms constitute a legally binding agreement between you and BloodConnect",
				"You must be at least 18 years old to use our services"
			]
		},
		{
			title: "User Responsibilities",
			icon: <Shield className="h-6 w-6" />,
			content: [
				"Provide accurate and truthful information about your medical history and eligibility",
				"Maintain the confidentiality of your account credentials",
				"Use the platform only for legitimate blood donation and request purposes",
				"Comply with all applicable laws and regulations",
				"Respect other users and maintain professional conduct",
				"Report any suspicious or inappropriate activity"
			]
		},
		{
			title: "Medical Disclaimers",
			icon: <AlertTriangle className="h-6 w-6" />,
			content: [
				"BloodConnect is a platform that connects donors and recipients but does not provide medical advice",
				"Always consult with qualified healthcare professionals for medical decisions",
				"We do not guarantee the availability of specific blood types or donors",
				"Medical screening and testing are the responsibility of certified medical facilities",
				"BloodConnect is not liable for medical complications or adverse reactions"
			]
		},
		{
			title: "Platform Usage",
			icon: <FileText className="h-6 w-6" />,
			content: [
				"Use the platform only for its intended purpose of facilitating blood donations",
				"Do not attempt to hack, disrupt, or compromise platform security",
				"Respect intellectual property rights and do not copy or redistribute content",
				"Do not create multiple accounts or impersonate others",
				"Commercial use or advertising without permission is prohibited"
			]
		},
		{
			title: "Data and Privacy",
			icon: <Scale className="h-6 w-6" />,
			content: [
				"Your personal data will be processed according to our Privacy Policy",
				"You consent to the collection and use of your information as described",
				"Medical information may be shared with authorized healthcare providers",
				"You have the right to access, update, or delete your personal data",
				"We implement security measures to protect your information"
			]
		}
	];

	const prohibitedActivities = [
		"Providing false medical information or donation eligibility status",
		"Using the platform for commercial blood sales or trafficking",
		"Harassing, threatening, or discriminating against other users",
		"Attempting to bypass medical screening or safety protocols",
		"Sharing account credentials or creating fake accounts",
		"Violating any local, national, or international laws",
		"Interfering with platform operations or security measures",
		"Using automated scripts or bots to access the platform"
	];

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-12">
						<div className="flex justify-center mb-4">
							<div className="bg-primary/10 p-4 rounded-full">
								<FileText className="h-12 w-12 text-primary" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-4">Terms of Service</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Please read these terms carefully before using BloodConnect platform and services.
						</p>
						<div className="mt-4">
							<Badge variant="outline" className="text-sm">
								Effective Date: December 2024
							</Badge>
						</div>
					</div>

					{/* Introduction */}
					<Card className="mb-8">
						<CardContent className="pt-6">
							<p className="text-muted-foreground leading-relaxed">
								These Terms of Service ("Terms") govern your use of the BloodConnect platform and services operated by
								BloodConnect ("we," "us," or "our"). BloodConnect is a platform designed to connect blood donors with
								those in need of blood donations, facilitating life-saving connections within communities.
							</p>
							<p className="text-muted-foreground leading-relaxed mt-4">
								By creating an account or using our services, you acknowledge that you have read, understood, and
								agree to be bound by these Terms and our Privacy Policy.
							</p>
						</CardContent>
					</Card>

					{/* Main Sections */}
					<div className="space-y-6">
						{sections.map((section, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle className="flex items-center text-xl">
										<div className="text-primary mr-3">{section.icon}</div>
										{section.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{section.content.map((item, itemIndex) => (
											<li key={itemIndex} className="flex items-start">
												<span className="text-primary mr-2 mt-1.5">•</span>
												<span className="text-muted-foreground">{item}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>

					{/* Prohibited Activities */}
					<Card className="mt-8 border-red-200 bg-red-50">
						<CardHeader>
							<CardTitle className="text-xl text-red-800 flex items-center">
								<AlertTriangle className="h-6 w-6 mr-3" />
								Prohibited Activities
							</CardTitle>
							<CardDescription className="text-red-600">
								The following activities are strictly forbidden on our platform
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ul className="space-y-3">
								{prohibitedActivities.map((activity, index) => (
									<li key={index} className="flex items-start">
										<span className="text-red-600 mr-2 mt-1.5">×</span>
										<span className="text-red-700">{activity}</span>
									</li>
								))}
							</ul>
						</CardContent>
					</Card>

					{/* Limitation of Liability */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl">Limitation of Liability</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								BloodConnect provides a platform service and is not liable for:
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Medical Outcomes</h4>
									<p className="text-sm text-muted-foreground">
										Any medical complications, adverse reactions, or health outcomes related to blood donations or transfusions.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">User Actions</h4>
									<p className="text-sm text-muted-foreground">
										Actions, omissions, or conduct of users, donors, recipients, or healthcare providers.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Third-Party Services</h4>
									<p className="text-sm text-muted-foreground">
										Services provided by blood banks, hospitals, or other healthcare facilities.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Technical Issues</h4>
									<p className="text-sm text-muted-foreground">
										Platform downtime, technical errors, or loss of data (though we strive to prevent these).
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Account Termination */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl">Account Termination</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								We reserve the right to suspend or terminate accounts that violate these Terms:
							</p>
							<ul className="space-y-2">
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Immediate termination for serious violations (fraud, endangering others)</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Warning and temporary suspension for minor violations</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">You may terminate your account at any time through account settings</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Data deletion will occur according to our data retention policy</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Governing Law */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl">Governing Law and Disputes</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								These Terms are governed by the laws of Bangladesh. Any disputes will be resolved through:
							</p>
							<div className="space-y-3">
								<div className="border-l-4 border-primary pl-4">
									<h4 className="font-semibold">Mediation</h4>
									<p className="text-sm text-muted-foreground">
										First attempt at resolution through mediation services
									</p>
								</div>
								<div className="border-l-4 border-primary pl-4">
									<h4 className="font-semibold">Arbitration</h4>
									<p className="text-sm text-muted-foreground">
										Binding arbitration if mediation is unsuccessful
									</p>
								</div>
								<div className="border-l-4 border-primary pl-4">
									<h4 className="font-semibold">Court Jurisdiction</h4>
									<p className="text-sm text-muted-foreground">
										Courts of Dhaka, Bangladesh for final resolution
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card className="mt-8 border-primary/20 bg-primary/5">
						<CardHeader>
							<CardTitle className="text-xl">Questions About Terms?</CardTitle>
							<CardDescription>
								Contact us if you have any questions about these Terms of Service
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center space-x-3">
									<Mail className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium">Email</p>
										<p className="text-sm text-muted-foreground">legal@bloodconnect.com</p>
									</div>
								</div>
								<div className="flex items-center space-x-3">
									<Phone className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium">Phone</p>
										<p className="text-sm text-muted-foreground">+880-1234-567890</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Updates */}
					<Card className="mt-8">
						<CardContent className="pt-6">
							<h3 className="font-semibold text-lg mb-3">Changes to Terms</h3>
							<p className="text-muted-foreground">
								We reserve the right to modify these Terms at any time. We will notify users of significant changes
								via email or platform notifications. Continued use of the platform after changes constitutes acceptance
								of the new Terms. We recommend reviewing these Terms periodically for updates.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default TermsOfService;
