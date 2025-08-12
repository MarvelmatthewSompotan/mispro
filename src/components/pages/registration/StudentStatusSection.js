import React, { useState } from "react";
import styles from "./StudentStatusSection.module.css";

const statusOptions = [
  { value: "new", label: "New" },

  { value: "transferee", label: "Transferee" },
  { value: "old", label: "Old" },
];

const StudentStatusSection = () => {
  const [status, setStatus] = useState("");
  const [studentId, setStudentId] = useState("");

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
                  onChange={() => setStatus(option.value)}
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
                  <input
                    id="studentId"
                    className={styles.studentIdValue}
                    type="text"
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="Enter Student ID"
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      fontFamily: "Poppins, Arial, sans-serif",
                      fontWeight: "bold",
                      fontSize: 16,
                      padding: 3,
                      margin: 0,
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
