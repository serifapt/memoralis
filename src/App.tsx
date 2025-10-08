import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
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
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/obituaries" element={<Obituaries />} />
            <Route path="/obituaries/new" element={<NewObituary />} />
            <Route path="/ceremonies" element={<Ceremonies />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
