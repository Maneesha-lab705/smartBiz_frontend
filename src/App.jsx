import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import theme from "./theme/theme";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider } from "./contexts/ToastContext";
import { ProtectedRoute } from "./components/common/ProtectedRoute";
import MainLayout from "./components/layout/MainLayout";

import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import AdminLoginPage from "./pages/auth/AdminLoginPage";
import AdminRegisterPage from "./pages/auth/AdminRegisterPage";

import DashboardPage from "./pages/dashboard/DashboardPage";
import ProductsPage from "./pages/products/ProductsPage";
import CustomersPage from "./pages/customers/CustomersPage";
import SuppliersPage from "./pages/suppliers/SuppliersPage";
import SalesPage from "./pages/sales/SalesPage";
import ExpensesPage from "./pages/expenses/ExpensesPage";
import ReportsPage from "./pages/reports/ReportsPage";
import AIInsightsPage from "./pages/ai/AIInsightsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import BusinessesPage from "./pages/admin/BusinessesPage";
import UsersPage from "./pages/admin/UsersPage";
import AiLogsPage from "./pages/admin/AiLogsPage";

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <BrowserRouter>
          <AuthProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin-login" element={<AdminLoginPage />} />
              <Route path="/admin-register" element={<AdminRegisterPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/customers" element={<CustomersPage />} />
                  <Route path="/suppliers" element={<SuppliersPage />} />
                  <Route path="/sales" element={<SalesPage />} />
                  <Route path="/expenses" element={<ExpensesPage />} />
                  <Route path="/reports" element={<ReportsPage />} />
                  <Route path="/ai" element={<AIInsightsPage />} />
                </Route>
              </Route>

              <Route element={<ProtectedRoute adminOnly />}>
                <Route element={<MainLayout />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route
                    path="/admin/businesses"
                    element={<BusinessesPage />}
                  />
                  <Route path="/admin/users" element={<UsersPage />} />
                  <Route path="/admin/ai-logs" element={<AiLogsPage />} />
                </Route>
              </Route>

              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </ToastProvider>
    </ThemeProvider>
  );
}
