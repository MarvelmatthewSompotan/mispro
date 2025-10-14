import React, { useState } from "react";
import styles from "./Logbook.module.css";
import TableHeaderController from "../../molecules/TableHeaderController/TableHeaderController";
import Button from "../../atoms/Button";
import ExportLogbookPopup from "./ExportLogbookPopup/ExportLogbookPopup"; // 1. Impor komponen popup
import jsPDF from "jspdf"; // 2. Impor jsPDF
import autoTable from "jspdf-autotable";
// 1. Impor dari dnd-kit
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

const INITIAL_HEADERS = [
  "Photo",
  "Student ID",
  "Full Name",
  "Grade",
  "Section",
  "School Year",
  "Gender",
  "Registration Date",
  "Transportation",
  "NISN",
  "Family Rank",
  "Place DOB",
  "Age",
  "Religion",
  "Country",
  "Address",
  "Phone",
  "Father Name",
  "Father Occupation",
  "Father Phone",
  "Mother Name",
  "Mother Occupation",
  "Mother Phone",
  "NIK",
  "KITAS",
];
const logbookData = [
  {
    photo_url: "https://i.pravatar.cc/150?img=1",
    student_id: "25430001",
    full_name: "Jonathan C. Giroth",
    grade: "10",
    section: "High School",
    school_year: "2025/2026",
    gender: "MALE",
    registration_date: "2025-10-08",
    transportation: "Own car",
    nisn: "6890853967",
    family_rank: "1",
    place_dob: "Manado, 2012-03-28",
    age: "13 years, 7 months",
    religion: "Kristen",
    country: "Indonesia",
    address: "Link II, Malalayang Satu, Manado",
    phone: "082187751124",
    father_name: "Hengki Giroth",
    father_occupation: "Entrepreneur",
    father_phone: "081384940021",
    mother_name: "Olfiane O Karundeng",
    mother_occupation: "Civil Servant",
    mother_phone: "082187751124",
    nik: "7408090501060002",
    kitas: null,
  },
  {
    photo_url: "https://i.pravatar.cc/150?img=2",
    student_id: "25430002",
    full_name: "Amanda Sari",
    grade: "11",
    section: "High School",
    school_year: "2025/2026",
    gender: "FEMALE",
    registration_date: "2025-10-09",
    transportation: "School Bus",
    nisn: "7890123456",
    family_rank: "2",
    place_dob: "Jakarta, 2011-05-15",
    age: "14 years, 5 months",
    religion: "Islam",
    country: "Indonesia",
    address: "Jl. Sudirman No. 12, Jakarta",
    phone: "081234567890",
    father_name: "Budi Santoso",
    father_occupation: "Manager",
    father_phone: "081298765432",
    mother_name: "Citra Lestari",
    mother_occupation: "Doctor",
    mother_phone: "081234567890",
    nik: "3171234567890001",
    kitas: null,
  },
];
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

// Komponen perantara untuk logika sortable
const SortableHeader = ({ header, selectedColumns, handleColumnSelect }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHeaderController
      ref={setNodeRef}
      style={style}
      listeners={listeners}
      {...attributes}
      title={header}
      controlsDisabled={header === "Photo"}
      showCheckbox={true}
      isChecked={selectedColumns.has(header)}
      onChange={(e) => handleColumnSelect(header, e.target.checked)}
    />
  );
};

