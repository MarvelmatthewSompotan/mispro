import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "../components/pages/LoginPage";
import HomePage from "../components/pages/HomePage";
import StudentListPage from "../components/pages/StudentListPage";
import TeacherListPage from "../components/pages/TeacherListPage";
import HomeroomListPage from "../components/pages/HomeroomListPage";
import RegistrationPage from "../components/pages/RegistrationPage";
import MainLayout from "../components/layout/MainLayout";

const AppRouter = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/home"
      element={
        <MainLayout>
          <HomePage />
        </MainLayout>
      }
    />
    <Route
      path="/students"
      element={
        <MainLayout>
          <StudentListPage />
        </MainLayout>
      }
    />
    <Route
      path="/teachers"
      element={
        <MainLayout>
          <TeacherListPage />
        </MainLayout>
      }
    />
    <Route
      path="/homerooms"
      element={
        <MainLayout>
          <HomeroomListPage />
        </MainLayout>
      }
    />
    <Route
      path="/registration"
      element={
        <MainLayout>
          <RegistrationPage />
        </MainLayout>
      }
    />
    <Route path="/" element={<Navigate to="/login" replace />} />
    <Route path="*" element={<Navigate to="/login" replace />} />
  </Routes>
);

export default AppRouter;
