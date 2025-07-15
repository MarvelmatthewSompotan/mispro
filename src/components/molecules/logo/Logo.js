import React from "react";
import "../../../assets/image/MIS.png";
import "../../css/Logo.css";

const Logo = () => (
  <div className="logo-container">
    <img
      src={require("../../../assets/image/MIS.png")}
      alt="Manado Independent School"
      className="logo-img"
    />
  </div>
);

export default Logo;
