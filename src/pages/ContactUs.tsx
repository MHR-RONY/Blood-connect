import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Phone, MapPin, Clock, MessageCircle, Send } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ContactUs = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		category: "",
		message: ""
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		// Handle form submission
		console.log("Contact form submitted:", formData);
	};

	const contactInfo = [
		{
			icon: <Mail className="h-6 w-6" />,
			title: "Email",
			details: "support@bloodconnect.com",
			description: "Send us an email anytime"
		},
		{
			icon: <Phone className="h-6 w-6" />,
			title: "Phone",
			details: "+880-1234-567890",
			description: "Call us during business hours"
		},
		{
			icon: <MapPin className="h-6 w-6" />,
			title: "Address",
			details: "123 Health Street, Dhaka 1000, Bangladesh",
			description: "Visit our office"
		},
		{
			icon: <Clock className="h-6 w-6" />,
			title: "Business Hours",
			details: "Mon-Fri: 9AM-6PM, Sat: 9AM-2PM",
			description: "We're here to help"
		}
	];

	const offices = [
		{
			city: "Dhaka",
			address: "123 Health Street, Dhaka 1000",
			phone: "+880-1234-567890",
			email: "dhaka@bloodconnect.com"
		},
		{
			city: "Chittagong",
			address: "456 Medical Road, Chittagong 4000",
			phone: "+880-1234-567891",
			email: "chittagong@bloodconnect.com"
		},
		{
			city: "Sylhet",
			address: "789 Care Avenue, Sylhet 3100",
			phone: "+880-1234-567892",
			email: "sylhet@bloodconnect.com"
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
						<h1 className="text-4xl font-bold text-foreground mb-4">Contact Us</h1>
						<p className="text-xl text-muted-foreground max-w-2xl mx-auto">
							Get in touch with our team. We're here to help you save lives.
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
						{/* Contact Form */}
						<Card>
							<CardHeader>
								<CardTitle className="text-2xl">Send us a message</CardTitle>
								<CardDescription>
									Fill out the form below and we'll get back to you as soon as possible
								</CardDescription>
							</CardHeader>
							<CardContent>
								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="name">Full Name *</Label>
											<Input
												id="name"
												value={formData.name}
												onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email Address *</Label>
											<Input
												id="email"
												type="email"
												value={formData.email}
												onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="category">Category</Label>
										<Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
											<SelectTrigger>
												<SelectValue placeholder="Select a category" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="general">General Inquiry</SelectItem>
												<SelectItem value="technical">Technical Support</SelectItem>
												<SelectItem value="donation">Blood Donation</SelectItem>
												<SelectItem value="request">Blood Request</SelectItem>
												<SelectItem value="emergency">Emergency</SelectItem>
												<SelectItem value="partnership">Partnership</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject">Subject *</Label>
										<Input
											id="subject"
											value={formData.subject}
											onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="message">Message *</Label>
										<Textarea
											id="message"
											rows={5}
											value={formData.message}
											onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
											required
										/>
									</div>

									<Button type="submit" className="w-full">
										<Send className="h-4 w-4 mr-2" />
										Send Message
									</Button>
								</form>
							</CardContent>
						</Card>

						{/* Contact Information */}
						<div className="space-y-6">
							{/* Contact Details */}
							<Card>
								<CardHeader>
									<CardTitle>Get in Touch</CardTitle>
									<CardDescription>
										Reach out to us through any of these channels
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-6">
									{contactInfo.map((info, index) => (
										<div key={index} className="flex items-start space-x-4">
											<div className="text-primary mt-1">{info.icon}</div>
											<div>
												<h3 className="font-semibold text-foreground">{info.title}</h3>
												<p className="text-foreground font-medium">{info.details}</p>
												<p className="text-sm text-muted-foreground">{info.description}</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>

							{/* Emergency Contact */}
							<Card className="border-red-200 bg-red-50">
								<CardHeader>
									<CardTitle className="text-red-700">Emergency Contact</CardTitle>
									<CardDescription className="text-red-600">
										For urgent blood requests or emergencies
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-2">
										<p className="font-semibold text-red-700">24/7 Emergency Hotline</p>
										<p className="text-xl font-bold text-red-800">999</p>
										<p className="text-sm text-red-600">Available round the clock for emergency blood requests</p>
									</div>
								</CardContent>
							</Card>

							{/* Office Locations */}
							<Card>
								<CardHeader>
									<CardTitle>Our Offices</CardTitle>
									<CardDescription>
										Visit us at any of our locations
									</CardDescription>
								</CardHeader>
								<CardContent className="space-y-4">
									{offices.map((office, index) => (
										<div key={index} className="border-l-4 border-primary pl-4">
											<h3 className="font-semibold text-foreground">{office.city}</h3>
											<p className="text-sm text-muted-foreground">{office.address}</p>
											<p className="text-sm text-muted-foreground">{office.phone}</p>
											<p className="text-sm text-primary">{office.email}</p>
										</div>
									))}
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default ContactUs;
