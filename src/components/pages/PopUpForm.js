import React, { useState, useEffect } from "react";
import styles from "../styles/PopUpForm.module.css";
import ApiService from "../../services/api";

const PopUpForm = ({ onClose, onCreate, registrationOptions = {} }) => {
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Add hasValue class when fields have values
  useEffect(() => {
    const schoolYearSelect = document.querySelector(`.${styles.schoolYear}`);
    const semesterSelect = document.querySelector(`.${styles.semester}`);
    const dateInput = document.querySelector(`.${styles.dateField}`);

    if (schoolYearSelect) {
      if (schoolYear) {
        schoolYearSelect.classList.add(styles.hasValue);
      } else {
        schoolYearSelect.classList.remove(styles.hasValue);
      }
    }

    if (semesterSelect) {
      if (semester) {
        semesterSelect.classList.add(styles.hasValue);
      } else {
        semesterSelect.classList.remove(styles.hasValue);
      }
    }

    if (dateInput) {
      if (date) {
        dateInput.classList.add(styles.hasValue);
      } else {
        dateInput.classList.remove(styles.hasValue);
      }
    }
  }, [schoolYear, semester, date, styles]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!schoolYear || !semester || !date) {
      setError("Please fill all fields");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = {
        school_year_id: parseInt(schoolYear),
        semester_id: parseInt(semester),
        registration_date: date,
      };

      const response = await ApiService.startRegistration(formData);

      if (response.success) {
        // Find the display values for school year and semester
        const selectedSchoolYear = registrationOptions.school_years?.find(
          (year) => year.school_year_id === parseInt(schoolYear)
        );
        const selectedSemester = registrationOptions.semesters?.find(
          (sem) => sem.semester_id === parseInt(semester)
        );

        onCreate({
          schoolYear: selectedSchoolYear?.year || schoolYear,
          semester: selectedSemester?.name || semester,
          date,
          draftId: response.data.draft_id,
        });
      } else {
        setError(response.message || "Failed to create registration");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.popUpForm} onSubmit={handleSubmit}>
        <div className={styles.createNewRegistration}>
          Create new registration form
        </div>

        {error && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

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
              {registrationOptions.school_years?.map((year) => (
                <option key={year.school_year_id} value={year.school_year_id}>
                  {year.year}
                </option>
              ))}
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
              {registrationOptions.semesters?.map((sem) => (
                <option key={sem.semester_id} value={sem.semester_id}>
                  {sem.name}
                </option>
              ))}
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
            disabled={loading}
            style={{ cursor: loading ? "not-allowed" : "pointer" }}
          >
            <div className={styles.cancel}>
              {loading ? "Creating..." : "Create"}
            </div>
          </button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;
