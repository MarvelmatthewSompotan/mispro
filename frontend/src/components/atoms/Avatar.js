import React from 'react';
import '../styles/Avatar.css';

const Avatar = ({ src, alt, size = 40, style, className }) => (
  <img
    src={src}
    alt={alt}
    className={`atom-avatar${className ? ' ' + className : ''}`}
    style={{ width: size, height: size, ...style }}
  />
);

export default Avatar; 