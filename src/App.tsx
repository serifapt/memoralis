import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AdminLayout } from "./components/layout/AdminLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import Home from "./pages/Home";
import ObituaryDetail from "./pages/ObituaryDetail";
import ObituaryArchive from "./pages/ObituaryArchive";
import FunerariaArchive from "./pages/FunerariaArchive";
import FunerariaDetail from "./pages/FunerariaDetail";
import Dashboard from "./pages/Dashboard";
import Obituaries from "./pages/Obituaries";
import NewObituary from "./pages/NewObituary";
import Ceremonies from "./pages/Ceremonies";
import Clients from "./pages/Clients";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";
import Auth from "./pages/Auth";
import AdminAuth from "./pages/AdminAuth";
import FunerariaRegister from "./pages/FunerariaRegister";
import FunerariaStatus from "./pages/FunerariaStatus";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFunerarias from "./pages/AdminFunerarias";
import AdminFunerariaDetail from "./pages/AdminFunerariaDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminChat from "./pages/AdminChat";
import Support from "./pages/Support";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Sobre from "./pages/Sobre";
import Contactos from "./pages/Contactos";
import NotFound from "./pages/NotFound";
import FlowerCatalog from "./pages/FlowerCatalog";
import FlowerOrders from "./pages/FlowerOrders";
import BudgetQuotes from "./pages/BudgetQuotes";
import BudgetQuoteDetail from "./pages/BudgetQuoteDetail";
import FunerariaContacts from "./pages/FunerariaContacts";
import TestimonialsManagement from "./pages/TestimonialsManagement";
// Care & Homenagem B2C Module
import CareLanding from "./pages/CareLanding";

import CareCheckout from "./pages/CareCheckout";
import CareAuth from "./pages/CareAuth";
import CustomerDashboard from "./pages/CustomerDashboard";
import AdminCareSubscriptions from "./pages/AdminCareSubscriptions";
import AdminCareTasks from "./pages/AdminCareTasks";
import AdminCareTechnicians from "./pages/AdminCareTechnicians";
import TechnicianDashboard from "./pages/TechnicianDashboard";
import TechnicianAuth from "./pages/TechnicianAuth";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/obituario" element={<ObituaryArchive />} />
          <Route path="/obituario/:id" element={<ObituaryDetail />} />
          <Route path="/funerarias" element={<FunerariaArchive />} />
          <Route path="/funerarias/:id" element={<FunerariaDetail />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="/contactos" element={<Contactos />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/funeraria/register" element={<FunerariaRegister />} />
          {/* Care & Homenagem B2C Routes */}
          <Route path="/care" element={<CareLanding />} />
          
          <Route path="/care/checkout" element={<CareCheckout />} />
          <Route path="/care/auth" element={<CareAuth />} />
          <Route path="/account/care" element={<CustomerDashboard />} />
          <Route path="/technician/auth" element={<TechnicianAuth />} />
          <Route path="/field/tasks" element={<TechnicianDashboard />} />
          <Route 
            path="/funeraria/status" 
            element={
              <ProtectedRoute requireRole="funeraria">
                <FunerariaStatus />
              </ProtectedRoute>
            } 
          />
          <Route
            element={
              <ProtectedRoute requireRole="admin">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/funerarias" element={<AdminFunerarias />} />
            <Route path="/admin/funerarias/:id" element={<AdminFunerariaDetail />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/chat" element={<AdminChat />} />
            <Route path="/admin/care/subscriptions" element={<AdminCareSubscriptions />} />
            <Route path="/admin/care/tasks" element={<AdminCareTasks />} />
            <Route path="/admin/care/technicians" element={<AdminCareTechnicians />} />
          </Route>
          <Route
            element={
              <ProtectedRoute requireRole="funeraria">
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/obituaries" element={<Obituaries />} />
            <Route path="/obituaries/new" element={<NewObituary />} />
            <Route path="/obituaries/:id/edit" element={<NewObituary />} />
            <Route path="/ceremonies" element={<Ceremonies />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/contacts" element={<FunerariaContacts />} />
            <Route path="/testimonials" element={<TestimonialsManagement />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/flowers/catalog" element={<FlowerCatalog />} />
            <Route path="/flowers/orders" element={<FlowerOrders />} />
            <Route path="/budgets" element={<BudgetQuotes />} />
            <Route path="/budgets/new" element={<BudgetQuoteDetail />} />
            <Route path="/budgets/:id" element={<BudgetQuoteDetail />} />
            <Route path="/support" element={<Support />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
