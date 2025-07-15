import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SidebarMenu from './components/molecules/SidebarMenu';
import Home from './components/pages/Home';
import Print from './components/pages/Print';
import Registration from './components/pages/Registration';
import './App.css';

// Placeholder pages
const StudentList = () => <div style={{ padding: 32 }}>Student List Page</div>;
const TeacherList = () => <div style={{ padding: 32 }}>Teacher List Page</div>;
const HomeroomList = () => <div style={{ padding: 32 }}>Homeroom List Page</div>;

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#fafbff' }}>
        <SidebarMenu />
        <main style={{ flex: 1, padding: 32, position: 'relative' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/teachers" element={<TeacherList />} />
            <Route path="/homerooms" element={<HomeroomList />} />
            <Route path="/registration" element={<Registration />} />
            <Route path="/print" element={<Print />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
