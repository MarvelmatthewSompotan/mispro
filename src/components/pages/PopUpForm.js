import React, { useState } from "react";
import styles from "./PopUpForm.module.css";

const PopUpForm = ({ onClose, onCreate }) => {
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (schoolYear && semester && date) {
      onCreate({ schoolYear, semester, date });
    } else {
      alert("Please fill all fields");
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.popUpForm} onSubmit={handleSubmit}>
        <div className={styles.createNewRegistration}>
          Create new registration form
        </div>

        <div className={styles.frameParent}>
          {/* School Year Field */}
          <div className={styles.fieldWrapper}>
            <select
              className={styles.schoolYear}
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              required
            >
              <option value="">Select year</option>
              <option value="2025/2026">2025/2026</option>
              <option value="2024/2025">2024/2025</option>
            </select>
          </div>

          {/* Semester Field */}
          <div className={styles.fieldWrapper}>
            <select
              className={styles.semester}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="">Select semester</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
          </div>

          {/* Date Field */}
          <div className={styles.fieldWrapper}>
            <input
              className={styles.dateField}
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
        </div>

        <div className={styles.bAddSubjectParent}>
          <div
            className={styles.bAddSubject}
            onClick={onClose}
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cancel}>Cancel</div>
          </div>
          <button
            className={styles.bAddSubject1}
            type="submit"
            style={{ cursor: "pointer" }}
          >
            <div className={styles.cancel}>Create</div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;
