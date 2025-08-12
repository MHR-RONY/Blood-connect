import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { User, Mail, Lock, Phone, Calendar, UserCheck } from "lucide-react";
import BloodTypeSelector from "@/components/BloodTypeSelector";
import LocationSelector from "@/components/LocationSelector";
import Header from "@/components/Header";
import BloodDropIcon from "@/components/BloodDropIcon";

const SignUp = () => {
	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
		confirmPassword: "",
		phone: "",
		dateOfBirth: "",
		gender: "",
		bloodType: "",
		weight: "",
		location: { city: "", area: "" },
		agreedToTerms: false,
		isAvailableDonor: true
	});

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Sign up form submitted:", formData);
		// Here you would normally send the data to your backend
	};

	const handleLocationChange = (location: { city: string; area: string; coordinates?: { lat: number; lng: number } }) => {
		setFormData(prev => ({ ...prev, location }));
	};

	return (
		<div className="min-h-screen bg-medical/20">
			<Header />
			<div className="container mx-auto px-4 py-8">
				<div className="max-w-2xl mx-auto">
					<Card className="shadow-lg border-border/50">
						<CardHeader className="text-center">
							<div className="flex justify-center mb-4">
								<div className="bg-primary/10 p-3 rounded-full">
									<BloodDropIcon size="lg" />
								</div>
							</div>
							<CardTitle className="text-2xl font-bold">Join BloodConnect</CardTitle>
							<CardDescription className="text-base">
								Create your account and start saving lives today
							</CardDescription>
						</CardHeader>
						<CardContent>
							<form onSubmit={handleSubmit} className="space-y-6">
								{/* Personal Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold flex items-center">
										<User className="h-5 w-5 mr-2 text-primary" />
										Personal Information
									</h3>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">First Name</Label>
											<Input
												id="firstName"
												value={formData.firstName}
												onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">Last Name</Label>
											<Input
												id="lastName"
												value={formData.lastName}
												onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">Email Address</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="email"
												type="email"
												className="pl-10"
												value={formData.email}
												onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="phone">Phone Number</Label>
										<div className="relative">
											<Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
											<Input
												id="phone"
												type="tel"
												className="pl-10"
												value={formData.phone}
												onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
												required
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="dateOfBirth">Date of Birth</Label>
											<div className="relative">
												<Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
												<Input
													id="dateOfBirth"
													type="date"
													className="pl-10"
													value={formData.dateOfBirth}
													onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
													required
												/>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor="gender">Gender</Label>
											<Select value={formData.gender} onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}>
												<SelectTrigger>
													<SelectValue placeholder="Select gender" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="male">Male</SelectItem>
													<SelectItem value="female">Female</SelectItem>
													<SelectItem value="other">Other</SelectItem>
													<SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>
								</div>

								{/* Medical Information */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold flex items-center">
										<UserCheck className="h-5 w-5 mr-2 text-primary" />
										Medical Information
									</h3>

									<BloodTypeSelector
										selectedType={formData.bloodType}
										onSelect={(type) => setFormData(prev => ({ ...prev, bloodType: type }))}
										label="Your Blood Type"
									/>

									<div className="space-y-2">
										<Label htmlFor="weight">Weight (kg)</Label>
										<Input
											id="weight"
											type="number"
											min="45"
											placeholder="Minimum 45 kg required for donation"
											value={formData.weight}
											onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value }))}
											required
										/>
									</div>
								</div>

								{/* Location */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold">Location</h3>
									<LocationSelector onLocationChange={handleLocationChange} />
								</div>

								{/* Account Security */}
								<div className="space-y-4">
									<h3 className="text-lg font-semibold flex items-center">
										<Lock className="h-5 w-5 mr-2 text-primary" />
										Account Security
									</h3>

									<div className="space-y-2">
										<Label htmlFor="password">Password</Label>
										<Input
											id="password"
											type="password"
											value={formData.password}
											onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
											required
										/>
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">Confirm Password</Label>
										<Input
											id="confirmPassword"
											type="password"
											value={formData.confirmPassword}
											onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
											required
										/>
									</div>
								</div>

								{/* Preferences */}
								<div className="space-y-4">
									<div className="flex items-center space-x-2">
										<Checkbox
											id="availableDonor"
											checked={formData.isAvailableDonor}
											onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailableDonor: checked as boolean }))}
										/>
										<Label htmlFor="availableDonor" className="text-sm">
											I am available as a blood donor
										</Label>
									</div>

									<div className="flex items-center space-x-2">
										<Checkbox
											id="agreedToTerms"
											checked={formData.agreedToTerms}
											onCheckedChange={(checked) => setFormData(prev => ({ ...prev, agreedToTerms: checked as boolean }))}
											required
										/>
										<Label htmlFor="agreedToTerms" className="text-sm">
											I agree to the{" "}
											<Link to="/terms" className="text-primary hover:underline">
												Terms of Service
											</Link>{" "}
											and{" "}
											<Link to="/privacy" className="text-primary hover:underline">
												Privacy Policy
											</Link>
										</Label>
									</div>
								</div>

								<Button type="submit" className="w-full" size="lg">
									Create Account
								</Button>

								<div className="text-center text-sm text-muted-foreground">
									Already have an account?{" "}
									<Link to="/login" className="text-primary hover:underline font-medium">
										Sign in here
									</Link>
								</div>
							</form>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default SignUp;