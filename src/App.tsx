
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "./components/Layout/Footer";
import { SidebarProvider } from "@/components/ui/sidebar";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AllResidents from "./pages/AllResidents";
import AddResident from "./pages/AddResident";
import ResidentTypeManager from "./pages/ResidentTypeManager";
import StaffVolunteers from "./pages/StaffVolunteers";
import NotFound from "./pages/NotFound";

// Layouts
import DashboardLayout from "./components/Layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <SidebarProvider>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<div className="flex flex-col min-h-screen"><Login /><Footer /></div>} />
              <Route path="/signup" element={<div className="flex flex-col min-h-screen"><Signup /><Footer /></div>} />
              
              {/* Protected Dashboard Routes */}
              <Route path="/" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="residents" element={<AllResidents />} />
                <Route path="residents/new" element={<AddResident />} />
                <Route path="resident-types" element={<ResidentTypeManager />} />
                <Route path="groups" element={<Dashboard />} /> 
                <Route path="staff" element={<StaffVolunteers />} />
                <Route path="settings" element={<Dashboard />} />
                <Route path="about" element={<Dashboard />} />
                <Route path="help" element={<Dashboard />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<div className="flex flex-col min-h-screen"><NotFound /><Footer /></div>} />
            </Routes>
          </SidebarProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
