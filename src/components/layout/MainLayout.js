import React from "react";
import Sidebar from "../molecules/sidebar/Sidebar";
import HeaderBar from "../molecules/header/HeaderBar";
import "../css/MainLayout.css";

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <HeaderBar />
        <div className="page-content">{children}</div>
      </div>
    </div>
  );
};

export default MainLayout;
