import React from "react";
import HeaderBar from "../molecules/HeaderBar";
import SidebarMenu from "../molecules/SidebarMenu";
import styles from "./Main.module.css";

const Main = ({ children }) => {
  return (
    <div
      style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}
    >
      <HeaderBar />
      <div style={{ display: "flex", flex: 1 }}>
        <div style={{ position: "fixed", top: "0px", left: 0, zIndex: 100 }}>
          <SidebarMenu />
        </div>
        <main className={styles.mainContent}>{children}</main>
      </div>
    </div>
  );
};

export default Main;
