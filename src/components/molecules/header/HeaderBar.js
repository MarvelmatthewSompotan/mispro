import React from "react";
import logo from "../../../assets/image/MIS.png";
import "../../css/HeaderBar.css";

const HeaderBar = ({ sidebarOpen, onHamburgerClick }) => (
  <header className="header-bar">
    <div className="header-bar-left">
      <button
        className="header-bar-hamburger"
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        onClick={onHamburgerClick}
      >
        {sidebarOpen ? (
          <span style={{ fontSize: "2rem", lineHeight: 1 }}>&times;</span>
        ) : (
          <>
            <span className="hamburger-line" />
            <span className="hamburger-line" />
            <span className="hamburger-line" />
          </>
        )}
      </button>
      <img src={logo} alt="MIS Logo" className="header-bar-logo" />
    </div>
    <div className="header-bar-right">
      <div className="header-bar-avatar">
        <span role="img" aria-label="profile">
          🧑‍🎓
        </span>
      </div>
    </div>
  </header>
);

export default HeaderBar;
