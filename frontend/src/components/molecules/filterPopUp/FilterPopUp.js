// src/components/molecules/filterPopUp/FilterPopUp.js (Diperbarui)
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
  filterType = "checkbox",
  filterKey,
  className = "",
  initialValue,
  singleSelect = false, // <-- PROP BARU untuk School Year
}) => {
  const popupRef = useRef(null);

  // State untuk checkbox
  const [selected, setSelected] = useState(() => {
    return filterType === "checkbox" && Array.isArray(initialValue)
      ? initialValue
      : [];
  });

  // State untuk search
  const [searchTerm, setSearchTerm] = useState(() => {
    return filterType === "search" && typeof initialValue === "string"
      ? initialValue
      : "";
  });

  // State untuk date range
  const [startDate, setStartDate] = useState(() => {
    return filterType === "date-range" && Array.isArray(initialValue)
      ? initialValue[0] || ""
      : "";
  });
  const [endDate, setEndDate] = useState(() => {
    return filterType === "date-range" && Array.isArray(initialValue)
      ? initialValue[1] || ""
      : "";
  });

  // --- STATE BARU untuk Number Range (Age) ---
  const [minVal, setMinVal] = useState(() => {
    return filterType === "number-range" && Array.isArray(initialValue)
      ? initialValue[0] || ""
      : "";
  });
  const [maxVal, setMaxVal] = useState(() => {
    return filterType === "number-range" && Array.isArray(initialValue)
      ? initialValue[1] || ""
      : "";
  });
  // ----------------------------------------

  useClickOutside(popupRef, onClose);

  // Handler checkbox (DIMODIFIKASI untuk singleSelect)
  const handleToggle = (value) => {
    if (singleSelect) {
      // Jika single select, cek apakah sudah terpilih
      // Jika ya, batalkan (set jadi array kosong)
      // Jika belum, set jadi array berisi value itu saja
      setSelected((prev) => (prev.includes(value) ? [] : [value]));
    } else {
      // Logika multi-select (tetap sama)
      setSelected((prev) =>
        prev.includes(value)
          ? prev.filter((v) => v !== value)
          : [...prev, value]
      );
    }
  };

  // Handler Tombol Apply (DIMODIFIKASI)
  const handleApplyClick = () => {
    if (filterType === "checkbox") {
      onSubmit(selected);
    } else if (filterType === "search") {
      onSubmit(searchTerm);
    } else if (filterType === "date-range") {
      onSubmit([startDate, endDate]);
    } else if (filterType === "number-range") {
      // <-- LOGIKA BARU
      onSubmit([minVal, maxVal]);
    }
    onClose(); // Tutup popup
  };

  // Handler Tombol Reset (DIMODIFIKASI)
  const handleResetClick = () => {
    if (filterType === "checkbox") {
      setSelected([]);
      onSubmit([]);
    } else if (filterType === "search") {
      setSearchTerm("");
      onSubmit("");
    } else if (filterType === "date-range") {
      setStartDate("");
      setEndDate("");
      onSubmit(["", ""]);
    } else if (filterType === "number-range") {
      // <-- LOGIKA BARU
      setMinVal("");
      setMaxVal("");
      onSubmit(["", ""]);
    }
    // Tidak menutup popup
  };

  const getSearchPlaceholder = () => {
    // ... (logika placeholder Anda tetap sama)
    if (filterKey === "search_id") return "Enter Registration ID...";
    if (filterKey === "search_name") return "Enter Student name...";
    // Placeholder baru untuk Logbook
    if (filterKey === "search_family_rank") return "Enter rank number...";
    if (filterKey === "search_religion") return "Enter religion...";
    if (filterKey === "search_country") return "Enter country...";
    if (filterKey === "search_father") return "Enter father name...";
    if (filterKey === "search_mother") return "Enter mother name...";

    return "Enter text...";
  };

  return (
    <div className={`${styles.popupContainer} ${className}`} ref={popupRef}>
      <div className={styles.popupHeader}>
        <span>Filter by</span>
        <button onClick={onClose} className={styles.closeBtn}>
          &times;
        </button>
      </div>

      <div className={styles.popupBody}>
        {/* --- LOGIKA RENDER BODY DIMODIFIKASI --- */}

        {filterType === "date-range" ? (
          // 1. Date Range (Registation Date)
          <div className={styles.dateRangePopupBody}>
            <label className={styles.dateLabel}>Start Date</label>
            <input
              type="date"
              className={styles.dateInput}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className={styles.dateLabel} style={{ marginTop: "10px" }}>
              End Date
            </label>
            <input
              type="date"
              className={styles.dateInput}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        ) : filterType === "number-range" ? (
          // 2. Number Range (Age) <-- TAMPILAN BARU
          <div className={styles.dateRangePopupBody}>
            <label className={styles.dateLabel}>Min Age</label>
            <input
              type="number"
              placeholder="Min"
              className={styles.dateInput} // Pakai style yang sama dengan date input
              value={minVal}
              onChange={(e) => setMinVal(e.target.value)}
            />
            <label className={styles.dateLabel} style={{ marginTop: "10px" }}>
              Max Age
            </label>
            <input
              type="number"
              placeholder="Max"
              className={styles.dateInput}
              value={maxVal}
              onChange={(e) => setMaxVal(e.target.value)}
            />
          </div>
        ) : filterType === "search" ? (
          // 3. Search
          <div className={styles.searchPopupBody}>
            <input
              type="text"
              className={styles.searchInputPopup}
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        ) : // 4. Checkbox
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
        )}
      </div>

      <div className={styles.popupFooter}>
        <button onClick={handleResetClick} className={styles.resetBtn}>
          Reset
        </button>
        {/* --- Perubahan kecil: Grup tombol kanan --- */}
        <div className={styles.actionBtnGroup}>
          <button onClick={onClose} className={styles.actionBtn}>
            Cancel
          </button>
          <button onClick={handleApplyClick} className={styles.applyBtn}>
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPopup;

