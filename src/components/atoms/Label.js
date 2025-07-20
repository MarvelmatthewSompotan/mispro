import React from 'react';

const Label = ({ children, htmlFor, style, className }) => (
  <label 
    htmlFor={htmlFor} 
    style={style} 
    className={`atom-label${className ? ' ' + className : ''}`}
  >
    {children}
  </label>
);

export default Label; 