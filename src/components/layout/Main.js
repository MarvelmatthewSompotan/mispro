import React, { useState } from "react";
import HeaderBar from "../molecules/HeaderBar";
import SidebarMenu from "../molecules/SidebarMenu";
import styles from "./Main.module.css";

const Main = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);

  // Cek apakah mode mobile/overlay
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 900;

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <HeaderBar onHamburgerClick={handleSidebarToggle} />
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div className={styles.sidebar + (isMobile ? ` ${styles.sidebarOverlay}` : "") }>
            <SidebarMenu />
          </div>
        )}
        {/* Main content */}
        <main
          className={
            styles.mainContent + (!sidebarOpen ? ` ${styles.mainContentFull}` : "")
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Main;
