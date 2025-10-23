// SortButton.js
import React from "react";
import "../styles/Controls.css";
import sortIcon from "../../assets/sort.svg";
import kananIcon from "../../assets/kanan.svg";
import kiriIcon from "../../assets/kiri.svg";
import "./SortButton.css";

/**
 * direction:
 *  - "none" → icon sort.svg (default)
 *  - "asc"  → icon kiri.svg (A→Z, kecil→besar)
 *  - "desc" → icon kanan.svg (Z→A, besar→kecil)
 */
const SortButton = ({
  disabled = false,
  direction = "none",
  onClick,
  title = "Sort",
}) => {
  let iconSrc = sortIcon; // default (none)
  if (direction === "asc") iconSrc = kiriIcon;
  else if (direction === "desc") iconSrc = kananIcon;

  return (
    <button
      type="button"
      className={`control-btn ${disabled ? "disabled" : ""}`}
      onClick={disabled ? undefined : onClick}
      aria-label={title}
      title={title}
      disabled={disabled}
    >
      <img
        src={iconSrc}
        alt={`Sort ${direction}`}
        width="20"
        height="20"
        className={`sort-icon ${direction}`}
      />
    </button>
  );
};

export default SortButton;
