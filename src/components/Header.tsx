import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Droplets, Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import logoMedical from "@/assets/logo-medical.png";

const Header = () => {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const { isAuthenticated, user, logout } = useAuth();
	const location = useLocation();

	return (
		<header className="bg-background border-b border-border shadow-sm sticky top-0 z-50">
			<div className="container mx-auto px-4 lg:px-6">
				<div className="flex items-center justify-between h-16">
					{/* Logo */}
					<Link to="/" className="flex items-center space-x-2 shrink-0">
						<img src={logoMedical} alt="BloodConnect" className="h-8 w-8" />
						<span className="text-base sm:text-lg md:text-xl font-bold text-foreground">BloodConnect</span>
					</Link>

					{/* Desktop Navigation */}
					<nav className="hidden lg:flex items-center space-x-6">
						<Link to="/donate" className="text-sm text-foreground hover:text-primary transition-colors">
							Donate Blood
						</Link>
						<Link to="/request" className="text-sm text-foreground hover:text-primary transition-colors">
							Request Blood
						</Link>
						<Link to="/donation" className="text-sm text-foreground hover:text-primary transition-colors">
							Donate Money
						</Link>
						{isAuthenticated && (
							<Link to="/dashboard" className="text-sm text-foreground hover:text-primary transition-colors">
								Dashboard
							</Link>
						)}
						<Link to="/find-donors" className="text-sm text-foreground hover:text-primary transition-colors">
							Find Donors
						</Link>
						<Link to="/help-center" className="text-sm text-foreground hover:text-primary transition-colors">
							Help Center
						</Link>
						<Link to="/contact-us" className="text-sm text-foreground hover:text-primary transition-colors">
							Contact Us
						</Link>
					</nav>

					{/* Desktop Actions */}
					<div className="hidden lg:flex items-center space-x-4">
						<ThemeToggle />
						{isAuthenticated ? (
							<>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button variant="ghost" size="icon" className="relative">
											<User className="h-5 w-5" />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className="w-56" align="end" forceMount>
										<DropdownMenuLabel className="font-normal">
											<div className="flex flex-col space-y-1">
												<p className="text-sm font-medium leading-none">
													{user?.firstName} {user?.lastName}
												</p>
												<p className="text-xs leading-none text-muted-foreground">
													{user?.email}
												</p>
											</div>
										</DropdownMenuLabel>
										<DropdownMenuSeparator />
										<DropdownMenuItem asChild>
											<Link to="/profile" className="flex items-center">
												<User className="mr-2 h-4 w-4" />
												<span>Profile</span>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem onClick={logout} className="flex items-center text-red-600">
											<LogOut className="mr-2 h-4 w-4" />
											<span>Log out</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</>
						) : (
							<>
								{location.pathname !== '/login' && (
									<Button variant="outline" size="sm" asChild>
										<Link to="/login">Login</Link>
									</Button>
								)}
								{location.pathname === '/login' && (
									<Button size="sm" asChild>
										<Link to="/signup">Sign Up</Link>
									</Button>
								)}
							</>
						)}
						<Button variant="emergency" size="sm" asChild>
							<Link to="/emergency">
								<Droplets className="h-4 w-4" />
								Emergency Request
							</Link>
						</Button>
					</div>

					{/* Mobile Menu Button */}
					<div className="lg:hidden flex items-center space-x-2">
						<ThemeToggle />
						<Button
							variant="ghost"
							size="icon"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
						</Button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="lg:hidden border-t border-border py-4 max-h-[calc(100vh-64px)] overflow-y-auto">
						<nav className="flex flex-col space-x-3 px-4 mb-4">
							<Link
								to="/donate"
								className="text-sm text-foreground hover:text-primary transition-colors py-2"
								onClick={() => setIsMenuOpen(false)}
							>
								Donate Blood
							</Link>
							<Link
								to="/request"
								className="text-foreground hover:text-primary transition-colors py-2"
								onClick={() => setIsMenuOpen(false)}
							>
								Request Blood
							</Link>
							<Link
								to="/donation"
								className="text-foreground hover:text-primary transition-colors py-2"
								onClick={() => setIsMenuOpen(false)}
							>
								Donate Money
							</Link>
							{isAuthenticated && (
								<Link
									to="/dashboard"
									className="text-foreground hover:text-primary transition-colors py-2"
									onClick={() => setIsMenuOpen(false)}
								>
									Dashboard
								</Link>
							)}
							<Link
								to="/find-donors"
								className="text-foreground hover:text-primary transition-colors py-2"
								onClick={() => setIsMenuOpen(false)}
							>
								Find Donors
							</Link>
							<Link
								to="/help-center"
								className="text-foreground hover:text-primary transition-colors py-2"
								onClick={() => setIsMenuOpen(false)}
							>
								Help Center
							</Link>
							<Link
								to="/contact-us"
								className="text-foreground hover:text-primary transition-colors py-2"
								onClick={() => setIsMenuOpen(false)}
							>
								Contact Us
							</Link>
						</nav>

						<div className="flex flex-col space-y-3 px-2 pt-4 border-t border-border">
							{isAuthenticated ? (
								<>
									<div className="bg-muted/50 rounded-lg p-3">
										<p className="text-sm font-medium">
											{user?.firstName} {user?.lastName}
										</p>
										<p className="text-xs text-muted-foreground">
											{user?.email}
										</p>
									</div>
									<Button variant="medical" className="w-full" asChild>
										<Link to="/profile" onClick={() => setIsMenuOpen(false)}>
											<User className="h-4 w-4 mr-2" />
											Profile
										</Link>
									</Button>
									<Button
										variant="outline"
										className="w-full text-red-600 border-red-200 hover:bg-red-50"
										onClick={() => { logout(); setIsMenuOpen(false); }}
									>
										<LogOut className="h-4 w-4 mr-2" />
										Log out
									</Button>
								</>
							) : (
								<>
									{location.pathname !== '/login' && (
										<Button variant="outline" className="w-full" asChild>
											<Link to="/login">Login</Link>
										</Button>
									)}
									{location.pathname === '/login' && (
										<Button className="w-full" asChild>
											<Link to="/signup">Sign Up</Link>
										</Button>
									)}
								</>
							)}
							<Button variant="emergency" className="w-full" asChild>
								<Link to="/emergency" onClick={() => setIsMenuOpen(false)}>
									<Droplets className="h-4 w-4 mr-2" />
									Emergency Request
								</Link>
							</Button>
						</div>
					</div>
				)}
			</div>
		</header>
	);
};

export default Header;