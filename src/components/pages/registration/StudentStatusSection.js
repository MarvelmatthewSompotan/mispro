import React, { useState } from "react";
import styles from "./StudentStatusSection.module.css";
import Select from "react-select";

const statusOptions = [
  { value: "new", label: "New" },
  { value: "transferee", label: "Transferee" },
  { value: "old", label: "Old" },
];

const StudentStatusSection = ({
  searchResults = [],
  searchLoading = false,
  onSearchStudent,
  onSelectStudent,
  onValidationChange,
  setErrors,
  forceError,
}) => {
  const [status, setStatus] = useState("");
  const [studentId, setStudentId] = useState("");

  // Handle status change and validation
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);

    // Validate and notify parent
    const isValid = newStatus !== "";
    onValidationChange?.({
      isValid,
      data: { status: newStatus, studentId },
    });
  };

  // Handle student ID change with search
  const handleStudentIdChange = (e) => {
    const value = e.target.value;
    setStudentId(value);

    // Call search API if user types 2 or more characters
    if (onSearchStudent && value.trim().length >= 2) {
      onSearchStudent(value);
    }

    // Validate and notify parent
    const isValid = status !== "" && (status !== "old" || value.trim() !== "");
    onValidationChange?.({
      isValid,
      data: { status, studentId: value },
    });
  };

  // Handle select student from search results
  const handleSelectStudent = (student) => {
    const displayName =
      student.name || `${student.first_name} ${student.last_name}`;
    setStudentId(displayName);

    if (onSelectStudent) {
      onSelectStudent(student.student_id);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT’S STATUS</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.statusOptions}>
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className={
                option.value === "old" ? styles.optionOld : styles.optionNew
              }
            >
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  cursor: "pointer",
                  position: "relative",
                }}
              >
                <input
                  type="radio"
                  name="studentStatus"
                  value={option.value}
                  checked={status === option.value}
                  onChange={() => handleStatusChange(option.value)}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {status === option.value && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.statusLabel}>{option.label}</span>
              </label>
              {option.value === "old" && status === "old" && (
                <div className={styles.studentIdField}>
                  <label htmlFor="studentId" className={styles.statusLabel}>
                    Student ID
                  </label>
                  <Select
                    id="studentId"
                    options={searchResults.map((student) => ({
                      value: student.student_id,
                      label: `${
                        student.name ||
                        `${student.first_name} ${student.last_name}`
                      } (ID: ${student.student_id})`,
                    }))}
                    placeholder="Search by name or ID"
                    value={
                      studentId ? { value: studentId, label: studentId } : null
                    }
                    onChange={(opt) => {
                      if (opt) {
                        const selectedStudent = searchResults.find(
                          (s) => s.student_id === opt.value
                        );
                        if (selectedStudent) {
                          handleSelectStudent(selectedStudent);
                        }
                      } else {
                        setStudentId("");
                      }
                    }}
                    onInputChange={(inputValue) => {
                      if (onSearchStudent && inputValue.trim().length >= 2) {
                        onSearchStudent(inputValue);
                      }
                    }}
                    isLoading={searchLoading}
                    isClearable
                    noOptionsMessage={() => "No students found"}
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontWeight: studentId ? "bold" : "400",
                        color: studentId ? "#000" : "rgba(128,128,128,0.6)",
                        border: "none",
                        boxShadow: "none",
                        borderRadius: 0,
                        borderBottom: "none",
                        background: "transparent",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontWeight: studentId ? "bold" : "400",
                        color: studentId ? "#000" : "rgba(128,128,128,0.6)",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "rgba(128,128,128,0.6)",
                      }),
                      menu: (base) => ({
                        ...base,
                        zIndex: 9999,
                      }),
                      dropdownIndicator: (base) => ({
                        ...base,
                        display: "none",
                      }),
                      indicatorSeparator: (base) => ({
                        ...base,
                        display: "none",
                      }),
                    }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className={styles.noteSection}>
          <div className={styles.noteWrapper}>
            <div className={styles.noteLabel}>{`Note: `}</div>
            <div className={styles.noteText}>
              <span>By selecting student’s status </span>
              <span className={styles.noteTextBold}>New</span>
              <span> or </span>
              <span className={styles.noteTextBold}>Transferee </span>
              <span>
                will automatically generate a new registration number.
              </span>
            </div>
            <div className={styles.noteWarning}>
              <span>{`Please keep in mind that this action cannot be `}</span>
              <span className={styles.noteWarningBold}>undone</span>
              <span>.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStatusSection;
