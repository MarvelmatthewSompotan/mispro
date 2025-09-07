import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/pages/LoginPage";
import Home from "../components/pages/Home";
import StudentList from "../components/pages/student_list/StudentList";
import TeacherList from "../components/pages/TeacherList";
import HomeroomList from "../components/pages/HomeroomList";
import Registration from "../components/pages/Registration";
import RegistrationPage from "../components/pages/RegistrationForm";
import Print from "../components/pages/Print";
import MainLayout from "../components/layout/Main";
import StudentProfile from "../components/pages/student_list/StudentProfile/StudentProfile.js";

const AppRouter = () => (
  <Routes>
    {/* Public routes */}
    <Route path="/login" element={<LoginPage />} />

    {/* Protected routes with MainLayout */}
    <Route
      path="/home"
      element={
        <MainLayout>
          <Home />
        </MainLayout>
      }
    />
    <Route
      path="/students"
      element={
        <MainLayout>
          <StudentList />
        </MainLayout>
      }
    />

    <Route
      path="/students/:studentId"
      element={
        <MainLayout>
          <StudentProfile />
        </MainLayout>
      }
    />

    <Route
      path="/teachers"
      element={
        <MainLayout>
          <TeacherList />
        </MainLayout>
      }
    />
    <Route
      path="/homerooms"
      element={
        <MainLayout>
          <HomeroomList />
        </MainLayout>
      }
    />
    <Route
      path="/registration"
      element={
        <MainLayout>
          <Registration />
        </MainLayout>
      }
    />
    <Route path="/registration-form" element={<RegistrationPage />} />
    <Route path="/print" element={<Print />} />

    {/* Default redirects */}
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
