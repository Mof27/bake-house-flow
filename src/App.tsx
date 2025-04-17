
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { NotificationProvider } from "@/contexts/NotificationContext";

import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateOrder from "./pages/CreateOrder";
import OrderDetails from "./pages/OrderDetails";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <OrderProvider>
            <NotificationProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/create-order" element={<ProtectedRoute roleRequired="leader"><CreateOrder /></ProtectedRoute>} />
                  <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />
                  <Route path="/index" element={<Index />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </TooltipProvider>
            </NotificationProvider>
          </OrderProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
