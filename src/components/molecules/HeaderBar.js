import React from "react";
import logo from "../../assets/logo-mis-f.png";
import "../styles/HeaderBar.css";

const HeaderBar = ({ onHamburgerClick, onToggleTheme, theme }) => (
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
      <div className="header-bar-avatar">
        <span role="img" aria-label="profile">
          🧑‍🎓
        </span>
      </div>
    </div>
  </header>
);

export default HeaderBar;
