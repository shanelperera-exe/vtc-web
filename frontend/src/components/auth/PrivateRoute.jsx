import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LAST_PROTECTED_KEY = 'vtc_last_protected_path';

export function getLastProtectedPath() {
  try { return sessionStorage.getItem(LAST_PROTECTED_KEY) || localStorage.getItem(LAST_PROTECTED_KEY); } catch { return null; }
}

export function clearLastProtectedPath() {
  try { sessionStorage.removeItem(LAST_PROTECTED_KEY); localStorage.removeItem(LAST_PROTECTED_KEY);} catch {}
}

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth() || {};
  const location = useLocation();

  if (loading) return null; // overlay handles visual loading

  if (!isAuthenticated) {
    // store path for post-login redirect
    try { sessionStorage.setItem(LAST_PROTECTED_KEY, location.pathname + location.search); } catch {}
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children ? children : <Outlet />;
};

export default PrivateRoute;
