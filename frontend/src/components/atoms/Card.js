import React from 'react';
import '../styles/Card.css';

const Card = ({ children, style, className }) => (
  <div
    className={`atom-card${className ? ' ' + className : ''}`}
    style={style}
  >
    {children}
  </div>
);

export default Card; 