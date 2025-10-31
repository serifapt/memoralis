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
import AdminSetup from "./pages/AdminSetup";
import FunerariaRegister from "./pages/FunerariaRegister";
import FunerariaStatus from "./pages/FunerariaStatus";
import AdminDashboard from "./pages/AdminDashboard";
import AdminFunerarias from "./pages/AdminFunerarias";
import AdminFunerariaDetail from "./pages/AdminFunerariaDetail";
import AdminUsers from "./pages/AdminUsers";
import AdminChat from "./pages/AdminChat";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";

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
          <Route path="/auth" element={<Auth />} />
          <Route path="/admin/auth" element={<AdminAuth />} />
          <Route path="/admin/setup" element={<AdminSetup />} />
          <Route path="/funeraria/register" element={<FunerariaRegister />} />
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
            <Route path="/documents" element={<Documents />} />
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
