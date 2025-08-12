import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Eye, Lock, Database, UserCheck, Globe, Mail, Phone } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const PrivacyPolicy = () => {
	const sections = [
		{
			title: "Information We Collect",
			icon: <Database className="h-6 w-6" />,
			content: [
				"Personal identification information (name, email, phone number, date of birth)",
				"Medical information (blood type, medical history, donation eligibility)",
				"Location data (for finding nearby donors and blood banks)",
				"Usage data (how you interact with our platform)",
				"Communication data (messages between users, support conversations)"
			]
		},
		{
			title: "How We Use Your Information",
			icon: <UserCheck className="h-6 w-6" />,
			content: [
				"Facilitate blood donation matching and requests",
				"Verify donor eligibility and medical compatibility",
				"Send notifications about donation opportunities",
				"Provide customer support and respond to inquiries",
				"Improve our services and user experience",
				"Ensure platform security and prevent fraud"
			]
		},
		{
			title: "Information Sharing",
			icon: <Globe className="h-6 w-6" />,
			content: [
				"We do not sell your personal information to third parties",
				"Medical information is shared only with authorized healthcare providers",
				"Emergency contact information may be shared during critical situations",
				"Aggregated, anonymized data may be used for research purposes",
				"Legal authorities may access data when required by law"
			]
		},
		{
			title: "Data Security",
			icon: <Shield className="h-6 w-6" />,
			content: [
				"All data is encrypted in transit and at rest",
				"Access controls and authentication measures protect your account",
				"Regular security audits and monitoring",
				"Secure servers with industry-standard protection",
				"Staff training on data protection and privacy"
			]
		},
		{
			title: "Your Rights",
			icon: <Eye className="h-6 w-6" />,
			content: [
				"Access your personal data and download a copy",
				"Update or correct inaccurate information",
				"Delete your account and associated data",
				"Opt-out of non-essential communications",
				"Request data portability to another service",
				"File complaints with data protection authorities"
			]
		},
		{
			title: "Data Retention",
			icon: <Lock className="h-6 w-6" />,
			content: [
				"Personal data is retained while your account is active",
				"Medical records may be kept longer for health and safety purposes",
				"Communication data is retained for support and legal purposes",
				"Deleted accounts are permanently removed within 30 days",
				"Some data may be retained for legal compliance requirements"
			]
		}
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
								<Shield className="h-12 w-12 text-primary" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-4">Privacy Policy</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Your privacy is important to us. Learn how we collect, use, and protect your information.
						</p>
						<div className="mt-4">
							<Badge variant="outline" className="text-sm">
								Last updated: December 2024
							</Badge>
						</div>
					</div>

					{/* Introduction */}
					<Card className="mb-8">
						<CardContent className="pt-6">
							<p className="text-muted-foreground leading-relaxed">
								BloodConnect ("we," "our," or "us") is committed to protecting your privacy and ensuring the security
								of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard
								your information when you use our blood donation platform and related services.
							</p>
							<p className="text-muted-foreground leading-relaxed mt-4">
								By using BloodConnect, you agree to the collection and use of information in accordance with this policy.
								If you do not agree with our policies and practices, please do not use our services.
							</p>
						</CardContent>
					</Card>

					{/* Privacy Sections */}
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

					{/* Cookies and Tracking */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl">Cookies and Tracking Technologies</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								We use cookies and similar tracking technologies to enhance your experience on our platform:
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Essential Cookies</h4>
									<p className="text-sm text-muted-foreground">
										Required for basic platform functionality and security features.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Analytics Cookies</h4>
									<p className="text-sm text-muted-foreground">
										Help us understand how users interact with our platform to improve services.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Preference Cookies</h4>
									<p className="text-sm text-muted-foreground">
										Remember your settings and preferences for a personalized experience.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Marketing Cookies</h4>
									<p className="text-sm text-muted-foreground">
										Used to deliver relevant content and measure campaign effectiveness.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Third-Party Services */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl">Third-Party Services</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								We may use third-party services to provide and improve our platform. These services have their own privacy policies:
							</p>
							<ul className="space-y-2">
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Payment processors for donation transactions</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Mapping services for location-based features</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Email and SMS services for notifications</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Analytics platforms for usage insights</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card className="mt-8 border-primary/20 bg-primary/5">
						<CardHeader>
							<CardTitle className="text-xl">Questions About Privacy?</CardTitle>
							<CardDescription>
								Contact us if you have any questions about this Privacy Policy
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center space-x-3">
									<Mail className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium">Email</p>
										<p className="text-sm text-muted-foreground">privacy@bloodconnect.com</p>
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
							<p className="text-sm text-muted-foreground mt-4">
								We will respond to privacy-related inquiries within 30 days of receipt.
							</p>
						</CardContent>
					</Card>

					{/* Updates */}
					<Card className="mt-8">
						<CardContent className="pt-6">
							<h3 className="font-semibold text-lg mb-3">Policy Updates</h3>
							<p className="text-muted-foreground">
								We may update this Privacy Policy from time to time. We will notify you of any changes by posting
								the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review
								this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when
								they are posted on this page.
							</p>
						</CardContent>
					</Card>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default PrivacyPolicy;
