import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import { setAuthToken } from "./api/client";
import { ToastProvider } from "./components/toast/ToastProvider";

import { ProtectedAdminRoute } from "./components/auth/ProtectedAdminRoute";
import LoginPage from "./pages/admin/LoginPage";
import DashboardPage from "./pages/admin/DashboardPage";
import CarsPage from "./pages/admin/CarsPage";
import CarEditorPage from "./pages/admin/CarEditorPage";
import NotificationsPage from "./pages/admin/NotificationsPage";

import GalleryPage from "./pages/public/GalleryPage";
import CarDetailsPage from "./pages/public/CarDetailsPage";

export default function App() {
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (token) setAuthToken(token);
  }, []);

  return (
    <ToastProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<GalleryPage />} />
          <Route path="/cars/:id" element={<CarDetailsPage />} />

          <Route path="/admin/login" element={<LoginPage />} />

          <Route
            path="/admin/dashboard"
            element={<ProtectedAdminRoute element={<DashboardPage />} />}
          />
          <Route path="/admin/cars" element={<ProtectedAdminRoute element={<CarsPage />} />} />
          <Route
            path="/admin/cars/new"
            element={<ProtectedAdminRoute element={<CarEditorPage mode="create" />} />}
          />
          <Route
            path="/admin/cars/:id/edit"
            element={<ProtectedAdminRoute element={<CarEditorPage mode="edit" />} />}
          />
          <Route
            path="/admin/notifications"
            element={<ProtectedAdminRoute element={<NotificationsPage />} />}
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </ToastProvider>
  );
}

