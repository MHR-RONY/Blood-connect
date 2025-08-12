import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Search, MessageCircle, Phone, Mail, Book, Users, Heart } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BloodDropIcon from "@/components/BloodDropIcon";

const HelpCenter = () => {
	const [searchQuery, setSearchQuery] = useState("");

	const faqs = [
		{
			id: "1",
			question: "How do I donate blood?",
			answer: "To donate blood, register on our platform, complete your profile, and schedule an appointment at a nearby blood bank. Make sure you meet the eligibility criteria: be 18-65 years old, weigh at least 50kg, and be in good health."
		},
		{
			id: "2",
			question: "How often can I donate blood?",
			answer: "You can donate whole blood every 56 days (8 weeks). For platelets, you can donate every 7 days, up to 24 times per year. For plasma, donations are allowed every 28 days."
		},
		{
			id: "3",
			question: "What should I do before donating blood?",
			answer: "Get a good night's sleep, eat a healthy meal, drink plenty of fluids, and avoid alcohol 24 hours before donation. Bring a valid ID and wear comfortable clothing with sleeves that can be rolled up."
		},
		{
			id: "4",
			question: "How do I request blood?",
			answer: "Click on 'Request Blood' in the main menu, fill out the required information including blood type, quantity needed, and urgency level. For emergencies, use our Emergency Request feature for immediate assistance."
		},
		{
			id: "5",
			question: "Is my personal information safe?",
			answer: "Yes, we take privacy seriously. All personal information is encrypted and stored securely. We never share your data with third parties without your consent, except for medical emergencies where it's necessary to save lives."
		},
		{
			id: "6",
			question: "How do I find donors near me?",
			answer: "Use our 'Find Donors' feature to search for donors by blood type and location. You can contact verified donors directly through our secure messaging system."
		}
	];

	const categories = [
		{
			title: "Getting Started",
			icon: <Book className="h-6 w-6" />,
			description: "Learn the basics of using BloodConnect",
			topics: ["Account setup", "Profile completion", "Verification process"]
		},
		{
			title: "Blood Donation",
			icon: <BloodDropIcon size="md" />,
			description: "Everything about donating blood",
			topics: ["Eligibility criteria", "Donation process", "After donation care"]
		},
		{
			title: "Blood Requests",
			icon: <Users className="h-6 w-6" />,
			description: "How to request blood for patients",
			topics: ["Creating requests", "Emergency procedures", "Tracking status"]
		},
		{
			title: "Account & Privacy",
			icon: <Heart className="h-6 w-6" />,
			description: "Managing your account and privacy settings",
			topics: ["Profile settings", "Privacy controls", "Data security"]
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
							<div className="bg-primary/10 p-4 rounded-full">
								<MessageCircle className="h-12 w-12 text-primary" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-4">Help Center</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Find answers to your questions and get support for using BloodConnect
						</p>
					</div>

					{/* Search */}
					<div className="mb-12">
						<div className="relative max-w-2xl mx-auto">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
							<Input
								placeholder="Search for help topics..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="pl-10 py-3 text-lg"
							/>
						</div>
					</div>

					{/* Categories */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
						{categories.map((category, index) => (
							<Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
								<CardHeader>
									<div className="flex items-center space-x-3">
										<div className="text-primary">{category.icon}</div>
										<div>
											<CardTitle className="text-xl">{category.title}</CardTitle>
											<CardDescription>{category.description}</CardDescription>
										</div>
									</div>
								</CardHeader>
								<CardContent>
									<ul className="space-y-2">
										{category.topics.map((topic, topicIndex) => (
											<li key={topicIndex} className="text-sm text-muted-foreground hover:text-primary cursor-pointer">
												• {topic}
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						))}
					</div>

					{/* FAQ Section */}
					<Card>
						<CardHeader>
							<CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
							<CardDescription>
								Quick answers to common questions about BloodConnect
							</CardDescription>
						</CardHeader>
						<CardContent>
							<Accordion type="single" collapsible className="w-full">
								{faqs.map((faq) => (
									<AccordionItem key={faq.id} value={faq.id}>
										<AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
										<AccordionContent className="text-muted-foreground">
											{faq.answer}
										</AccordionContent>
									</AccordionItem>
								))}
							</Accordion>
						</CardContent>
					</Card>

					{/* Contact Support */}
					<Card className="mt-8">
						<CardHeader>
							<CardTitle>Still need help?</CardTitle>
							<CardDescription>
								Can't find what you're looking for? Contact our support team
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
									<Mail className="h-6 w-6 text-primary" />
									<span className="font-medium">Email Support</span>
									<span className="text-sm text-muted-foreground">support@bloodconnect.com</span>
								</Button>
								<Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
									<Phone className="h-6 w-6 text-primary" />
									<span className="font-medium">Call Us</span>
									<span className="text-sm text-muted-foreground">+880-1234-567890</span>
								</Button>
								<Button variant="outline" className="h-auto p-4 flex flex-col items-center space-y-2">
									<MessageCircle className="h-6 w-6 text-primary" />
									<span className="font-medium">Live Chat</span>
									<span className="text-sm text-muted-foreground">Available 24/7</span>
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default HelpCenter;
