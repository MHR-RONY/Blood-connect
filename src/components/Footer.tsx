import { Link } from "react-router-dom";

const Footer = () => {
	return (
		<footer className="bg-foreground text-background py-12 mt-12">
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
	);
};

export default Footer;
