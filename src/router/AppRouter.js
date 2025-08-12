import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/pages/LoginPage";
import Home from "../components/pages/Home";
import StudentList from "../components/pages/StudentList";
import TeacherList from "../components/pages/TeacherList";
import HomeroomList from "../components/pages/HomeroomList";
import Registration from "../components/pages/Registration";
import RegistrationPage from "../components/pages/RegistrationForm";
import Print from "../components/pages/Print";
import MainLayout from "../components/layout/Main";
import ProtectedRoute from "../components/ProtectedRoute";

const AppRouter = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protected routes with MainLayout */}
    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <MainLayout>
            <Home />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/students"
      element={
        <ProtectedRoute>
          <MainLayout>
            <StudentList />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/teachers"
      element={
        <ProtectedRoute>
          <MainLayout>
            <TeacherList />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/homerooms"
      element={
        <ProtectedRoute>
          <MainLayout>
            <HomeroomList />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/registration"
      element={
        <ProtectedRoute>
          <MainLayout>
            <Registration />
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/registration-form"
      element={
        <ProtectedRoute>
          <RegistrationPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/print"
      element={
        <ProtectedRoute>
          <Print />
        </ProtectedRoute>
      }
    />

    {/* Default redirects */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
