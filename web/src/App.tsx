import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Landing from "./pages/Landing";
import DashboardLayout from "./layouts/DashboardLayout";
import Dashboard from "./pages/app/Dashboard";
import Send from "./pages/app/Send";
import Vaults from "./pages/app/Vaults";
import Identity from "./pages/app/Identity";
import Analytics from "./pages/app/Analytics";
import Developers from "./pages/app/Developers";
import Settings from "./pages/app/Settings";
import Help from "./pages/app/Help";
import Agents from "./pages/app/Agents";
import Corridors from "./pages/app/Corridors";
import Recurring from "./pages/app/Recurring";
import NotFound from "./pages/NotFound";

import { WagmiProvider } from 'wagmi';
import { config } from './lib/wallet';

const queryClient = new QueryClient();

const App = () => (
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/app" element={<DashboardLayout />}>
              <Route index element={<Navigate to="/app/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="send" element={<Send />} />
              <Route path="corridors" element={<Corridors />} />
              <Route path="vaults" element={<Vaults />} />
              <Route path="agents" element={<Agents />} />
              <Route path="recurring" element={<Recurring />} />
              <Route path="identity" element={<Identity />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="developers" element={<Developers />} />
              <Route path="settings" element={<Settings />} />
              <Route path="help" element={<Help />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

export default App;
