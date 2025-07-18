import React, { useState } from "react";
import Sidebar from "../molecules/sidebar/Sidebar";
import HeaderBar from "../molecules/header/HeaderBar";
import "../css/MainLayout.css";

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Fungsi toggle sidebar
  const toggleSidebar = () => setSidebarOpen((open) => !open);
  // Tutup sidebar jika klik overlay
  const closeSidebar = () => setSidebarOpen(false);
  return (
    <div className="main-layout">
      {/* Overlay untuk mobile */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar} />
      )}
      <Sidebar
        open={sidebarOpen}
        onClose={closeSidebar}
        closed={!sidebarOpen}
      />
      <div className={`main-area${!sidebarOpen ? " sidebar-closed" : ""}`}>
        <HeaderBar onHamburgerClick={toggleSidebar} />
        <div className="main-content">
          <div className="main-layout-container">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
