import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {

	CreditCard,
	Smartphone,
	Building,
	Gift,
	Star,
	Users,
	Target,
	Award,
	Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import BloodDropIcon from "@/components/BloodDropIcon";

const BloodDonatePage = () => {
	const [donationData, setDonationData] = useState({
		amount: "",
		customAmount: "",
		purpose: "",
		frequency: "one-time",
		donorName: "",
		donorEmail: "",
		donorPhone: "",
		paymentMethod: "",
		isAnonymous: false,
		message: "",
		agreeToTerms: false
	});

	const presetAmounts = [
		{ amount: 500, label: "৳500", description: "Help 1 patient" },
		{ amount: 1000, label: "৳1,000", description: "Support blood drive" },
		{ amount: 2500, label: "৳2,500", description: "Fund equipment" },
		{ amount: 5000, label: "৳5,000", description: "Emergency fund" },
		{ amount: 10000, label: "৳10,000", description: "Major impact" },
		{ amount: 0, label: "Custom", description: "Enter your amount" }
	];

	const donationPurposes = [
		{ value: "emergency", label: "Emergency Blood Drive", icon: "🚨" },
		{ value: "equipment", label: "Medical Equipment", icon: "🏥" },
		{ value: "awareness", label: "Awareness Campaign", icon: "📢" },
		{ value: "research", label: "Blood Research", icon: "🔬" },
		{ value: "general", label: "General Fund", icon: "❤️" },
		{ value: "infrastructure", label: "Infrastructure", icon: "🏢" }
	];

	const paymentMethods = [
		{ value: "bkash", label: "bKash", icon: "📱", color: "bg-pink-100 text-pink-700" },
		{ value: "nagad", label: "Nagad", icon: "📱", color: "bg-orange-100 text-orange-700" },
		{ value: "rocket", label: "Rocket", icon: "🚀", color: "bg-purple-100 text-purple-700" },
		{ value: "card", label: "Credit/Debit Card", icon: "💳", color: "bg-blue-100 text-blue-700" },
		{ value: "bank", label: "Bank Transfer", icon: "🏦", color: "bg-green-100 text-green-700" }
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Donation submitted:", donationData);
		// Here you would integrate with payment gateway
	};

	const selectedAmount = donationData.amount === "custom"
		? parseInt(donationData.customAmount) || 0
		: parseInt(donationData.amount) || 0;

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-6xl mx-auto">
					{/* Header */}
					<div className="text-center mb-8">
						<div className="flex justify-center mb-4">
							<div className="bg-primary/10 p-4 rounded-full">
								<BloodDropIcon className="h-12 w-12" />
							</div>
						</div>
						<h1 className="text-4xl font-bold text-foreground mb-2">Support Blood Donation</h1>
						<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
							Your contribution helps save lives by supporting our blood donation initiatives,
							emergency drives, and medical equipment procurement.
						</p>
					</div>

					{/* Impact Stats */}
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Users className="h-8 w-8 text-primary" />
								</div>
								<div className="text-2xl font-bold text-primary">2,500+</div>
								<div className="text-sm text-muted-foreground">Lives Saved</div>
							</CardContent>
						</Card>
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Target className="h-8 w-8 text-success" />
								</div>
								<div className="text-2xl font-bold text-success">৳2.5M</div>
								<div className="text-sm text-muted-foreground">Funds Raised</div>
							</CardContent>
						</Card>
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Award className="h-8 w-8 text-emergency" />
								</div>
								<div className="text-2xl font-bold text-emergency">50+</div>
								<div className="text-sm text-muted-foreground">Blood Drives</div>
							</CardContent>
						</Card>
						<Card className="text-center border-border/50">
							<CardContent className="pt-6">
								<div className="flex justify-center mb-2">
									<Shield className="h-8 w-8 text-primary" />
								</div>
								<div className="text-2xl font-bold text-primary">1,200+</div>
								<div className="text-sm text-muted-foreground">Donors Helped</div>
							</CardContent>
						</Card>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
						{/* Donation Form */}
						<div className="lg:col-span-2">
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Donation Amount */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center">
											<Gift className="h-5 w-5 mr-2 text-primary" />
											Select Donation Amount
										</CardTitle>
										<CardDescription>
											Choose an amount or enter a custom donation amount in BDT
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
											{presetAmounts.map((preset) => (
												<div key={preset.amount} className="relative">
													<input
														type="radio"
														id={`amount-${preset.amount}`}
														name="amount"
														value={preset.amount === 0 ? "custom" : preset.amount}
														checked={donationData.amount === (preset.amount === 0 ? "custom" : preset.amount.toString())}
														onChange={(e) => setDonationData(prev => ({ ...prev, amount: e.target.value }))}
														className="sr-only"
													/>
													<label
														htmlFor={`amount-${preset.amount}`}
														className={cn(
															"block p-4 rounded-lg border-2 cursor-pointer transition-all",
															"hover:border-primary/50 hover:bg-primary/5",
															donationData.amount === (preset.amount === 0 ? "custom" : preset.amount.toString())
																? "border-primary bg-primary/10 ring-2 ring-primary/20"
																: "border-border"
														)}
													>
														<div className="text-center">
															<div className="text-xl font-bold text-foreground">{preset.label}</div>
															<div className="text-xs text-muted-foreground mt-1">{preset.description}</div>
														</div>
													</label>
												</div>
											))}
										</div>

										{donationData.amount === "custom" && (
											<div className="space-y-2">
												<Label htmlFor="customAmount">Enter Custom Amount (BDT)</Label>
												<div className="relative">
													<span className="absolute left-3 top-3 text-muted-foreground">৳</span>
													<Input
														id="customAmount"
														type="number"
														min="100"
														className="pl-8"
														placeholder="Enter amount"
														value={donationData.customAmount}
														onChange={(e) => setDonationData(prev => ({ ...prev, customAmount: e.target.value }))}
													/>
												</div>
												<p className="text-xs text-muted-foreground">Minimum donation: ৳100</p>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Donation Purpose */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle>Donation Purpose</CardTitle>
										<CardDescription>
											Choose what your donation will support
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{donationPurposes.map((purpose) => (
												<div key={purpose.value} className="relative">
													<input
														type="radio"
														id={`purpose-${purpose.value}`}
														name="purpose"
														value={purpose.value}
														checked={donationData.purpose === purpose.value}
														onChange={(e) => setDonationData(prev => ({ ...prev, purpose: e.target.value }))}
														className="sr-only"
													/>
													<label
														htmlFor={`purpose-${purpose.value}`}
														className={cn(
															"block p-3 rounded-lg border cursor-pointer transition-all",
															"hover:border-primary/50 hover:bg-primary/5",
															donationData.purpose === purpose.value
																? "border-primary bg-primary/10"
																: "border-border"
														)}
													>
														<div className="flex items-center space-x-3">
															<span className="text-xl">{purpose.icon}</span>
															<span className="font-medium">{purpose.label}</span>
														</div>
													</label>
												</div>
											))}
										</div>
									</CardContent>
								</Card>

								{/* Frequency */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle>Donation Frequency</CardTitle>
									</CardHeader>
									<CardContent>
										<RadioGroup
											value={donationData.frequency}
											onValueChange={(value) => setDonationData(prev => ({ ...prev, frequency: value }))}
											className="grid grid-cols-1 md:grid-cols-3 gap-4"
										>
											<div className="flex items-center space-x-2 p-3 border rounded-lg">
												<RadioGroupItem value="one-time" id="one-time" />
												<Label htmlFor="one-time" className="flex-1">
													<div className="font-medium">One-time</div>
													<div className="text-xs text-muted-foreground">Single donation</div>
												</Label>
											</div>
											<div className="flex items-center space-x-2 p-3 border rounded-lg">
												<RadioGroupItem value="monthly" id="monthly" />
												<Label htmlFor="monthly" className="flex-1">
													<div className="font-medium">Monthly</div>
													<div className="text-xs text-muted-foreground">Recurring monthly</div>
												</Label>
											</div>
											<div className="flex items-center space-x-2 p-3 border rounded-lg">
												<RadioGroupItem value="yearly" id="yearly" />
												<Label htmlFor="yearly" className="flex-1">
													<div className="font-medium">Yearly</div>
													<div className="text-xs text-muted-foreground">Annual donation</div>
												</Label>
											</div>
										</RadioGroup>
									</CardContent>
								</Card>

								{/* Donor Information */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle>Donor Information</CardTitle>
										<CardDescription>
											Please provide your contact details
										</CardDescription>
									</CardHeader>
									<CardContent className="space-y-6">
										<div className="flex items-center space-x-2 mb-4">
											<Checkbox
												id="anonymous"
												checked={donationData.isAnonymous}
												onCheckedChange={(checked) => setDonationData(prev => ({ ...prev, isAnonymous: checked as boolean }))}
											/>
											<Label htmlFor="anonymous" className="text-sm">
												Make this an anonymous donation
											</Label>
										</div>

										{!donationData.isAnonymous && (
											<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
												<div className="space-y-2">
													<Label htmlFor="donorName">Full Name</Label>
													<Input
														id="donorName"
														value={donationData.donorName}
														onChange={(e) => setDonationData(prev => ({ ...prev, donorName: e.target.value }))}
														required={!donationData.isAnonymous}
													/>
												</div>
												<div className="space-y-2">
													<Label htmlFor="donorEmail">Email Address</Label>
													<Input
														id="donorEmail"
														type="email"
														value={donationData.donorEmail}
														onChange={(e) => setDonationData(prev => ({ ...prev, donorEmail: e.target.value }))}
														required={!donationData.isAnonymous}
													/>
												</div>
												<div className="space-y-2 md:col-span-2">
													<Label htmlFor="donorPhone">Phone Number</Label>
													<Input
														id="donorPhone"
														type="tel"
														value={donationData.donorPhone}
														onChange={(e) => setDonationData(prev => ({ ...prev, donorPhone: e.target.value }))}
													/>
												</div>
											</div>
										)}

										<div className="space-y-2">
											<Label htmlFor="message">Message (Optional)</Label>
											<Textarea
												id="message"
												placeholder="Leave a message of support..."
												value={donationData.message}
												onChange={(e) => setDonationData(prev => ({ ...prev, message: e.target.value }))}
											/>
										</div>
									</CardContent>
								</Card>

								{/* Payment Method */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="flex items-center">
											<CreditCard className="h-5 w-5 mr-2 text-primary" />
											Payment Method
										</CardTitle>
										<CardDescription>
											Choose your preferred payment method
										</CardDescription>
									</CardHeader>
									<CardContent>
										<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
											{paymentMethods.map((method) => (
												<div key={method.value} className="relative">
													<input
														type="radio"
														id={`payment-${method.value}`}
														name="paymentMethod"
														value={method.value}
														checked={donationData.paymentMethod === method.value}
														onChange={(e) => setDonationData(prev => ({ ...prev, paymentMethod: e.target.value }))}
														className="sr-only"
													/>
													<label
														htmlFor={`payment-${method.value}`}
														className={cn(
															"block p-4 rounded-lg border cursor-pointer transition-all",
															"hover:border-primary/50",
															donationData.paymentMethod === method.value
																? "border-primary bg-primary/10"
																: "border-border"
														)}
													>
														<div className="flex items-center space-x-3">
															<div className={cn("p-2 rounded-full", method.color)}>
																<span className="text-lg">{method.icon}</span>
															</div>
															<span className="font-medium">{method.label}</span>
														</div>
													</label>
												</div>
											))}
										</div>
									</CardContent>
								</Card>

								{/* Terms and Submit */}
								<Card className="shadow-lg border-border/50">
									<CardContent className="pt-6">
										<div className="space-y-4">
											<div className="flex items-start space-x-2">
												<Checkbox
													id="terms"
													checked={donationData.agreeToTerms}
													onCheckedChange={(checked) => setDonationData(prev => ({ ...prev, agreeToTerms: checked as boolean }))}
													required
												/>
												<Label htmlFor="terms" className="text-sm leading-relaxed">
													I agree to the donation terms and conditions. I understand that my donation
													will be used to support blood donation initiatives and related medical activities.
												</Label>
											</div>

											<Button
												type="submit"
												className="w-full"
												size="lg"
												disabled={!donationData.agreeToTerms || selectedAmount < 100}
											>
												<BloodDropIcon size="sm" className="mr-2" />
												Donate ৳{selectedAmount.toLocaleString()} Now
											</Button>
										</div>
									</CardContent>
								</Card>
							</form>
						</div>

						{/* Donation Summary Sidebar */}
						<div className="lg:col-span-1">
							<div className="sticky top-24 space-y-6">
								{/* Donation Summary */}
								<Card className="shadow-lg border-primary/20 bg-gradient-to-br from-primary/5 to-medical">
									<CardHeader>
										<CardTitle className="text-primary">Donation Summary</CardTitle>
									</CardHeader>
									<CardContent className="space-y-4">
										<div className="space-y-3">
											<div className="flex justify-between">
												<span>Amount:</span>
												<span className="font-semibold">
													৳{selectedAmount.toLocaleString()}
												</span>
											</div>
											{donationData.purpose && (
												<div className="flex justify-between">
													<span>Purpose:</span>
													<span className="font-semibold">
														{donationPurposes.find(p => p.value === donationData.purpose)?.label}
													</span>
												</div>
											)}
											<div className="flex justify-between">
												<span>Frequency:</span>
												<span className="font-semibold capitalize">{donationData.frequency}</span>
											</div>
											{donationData.paymentMethod && (
												<div className="flex justify-between">
													<span>Payment:</span>
													<span className="font-semibold">
														{paymentMethods.find(p => p.value === donationData.paymentMethod)?.label}
													</span>
												</div>
											)}
										</div>

										{selectedAmount > 0 && (
											<div className="border-t border-primary/20 pt-3">
												<div className="flex justify-between text-lg font-bold text-primary">
													<span>Total:</span>
													<span>৳{selectedAmount.toLocaleString()}</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Impact Message */}
								<Card className="shadow-lg border-border/50">
									<CardHeader>
										<CardTitle className="text-success">Your Impact</CardTitle>
									</CardHeader>
									<CardContent>
										{selectedAmount >= 5000 && (
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<Star className="h-4 w-4 text-yellow-500" />
													<span className="text-sm">Fund complete blood drive</span>
												</div>
												<div className="flex items-center space-x-2">
													<BloodDropIcon size="sm" />
													<span className="text-sm">Help 10+ patients</span>
												</div>
											</div>
										)}
										{selectedAmount >= 1000 && selectedAmount < 5000 && (
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<BloodDropIcon size="sm" />
													<span className="text-sm">Support medical equipment</span>
												</div>
												<div className="flex items-center space-x-2">
													<Users className="h-4 w-4 text-primary" />
													<span className="text-sm">Help 3-5 patients</span>
												</div>
											</div>
										)}
										{selectedAmount >= 100 && selectedAmount < 1000 && (
											<div className="space-y-2">
												<div className="flex items-center space-x-2">
													<BloodDropIcon size="sm" />
													<span className="text-sm">Support a patient in need</span>
												</div>
											</div>
										)}
									</CardContent>
								</Card>

								{/* Recognition Badge */}
								{selectedAmount >= 10000 && (
									<Card className="shadow-lg border-primary/20 bg-gradient-to-br from-primary/10 to-emergency/10">
										<CardContent className="pt-6 text-center">
											<Award className="h-12 w-12 text-primary mx-auto mb-3" />
											<h3 className="font-bold text-primary mb-2">Platinum Donor</h3>
											<p className="text-xs text-muted-foreground">
												You'll receive special recognition as a major contributor
											</p>
										</CardContent>
									</Card>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
			<Footer />
		</div>
	);
};

export default BloodDonatePage;