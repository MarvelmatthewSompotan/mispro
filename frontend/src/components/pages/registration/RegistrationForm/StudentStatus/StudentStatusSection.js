import React, { useState, useEffect, useRef } from "react";
import {
  searchStudent,
  getStudentLatestApplication,
  getRegistrationOptions,
} from "../../../../../services/api";
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
  const [searchResults, setSearchResults] = useState({ new: [], old: [] });
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
    setSearchResults({ new: [], old: [] });

    // Jika user memilih "New" atau "Transferee" setelah mengisi data "Old",
    // panggil fungsi reset dari parent.
    if ((option === "New" || option === "Transferee") && onClearForm) {
      onClearForm();
    }

    if (onDataChange) {
      onDataChange({
        student_status: option,
        input_name: "",
        is_selected: false, // LOGIC: Reset selection state
      });
    }
  };

  const handleSearchChange = async (value) => {
    setStudentSearch(value);

    // LOGIC: Update parent state to indicate user is typing, but no selection is made
    if (onDataChange) {
      onDataChange({
        student_status: "Old",
        input_name: value, // Pass the typed value for validation feedback
        is_selected: false, // Explicitly set to false as no selection has occurred
      });
    }

    if (value.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchStudent(value);
        setSearchResults(results);
        setShowDropdown(results.new?.length > 0 || results.old?.length > 0);
      } catch (err) {
        console.error("Error searching student:", err);
        setSearchResults({ new: [], old: [] });
        setShowDropdown(false);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults({ new: [], old: [] });
      setShowDropdown(false);
    }
  };

  const handleSelectStudent = async (student) => {
    // LOGIC: Set display text to be user-friendly, not the raw ID
    setStudentSearch(`${student.full_name} (${student.student_id})`);
    setSearchResults({ new: [], old: [] });
    setShowDropdown(false);
    setIsSearching(true);

    try {
      const latestData = await getStudentLatestApplication(
        student.student_id,
        student.source
      );
      if (latestData.success && latestData.data) {
        console.log("Received application data:", latestData.data); // Debug log
        // Kirim data ke parent untuk prefill semua form fields
        onSelectOldStudent(latestData.data);

        // LOGIC: Kirim data ke parent component DENGAN flag is_selected: true
        if (onDataChange) {
          onDataChange({
            student_status: "Old",
            input_name: student.student_id, // The actual ID for submission
            source: student.source,
            is_selected: true, // Explicitly set to true on selection
          });
        }
      } else {
        console.error(
          "No application data found for student:",
          student.student_id
        );
        if (onDataChange) {
          onDataChange({
            student_status: "Old",
            input_name: student.student_id,
            source: student.source,
            is_selected: true, // Also true here, because student IS selected
          });
        }
      }
    } catch (err) {
      console.error("Error getting latest application:", err);
      if (onDataChange) {
        onDataChange({
          student_status: "Old",
          input_name: student.student_id,
          source: student.source,
          is_selected: true, // Also true here, because student IS selected
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
    const allResults = [
      ...(searchResults.new || []),
      ...(searchResults.old || []),
    ];
    if (allResults.length === 0) return "auto";
    const longestText = allResults.reduce((longest, student) => {
      const text = `${student.full_name} (${student.student_id})`;
      return text.length > longest.length ? text : longest;
    }, "");
    const estimatedWidth = Math.max(longestText.length * 8, 300);
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
                className={styles.radioLabel}
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

              {option === "Old" && status === "Old" && (
                <div className={styles.studentIdField} ref={searchRef}>
                  <label htmlFor="studentSearch" className={styles.statusLabel}>
                    Search Student
                  </label>
                  <div className={styles.searchContainer}>
                    <div className={styles.searchInputRow}>
                      <input
                        id="studentSearch"
                        className={`${styles.studentIdValue} ${
                          errors?.input_name || forceError?.input_name
                            ? styles.errorInput
                            : ""
                        }`}
                        type="text"
                        autoComplete="off"
                        value={studentSearch}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        onFocus={() =>
                          (searchResults.new?.length > 0 ||
                            searchResults.old?.length > 0) &&
                          setShowDropdown(true)
                        }
                        placeholder={"Enter Name or ID"}
                      />
                      {isSearching && (
                        <div className={styles.searching}>Searching...</div>
                      )}
                      {(errors?.input_name || forceError?.input_name) && (
                        <div className={styles.inlineErrorText}>
                          Please search and select a student!
                        </div>
                      )}
                    </div>

                    {showDropdown &&
                      (searchResults.new?.length > 0 ||
                        searchResults.old?.length > 0) && (
                        <div
                          className={styles.searchDropdown}
                          style={{ width: getDropdownWidth() }}
                        >
                          {searchResults.new?.length > 0 && (
                            <>
                              <div className={styles.dropdownHeader}>
                                New data :
                              </div>
                              {searchResults.new.map((student) => (
                                <div
                                  key={`new-${student.student_id}`}
                                  className={styles.dropdownItem}
                                  onClick={() =>
                                    handleSelectStudent({
                                      ...student,
                                      source: "new",
                                    })
                                  }
                                >
                                  <span className={styles.studentName}>
                                    {student.full_name}
                                  </span>
                                  <span className={styles.studentId}>
                                    ({student.student_id})
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
                          {searchResults.old?.length > 0 && (
                            <>
                              <div className={styles.dropdownHeader}>
                                Previous data :
                              </div>
                              {searchResults.old.map((student) => (
                                <div
                                  key={`old-${student.student_id}`}
                                  className={styles.dropdownItem}
                                  onClick={() =>
                                    handleSelectStudent({
                                      ...student,
                                      source: "old",
                                    })
                                  }
                                >
                                  <span className={styles.studentName}>
                                    {student.full_name}
                                  </span>
                                  <span className={styles.studentId}>
                                    ({student.student_id})
                                  </span>
                                </div>
                              ))}
                            </>
                          )}
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
