import React from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./ExportLogbookPopup.module.css";

const ExportLogbookPopup = ({
  isOpen,
  onClose,
  columns,
  selectedColumns,
  logbookData,
}) => {
  if (!isOpen) return null;

  const HEADER_KEY_MAP = {
    Photo: "photo_url",
    "Student ID": "student_id",
    "Full Name": "full_name",
    Grade: "grade",
    Section: "section",
    "School Year": "school_year",
    Gender: "gender",
    "Registration Date": "registration_date",
    Transportation: "transportation",
    NISN: "nisn",
    "Family Rank": "family_rank",
    "Place DOB": "place_dob",
    Age: "age",
    Religion: "religion",
    Country: "country",
    Address: "address",
    Phone: "phone",
    "Father Name": "father_name",
    "Father Occupation": "father_occupation",
    "Father Phone": "father_phone",
    "Mother Name": "mother_name",
    "Mother Occupation": "mother_occupation",
    "Mother Phone": "mother_phone",
    NIK: "nik",
    KITAS: "kitas",
  };

  const selectedColumnsForPreview = columns.filter((column) =>
    selectedColumns.has(column)
  );

  const handleDownloadPDF = () => {
    // PERUBAHAN: Mendefinisikan warna dari global-vars.css
    const globalColors = {
      mainText: [0, 0, 0], // --main-text: #000000
      mainGrey: [0, 0, 0], // --main-grey: #7A7A7A
      secondaryBg: [255, 255, 255], // --secondary-background: #FFFFFF
    };

    const columnsForPDFTable = columns.filter(
      (column) => selectedColumns.has(column) && column !== "School Year"
    );

    const tableHeaders = ["No.", ...columnsForPDFTable];

    const tableData = logbookData.map((student, index) => {
      const row = [index + 1];
      columnsForPDFTable.forEach((column) => {
        if (column === "Photo") {
          row.push("");
        } else {
          const dataKey = HEADER_KEY_MAP[column];
          const cellData =
            student[dataKey] === null || student[dataKey] === undefined
              ? "-"
              : student[dataKey];
          row.push(cellData);
        }
      });
      return row;
    });

    const doc = new jsPDF("landscape", "mm", "a4");
    const margin = 7;

    const firstStudent = logbookData.length > 0 ? logbookData[0] : null;
    const schoolYear = firstStudent ? firstStudent.school_year : "N/A";
    const titleText = `Student Logbook (School Year: ${schoolYear})`;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(
      globalColors.mainText[0],
      globalColors.mainText[1],
      globalColors.mainText[2]
    );
    doc.text(titleText, margin, 15);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    const now = new Date();
    const createdDate = `Created: ${now
      .getDate()
      .toString()
      .padStart(2, "0")}/${(now.getMonth() + 1)
      .toString()
      .padStart(2, "0")}/${now.getFullYear()} ${now
      .getHours()
      .toString()
      .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}:${now
      .getSeconds()
      .toString()
      .padStart(2, "0")}`;
    doc.text(createdDate, margin, 22);

    // PERUBAHAN: Menggunakan warna global di autoTable
    autoTable(doc, {
      head: [tableHeaders],
      body: tableData,
      startY: 28,
      margin: { left: margin, right: margin },
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 4,
        cellPadding: 0.9,
        textColor: globalColors.mainText,
        lineColor: globalColors.mainGrey, // Menggunakan --main-grey
        lineWidth: 0.2,
        valign: "top",
      },
      headStyles: {
        fontSize: 4,
        fillColor: globalColors.secondaryBg,
        textColor: globalColors.mainText,
        halign: "left",
      },
      bodyStyles: {
        halign: "left",
      },
      didDrawPage: (data) => {
        const pageCount = doc.internal.getNumberOfPages();
        if (pageCount > 1) {
          doc.setFontSize(8);
          doc.text(
            `Page ${data.pageNumber} of ${pageCount}`,
            doc.internal.pageSize.width - margin,
            doc.internal.pageSize.height - 5,
            { align: "right" }
          );
        }
      },
    });

    const fileName = `Student_Logbook_${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    doc.save(fileName);
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2 className={styles.title}>Export Student Logbook</h2>
        </div>
        <div className={styles.content}>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.headerCell}>No.</th>
                  {selectedColumnsForPreview.map((column) => (
                    <th key={column} className={styles.headerCell}>
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {logbookData.map((student, index) => (
                  <tr key={student.student_id}>
                    <td className={styles.dataCell}>{index + 1}</td>
                    {selectedColumnsForPreview.map((column) => {
                      const dataKey = HEADER_KEY_MAP[column];
                      if (column === "Photo") {
                        return (
                          <td key={column} className={styles.photoCell}>
                            <img
                              src={student[dataKey]}
                              alt={student.full_name}
                              className={styles.studentPhoto}
                            />
                          </td>
                        );
                      }
                      return (
                        <td key={column} className={styles.dataCell}>
                          {student[dataKey] || "-"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles.footer}>
          <div className={styles.buttonGroup}>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
            <button
              className={styles.downloadButton}
              onClick={handleDownloadPDF}
            >
              Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportLogbookPopup;
