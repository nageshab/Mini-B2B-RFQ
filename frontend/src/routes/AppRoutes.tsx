import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { LoginPage } from "../pages/LoginPage";
import { SignupPage } from "../pages/SignupPage";
import { BuyerDashboard } from "../pages/BuyerDashboard";
import { MyRfqsPage } from "../pages/MyRfqsPage";
import { CreateRfqPage } from "../pages/CreateRfqPage";
import { RfqDetailsPage } from "../pages/RfqDetailsPage";
import { EditRfqPage } from "../pages/EditRfqPage";
import { RfqQuotationsPage } from "../pages/RfqQuotationsPage";
import { SupplierDashboard } from "../pages/SupplierDashboard";
import { MarketplacePage } from "../pages/MarketplacePage";
import { SupplierRfqDetailsPage } from "../pages/SupplierRfqDetailsPage";
import { SupplierQuotationsPage } from "../pages/SupplierQuotationsPage";
import { NotFoundPage } from "../pages/NotFoundPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { AppLayout } from "../layouts/AppLayout";

const IndexRedirect: React.FC = () => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to={user.role === "BUYER" ? "/buyer" : "/supplier"} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<IndexRedirect />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />

      {/* Protected Buyer Routes */}
      <Route
        path="/buyer"
        element={
          <ProtectedRoute allowedRole="BUYER">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<BuyerDashboard />} />
        <Route path="rfqs" element={<MyRfqsPage />} />
        <Route path="rfqs/new" element={<CreateRfqPage />} />
        <Route path="rfqs/:id" element={<RfqDetailsPage />} />
        <Route path="rfqs/:id/edit" element={<EditRfqPage />} />
        <Route path="rfqs/:id/quotations" element={<RfqQuotationsPage />} />
      </Route>

      {/* Protected Supplier Routes */}
      <Route
        path="/supplier"
        element={
          <ProtectedRoute allowedRole="SUPPLIER">
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<SupplierDashboard />} />
        <Route path="rfqs" element={<MarketplacePage />} />
        <Route path="rfqs/:id" element={<SupplierRfqDetailsPage />} />
        <Route path="quotations" element={<SupplierQuotationsPage />} />
      </Route>

      {/* 404 Catch-All */}
      <Route
        path="*"
        element={
          <AppLayout />
        }
      >
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
