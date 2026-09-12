import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Role } from "../types/auth";

interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRole?: Role;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRole,
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-sm font-medium text-slate-500 animate-pulse">
          Loading authentication...
        </div>
      </div>
    );
  }

  // 1. Unauthenticated users redirected to login
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Role enforcement: if route requires BUYER and user is SUPPLIER (or vice versa),
  // redirect them to their own authorized dashboard.
  if (allowedRole && user.role !== allowedRole) {
    const fallbackPath = user.role === "BUYER" ? "/buyer" : "/supplier";
    return <Navigate to={fallbackPath} replace />;
  }

  return children;
};
