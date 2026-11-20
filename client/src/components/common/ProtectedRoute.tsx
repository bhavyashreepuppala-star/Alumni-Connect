import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, getStoredUser } from '../../lib/auth';

/**
 * ProtectedRoute — Frontend route guard.
 *
 * Rules enforced (all role/status enforcement is ALSO done on the backend for every API call):
 * 1. If no token → redirect to /login.
 * 2. If requiredRole is set and stored user doesn't match → redirect to /.
 * 3. If requireVerified is true and student is not VERIFIED → redirect to /account-status.
 *
 * The backend independently enforces all of these on every request; this guard only
 * provides a smooth UX redirect rather than a security barrier.
 */
interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'STUDENT' | 'ALUMNI' | 'ADMIN';
  requireVerified?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requireVerified = false,
}) => {
  const location = useLocation();
  const token = getToken();
  const user = getStoredUser();

  // 1. No token → login
  if (!token || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role mismatch → home (don't expose other dashboards)
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/" replace />;
  }

  // 3. Unverified student trying to access verified-only area
  if (requireVerified && user.role === 'STUDENT' && user.status !== 'VERIFIED') {
    return <Navigate to="/account-status" replace />;
  }

  return <>{children}</>;
};

/**
 * GuestOnlyRoute — Prevents already-authenticated users from reaching login/register pages.
 * Redirects verified students to their dashboard; pending students to account-status.
 */
export const GuestOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getToken();
  const user = getStoredUser();

  if (token && user) {
    if (user.role === 'STUDENT') {
      return user.status === 'VERIFIED'
        ? <Navigate to="/dashboard/student" replace />
        : <Navigate to="/account-status" replace />;
    }
    if (user.role === 'ALUMNI') return <Navigate to="/dashboard/alumni" replace />;
    if (user.role === 'ADMIN') return <Navigate to="/dashboard/admin" replace />;
  }

  return <>{children}</>;
};
