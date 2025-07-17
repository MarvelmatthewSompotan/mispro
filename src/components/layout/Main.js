import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import HeaderBar from '../molecules/HeaderBar';
import SidebarMenu from '../molecules/SidebarMenu';
import Home from '../pages/Home';
import Registration from '../pages/Registration';
import Print from '../pages/Print';

// Placeholder pages
const StudentList = () => <div style={{ padding: 32 }}>Student List Page</div>;
const TeacherList = () => <div style={{ padding: 32 }}>Teacher List Page</div>;
const HomeroomList = () => <div style={{ padding: 32 }}>Homeroom List Page</div>;

const Main = () => {
  const location = useLocation();
  if (location.pathname === '/print') {
    return <Print />;
  }

  return (
    <div>
      <HeaderBar />
      <div className="main-layout" style={{ display: 'flex' }}>
        <SidebarMenu />
        <div style={{ flex: 1, paddingTop: 76 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/teachers" element={<TeacherList />} />
            <Route path="/homerooms" element={<HomeroomList />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/print" element={<Print />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Main; 