// src/components/styles/HeaderBar.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/api"; // Pastikan path ini benar
import logo from "../../assets/logo-mis-f.png";
import "../styles/HeaderBar.css";

const HeaderBar = ({ onHamburgerClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  // Fungsi untuk menangani logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Efek untuk menutup dropdown saat klik di luar area
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    // Tambahkan event listener saat komponen dimuat
    document.addEventListener("mousedown", handleClickOutside);
    // Hapus event listener saat komponen dibongkar
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header-bar">
      <div className="header-bar-left">
        <button
          className="header-bar-hamburger"
          aria-label="Open menu"
          onClick={onHamburgerClick}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
        <img src={logo} alt="MIS Logo" className="header-bar-logo" />
      </div>

      {/* Gunakan ref di sini untuk mendeteksi klik di luar */}
      <div className="header-bar-right" ref={dropdownRef}>
        <button
          className="header-bar-avatar-button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <div className="header-bar-avatar">
            <span role="img" aria-label="profile">
              🧑‍🎓
            </span>
          </div>
        </button>

        {/* Tampilkan dropdown jika isDropdownOpen bernilai true */}
        {isDropdownOpen && (
          <div className="profile-dropdown">
            <button onClick={handleLogout} className="logout-button">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default HeaderBar;
