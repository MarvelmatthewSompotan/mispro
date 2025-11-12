import React, { useState, useCallback } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import styles from "./ExportLogbookPopup.module.css";
import placeholder from "../../../../assets/user.svg";

const loadImage = (url) =>
  new Promise((resolve) => {
    if (!url || url === placeholder) {
      resolve(null);
      return;
    }
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        const dataURL = canvas.toDataURL("image/jpeg");
        resolve(dataURL);
      } catch (e) {
        console.error(
          "Gagal konversi canvas ke DataURL (mungkin Tainted Canvas / CORS):",
          url,
          e
        );
        resolve(null);
      }
    };
    img.onerror = (err) => {
      console.error("Gagal me-load gambar dari URL:", url, err);
      resolve(null);
    };
    try {
      img.src = url;
    } catch (e) {
      console.error("Error saat set img.src (URL tidak valid?):", url, e);
      resolve(null);
    }
  });

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
// ---------------------------------------------

const ExportLogbookPopup = ({
  isOpen,
  onClose,
  columns,
  selectedColumns,
  logbookData,
}) => {
  // --- STATE (HOOK) ---
  const [isDownloading, setIsDownloading] = useState(false);

  // --- Kalkulasi (sebelum hook) ---
  const selectedColumnsForPreview = columns.filter((column) =>
    selectedColumns.has(column)
  );
  const hasSelectedColumns = selectedColumnsForPreview.length > 0;

  // --- FUNGSI DOWNLOAD (HOOK) ---
  const handleDownloadPDF = useCallback(async () => {
    if (!hasSelectedColumns || isDownloading) return;

    setIsDownloading(true);

    try {
      // 1. Definisikan Warna
      const globalColors = {
        mainText: [0, 0, 0],
        mainGrey: [0, 0, 0],
        secondaryBg: [255, 255, 255],
      };

      // 2. Siapkan Kolom & Header
      const columnsForPDFTable = columns.filter(
        (column) => selectedColumns.has(column) && column !== "School Year"
      );
      const tableHeaders = ["No.", ...columnsForPDFTable];
      const photoColIndex = tableHeaders.indexOf("Photo");

      // 3. Load semua gambar (Ini tetap sama)
      const loadedImages = await Promise.all(
        logbookData.map((student) =>
          loadImage(student[HEADER_KEY_MAP["Photo"]])
        )
      );

      // 4. Siapkan Data Tabel (Ini tetap sama, 'null' untuk foto)
      const tableData = logbookData.map((student, index) => {
        const row = [index + 1];
        columnsForPDFTable.forEach((column) => {
          if (column === "Photo") {
            row.push(null);
          } else {
            const dataKey = HEADER_KEY_MAP[column];
            const cellData =
              student[dataKey] === null || student[dataKey] === undefined
                ? "-"
                : String(student[dataKey]);
            row.push(cellData);
          }
        });
        return row;
      });

      // 5. Inisialisasi Dokumen PDF
      const doc = new jsPDF("landscape", "mm", [210, 330]);
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

      // --- PERBAIKAN: Tentukan Semua Ukuran di Sini ---

      // 1. UBAH ANGKA INI UNTUK MENGUBAH UKURAN GAMBAR
      const fixedImgHeight = 12; // (Sebelumnya 5, sekarang 15mm)

      // 2. Definisikan aspect ratio & padding
      const aspectRatio = 59.97 / 81;
      const globalCellPadding = 2.5; // Sesuai 'styles.cellPadding'

      // 3. Hitung ukuran sel foto secara otomatis
      const fixedImgWidth = fixedImgHeight * aspectRatio; // Lebar gambar
      const photoCellWidth = fixedImgWidth + globalCellPadding * 2; // Lebar sel = lebar gambar + padding kiri/kanan
      const photoCellHeight = fixedImgHeight + globalCellPadding * 2; // Tinggi sel = tinggi gambar + padding atas/bawah

      // 6. Panggil autoTable
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 28,
        margin: { left: margin, right: margin },
        theme: "grid",
        rowPageBreak: "auto",
        styles: {
          font: "helvetica",
          fontSize: 4,
          cellPadding: globalCellPadding, // Gunakan variabel
          textColor: globalColors.mainText,
          lineColor: globalColors.mainGrey,
          lineWidth: 0.2,
          valign: "middle",
          minCellHeight: 1,
        },
        headStyles: {
          fontSize: 4,
          fillColor: globalColors.secondaryBg,
          textColor: globalColors.mainText,
          halign: "middle",
          minCellHeight: 7,
        },
        bodyStyles: {
          halign: "left",
        },
        columnStyles: {
          [photoColIndex]: {
            // Gunakan nilai yang sudah dihitung otomatis
            cellWidth: photoCellWidth,
            minCellHeight: photoCellHeight,
            halign: "center",
          },
        },

        willDrawCell: (data) => {
          if (
            photoColIndex !== -1 &&
            data.column.index === photoColIndex &&
            data.cell.section === "body"
          ) {
            data.cell.text = []; // Tetap kosongkan teks
          }
        },

        didDrawCell: (data) => {
          if (
            photoColIndex !== -1 &&
            data.column.index === photoColIndex &&
            data.cell.section === "body"
          ) {
            const cellHeight = data.cell.height;
            const cellWidth = data.cell.width;
            const imgData = loadedImages[data.row.index];

            if (imgData) {
              // Gunakan 'fixedImgHeight' dan 'fixedImgWidth'
              // yang kita definisikan di atas
              const imgHeight = fixedImgHeight;
              const imgWidth = fixedImgWidth;

              // Center gambar di dalam sel
              const x = data.cell.x + (cellWidth - imgWidth) / 2;
              const y = data.cell.y + (cellHeight - imgHeight) / 2;

              try {
                doc.addImage(imgData, "JPEG", x, y, imgWidth, imgHeight);
              } catch (e) {
                console.error("Gagal menambah gambar ke PDF:", e);
                doc.text(
                  "X",
                  data.cell.x + cellWidth / 2,
                  data.cell.y + cellHeight / 2,
                  { halign: "center", valign: "middle" }
                );
              }
            } else {
              // Gambar placeholder jika tidak ada imgData
              doc.text(
                "-",
                data.cell.x + cellWidth / 2,
                data.cell.y + cellHeight / 2,
                { halign: "center", valign: "middle" }
              );
            }
          }
        },
      });

      // --- Logika Nomor Halaman (Tetap sama, sudah benar) ---
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont("helvetica", "normal");
      doc.setFontSize(8);
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.text(
          `Page ${i} of ${pageCount}`,
          doc.internal.pageSize.width - margin,
          doc.internal.pageSize.height - 5,
          { align: "right" }
        );
      }
      // -----------------------------------------------------

      // 7. Simpan PDF
      const fileName = `Student_Logbook_${
        new Date().toISOString().split("T")[0]
      }.pdf`;
      doc.save(fileName);
    } catch (err) {
      console.error("Gagal membuat PDF:", err);
    } finally {
      setIsDownloading(false);
    }
  }, [
    columns,
    selectedColumns,
    logbookData,
    hasSelectedColumns,
    isDownloading,
  ]); // Dependensi hook

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h2 className={styles.title}>Export Student Logbook</h2>
        </div>

        <div className={styles.content}>
          {hasSelectedColumns ? (
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
                                src={student[dataKey] || placeholder}
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
          ) : (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                fontStyle: "italic",
                color: "#7a7a7a",
                minHeight: "200px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#f9f9f9",
                borderRadius: "8px",
              }}
            >
              Please select at least one column first to see the preview.
            </div>
          )}
        </div>

        <div className={styles.footer}>
          <div className={styles.buttonGroup}>
            <button
              className={styles.cancelButton}
              onClick={onClose}
              disabled={isDownloading}
            >
              Cancel
            </button>

            <button
              className={styles.downloadButton}
              onClick={handleDownloadPDF}
              disabled={!hasSelectedColumns || isDownloading}
            >
              {isDownloading ? "Downloading..." : "Download PDF"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportLogbookPopup;
