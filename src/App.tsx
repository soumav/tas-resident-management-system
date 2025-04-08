
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AllResidents from "./pages/AllResidents";
import AddResident from "./pages/AddResident";
import ResidentTypeManager from "./pages/ResidentTypeManager";
import StaffVolunteers from "./pages/StaffVolunteers";
import NotFound from "./pages/NotFound";
import Groups from "./pages/Groups";
import About from "./pages/About";
import Help from "./pages/Help";
import Settings from "./pages/Settings";
import AdminApproval from "./pages/AdminApproval"; // Added import

// Layouts
import DashboardLayout from "./components/Layout/DashboardLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <Routes>
            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected Dashboard Routes */}
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="residents" element={<AllResidents />} />
              <Route path="residents/new" element={<AddResident />} />
              <Route path="residents/edit/:id" element={<AddResident />} />
              <Route path="resident-types" element={<ResidentTypeManager />} />
              <Route path="groups" element={<Groups />} /> 
              <Route path="staff" element={<StaffVolunteers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="about" element={<About />} />
              <Route path="help" element={<Help />} />
              <Route path="admin/approvals" element={<AdminApproval />} /> {/* Added route */}
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </TooltipProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
