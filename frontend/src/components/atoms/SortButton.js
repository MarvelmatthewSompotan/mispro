import React from "react";
import "../styles/Controls.css";

const SortButton = ({ disabled = false, direction = "none", onClick, title = "Sort" }) => {
  return (
    <button
      type="button"
      className={`control-btn ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      aria-label={title}
      title={title}
      disabled={disabled} // Tambahkan atribut disabled
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={direction === "down" ? 0.25 : 1}/>
        <path d="M16 17l-4 4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity={direction === "up" ? 0.25 : 1}/>
      </svg>
    </button>
  );
};

export default SortButton;