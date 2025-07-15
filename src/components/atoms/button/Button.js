import React from "react";
import "../../css/Button.css";

const Button = ({ children, onClick, type = "button", disabled }) => (
  <button
    className="atom-button"
    onClick={onClick}
    type={type}
    disabled={disabled}
  >
    {children}
  </button>
);

export default Button;
