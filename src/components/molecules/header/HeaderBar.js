import React from "react";
import logo from "../../../assets/image/MIS.png";
import "../../css/HeaderBar.css";

const HeaderBar = () => (
  <header className="header-bar">
    <div className="header-bar-left">
      <button className="header-bar-hamburger" aria-label="Open menu">
        <span className="hamburger-line" />
        <span className="hamburger-line" />
        <span className="hamburger-line" />
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
