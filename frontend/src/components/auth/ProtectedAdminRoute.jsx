import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedAdminRoute({ element }) {
  const token = localStorage.getItem("admin_token");
  if (!token) return <Navigate to="/admin/login" replace />;
  return element;
}

