import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AccountStatusPage } from './pages/AccountStatusPage';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { AlumniDashboard } from './pages/dashboards/AlumniDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { NotFoundPage } from './pages/NotFoundPage';
import { ProtectedRoute, GuestOnlyRoute } from './components/common/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Landing & Marketing */}
          <Route path="/" element={<LandingPage />} />

          {/* Auth pages: redirect authenticated users away */}
          <Route
            path="/login"
            element={
              <GuestOnlyRoute>
                <LoginPage />
              </GuestOnlyRoute>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnlyRoute>
                <RegisterPage />
              </GuestOnlyRoute>
            }
          />

          {/* Account status portal: authenticated students only */}
          <Route
            path="/account-status"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <AccountStatusPage />
              </ProtectedRoute>
            }
          />

          {/* Student Dashboard: verified students only */}
          <Route
            path="/dashboard/student"
            element={
              <ProtectedRoute requiredRole="STUDENT" requireVerified>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />

          {/* Alumni Dashboard: alumni role only */}
          <Route
            path="/dashboard/alumni"
            element={
              <ProtectedRoute requiredRole="ALUMNI">
                <AlumniDashboard />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard: admin role only */}
          <Route
            path="/dashboard/admin"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
