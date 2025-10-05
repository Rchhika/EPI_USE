import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import OrgChart from "./pages/OrgChart";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";
import { ToastProvider } from "./contexts/ToastContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ToastProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/employees"
            element={
              <ProtectedRoute>
                <Layout>
                  <Employees />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/org-chart"
            element={
              <ProtectedRoute>
                <Layout>
                  <OrgChart />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
        </BrowserRouter>
      </ToastProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
