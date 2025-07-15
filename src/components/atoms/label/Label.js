import React from "react";
import "../../css/Label.css";

const Label = ({ children, htmlFor }) => (
  <label className="atom-label" htmlFor={htmlFor}>
    {children}
  </label>
);

export default Label;
