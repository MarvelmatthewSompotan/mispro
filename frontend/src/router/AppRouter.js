// src/router/AppRouter.js

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Import komponen halaman
import LoginPage from "../components/pages/login/LoginPage.js";
import Home from "../components/pages/Home";
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

// Import komponen penjaga rute
import ProtectedRoute from "./ProtectedRoute";

const AppRouter = () => (
  <Routes>
    {/* Rute Publik: HANYA halaman login yang bisa diakses tanpa token */}
    <Route path="/login" element={<LoginPage />} />

    {/* Rute Terproteksi: SEMUA halaman di bawah ini HARUS punya token untuk diakses */}
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
      path="/students/:studentId"
      element={
        <ProtectedRoute>
          <MainLayout>
            <StudentProfile />
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
      path="/logbook"
      element={
        <ProtectedRoute>
          <MainLayout>
            <Logbook />
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
      path="/users"
      element={
        <ProtectedRoute>
          <MainLayout>
            <Users />
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

    {/* Pengalihan Default */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
