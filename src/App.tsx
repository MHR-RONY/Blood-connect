
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UsersPage from "./pages/admin/UsersPage";
import DonorsPage from "./pages/admin/DonorsPage";
import RequestsPage from "./pages/admin/RequestsPage";
import InventoryPage from "./pages/admin/InventoryPage";
import EmergencyPage from "./pages/admin/EmergencyPage";
import SettingsPage from "./pages/admin/SettingsPage";
import DonationsPage from "./pages/admin/DonationsPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="blood-connect-theme">
      <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/donate" element={<BloodDonatePage />} />
          <Route path="/donation" element={<MoneyDonationPage />} />
          <Route path="/request" element={<RequestBloodPage />} />
          <Route path="/find-donors" element={<FindDonorsPage />} />
          <Route path="/emergency" element={<EmergencyRequestPage />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="donors" element={<DonorsPage />} />
            <Route path="requests" element={<RequestsPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="emergency" element={<EmergencyPage />} />
            <Route path="donations" element={<DonationsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </ThemeProvider>
  </QueryClientProvider>
);

export default App;
