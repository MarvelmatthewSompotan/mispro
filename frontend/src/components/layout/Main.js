import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderBar from "../molecules/HeaderBar";
import SidebarMenu from "../molecules/SidebarMenu";
import styles from "./Main.module.css";

// [MODIFIKASI 1] Terima props baru: showBackButton, onBackClick
const Main = ({
  children,
  showBackButton: showBackButtonProp,
  onBackClick: onBackClickProp,
}) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // --- Logika Internal (Sebagai Fallback) ---
  const isProfilePage = /^\/students\/.+/.test(location.pathname);
  const isRegistrationFormPage = /^\/registration-form(\/|$)/.test(
    location.pathname
  );
  // Logika internal untuk menentukan apakah tombol back harus muncul
  const isDetailLikePageInternal = isProfilePage || isRegistrationFormPage;

  // Handler back click internal (sebagai fallback)
  const internalHandleBackClick = () => {
    if (isRegistrationFormPage) {
      navigate("/registration");
    } else if (isProfilePage) {
      navigate("/students");
    } else {
      navigate(-1);
    }
  };
  // --- Akhir Logika Internal ---

  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  useEffect(() => {
    const handleResize = () => {
      // Gunakan 'isDetailLikePageInternal' untuk logika resize
      if (isDetailLikePageInternal) {
        setSidebarOpen(false);
        return;
      }
      if (window.innerWidth >= 1024) {
        setSidebarOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isDetailLikePageInternal, location.pathname]);

  // [MODIFIKASI 2] Tentukan nilai final yang akan dikirim ke HeaderBar
  // Gunakan prop 'onBackClick' jika ada, jika tidak, gunakan handler internal
  const finalOnBackClick = onBackClickProp || internalHandleBackClick;

  // Gunakan prop 'showBackButton' jika ada (bahkan jika nilainya 'false'),
  // jika tidak (undefined), gunakan logika internal
  const finalShowBackButton =
    showBackButtonProp !== undefined
      ? showBackButtonProp
      : isDetailLikePageInternal;

  return (
    <div className={styles.layoutContainer}>
      {/* [MODIFIKASI 3] Kirim props final ke HeaderBar */}
      <HeaderBar
        onHamburgerClick={handleSidebarToggle}
        onBackClick={finalOnBackClick}
        showBackButton={finalShowBackButton}
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

