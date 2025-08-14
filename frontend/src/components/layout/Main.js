import React, { useState, useEffect } from "react";
import HeaderBar from "../molecules/HeaderBar";
import SidebarMenu from "../molecules/SidebarMenu";
import styles from "./Main.module.css";

const Main = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [theme, setTheme] = useState("light");

  const handleSidebarToggle = () => setSidebarOpen((open) => !open);
  const handleToggleTheme = () =>
    setTheme((t) => (t === "dark" ? "light" : "dark"));

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "";
  }, [theme]);

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <HeaderBar
        onHamburgerClick={handleSidebarToggle}
        onToggleTheme={handleToggleTheme}
        theme={theme}
      />
      <div style={{ display: "flex", flex: 1 }}>
        {/* Sidebar */}
        {sidebarOpen && (
          <div className={styles.sidebar}>
            <SidebarMenu />
          </div>
        )}
        {/* Main content */}
        <main
          className={
            styles.mainContent +
            (!sidebarOpen ? ` ${styles.mainContentFull}` : "")
          }
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Main;
