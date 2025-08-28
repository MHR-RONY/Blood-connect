
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminProtectedRoute from "@/components/AdminProtectedRoute";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import BloodDonatePage from "./pages/BloodDonatePage";
import MoneyDonationPage from "./pages/MoneyDonationPage";
import RequestBloodPage from "./pages/RequestBloodPage";
import FindDonorsPage from "./pages/FindDonorsPage";
import EmergencyRequestPage from "./pages/EmergencyRequestPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailed from "./pages/PaymentFailed";
import PaymentCancelled from "./pages/PaymentCancelled";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import DonorsPage from "./pages/admin/DonorsPage";
import RequestsPage from "./pages/admin/RequestsPage";
import InventoryPage from "./pages/admin/InventoryPage";
import EmergencyPage from "./pages/admin/EmergencyPage";
import SettingsPage from "./pages/admin/SettingsPage";
import DonationsPage from "./pages/admin/DonationsPage";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import Emergency from "./pages/Emergency";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import MedicalDisclaimer from "./pages/MedicalDisclaimer";
import AdminLogin from "./pages/AdminLogin";
import BannedUser from "./pages/BannedUser";

const queryClient = new QueryClient();

const App = () => (
	<QueryClientProvider client={queryClient}>
		<ThemeProvider defaultTheme="system" storageKey="blood-connect-theme">
			<TooltipProvider>
				<Toaster />
				<Sonner />
				<BrowserRouter>
					<AuthProvider>
						<Routes>
							{/* Public Routes */}
							<Route path="/" element={<LandingPage />} />
							<Route
								path="/signup"
								element={
									<ProtectedRoute requireAuth={false}>
										<SignUp />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/login"
								element={
									<ProtectedRoute requireAuth={false}>
										<Login />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/admin/login"
								element={
									<ProtectedRoute requireAuth={false}>
										<AdminLogin />
									</ProtectedRoute>
								}
							/>

							{/* Protected Routes - Require Authentication */}
							<Route
								path="/dashboard"
								element={
									<ProtectedRoute>
										<Dashboard />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/donate"
								element={
									<ProtectedRoute>
										<BloodDonatePage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/donation"
								element={
									<ProtectedRoute>
										<MoneyDonationPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/request"
								element={
									<ProtectedRoute>
										<RequestBloodPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/find-donors"
								element={
									<ProtectedRoute>
										<FindDonorsPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/emergency"
								element={
									<ProtectedRoute>
										<EmergencyRequestPage />
									</ProtectedRoute>
								}
							/>
							<Route
								path="/profile"
								element={
									<ProtectedRoute>
										<Profile />
									</ProtectedRoute>
								}
							/>

							{/* Payment Routes */}
							<Route path="/payment/success" element={<PaymentSuccess />} />
							<Route path="/payment/failed" element={<PaymentFailed />} />
							<Route path="/payment/cancelled" element={<PaymentCancelled />} />

							{/* Protected Admin Routes */}
							<Route
								path="/admin"
								element={
									<AdminProtectedRoute>
										<AdminLayout />
									</AdminProtectedRoute>
								}
							>
								<Route index element={<AdminDashboard />} />
								<Route path="users" element={<UsersPage />} />
								<Route path="donors" element={<DonorsPage />} />
								<Route path="requests" element={<RequestsPage />} />
								<Route path="inventory" element={<InventoryPage />} />
								<Route path="emergency" element={<EmergencyPage />} />
								<Route path="donations" element={<DonationsPage />} />
								<Route path="settings" element={<SettingsPage />} />
							</Route>

							{/* Static Pages - Public */}
							<Route path="/banned" element={<BannedUser />} />
							<Route path="/help-center" element={<HelpCenter />} />
							<Route path="/contact-us" element={<ContactUs />} />
							<Route path="/emergency-info" element={<Emergency />} />
							<Route path="/privacy-policy" element={<PrivacyPolicy />} />
							<Route path="/terms-of-service" element={<TermsOfService />} />
							<Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />

							{/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
							<Route path="*" element={<NotFound />} />
						</Routes>
					</AuthProvider>
				</BrowserRouter>
			</TooltipProvider>
		</ThemeProvider>
	</QueryClientProvider>
);

export default App;
