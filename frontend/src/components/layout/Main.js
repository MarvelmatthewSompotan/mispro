// src/components/layout/Main.js

import React, { useState, useEffect } from "react";
// [BARU] Impor hooks dari react-router-dom
import { useLocation, useNavigate } from "react-router-dom";
import HeaderBar from "../molecules/HeaderBar"; // Sesuaikan path jika perlu
import SidebarMenu from "../molecules/SidebarMenu"; // Sesuaikan path jika perlu
import styles from "./Main.module.css"; // Pastikan nama file CSS sesuai

const Main = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);

  // [BARU] Dapatkan lokasi dan fungsi navigasi
  const location = useLocation();
  const navigate = useNavigate();

  // [BARU] Cek apakah kita di halaman profile.
  // Regex ini berarti "/students/" HARUS diikuti oleh karakter lain (seperti ID)
  // Ini akan 'true' untuk /students/12345, tapi 'false' untuk /students
  const isProfilePage = /^\/students\/.+/.test(location.pathname);

  // Fungsi toggle sidebar (untuk hamburger)
  const handleSidebarToggle = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // [BARU] Fungsi untuk tombol back
  const handleBackClick = () => {
    navigate("/students"); // Kembali ke halaman student list
  };

  // [DIUBAH] Logika untuk resize dan deteksi rute digabungkan di sini
  useEffect(() => {
    const handleResize = () => {
      // [LOGIKA BARU] Prioritas #1: Jika di halaman profil, sidebar SELALU tertutup
      if (isProfilePage) {
        setSidebarOpen(false);
      } else {
        // [LOGIKA LAMA] Jika tidak, ikuti aturan ukuran layar
        if (window.innerWidth < 1024) {
          setSidebarOpen(false);
        } else {
          setSidebarOpen(true);
        }
      }
    };

    handleResize(); // Panggil saat komponen dimuat DAN saat rute berubah

    // Tambahkan listener
    window.addEventListener("resize", handleResize);

    // Hapus listener saat komponen dibongkar
    return () => window.removeEventListener("resize", handleResize);

    // [DIUBAH] Efek ini sekarang juga bergantung pada 'isProfilePage'
    // Ini memastikan logika berjalan setiap kali Anda pindah halaman
  }, [isProfilePage, location.pathname]);

  return (
    <div className={styles.layoutContainer}>
      <HeaderBar
        onHamburgerClick={handleSidebarToggle}
        showBackButton={isProfilePage}
        onBackClick={handleBackClick}
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
