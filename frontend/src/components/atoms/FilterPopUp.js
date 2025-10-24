// FilterPopUp.js (Diperbarui)
import React, { useState, useEffect, useRef } from 'react';
import styles from './FilterPopUp.module.css';

// Hook kustom (tidak berubah)
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

const FilterPopup = ({
  options = [],
  valueKey,
  labelKey,
  onSubmit,
  onClose,
  filterType = 'checkbox', // <-- PROP BARU: defaultnya 'checkbox'
  filterKey,
  className = '',
  initialValue,
}) => {
  const popupRef = useRef(null);
  // State untuk checkbox
  const [selected, setSelected] = useState(() => {
    // Untuk Checkbox: initialValue harus berupa array
    return filterType === 'checkbox' && Array.isArray(initialValue)
      ? initialValue
      : [];
  });
  const [searchTerm, setSearchTerm] = useState(() => {
    // Untuk Search: initialValue harus berupa string
    return filterType === 'search' && typeof initialValue === 'string'
      ? initialValue
      : '';
  });
  const [startDate, setStartDate] = useState(() => {
    // Untuk Date Range: initialValue adalah array [start, end]
    return filterType === 'date-range' && Array.isArray(initialValue)
      ? initialValue[0] || ''
      : '';
  });
  const [endDate, setEndDate] = useState(() => {
    return filterType === 'date-range' && Array.isArray(initialValue)
      ? initialValue[1] || ''
      : '';
  });
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
    if (filterType === 'checkbox') {
      onSubmit(selected); // Kirim array (cth: [13, 10])
    } else if (filterType === 'search') {
      onSubmit(searchTerm); // Kirim string
    } else if (filterType === 'date-range') {
      // Kirim array [startDate, endDate]
      onSubmit([startDate, endDate]);
    }
    onClose(); // Tutup popup
  };
  // ----------------------------------------

  const handleResetClick = () => {
    if (filterType === 'checkbox') {
      setSelected([]);
      onSubmit([]);
    } else if (filterType === 'search') {
      setSearchTerm('');
      onSubmit('');
    } else if (filterType === 'date-range') {
      setStartDate('');
      setEndDate('');
      onSubmit(['', '']);
    }
    // Tidak langsung menutup pop-up, beri kesempatan user untuk apply ulang
  };

  const getSearchPlaceholder = () => {
    if (filterKey === 'search_id') {
      return 'Enter Registration ID...';
    }
    if (filterKey === 'search_name') {
      return 'Enter Student name...';
    }
    // Placeholder default untuk search bar atas
    return 'Enter ID or Name...';
  };

  return (
    <div className={`${styles.popupContainer} ${className}`} ref={popupRef}>
      <div className={styles.popupHeader}>
        <span>Filter by</span>
        <button onClick={onClose} className={styles.closeBtn}>
          &times;
        </button>
      </div>

      {/* --- Bagian Body (DIMODIFIKASI) --- */}
      <div className={styles.popupBody}>
        {filterType === 'date-range' ? ( // <-- LOGIKA BARU: Date Range
          <div className={styles.dateRangePopupBody}>
            <label className={styles.dateLabel}>Start Date</label>
            <input
              type='date'
              className={styles.dateInput} // Asumsi styles.dateInput ada/dibuat
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <label className={styles.dateLabel} style={{ marginTop: '10px' }}>
              End Date
            </label>
            <input
              type='date'
              className={styles.dateInput} // Asumsi styles.dateInput ada/dibuat
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        ) : filterType === 'search' ? ( // <-- LOGIKA LAMA: Search Input
          <div className={styles.searchPopupBody}>
            <input
              type='text'
              className={styles.searchInputPopup}
              placeholder={getSearchPlaceholder()}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
        ) : // <-- LOGIKA LAMA: Checkbox
        // Mode Checkbox (Logika lama, disarankan: ganti ke array 'options' yang di-map)
        options.length > 0 ? (
          options.map((opt) => {
            const value = opt[valueKey];
            const label = opt[labelKey];
            return (
              <label key={value} className={styles.checkboxLabel}>
                <input
                  type='checkbox'
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
      {/* ---------------------------------- */}

      <div className={styles.popupFooter}>
        <button onClick={handleResetClick} className={styles.resetBtn}>
          Reset
        </button>
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
