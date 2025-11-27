// src/router/AppRouter.js

import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Komponen halaman
import LoginPage from '../components/pages/login/LoginPage.js';
import Home from '../components/pages/home/Home.js';
import StudentList from '../components/pages/student_list/StudentList';
import TeacherList from '../components/pages/TeacherList';
import HomeroomList from '../components/pages/HomeroomList';
import Registration from '../components/pages/registration/Registration.js';
import RegistrationPage from '../components/pages/registration/RegistrationForm/RegistrationForm.js';
import Print from '../components/pages/Print_Content/Print.js';
import MainLayout from '../components/layout/Main';
import StudentProfile from '../components/pages/student_list/StudentProfile/StudentProfile.js';
import Logbook from '../components/pages/logbook/Logbook.js';
import Users from '../components/pages/users/Users.js';

import ProtectedRoute from './ProtectedRoute';

// Komponen 'Access' Anda tetap sama
const RegistrarAccess = ({ children }) => {
  const { isAdmin, isRegistrar } = useAuth();
  if (!isAdmin() && !isRegistrar()) {
    return <Navigate to='/home' replace />;
  }
  return children;
};

const AdminAccess = ({ children }) => {
  const { isAdmin } = useAuth();
  if (!isAdmin()) {
    return <Navigate to='/home' replace />;
  }
  return children;
};

// Ini adalah 'AppRouter' baru, sekarang dalam format array
const appRoutes = [
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/home',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <Home />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/students',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <StudentList />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/students/:id',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <StudentProfile />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/teachers',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <TeacherList />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/logbook',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <Logbook />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/homerooms',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <HomeroomList />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/registration',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <Registration />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <AdminAccess>
            <Users />
          </AdminAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/registration-form',
    element: (
      <ProtectedRoute>
        <MainLayout>
          <RegistrarAccess>
            <RegistrationPage />
          </RegistrarAccess>
        </MainLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/print',
    element: (
      <ProtectedRoute>
        <RegistrarAccess>
          <Print />
        </RegistrarAccess>
      </ProtectedRoute>
    ),
  },
  // Pengalihan Default
  {
    path: '/',
    element: <Navigate to='/login' replace />,
  },
  {
    path: '*',
    element: <Navigate to='/login' replace />,
  },
];

export default appRoutes;
