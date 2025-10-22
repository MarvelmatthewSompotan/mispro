import React, { useState, useEffect, useRef } from "react";
import styles from "./FilterPopUp.module.css";

// Hook kustom untuk mendeteksi klik di luar popup
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
  valueKey, // Kunci untuk 'value' (cth: 'class_id')
  labelKey, // Kunci untuk 'label' (cth: 'grade')
  onSubmit, // Fungsi dari ColumnHeader (handleFilterSubmit)
  onClose, // Fungsi dari ColumnHeader (untuk menutup)
}) => {
  const popupRef = useRef(null);
  // State internal untuk melacak checkbox yang dicentang
  const [selected, setSelected] = useState([]);

  // Panggil 'onClose' saat klik di luar popup
  useClickOutside(popupRef, onClose);

  // Handler saat checkbox diubah
  const handleToggle = (value) => {
    setSelected((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  // Handler saat tombol 'Apply' diklik
  const handleApplyClick = () => {
    onSubmit(selected); // Kirim array berisi value (cth: [13, 10])
    onClose(); // Tutup popup
  };

  return (
    <div className={styles.popupContainer} ref={popupRef}>
      <div className={styles.popupHeader}>
        <span>Filter by</span>
        <button onClick={onClose} className={styles.closeBtn}>
          &times;
        </button>
      </div>
      <div className={styles.popupBody}>
        {options.length > 0 ? (
          options.map((opt) => {
            // Ambil value dan label secara dinamis
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
        )}
      </div>
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