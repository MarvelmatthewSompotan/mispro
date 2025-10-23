// src/components/molecules/HeaderBar.js

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "../../services/api";
import logo from "../../assets/logo-mis-f.png";
import backIcon from "../../assets/back.svg"; // <-- GANTI JIKA PERLU
import "../styles/HeaderBar.css"; // Sesuaikan path jika perlu

// [DIUBAH] Terima prop baru: showBackButton dan onBackClick
const HeaderBar = ({ onHamburgerClick, showBackButton, onBackClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="header-bar">
      <div className="header-bar-left">
        {/* [BARU] Logika kondisional untuk tombol back/hamburger */}
        {showBackButton ? (
          // Jika showBackButton true, tampilkan tombol back
          <button
            className="header-bar-back-button" // Class CSS baru
            aria-label="Go back"
            onClick={onBackClick}
          >
            <img src={backIcon} alt="Back" className="header-bar-back-icon" />
          </button>
        ) : (
          // Jika false, tampilkan hamburger menu seperti biasa
          <button
            className="header-bar-hamburger"
            aria-label="Open menu"
            onClick={onHamburgerClick}
          >
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </button>
        )}
        <img src={logo} alt="MIS Logo" className="header-bar-logo" />
      </div>

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
