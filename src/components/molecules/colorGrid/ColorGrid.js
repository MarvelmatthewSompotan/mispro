import React from "react";
import "../../css/ColorGrid.css";

const colors = [
  "#FFD6D6", // pink
  "#FFF2C6", // yellow
  "#D6D6FF", // purple
  "#D6FFD6", // green
];

const ColorGrid = () => (
  <div className="color-grid-card">
    <div className="color-grid">
      {colors.map((color, idx) => (
        <div
          className="color-grid-item"
          style={{ background: color }}
          key={idx}
        />
      ))}
    </div>
  </div>
);

export default ColorGrid;
