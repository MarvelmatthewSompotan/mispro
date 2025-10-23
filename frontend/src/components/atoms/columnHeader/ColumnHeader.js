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
  disableSort = false,
  disableFilter = false,
}) => {
  // --- STATE BARU untuk mengontrol popup ---
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  // ----------------------------------------

  const showActions = hasSort || hasFilter;

  // Handler untuk SortButton (tetap sama)
  const handleSortClick = () => {
    if (disableSort) return; // blok jika disabled
    if (onSort) {
      onSort(fieldKey);
    }
  };

  // Handler untuk FilterButton (sekarang BUKA/TUTUP popup)
  const handleFilterToggle = () => {
    if (disableFilter) return; // blok jika disabled
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
        {hasSort && (
          <div
            className={`${styles.control} ${
              disableSort ? styles.isDisabled : ""
            }`}
            title={disableSort ? "Sort disabled" : undefined}
          >
            <SortButton
              direction={sortOrder || "none"}
              onClick={handleSortClick}
            />
          </div>
        )}

        {/* FilterButton sekarang membuka popup */}
        {hasFilter && (
          <div
            className={`${styles.control} ${
              disableFilter ? styles.isDisabled : ""
            }`}
            title={disableFilter ? "Filter disabled" : undefined}
          >
            <FilterButton
              onClick={handleFilterToggle}
              isActive={isFilterOpen}
            />
          </div>
        )}

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
