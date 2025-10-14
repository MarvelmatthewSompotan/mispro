import React from "react";
import "../styles/Controls.css";
import sortIcon from "../../assets/sort.png";

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
      <img
        src={sortIcon}
        alt="Sort Icon"
        width="24"
        height="24"
      />
    </button>
  );
};

export default SortButton;