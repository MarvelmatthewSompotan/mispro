/*
 * ColumnHeader.js (DIUPDATE DENGAN LOGIKA POPUP)
 */
import React, { useState } from "react"; // Import useState
import styles from "./ColumnHeader.module.css";
import SortButton from "../SortButton";
import FilterButton from "../FilterButton"; // Ini adalah FilterButton.js Anda
import FilterPopup from "../FilterPopUp"; // Import popup yang baru dibuat

const ColumnHeader = ({
  title,
  hasSort = false,
  hasFilter = false,

  // --- Props dari StudentList ---
  fieldKey,
  filterKey,
  sortOrder,
  onSort,
  onFilterChange,
  filterOptions = [],
  valueKey,
  labelKey,
  filterType,
}) => {
  // --- STATE BARU untuk mengontrol popup ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // ----------------------------------------

  const showActions = hasSort || hasFilter;

  // Handler untuk SortButton (tetap sama)
  const handleSortClick = () => {
    if (onSort) {
      onSort(fieldKey);
    }
  };

  // Handler untuk FilterButton (sekarang BUKA/TUTUP popup)
  const handleFilterToggle = () => {
    setIsFilterOpen((prev) => !prev);
  };

  // Handler saat popup mengirim data (dari tombol "Apply")
  const handleFilterSubmit = (selectedValues) => {
    if (onFilterChange) {
      onFilterChange(filterKey, selectedValues);
    }
    // Kita tidak tutup popup di sini, popup akan tutup sendiri
  };

  return (
    // 'columnController' perlu 'position: relative'
    <div className={styles.columnController}>
      <div className={styles.columnName}>
        <div className={styles.loremIpsum}>{title}</div>
      </div>

      <div
        className={`${styles.action} ${
          !showActions ? styles.disabledAction : ""
        }`}
      >
        {hasSort && <SortButton order={sortOrder} onClick={handleSortClick} />}

        {/* FilterButton sekarang membuka popup */}
        {hasFilter && <FilterButton onClick={handleFilterToggle} />}

        {/* Render Popup secara kondisional */}
        {hasFilter && isFilterOpen && (
          <FilterPopup
            options={filterOptions}
            valueKey={valueKey}
            labelKey={labelKey}
            onSubmit={handleFilterSubmit}
            onClose={() => setIsFilterOpen(false)}
            filterType={filterType}
          />
        )}
      </div>
    </div>
  );
};

export default ColumnHeader;
