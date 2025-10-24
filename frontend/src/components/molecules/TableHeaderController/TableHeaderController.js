import React from "react";
import styles from "./TableHeaderController.module.css";
import Checkbox from "../../atoms/checkbox/Checkbox";
import SortButton from "../../atoms/SortButton";
import FilterButton from "../../atoms/FilterButton";
import DragHandle from "../../atoms/DragHandle";

// Terima props baru dari dnd-kit
const TableHeaderController = React.forwardRef(
  (
    {
      title,
      isChecked,
      onChange,
      controlsDisabled = false,
      showCheckbox = true,
      style,
      listeners,
      sortDirection = "none",
      onSortClick,
      isFilterActive = false,
      isFilterApplied = false,
      onFilterClick,
      showFilterPopup = false,
      filterPopupNode = null,
      ...props // Props lain seperti 'attributes'
    },
    ref
  ) => {
    return (
      // Terapkan ref, style, dan props lainnya ke <th>
      <th
        className={styles.tableHeaderController}
        ref={ref}
        style={style}
        {...props}
      >
        <div className={styles.headerLayout}>
          {/* Teruskan listeners ke komponen DragHandle */}
          <DragHandle listeners={listeners} />
          <div className={styles.headerContent}>
            <div className={styles.headerActions}>
              {showCheckbox && (
                <Checkbox checked={isChecked} onChange={onChange} />
              )}
              <>
                <SortButton
                  disabled={controlsDisabled}
                  direction={sortDirection} // NEW
                  onClick={onSortClick} // NEW
                />
                <FilterButton
                  disabled={controlsDisabled}
                  onClick={onFilterClick} // NEW
                  isActive={isFilterActive} // NEW (ganti icon saat popup terbuka)
                  isApplied={isFilterApplied} // NEW (ganti icon saat filter tersimpan)
                />
              </>
            </div>
            <span className={styles.headerTitle}>{title}</span>
          </div>
        </div>
        {showFilterPopup && filterPopupNode}
      </th>
    );
  }
);

export default TableHeaderController;
