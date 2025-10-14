import React from "react";
import "../styles/Controls.css";
import filterIcon from "../../assets/filter.svg";

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
      <img src={filterIcon} alt="Filter Icon" width="24" height="24" />
    </button>
  );
};

export default FilterButton;
