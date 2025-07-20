import React from "react";
import "../../styles/Input.css";

const Input = ({ type = "text", placeholder, value, onChange, name }) => (
  <input
    className="atom-input registration-input"
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    name={name}
    autoComplete="off"
  />
);

export default Input;
