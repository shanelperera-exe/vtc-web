import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

const RequireAdmin = () => {
  const { user, loading } = useAuth() || {};
  const location = useLocation();
  if (loading) return null; // let a global loader handle visuals
  const roles = user?.roles || [];
  const hasAdmin = roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER');
  if (!hasAdmin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export default RequireAdmin;
