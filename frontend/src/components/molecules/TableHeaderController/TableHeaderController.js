import React from "react";
import styles from "./TableHeaderController.module.css";
import Checkbox from "../../atoms/checkbox/Checkbox";
import SortButton from "../../atoms/SortButton";
import FilterButton from "../../atoms/FilterButton";
import DragHandle from "../../atoms/DragHandle";

// Terima props baru dari dnd-kit
const TableHeaderController = React.forwardRef(({
  title,
  isChecked,
  onChange,
  controlsDisabled = false,
  showCheckbox = true,
  style,
  listeners, // Props untuk drag handle
  ...props      // Props lain seperti 'attributes'
}, ref) => {
  return (
    // Terapkan ref, style, dan props lainnya ke <th>
    <th className={styles.tableHeaderController} ref={ref} style={style} {...props}>
      <div className={styles.headerLayout}>
        {/* Teruskan listeners ke komponen DragHandle */}
        <DragHandle listeners={listeners} />
        <div className={styles.headerContent}>
          <div className={styles.headerActions}>
            {showCheckbox && <Checkbox checked={isChecked} onChange={onChange} />}
            <>
              <SortButton disabled={controlsDisabled} />
              <FilterButton disabled={controlsDisabled} />
            </>
          </div>
          <span className={styles.headerTitle}>{title}</span>
        </div>
      </div>
    </th>
  );
});

export default TableHeaderController;