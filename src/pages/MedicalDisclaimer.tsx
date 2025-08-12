import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Heart, ShieldAlert, UserX, Clock, Mail, Phone, Stethoscope } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodDropIcon from "@/components/BloodDropIcon";

const MedicalDisclaimer = () => {
	const disclaimers = [
		{
			title: "Not Medical Advice",
			icon: <Stethoscope className="h-6 w-6" />,
			content: [
				"BloodConnect does not provide medical advice, diagnosis, or treatment",
				"Information on our platform is for educational and connection purposes only",
				"Always consult qualified healthcare professionals for medical decisions",
				"Do not rely on platform information for medical emergencies"
			]
		},
		{
			title: "Blood Safety",
			icon: <BloodDropIcon className="h-6 w-6" />,
			content: [
				"All blood donations must go through proper medical screening",
				"BloodConnect does not test or verify blood safety",
				"Blood banks and medical facilities are responsible for testing",
				"Follow all medical protocols for blood collection and transfusion"
			]
		},
		{
			title: "Health Screening",
			icon: <ShieldAlert className="h-6 w-6" />,
			content: [
				"Donors must undergo proper medical evaluation before donating",
				"BloodConnect does not verify donor eligibility or health status",
				"Medical professionals determine donation eligibility",
				"Do not donate if you have health conditions that prevent safe donation"
			]
		},
		{
			title: "Emergency Situations",
			icon: <AlertTriangle className="h-6 w-6" />,
			content: [
				"For medical emergencies, call emergency services immediately (999)",
				"BloodConnect cannot guarantee immediate blood availability",
				"Emergency requests should go through proper medical channels",
				"Platform response times may not meet emergency requirements"
			]
		}
	];

	const riskFactors = [
		{
			category: "Donor Risks",
			risks: [
				"Dizziness or fainting during or after donation",
				"Bruising or soreness at the needle site",
				"Rare allergic reactions to sterilization materials",
				"Temporary fatigue or weakness",
				"Very rare nerve damage or infection"
			]
		},
		{
			category: "Recipient Risks",
			risks: [
				"Allergic reactions to blood components",
				"Transmission of infectious diseases (if screening fails)",
				"Immune system reactions to transfused blood",
				"Iron overload from multiple transfusions",
				"Complications from underlying medical conditions"
			]
		}
	];

	const contraindications = [
		"HIV, Hepatitis B, Hepatitis C, or other blood-borne infections",
		"Recent travel to malaria-endemic areas",
		"Use of certain medications or drugs",
		"Recent tattoos, piercings, or acupuncture",
		"Recent vaccinations or immunizations",
		"Pregnancy or recent childbirth",
		"Low hemoglobin or iron deficiency",
		"Recent surgery or medical procedures",
		"Chronic health conditions affecting blood safety",
		"Age restrictions (typically 17-65 years)"
	];

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-4xl mx-auto">
					{/* Header */}
					<div className="text-center mb-12">
						<div className="flex justify-center mb-4">
							<div className="bg-red-100 p-4 rounded-full">
								<AlertTriangle className="h-12 w-12 text-red-600" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-4">Medical Disclaimer</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Important medical information and disclaimers for BloodConnect users
						</p>
						<div className="mt-4">
							<Badge variant="destructive" className="text-sm">
								Please Read Carefully
							</Badge>
						</div>
					</div>

					{/* Important Notice */}
					<Card className="mb-8 border-red-200 bg-red-50">
						<CardContent className="pt-6">
							<div className="flex items-start space-x-3">
								<AlertTriangle className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
								<div>
									<h2 className="text-xl font-bold text-red-800 mb-3">Important Medical Notice</h2>
									<p className="text-red-700 leading-relaxed">
										BloodConnect is a platform that connects blood donors with recipients. We are NOT a medical service,
										healthcare provider, or medical facility. All medical decisions, blood testing, screening, and
										transfusions must be conducted by qualified healthcare professionals and certified medical facilities.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Main Disclaimers */}
					<div className="space-y-6">
						{disclaimers.map((disclaimer, index) => (
							<Card key={index}>
								<CardHeader>
									<CardTitle className="flex items-center text-xl">
										<div className="text-primary mr-3">{disclaimer.icon}</div>
										{disclaimer.title}
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className="space-y-3">
										{disclaimer.content.map((item, itemIndex) => (
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

					{/* Risk Factors */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl flex items-center">
								<Heart className="h-6 w-6 mr-3 text-red-500" />
								Known Risk Factors
							</CardTitle>
							<CardDescription>
								Blood donation and transfusion carry certain risks that must be understood
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								{riskFactors.map((category, index) => (
									<div key={index} className="border rounded-lg p-4">
										<h3 className="font-semibold text-lg mb-3 text-red-700">{category.category}</h3>
										<ul className="space-y-2">
											{category.risks.map((risk, riskIndex) => (
												<li key={riskIndex} className="flex items-start">
													<span className="text-red-500 mr-2 mt-1.5">•</span>
													<span className="text-sm text-muted-foreground">{risk}</span>
												</li>
											))}
										</ul>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Contraindications */}
					<Card className="mt-8 border-yellow-200 bg-yellow-50">
						<CardHeader>
							<CardTitle className="text-xl flex items-center text-yellow-800">
								<UserX className="h-6 w-6 mr-3" />
								Blood Donation Contraindications
							</CardTitle>
							<CardDescription className="text-yellow-700">
								Conditions that may prevent safe blood donation
							</CardDescription>
						</CardHeader>
						<CardContent>
							<p className="text-yellow-700 mb-4">
								The following conditions may prevent you from donating blood. Always consult with medical professionals:
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-2">
								{contraindications.map((condition, index) => (
									<div key={index} className="flex items-start">
										<span className="text-yellow-600 mr-2 mt-1.5">•</span>
										<span className="text-sm text-yellow-800">{condition}</span>
									</div>
								))}
							</div>
						</CardContent>
					</Card>

					{/* Liability */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl">Limitation of Liability</CardTitle>
						</CardHeader>
						<CardContent className="space-y-4">
							<p className="text-muted-foreground">
								BloodConnect expressly disclaims liability for:
							</p>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Medical Outcomes</h4>
									<p className="text-sm text-muted-foreground">
										Any adverse medical outcomes, complications, or health effects resulting from blood donation or transfusion.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Blood Safety</h4>
									<p className="text-sm text-muted-foreground">
										The safety, quality, or testing of blood products. This is the responsibility of medical facilities.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Medical Advice</h4>
									<p className="text-sm text-muted-foreground">
										Any medical advice, recommendations, or decisions made by users based on platform information.
									</p>
								</div>
								<div className="border rounded-lg p-4">
									<h4 className="font-semibold mb-2">Emergency Response</h4>
									<p className="text-sm text-muted-foreground">
										Delays in emergency response or inability to provide immediate blood availability.
									</p>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Professional Consultation */}
					<Card className="mt-8 border-primary/20 bg-primary/5">
						<CardHeader>
							<CardTitle className="text-xl flex items-center">
								<Stethoscope className="h-6 w-6 mr-3 text-primary" />
								Consult Healthcare Professionals
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-muted-foreground mb-4">
								Always consult with qualified healthcare professionals for:
							</p>
							<ul className="space-y-2">
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Determining blood donation eligibility</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Medical advice regarding blood transfusions</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Health concerns related to blood donation</span>
								</li>
								<li className="flex items-start">
									<span className="text-primary mr-2 mt-1.5">•</span>
									<span className="text-muted-foreground">Emergency medical situations</span>
								</li>
							</ul>
						</CardContent>
					</Card>

					{/* Contact Information */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle className="text-xl flex items-center">
								<Mail className="h-6 w-6 mr-3" />
								Medical Questions?
							</CardTitle>
							<CardDescription>
								For medical questions, consult healthcare professionals. For platform questions, contact us.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="flex items-center space-x-3">
									<Mail className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium">Platform Support</p>
										<p className="text-sm text-muted-foreground">support@bloodconnect.com</p>
									</div>
								</div>
								<div className="flex items-center space-x-3">
									<Phone className="h-5 w-5 text-primary" />
									<div>
										<p className="font-medium">Emergency Medical</p>
										<p className="text-sm text-red-600 font-bold">Call 999</p>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Last Updated */}
					<Card className="mt-8">
						<CardContent className="pt-6 text-center">
							<div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
								<Clock className="h-4 w-4" />
								<span>Medical disclaimer last updated: December 2024</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default MedicalDisclaimer;
