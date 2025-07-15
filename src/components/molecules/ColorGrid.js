import React from 'react';
import Card from '../atoms/Card';
import './ColorGrid.css';

const colors = ['#fddede', '#fdf3d6', '#e2f7e1', '#e3e2fd'];

const ColorGrid = () => (
  <div className="color-grid">
    {colors.map((color, idx) => (
      <Card key={idx} className="color-grid-item" style={{ background: color, minHeight: 80 }} />
    ))}
  </div>
);

export default ColorGrid; 