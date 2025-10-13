import React, { useState } from "react";
import styles from "./Logbook.module.css";
import TableHeaderController from "../../molecules/TableHeaderController/TableHeaderController";
import Button from "../../atoms/Button";
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

  return (
    <div className={styles.logbookPage}>
      <div className={styles.logbookContainer}>
        <header className={styles.logbookHeader}>
          <h1>Logbooks</h1>
          <Button variant="solid">Download PDF</Button>
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
    </div>
  );
};

export default Logbook;
