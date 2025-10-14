import React from "react";
import styles from "./ExportLogbookPopup.module.css";
import Button from "../../../atoms/Button"; // Pastikan path import ini sesuai

const ExportLogbookPopup = ({
  isOpen,
  onClose,
  onDownload,
  columns,
  selectedColumns,
  data,
  headerKeyMap,
}) => {
  if (!isOpen) {
    return null;
  }

  // Filter kolom yang akan ditampilkan berdasarkan yang dipilih (selectedColumns)
  // dan pertahankan urutan dari 'columns'
  const visibleColumns = columns.filter((header) =>
    selectedColumns.has(header)
  );

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContainer}>
        <header className={styles.popupHeader}>
          <h2>Export Student Logbook</h2>
        </header>

        <div className={styles.popupContent}>
          <div className={styles.tableWrapper}>
            <table className={styles.popupTable}>
              <thead>
                <tr>
                  <th>No.</th>
                  {visibleColumns.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item, index) => (
                  <tr key={item.student_id}>
                    <td>{index + 1}</td>
                    {visibleColumns.map((header) => {
                      const dataKey = headerKeyMap[header];
                      if (header === "Photo") {
                        return (
                          <td key={dataKey} className={styles.photoCell}>
                            <img
                              src={item[dataKey]}
                              alt={item.full_name}
                              className={styles.studentPhoto}
                            />
                          </td>
                        );
                      }
                      return <td key={dataKey}>{item[dataKey] || "-"}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <footer className={styles.popupActions}>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="solid" onClick={onDownload}>
            Download PDF
          </Button>
        </footer>
      </div>
    </div>
  );
};

export default ExportLogbookPopup;
