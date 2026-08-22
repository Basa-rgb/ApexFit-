import React from "react";
import { Navigate, useLocation } from "react-router-dom";

// Protect private pages using the token and user role saved at login.
const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");

  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (adminOnly && storedUser?.role !== "admin") return <Navigate to="/dashboard" replace />;

  return children;
};

export default ProtectedRoute;
