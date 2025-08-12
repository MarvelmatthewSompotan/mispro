import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo-mis-f.png";
import "../styles/HeaderBar.css";
import { useAuth } from "../../contexts/AuthContext";

const HeaderBar = ({ onHamburgerClick, onToggleTheme, theme }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

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
      <div className="header-bar-right">
        <button
          onClick={onToggleTheme}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "1.2rem",
            marginRight: "16px",
          }}
          aria-label="Toggle dark mode"
          title="Toggle dark mode"
        >
          {theme === "dark" ? "🌙" : "☀️"}
        </button>
        <div className="header-bar-user-section">
          <div className="header-bar-avatar" onClick={toggleUserMenu}>
            <span role="img" aria-label="profile">
              🧑‍🎓
            </span>
          </div>
          {showUserMenu && (
            <div className="user-menu">
              <div className="user-info">
                <div className="user-name">{user?.name || "User"}</div>
                <div className="user-email">
                  {user?.email || "user@example.com"}
                </div>
                <div className="user-role">{user?.role || "User"}</div>
              </div>
              <div className="user-menu-divider"></div>
              <button className="logout-button" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
