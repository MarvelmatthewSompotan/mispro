import React from "react";
import "./RadioButton.css";

const RadioButton = ({ name, value, checked, onChange }) => (
  <label className="atom-radio-button">
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
    />
    <span className="custom-radio"></span>
  </label>
);

export default RadioButton;