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
      console.log("StudentStatusSection received sharedData:", sharedData); // Debug log
      setStatusOptions(sharedData.student_status || []);
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
          {statusOptions.map((option) => {
            // Skip rendering "Old" here, we'll render it after "Transferee"
            if (option === "Old") return null;

            return (
              <div
                key={option}
                className={
                  option === "Transferee" ? styles.optionOld : styles.optionNew
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
                    value={option}
                    checked={status === option}
                    onChange={() => handleStatusChange(option)}
                    style={{
                      opacity: 0,
                      position: "absolute",
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
              </div>
            );
          })}

          {/* Render "Old" option after "Transferee" */}
          {statusOptions.includes("Old") && (
            <div key="Old" className={styles.optionOld}>
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
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
                    value="Old"
                    checked={status === "Old"}
                    onChange={() => handleStatusChange("Old")}
                    style={{
                      opacity: 0,
                      position: "absolute",
                      width: 0,
                      height: 0,
                    }}
                  />
                  <span className={styles.radioButton}>
                    <span className={styles.radioButtonCircle} />
                    {status === "Old" && (
                      <span className={styles.radioButtonSelected} />
                    )}
                  </span>
                  <span className={styles.statusLabel}>Old</span>
                </label>

                {/* Show dropdown field only for Old student status, aligned horizontally */}
                {status === "Old" && (
                  <div
                    className={styles.studentIdField}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <label className={styles.statusLabel}>Search Student</label>
                    <div
                      style={{ position: "relative", display: "inline-block" }}
                    >
                      <Select
                        options={studentOptions}
                        value={selectedStudent}
                        onChange={handleStudentSelect}
                        onInputChange={(newValue) => {
                          setSearchTerm(newValue);
                          return newValue; // Important: return the value
                        }}
                        placeholder="Enter Name or ID"
                        isLoading={isLoadingStudents}
                        isClearable
                        isSearchable
                        noOptionsMessage={() => "No students found"}
                        loadingMessage={() => "Searching..."}
                        filterOption={() => true} // Disable built-in filtering since we're doing custom search
                        menuPlacement="bottom"
                        styles={{
                          control: (base) => ({
                            ...base,
                            fontWeight: selectedStudent ? "bold" : "400",
                            color: selectedStudent
                              ? "#000"
                              : "rgba(128,128,128,0.6)",
                            border: "none",
                            boxShadow: "none",
                            borderRadius: 0,
                            borderBottom: "none",
                            background: "transparent",
                            fontFamily: "Poppins, Arial, sans-serif",
                            fontSize: 16,
                            padding: 3,
                            margin: 0,
                            minWidth: "200px", // Minimum width
                          }),
                          singleValue: (base) => ({
                            ...base,
                            fontWeight: selectedStudent ? "bold" : "400",
                            color: selectedStudent
                              ? "#000"
                              : "rgba(128,128,128,0.6)",
                            fontFamily: "Poppins, Arial, sans-serif",
                            fontSize: 16,
                          }),
                          placeholder: (base) => ({
                            ...base,
                            color: "rgba(128,128,128,0.6)",
                            fontFamily: "Poppins, Arial, sans-serif",
                            fontSize: 16,
                          }),
                          input: (base) => ({
                            ...base,
                            fontFamily: "Poppins, Arial, sans-serif",
                            fontSize: 16,
                          }),
                          menu: (base) => ({
                            ...base,
                            width: "auto", // Auto width based on content
                            minWidth: "100%", // At least as wide as the control
                          }),
                          option: (base, state) => ({
                            ...base,
                            backgroundColor: state.isSelected
                              ? "#007bff"
                              : state.isFocused
                              ? "#f8f9fa"
                              : "white",
                            color: state.isSelected ? "white" : "black",
                            fontFamily: "Poppins, Arial, sans-serif",
                            fontSize: 14,
                            whiteSpace: "nowrap", // Prevent text wrapping
                          }),
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
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
