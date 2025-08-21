import React, { useState, useEffect } from "react";
import Select from "react-select";
import {
  searchStudent,
  getStudentLatestApplication,
} from "../../../services/api";
import styles from "./StudentStatusSection.module.css";

const StudentStatusSection = ({
  onSelectOldStudent,
  onDataChange,
  sharedData,
}) => {
  const [status, setStatus] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentOptions, setStudentOptions] = useState([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Search effect
  useEffect(() => {
    if (searchTerm.length > 2) {
      handleStudentSearch(searchTerm);
    } else {
      setStudentOptions([]);
    }
  }, [searchTerm]);

  // Use shared data if available, otherwise fetch separately
  useEffect(() => {
    if (sharedData) {
      const opts = sharedData.student_status || [];
      // Ensure order: New, Transferee, Old
      const ordered = ['New', 'Transferee', 'Old'].filter((o) => opts.includes(o));
      setStatusOptions(ordered);
    } else {
      // Fallback to individual API call if shared data not available
      getRegistrationOptions()
        .then((data) => {
          const opts = data.student_status || [];
          const ordered = ['New', 'Transferee', 'Old'].filter((o) => opts.includes(o));
          setStatusOptions(ordered);
        })
        .catch((err) => {
          console.error('Failed to fetch student status options:', err);
        });
    }
  }, [sharedData]);

  const handleStatusChange = (option) => {
    setStatus(option);
    setSelectedStudent(null);
    setStudentOptions([]);
    setSearchTerm(""); // Clear search term when status changes

    // Kirim data ke parent component dengan input_name
    if (onDataChange) {
      onDataChange({
        student_status: option,
        input_name: option === "Old" ? "" : null, // Tambahkan input_name
      });
    }
  };

  const handleStudentSearch = async (term) => {
    if (term.length > 2) {
      setIsLoadingStudents(true);
      try {
        const response = await searchStudent(term);

        // Ensure we have a valid array of students
        let students = [];
        if (Array.isArray(response)) {
          students = response;
        } else if (response && Array.isArray(response.data)) {
          students = response.data;
        } else if (
          response &&
          response.students &&
          Array.isArray(response.students)
        ) {
          students = response.students;
        }

        // Create options with strict validation
        const options = students
          .filter((student) => {
            // Ensure student is a valid object
            return (
              student &&
              typeof student === "object" &&
              !(student instanceof Promise) &&
              (student.student_id || student.id) &&
              (student.full_name || student.name)
            );
          })
          .map((student) => {
            const id = student.student_id || student.id || "";
            const name = student.full_name || student.name || "Unknown";
            return {
              value: id,
              label: `${name} (${id})`,
              student: student,
            };
          });

        setStudentOptions(options);
      } catch (err) {
        console.error("Error searching student:", err);
        setStudentOptions([]);
      } finally {
        setIsLoadingStudents(false);
      }
    } else {
      setStudentOptions([]);
    }
  };

  const handleStudentSelect = async (option) => {
    if (!option) {
      setSelectedStudent(null);
      if (onDataChange) {
        onDataChange({
          student_status: "Old",
          input_name: "",
        });
      }
      return;
    }

    setSelectedStudent(option);
    setIsLoadingStudents(true);

    try {
      const latestData = await getStudentLatestApplication(student.student_id);
      if (latestData.success && latestData.data) {
        console.log("Received application data:", latestData.data); // Debug log

        // Kirim data ke parent untuk prefill semua form fields
        onSelectOldStudent(latestData.data);

        // Update input_name dengan nama student yang dipilih
        if (onDataChange) {
          onDataChange({
            student_status: "Old",
            input_name: student.student_id,
          });
        }
      } else {
        console.error(
          "No application data found for student:",
          student.student_id
        );
        // Handle case ketika tidak ada data application
        if (onDataChange) {
          onDataChange({
            student_status: "Old",
            input_name: student.student_id,
          });
        }
      }
    } catch (err) {
      console.error("Error getting latest application:", err);
      // Handle error case
      if (onDataChange) {
        onDataChange({
          student_status: "Old",
          input_name: student.student_id,
        });
      }
    } finally {
      setIsLoadingStudents(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT'S STATUS</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.statusOptions}>
          {statusOptions.map((option) => (
            <div
              key={option}
              className={option === 'Old' ? styles.optionOld : styles.optionNew}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <input
                  type='radio'
                  name='studentStatus'
                  value={option}
                  checked={status === option}
                  onChange={() => handleStatusChange(option)}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {status === option && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.statusLabel}>{option}</span>
              </label>

              {/* Show dropdown-like field (input with datalist) only for Old student status */}
              {option === 'Old' && status === 'Old' && (
                <div className={styles.studentIdField}>
                  <label htmlFor='studentSearch' className={styles.statusLabel}>
                    Search Student
                  </label>
                  <input
                    type="radio"
                    name="studentStatus"
                    value="Old"
                    checked={status === "Old"}
                    onChange={() => handleStatusChange("Old")}
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      fontWeight: 'bold',
                      fontSize: 16,
                      padding: 3,
                      margin: 0,
                      width: 'auto',
                      minWidth: 240,
                      maxWidth: '100%'
                    }}
                  />
                  {isSearching && (
                    <div className={styles.searching}>Searching...</div>
                  )}
                  {searchResults.length > 0 && (
                    <select
                      className={styles.searchResultsSelect}
                      value=""
                      onChange={(e) => {
                        const picked = searchResults.find((s) => s.student_id === e.target.value);
                        if (picked) handleSelectStudent(picked);
                      }}
                    >
                      <option value="" disabled>
                        Select a student
                      </option>
                      {searchResults.map((student) => (
                        <option key={student.student_id} value={student.student_id}>
                          {`${student.full_name} (${student.student_id})`}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.noteSection}>
          <div className={styles.noteWrapper}>
            <div className={styles.noteLabel}>{`Note: `}</div>
            <div className={styles.noteText}>
              <span>By selecting student's status </span>
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
