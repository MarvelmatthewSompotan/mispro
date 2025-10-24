import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderBar from "../molecules/HeaderBar";
import SidebarMenu from "../molecules/SidebarMenu";
import styles from "./Main.module.css";

const Main = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const isProfilePage = /^\/students\/.+/.test(location.pathname);
  const isRegistrationFormPage = /^\/registration-form(\/|$)/.test(
    location.pathname
  );
  const isDetailLikePage = isProfilePage || isRegistrationFormPage;
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const handleBackClick = () => {
    if (isRegistrationFormPage) {
      navigate("/registration");
    } else if (isProfilePage) {
      navigate("/students");
    } else {
      navigate(-1);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      if (isDetailLikePage) {
        setSidebarOpen(false);
      } else {
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [isDetailLikePage, location.pathname]);

  return (
    <div className={styles.layoutContainer}>
      <HeaderBar
        onHamburgerClick={handleSidebarToggle}
        onBackClick={handleBackClick}
        showBackButton={isDetailLikePage}
      />

      <div className={styles.contentWrapper}>
        <SidebarMenu isOpen={isSidebarOpen} />
        <main
          className={`${styles.mainContent} ${
            isSidebarOpen ? styles.sidebarOpen : styles.sidebarClosed
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Main;
