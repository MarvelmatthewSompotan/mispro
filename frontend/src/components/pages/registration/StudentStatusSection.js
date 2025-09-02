import React, { useState, useEffect, useRef } from "react";
import {
  searchStudent,
  getStudentLatestApplication,
  getRegistrationOptions,
} from "../../../services/api";
import styles from "./StudentStatusSection.module.css";

const StudentStatusSection = ({
  onSelectOldStudent,
  onDataChange,
  sharedData,
  errors,
  forceError,
  onClearForm,
}) => {
  const [status, setStatus] = useState("");
  const [statusOptions, setStatusOptions] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);

  // Use shared data if available, otherwise fetch separately
  useEffect(() => {
    if (sharedData) {
      const opts = sharedData.student_status || [];
      // Ensure order: New, Transferee, Old
      const ordered = ["New", "Transferee", "Old"].filter((o) =>
        opts.includes(o)
      );
      setStatusOptions(ordered);
    } else {
      // Fallback to individual API call if shared data not available
      getRegistrationOptions()
        .then((data) => {
          const opts = data.student_status || [];
          const ordered = ["New", "Transferee", "Old"].filter((o) =>
            opts.includes(o)
          );
          setStatusOptions(ordered);
        })
        .catch((err) => {
          console.error("Failed to fetch student status options:", err);
        });
    }
  }, [sharedData]);

  const handleStatusChange = (option) => {
    setStatus(option);
    setStudentSearch("");
    setSearchResults([]);

    // Jika user memilih "New" atau "Transferee" setelah mengisi data "Old",
    // panggil fungsi reset dari parent.
    if ((option === "New" || option === "Transferee") && onClearForm) {
      onClearForm();
    }

    // Kirim data ke parent component dengan format yang benar
    if (onDataChange) {
      onDataChange({
        student_status: option,
        input_name: "", // Reset input_name ketika status berubah
      });
    }
  };

  const handleSearchChange = async (value) => {
    setStudentSearch(value);

    // Update input_name setiap kali user mengetik
    if (onDataChange) {
      onDataChange({
        student_status: "Old",
        input_name: "", // Update input_name dengan value yang diketik
      });
    }

    if (value.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchStudent(value);
        setSearchResults(results);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error searching student:", err);
        setSearchResults([]);
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelectStudent = async (student) => {
    setStudentSearch(student.full_name || student.student_id);
    setSearchResults([]);
    setShowDropdown(false);
    setIsSearching(true);

    try {
      const latestData = await getStudentLatestApplication(student.student_id);
      if (latestData.success && latestData.data) {
        console.log("Received application data:", latestData.data); // Debug log

        // Kirim data ke parent untuk prefill semua form fields
        onSelectOldStudent(latestData.data);

        // Kirim input_name ke parent component
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
      setIsSearching(false);
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Calculate dropdown width based on content
  const getDropdownWidth = () => {
    if (searchResults.length === 0) return "auto";

    // Find the longest text to determine width
    const longestText = searchResults.reduce((longest, student) => {
      const text = `${student.full_name} (${student.student_id})`;
      return text.length > longest.length ? text : longest;
    }, "");

    // Estimate width based on character count (roughly 8px per character)
    const estimatedWidth = Math.max(longestText.length * 8, 300); // Minimum 300px
    return `${estimatedWidth}px`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT'S STATUS</span>
      </div>
      <div className={styles.contentWrapper}>
        <div
          className={`${styles.statusOptions} ${
            errors?.student_status || forceError?.student_status
              ? styles.studentStatusErrorWrapper
              : ""
          }`}
        >
          {statusOptions.map((option) => (
            <div
              key={option}
              className={option === "Old" ? styles.optionOld : styles.optionNew}
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
                <span
                  className={`${styles.statusLabel} ${
                    errors?.student_status || forceError?.student_status
                      ? styles.studentStatusErrorLabel
                      : ""
                  }`}
                >
                  {option}
                </span>
              </label>

              {/* Show unified search field with popup dropdown for Old student status */}
              {option === "Old" && status === "Old" && (
                <div className={styles.studentIdField} ref={searchRef}>
                  <label htmlFor="studentSearch" className={styles.statusLabel}>
                    Search Student
                  </label>
                  <div className={styles.searchContainer}>
                    <div className={styles.searchInputRow}>
                      <input
                        id="studentSearch"
                        className={styles.studentIdValue}
                        type="text"
                        value={studentSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() =>
                          searchResults.length > 0 && setShowDropdown(true)
                        }
                        placeholder="Enter Name or ID"
                        style={{
                          border: "none",
                          outline: "none",
                          background: "transparent",
                          fontFamily: "Poppins, Arial, sans-serif",
                          fontWeight: "bold",
                          fontSize: 16,
                          padding: 3,
                          margin: 0,
                          width: "auto",
                          minWidth: 240,
                          maxWidth: "100%",
                        }}
                      />
                      {isSearching && (
                        <div className={styles.searching}>Searching...</div>
                      )}
                    </div>

                    {/* Popup Dropdown */}
                    {showDropdown && searchResults.length > 0 && (
                      <div
                        className={styles.searchDropdown}
                        style={{ width: getDropdownWidth() }}
                      >
                        {searchResults.map((student) => (
                          <div
                            key={student.student_id}
                            className={styles.dropdownItem}
                            onClick={() => handleSelectStudent(student)}
                          >
                            <span className={styles.studentName}>
                              {student.full_name}
                            </span>
                            <span className={styles.studentId}>
                              ({student.student_id})
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
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
