
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { OrderProvider } from '@/contexts/OrderContext';
import { NotificationProvider } from '@/contexts/NotificationContext';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './App.css';
import { Toaster } from 'sonner';

// Pages
import Dashboard from './pages/Dashboard';
import QueuePage from './pages/Queue';
import CreateOrder from './pages/CreateOrder';
import NewCakeOrder from './pages/NewCakeOrder';
import NewOrder from './pages/NewOrder';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Index from './pages/Index';
import OrderDetails from './pages/OrderDetails';
import Logs from './pages/Logs';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      retry: 1,
      staleTime: 30 * 1000, // 30 seconds
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <OrderProvider>
            <NotificationProvider>
              <Router>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/queue" element={<QueuePage />} />
                  <Route path="/create-order" element={<CreateOrder />} />
                  <Route path="/new-cake-order" element={<NewCakeOrder />} />
                  <Route path="/new-order" element={<NewOrder />} />
                  <Route path="/orders/:id" element={<OrderDetails />} />
                  <Route path="/logs" element={<Logs />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Router>
              <Toaster position="top-right" />
            </NotificationProvider>
          </OrderProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
