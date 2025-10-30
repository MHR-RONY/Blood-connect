import { Button } from "@/components/ui/button";
import { MapPin, Users, Clock } from "lucide-react";
const heroImage = "https://res.cloudinary.com/dreby3qi3/image/upload/v1761851413/ravi25_may_5_jruyhv.jpg";
import BloodDropIcon from "@/components/BloodDropIcon";
import AnimatedCounter from "@/components/AnimatedCounter";

const Hero = () => {
	return (
		<section className="relative min-h-[600px] flex items-center bg-gradient-to-r from-medical to-background">
			<div className="container mx-auto px-4 lg:px-6">
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
					{/* Content */}
					<div className="space-y-8">
						<div className="space-y-4">
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
								Save Lives with
								<span className="text-primary"> Every Drop</span>
							</h1>
							<p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
								Connect blood donors with those in need. Find nearby donors, make requests,
								and help build a community that saves lives every day.
							</p>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<Button size="lg" className="text-lg px-8 py-6">
								<BloodDropIcon size="md" className="text-white" />
								Donate Blood
							</Button>
							<Button variant="medical" size="lg" className="text-lg px-8 py-6">
								<MapPin className="h-5 w-5" />
								Find Donors
							</Button>
						</div>

						{/* Stats */}
						<div className="grid grid-cols-3 gap-6 pt-8">
							<div className="text-center">
								<AnimatedCounter
									end={2500}
									suffix="+"
									className="text-2xl md:text-3xl font-bold text-primary"
									duration={2500}
								/>
								<div className="text-sm text-muted-foreground">Lives Saved</div>
							</div>
							<div className="text-center">
								<AnimatedCounter
									end={1200}
									suffix="+"
									className="text-2xl md:text-3xl font-bold text-primary"
									duration={2000}
								/>
								<div className="text-sm text-muted-foreground">Active Donors</div>
							</div>
							<div className="text-center">
								<div className="text-2xl md:text-3xl font-bold text-primary">24/7</div>
								<div className="text-sm text-muted-foreground">Support</div>
							</div>
						</div>
					</div>

					{/* Image */}
					<div className="relative">
						<div className="rounded-2xl overflow-hidden shadow-2xl" style={{boxShadow: "0 20px 40px rgba(0, 0, 0, 0.6)"}}>
							<img
								src={heroImage}
								alt="Blood donation in progress"
								className="w-full h-[500px] object-cover"
							/>
						</div>

						{/* Floating Cards */}
						<div className="absolute -top-6 -left-6 bg-background rounded-lg shadow-lg p-4 border border-border">
							<div className="flex items-center space-x-3">
								<div className="bg-success/10 p-2 rounded-full">
									<Users className="h-5 w-5 text-success" />
								</div>
								<div>
									<div className="font-semibold text-sm">15 Donors</div>
									<div className="text-xs text-muted-foreground">Available nearby</div>
								</div>
							</div>
						</div>

						<div className="absolute -bottom-6 -right-6 bg-background rounded-lg shadow-lg p-4 border border-border">
							<div className="flex items-center space-x-3">
								<div className="bg-emergency/10 p-2 rounded-full">
									<Clock className="h-5 w-5 text-emergency" />
								</div>
								<div>
									<div className="font-semibold text-sm">Urgent</div>
									<div className="text-xs text-muted-foreground">O- Blood needed</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;