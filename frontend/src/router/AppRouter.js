// src/router/AppRouter.js

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth"; 

// Komponen halaman
import LoginPage from "../components/pages/login/LoginPage.js";
import Home from "../components/pages/home/Home.js";
import StudentList from "../components/pages/student_list/StudentList";
import TeacherList from "../components/pages/TeacherList";
import HomeroomList from "../components/pages/HomeroomList";
import Registration from "../components/pages/registration/Registration.js";
import RegistrationPage from "../components/pages/registration/RegistrationForm/RegistrationForm.js";
import Print from "../components/Print_Content/Print.js";
import MainLayout from "../components/layout/Main";
import StudentProfile from "../components/pages/student_list/StudentProfile/StudentProfile.js";
import Logbook from "../components/pages/logbook/Logbook.js";
import Users from "../components/pages/users/Users.js";


import ProtectedRoute from "./ProtectedRoute";

const RegistrarAccess = ({ children }) => {
  const { isAdmin, isRegistrar } = useAuth();
  if (!isAdmin() && !isRegistrar()) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AdminAccess = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }
  return children;
};

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />

    <Route
      path="/home"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <Home />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/students"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <StudentList />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/students/:studentId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <StudentProfile />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/teachers"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <TeacherList />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/logbook"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <Logbook />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/homerooms"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <HomeroomList />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/registration"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <Registration />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/users"
      element={
        <ProtectedRoute>
          <MainLayout>
            <AdminAccess>
              <Users />
            </AdminAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />

    <Route
      path="/registration-form"
      element={
        <ProtectedRoute>
          <MainLayout>
            <RegistrarAccess>
              <RegistrationPage />
            </RegistrarAccess>
          </MainLayout>
        </ProtectedRoute>
      }
    />
    <Route
      path="/print"
      element={
        <ProtectedRoute>
          <RegistrarAccess>
            <Print />
          </RegistrarAccess>
        </ProtectedRoute>
      }
    />

    {/* Pengalihan Default */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
