import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { StudentDashboard } from './pages/dashboards/StudentDashboard';
import { AlumniDashboard } from './pages/dashboards/AlumniDashboard';
import { AdminDashboard } from './pages/dashboards/AdminDashboard';
import { NotFoundPage } from './pages/NotFoundPage';

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

          {/* Authentication & Onboarding */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Role-Specific Dashboards */}
          <Route path="/dashboard/student" element={<StudentDashboard />} />
          <Route path="/dashboard/alumni" element={<AlumniDashboard />} />
          <Route path="/dashboard/admin" element={<AdminDashboard />} />

          {/* 404 Fallback */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
