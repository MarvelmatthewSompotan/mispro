import React from "react";
import "../styles/Controls.css";

const FilterButton = ({ disabled = false, onClick, title = "Filter" }) => {
  return (
    <button
      type="button"
      className={`control-btn ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      aria-label={title}
      title={title}
      disabled={disabled} // Tambahkan atribut disabled
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M3 4h18l-7 8v6l-4 2v-8L3 4z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

export default FilterButton;
