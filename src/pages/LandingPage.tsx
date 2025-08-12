import Header from "@/components/Header";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Clock, Shield, Users, Bell } from "lucide-react";
import { Link } from "react-router-dom";
import BloodDropIcon from "@/components/BloodDropIcon";

const LandingPage = () => {
	const features = [
		{
			icon: <BloodDropIcon size="lg" />,
			title: "Easy Blood Donation",
			description: "Simple and secure blood donation process with real-time tracking of your contributions."
		},
		{
			icon: <MapPin className="h-8 w-8 text-primary" />,
			title: "Location-Based Matching",
			description: "Find nearby donors and recipients using advanced location filtering and mapping."
		},
		{
			icon: <Clock className="h-8 w-8 text-primary" />,
			title: "24/7 Emergency Requests",
			description: "Immediate notifications for urgent blood requirements in your area."
		},
		{
			icon: <Shield className="h-8 w-8 text-primary" />,
			title: "Secure & Private",
			description: "Your medical information is protected with bank-level security standards."
		},
		{
			icon: <Users className="h-8 w-8 text-primary" />,
			title: "Community Driven",
			description: "Join a network of life-savers making a difference in their communities."
		},
		{
			icon: <Bell className="h-8 w-8 text-primary" />,
			title: "Smart Notifications",
			description: "Get notified when your blood type is needed or when you're eligible to donate again."
		}
	];

	return (
		<div className="min-h-screen bg-background">
			<Header />
			<Hero />

			{/* Features Section */}
			<section className="py-20 bg-medical/30">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="text-center mb-16">
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
							Why Choose BloodConnect?
						</h2>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Our platform makes blood donation simple, safe, and impactful.
							Join thousands of donors saving lives every day.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{features.map((feature, index) => (
							<Card key={index} className="text-center border-border/50 shadow-sm hover:shadow-md transition-shadow">
								<CardHeader>
									<div className="flex justify-center mb-4">
										<div className="bg-primary/10 p-4 rounded-full">
											{feature.icon}
										</div>
									</div>
									<CardTitle className="text-xl">{feature.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<CardDescription className="text-base leading-relaxed">
										{feature.description}
									</CardDescription>
								</CardContent>
							</Card>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-20">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="bg-gradient-to-r from-primary to-emergency rounded-2xl p-12 text-center text-white">
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							Ready to Save Lives?
						</h2>
						<p className="text-xl mb-8 opacity-90">
							Join our community of heroes making a difference, one donation at a time.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center">
							<Button asChild size="lg" variant="secondary" className="text-lg px-8 py-6">
								<Link to="/signup">
									Get Started
								</Link>
							</Button>
							<Button asChild size="lg" variant="outline" className="text-lg px-8 py-6 border-white text-red-500 hover:bg-white hover:text-black">
								<Link to="/login">
									Sign In
								</Link>
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-foreground text-background py-12">
				<div className="container mx-auto px-4 lg:px-6">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
						<div>
							<h3 className="text-lg font-semibold mb-4">BloodConnect</h3>
							<p className="text-sm opacity-80">
								Connecting donors with those in need, saving lives one drop at a time.
							</p>
						</div>
						<div>
							<h4 className="font-semibold mb-3">Quick Links</h4>
							<div className="space-y-2 text-sm">
								<Link to="/donate" className="block opacity-80 hover:opacity-100">Donate Blood</Link>
								<Link to="/request" className="block opacity-80 hover:opacity-100">Request Blood</Link>
								<Link to="/find-donors" className="block opacity-80 hover:opacity-100">Find Donors</Link>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-3">Support</h4>
							<div className="space-y-2 text-sm">
								<Link to="/help-center" className="block opacity-80 hover:opacity-100">Help Center</Link>
								<Link to="/contact-us" className="block opacity-80 hover:opacity-100">Contact Us</Link>
								<Link to="/emergency-info" className="block opacity-80 hover:opacity-100">Emergency</Link>
							</div>
						</div>
						<div>
							<h4 className="font-semibold mb-3">Legal</h4>
							<div className="space-y-2 text-sm">
								<Link to="/privacy-policy" className="block opacity-80 hover:opacity-100">Privacy Policy</Link>
								<Link to="/terms-of-service" className="block opacity-80 hover:opacity-100">Terms of Service</Link>
								<Link to="/medical-disclaimer" className="block opacity-80 hover:opacity-100">Medical Disclaimer</Link>
							</div>
						</div>
					</div>
					<div className="border-t border-white/20 mt-8 pt-8 text-center text-sm opacity-80">
						<div className="flex flex-col items-center space-y-2">
							<div>© 2025 MhrRony. All rights reserved.</div>
							<div>
								Developed by{" "}
								<a
									href="https://www.mhrrony.com"
									target="_blank"
									rel="noopener noreferrer"
									className="text-primary-foreground underline hover:no-underline font-medium"
								>
									mhrrony
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

export default LandingPage;