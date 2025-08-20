import React, { useState, useRef, useEffect } from "react";
import styles from "../styles/PopUpForm.module.css";
import { startRegistration, getRegistrationOptions } from "../../services/api";

const PopUpForm = ({ onClose, onCreate }) => {
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");

  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);

  const schoolYearRef = useRef(null);
  const semesterRef = useRef(null);
  const dateRef = useRef(null);

  // Fetch registration options for PopUpForm
  useEffect(() => {
    getRegistrationOptions()
      .then((data) => {
        setSchoolYearOptions(data.school_years || []);
        setSemesterOptions(data.semesters || []);
      })
      .catch((err) => {
        console.error("Error fetching registration options:", err);
      });
  }, []);

  useEffect(() => {
    if (schoolYearRef.current) {
      schoolYearRef.current.classList.toggle(styles.hasValue, !!schoolYear);
    }
    if (semesterRef.current) {
      semesterRef.current.classList.toggle(styles.hasValue, !!semester);
    }
    if (dateRef.current) {
      dateRef.current.classList.toggle(styles.hasValue, !!date);
    }
  }, [schoolYear, semester, date]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (schoolYear && semester && date) {
      console.log("Submitting with data:", { schoolYear, semester, date }); // Debug log

      // Call startRegistration to generate draft ID
      startRegistration(schoolYear, semester, date)
        .then((response) => {
          console.log("Success response:", response); // Debug log
          if (response.success) {
            // Pass the draft ID along with other data to onCreate
            onCreate({
              schoolYear,
              semester,
              date,
              draftId: response.data.draft_id,
            });
          } else {
            alert(
              "Failed to start registration: " +
                (response.error || "Unknown error")
            );
          }
        })
        .catch((error) => {
          console.error("Error starting registration:", error);
          // Tambahkan detail error yang lebih spesifik
          if (error.response) {
            console.error("Error response:", error.response);
            console.error("Error status:", error.response.status);
            console.error("Error data:", error.response.data);
          }
          alert("Failed to start registration: " + error.message);
        });
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
              ref={schoolYearRef}
              className={styles.schoolYear}
              value={schoolYear}
              onChange={(e) => setSchoolYear(e.target.value)}
              required
            >
              <option value="">Select year</option>
              {schoolYearOptions.map((sy) => (
                <option key={sy.school_year_id} value={sy.school_year_id}>
                  {sy.year}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Field */}
          <div className={styles.fieldWrapper}>
            <select
              ref={semesterRef}
              className={styles.semester}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="">Select semester</option>
              {semesterOptions.map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Field */}
          <div className={styles.fieldWrapper}>
            <input
              ref={dateRef}
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