const Logbook = () => {
  const [columns, setColumns] = useState(INITIAL_HEADERS);
  const [selectedColumns, setSelectedColumns] = useState(
    new Set(INITIAL_HEADERS)
  );
  const [isPopupOpen, setPopupOpen] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleColumnSelect = (columnTitle, isChecked) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (isChecked) {
      newSelectedColumns.add(columnTitle);
    } else {
      newSelectedColumns.delete(columnTitle);
    }
    setSelectedColumns(newSelectedColumns);
  };
  const selectAllColumns = () => {
    setSelectedColumns(new Set(columns));
  };
  const unselectAllColumns = () => {
    setSelectedColumns(new Set());
  };

  // Fungsi untuk menangani akhir dari proses drag
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDownloadPdf = () => {
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const visibleColumns = columns.filter((header) =>
      selectedColumns.has(header)
    );
    const tableHeaders = visibleColumns;

    // Penjelasan 1: Modifikasi Pembuatan tableBody
    // Saat header adalah "Photo", kita berikan string kosong agar URL tidak tercetak.
    // Gambar akan ditangani oleh fungsi didDrawCell.
    const tableBody = logbookData.map((item) => {
      return visibleColumns.map((header) => {
        const key = HEADER_KEY_MAP[header];
        if (header === "Photo") {
          return ""; // Jangan tampilkan URL sebagai teks
        }
        return item[key] || "-";
      });
    });

    doc.setFontSize(18);
    doc.text("Student Logbook (Section: ECP, School Year: 2025/2026)", 14, 20);
    doc.setFontSize(10);
    const creationDate = new Date().toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    doc.text(`Created: ${creationDate}`, 14, 26);

    autoTable(doc, {
      head: [tableHeaders],
      body: tableBody,
      startY: 30,

      // Penjelasan 2: Ganti Tema dan Atur Style Garis
      // Kita gunakan 'grid' agar ada border di semua sel, sesuai contoh.
      // Atur warna garis agar lebih soft (abu-abu muda).
      theme: "grid",
      styles: {
        font: "helvetica", // Font standar yang didukung PDF
        fontSize: 8,
        cellPadding: 2,
        valign: "middle",
        lineWidth: 0.1, // Ketebalan garis
        lineColor: [200, 200, 200], // Warna garis abu-abu
      },
      headStyles: {
        fillColor: "#3B60B3", // Warna header biru dari kode Anda
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "center",
      },

      // Penjelasan 3: Kunci Utama - Mengatur Lebar Kolom secara Spesifik
      // Ini akan memaksa text wrapping pada kolom yang lebar (seperti Alamat)
      // dan memberikan ruang yang pas untuk kolom lainnya.
      columnStyles: {
        Photo: { cellWidth: 20, halign: "center" },
        "Student ID": { cellWidth: 15, halign: "center" },
        "Full Name": { cellWidth: 30 },
        Grade: { cellWidth: 10, halign: "center" },
        Section: { cellWidth: 15 },
        "School Year": { cellWidth: 15, halign: "center" },
        Gender: { cellWidth: 12 },
        "Registration Date": { cellWidth: 18, halign: "center" },
        Address: { cellWidth: 45 }, // Beri ruang lebih & text akan wrap
        // Tambahkan kolom lain jika perlu pengaturan khusus
        // Kolom yang tidak diatur di sini akan menggunakan lebar 'auto'
      },

      didDrawCell: (data) => {
        const photoColumnIndex = visibleColumns.indexOf("Photo");
        if (
          data.column.index === photoColumnIndex &&
          data.cell.section === "body"
        ) {
          const studentData = logbookData[data.row.index];
          if (studentData && studentData.photo_url) {
            try {
              const imgWidth = 15;
              const imgHeight = 20;
              const cell = data.cell;
              // Posisikan gambar di tengah sel
              const xPos = cell.x + (cell.width - imgWidth) / 2;
              const yPos = cell.y + (cell.height - imgHeight) / 2;
              doc.addImage(
                studentData.photo_url,
                "JPEG",
                xPos,
                yPos,
                imgWidth,
                imgHeight
              );
            } catch (e) {
              console.error(`Error adding image for row ${data.row.index}:`, e);
            }
          }
        }
      },
      rowPageBreak: "avoid",
      bodyStyles: { minCellHeight: 22 }, // Pastikan ada ruang untuk foto
    });

    const date = new Date().toISOString().slice(0, 10);
    doc.save(`Student_Logbook_${date}.pdf`);
    setPopupOpen(false);
  };

  return (
    <div className={styles.logbookPage}>
      <div className={styles.logbookContainer}>
        <header className={styles.logbookHeader}>
          <h1>Logbooks</h1>
          <Button variant="solid" onClick={() => setPopupOpen(true)}>
            Download PDF
          </Button>
        </header>
        <div className={styles.selectionControls}>
          <Button className={styles.btnChipDanger} onClick={unselectAllColumns}>
            Unselect All
          </Button>
          <Button className={styles.btnChipPrimary} onClick={selectAllColumns}>
            Select All
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className={styles.logbookTable}>
              <thead>
                <tr>
                  <SortableContext
                    items={columns}
                    strategy={horizontalListSortingStrategy}
                  >
                    {columns.map((header) => (
                      <SortableHeader
                        key={header}
                        header={header}
                        selectedColumns={selectedColumns}
                        handleColumnSelect={handleColumnSelect}
                      />
                    ))}
                  </SortableContext>
                </tr>
              </thead>
              <tbody>
                {logbookData.map((item) => (
                  <tr key={item.student_id}>
                    {columns.map((header) => {
                      const dataKey = HEADER_KEY_MAP[header];
                      const isSelected = selectedColumns.has(header);
                      if (header === "Photo") {
                        return (
                          <td
                            key={header}
                            className={`${styles.cellPhoto} ${
                              isSelected ? styles.selectedCell : ""
                            }`}
                          >
                            {" "}
                            <img
                              src={item[dataKey]}
                              alt={item.full_name}
                              className={styles.studentPhoto}
                            />{" "}
                          </td>
                        );
                      }
                      return (
                        <td
                          key={header}
                          className={isSelected ? styles.selectedCell : ""}
                        >
                          {" "}
                          {item[dataKey] || "-"}{" "}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </DndContext>
        </div>
      </div>
      <ExportLogbookPopup
        isOpen={isPopupOpen}
        onClose={() => setPopupOpen(false)}
        onDownload={handleDownloadPdf}
        columns={columns}
        selectedColumns={selectedColumns}
        data={logbookData}
        headerKeyMap={HEADER_KEY_MAP}
      />
    </div>
  );
};

export default Logbook;
