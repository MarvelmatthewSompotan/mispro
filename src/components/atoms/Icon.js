import React from 'react';
import '../styles/Icon.css';

const Icon = ({ src, alt, style, className }) => (
  <img
    src={src}
    alt={alt}
    className={`atom-icon${className ? ' ' + className : ''}`}
    style={style}
  />
);

export default Icon; 