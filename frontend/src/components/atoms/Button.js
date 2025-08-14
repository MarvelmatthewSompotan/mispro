import React from 'react';
import '../styles/Button.css';

const Button = ({ children, onClick, style, className }) => (
  <button
    className={`atom-button${className ? ' ' + className : ''}`}
    style={style}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button; 