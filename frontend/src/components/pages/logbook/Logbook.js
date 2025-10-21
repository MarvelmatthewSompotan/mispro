import React, { useState } from "react";
import styles from "./Logbook.module.css";
import TableHeaderController from "../../molecules/TableHeaderController/TableHeaderController";
import Button from "../../atoms/Button";
import ExportLogbookPopup from "./ExportLogbookPopup/ExportLogbookPopup";

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
    full_name: "Jonathan Constantine Balthazar Giroth-Maming",
    grade: "10",
    section: "High School Program",
    school_year: "2025/2026",
    gender: "MALE",
    registration_date: "2025-10-08",
    transportation: "Private Driver (Alphard)",
    nisn: "6890853967",
    family_rank: "1",
    place_dob: "RS Siloam MRCCC Semanggi, Jakarta, 2012-03-28",
    age: "13 years, 7 months",
    religion: "Kristen Protestan",
    country: "Indonesia",
    address:
      "Jalan Boulevard Piere Tendean Kavling 25, Kompleks Ruko Megamas Blok H-15, Manado, Sulawesi Utara, 95111",
    phone: "082187751124",
    father_name: "Professor Doktor Insinyur Hengki Giroth, S.T., M.Eng.",
    father_occupation:
      "CEO of a Multinational Conglomerate specializing in Advanced AI",
    father_phone: "081384940021",
    mother_name: "Dr. Olfiane Olivia Karundeng-Tumbelaka, Sp.A(K)",
    mother_occupation:
      "Head of the Regional Development Planning Agency (BAPPEDA)",
    mother_phone: "082187751124",
    nik: "7408090501060002",
    kitas: "23827839795384573859",
  },
  {
    photo_url: "https://i.pravatar.cc/150?img=2",
    student_id: "25430002",
    full_name: "Amanda Setyaningsih Ratu Kirana Dewi Sari",
    grade: "11",
    section: "High School Program",
    school_year: "2025/2026",
    gender: "FEMALE",
    registration_date: "2025-10-09",
    transportation: "School Bus (Priority Service)",
    nisn: "7890123456",
    family_rank: "2",
    place_dob: "Rumah Sakit Pondok Indah, Jakarta Selatan, 2011-05-15",
    age: "14 years, 5 months",
    religion: "Islam (Sunni)",
    country: "Indonesia",
    address:
      "Apartemen Pakubuwono Signature, Tower C, Lantai 35 Unit A, Jalan Pakubuwono VI No. 72, Kebayoran Baru, Jakarta Selatan, 12120",
    phone: "081234567890",
    father_name: "Jenderal TNI (Purn.) Budi Santoso, M.H., M.Si.",
    father_occupation:
      "Senior Vice President of Operations at PT. Bank Central Asia Tbk (BCA)",
    father_phone: "081298765432",
    mother_name: "Prof. Dr. Citra Lestari, Ph.D., M.D.",
    mother_occupation:
      "Lead Cardiovascular Surgeon and Head of Research at Harapan Kita",
    mother_phone: "081234567890",
    nik: "3171234567890001",
    kitas: "23827839795384573859",
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
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

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

  // Fungsi untuk membuka popup export
  const handleOpenExportPopup = () => {
    setIsExportPopupOpen(true);
  };

  // Fungsi untuk menutup popup export
  const handleCloseExportPopup = () => {
    setIsExportPopupOpen(false);
  };

  return (
    <div className={styles.logbookPage}>
      <div className={styles.logbookContainer}>
        <header className={styles.logbookHeader}>
          <h1>Logbooks</h1>
          <Button variant="solid" onClick={handleOpenExportPopup}>
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

      {/* Export Logbook Popup */}
      <ExportLogbookPopup
        isOpen={isExportPopupOpen}
        onClose={handleCloseExportPopup}
        columns={columns}
        selectedColumns={selectedColumns}
        logbookData={logbookData}
      />
    </div>
  );
};

export default Logbook;
