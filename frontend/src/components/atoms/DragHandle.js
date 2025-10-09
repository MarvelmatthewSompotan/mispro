import React from "react";
import "../styles/Controls.css";

// Terima 'listeners' dari dnd-kit
const DragHandle = ({ listeners }) => (
  // Sebarkan 'listeners' ke button
  <button
    type="button"
    className="control-btn"
    aria-label="Drag to reorder column"
    {...listeners}
  >
    <svg
      width="12"
      height="18"
      viewBox="0 0 12 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="2.5" cy="2.5" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="9" r="2.5" fill="currentColor" />
      <circle cx="2.5" cy="15.5" r="2.5" fill="currentColor" />
      <circle cx="9.5" cy="2.5" r="2.5" fill="currentColor" />
      <circle cx="9.5" cy="9" r="2.5" fill="currentColor" />
      <circle cx="9.5" cy="15.5" r="2.5" fill="currentColor" />
    </svg>
  </button>
);

export default DragHandle;
