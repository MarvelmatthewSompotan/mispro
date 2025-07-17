import React from "react";
import "../../css/Checkbox.css";

const Checkbox = ({ checked, onChange, name, label }) => (
  <label className="atom-checkbox">
    <input type="checkbox" checked={checked} onChange={onChange} name={name} />
    {label && <span className="checkbox-label">{label}</span>}
  </label>
);

export default Checkbox;
