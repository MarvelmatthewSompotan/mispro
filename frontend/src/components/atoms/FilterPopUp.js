// FilterPopUp.js (Diperbarui)
import React, { useState, useEffect, useRef } from "react";
import styles from "./FilterPopUp.module.css";

// Hook kustom (tidak berubah)
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

const FilterPopup = ({
  options = [],
  valueKey,
  labelKey,
  onSubmit,
  onClose,
  filterType = "checkbox", // <-- PROP BARU: defaultnya 'checkbox'
}) => {
  const popupRef = useRef(null);
  // State untuk checkbox
  const [selected, setSelected] = useState([]);
  // --- STATE BARU ---
  // State untuk search input
  const [searchTerm, setSearchTerm] = useState("");
  // ------------------

  useClickOutside(popupRef, onClose);

  // Handler checkbox (tidak berubah)
  const handleToggle = (value) => {
    setSelected((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  // --- Handler Tombol Apply (DIMODIFIKASI) ---
  const handleApplyClick = () => {
    if (filterType === "checkbox") {
      onSubmit(selected); // Kirim array (cth: [13, 10])
    } else {
      onSubmit(searchTerm); // Kirim string (cth: "David")
    }
    onClose(); // Tutup popup
  };
  // ----------------------------------------

  return (
    <div className={styles.popupContainer} ref={popupRef}>
      <div className={styles.popupHeader}>
        <span>Filter by</span>
        <button onClick={onClose} className={styles.closeBtn}>
          &times;
        </button>
      </div>

      {/* --- Bagian Body (DIMODIFIKASI) --- */}
      <div className={styles.popupBody}>
        {filterType === "checkbox" ? (
          // Mode Checkbox (Logika lama)
          options.length > 0 ? (
            options.map((opt) => {
              const value = opt[valueKey];
              const label = opt[labelKey];
              return (
                <label key={value} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={selected.includes(value)}
                    onChange={() => handleToggle(value)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.customCheckbox}></span>
                  {label}
                </label>
              );
            })
          ) : (
            <div className={styles.noOptions}>No options available</div>
          )
        ) : (
          // Mode Search (Logika baru)
          <div className={styles.searchPopupBody}>
            <input
              type="text"
              className={styles.searchInputPopup}
              placeholder="Enter name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>
      {/* ---------------------------------- */}

      <div className={styles.popupFooter}>
        <button onClick={onClose} className={styles.actionBtn}>
          Cancel
        </button>
        <button onClick={handleApplyClick} className={styles.applyBtn}>
          Apply
        </button>
      </div>
    </div>
  );
};

export default FilterPopup;
