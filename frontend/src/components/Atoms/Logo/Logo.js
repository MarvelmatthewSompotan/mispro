import React from "react";
import logo from "../../../assets/logo-mis-f.png";
import "./Logo.css";

const Logo = () => (
  <div className="logo-container">
    <img
      src={logo}
      alt="Manado Independent School"
      className="logo-img"
    />
  </div>
);

export default Logo;
