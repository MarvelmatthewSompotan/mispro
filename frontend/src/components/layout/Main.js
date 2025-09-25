// src/components/layout/Main.js

import React, { useState, useEffect } from "react";
import HeaderBar from "../molecules/HeaderBar"; // Sesuaikan path jika perlu
import SidebarMenu from "../molecules/SidebarMenu"; // Sesuaikan path jika perlu
import styles from "./Main.module.css"; // Pastikan nama file CSS sesuai

const Main = ({ children }) => {
  // State untuk sidebar sekarang terpusat di sini
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // Fungsi untuk toggle sidebar, akan dikirim ke HeaderBar
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Logika untuk mengatur sidebar berdasarkan ukuran layar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };
    handleResize(); // Panggil sekali saat komponen dimuat
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={styles.layoutContainer}>
      {/* HeaderBar menerima fungsi untuk toggle sidebar */}
      <HeaderBar onHamburgerClick={handleSidebarToggle} />

      <div className={styles.contentWrapper}>
        {/* Sidebar menerima statusnya dari Main.js */}
        <SidebarMenu isOpen={isSidebarOpen} />

        {/* Konten utama mendapat class dinamis berdasarkan status sidebar */}
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
