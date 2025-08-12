import React, { useState } from "react";
import styles from "./ProgramSection.module.css";
import Select from "react-select";

const ProgramSection = ({ options = {} }) => {
  const [selectedSection, setSelectedSection] = useState("");
  const [grade, setGrade] = useState("");
  const [majorId, setMajorId] = useState(""); // Store major_id instead of major name
  const [selectedProgram, setSelectedProgram] = useState("");
  const [otherProgram, setOtherProgram] = useState("");

  // Use options from API or fallback to default values
  const sectionOptions = options.sections?.map((section) => section.name) || [
    "ECP",
    "Elementary School", // Changed to match API format
    "Middle School",
    "High School",
  ];

  // Get unique grade options from API classes data
  const getGradeOptions = (sectionName) => {
    if (!options.classes) return [];

    const filteredClasses = options.classes.filter(
      (cls) => cls.section_name === sectionName
    );

    // Get unique grades only
    const uniqueGrades = [...new Set(filteredClasses.map((cls) => cls.grade))];

    return uniqueGrades.map((grade) => ({
      value: grade,
      label: grade,
    }));
  };

  // Get program options and ensure "Other" is after "Oxford"
  const rawProgramOptions = options.programs?.map(
    (program) => program.name
  ) || ["UAN", "A Beka", "Oxford", "Cambridge"];

  // Ensure "Other" is always present and positioned after "Oxford"
  let programOptions = [...rawProgramOptions];

  // Remove any existing "Other" or "Others" first
  programOptions = programOptions.filter(
    (opt) => opt !== "Other" && opt !== "Others"
  );

  // Find Oxford position and insert "Other" after it
  const oxfordIndex = programOptions.findIndex((opt) => opt === "Oxford");
  if (oxfordIndex !== -1) {
    programOptions.splice(oxfordIndex + 1, 0, "Other");
  } else {
    // If Oxford not found, add "Other" at the end
    programOptions.push("Other");
  }

  // Final check: ensure "Other" is always present
  if (!programOptions.includes("Other")) {
    programOptions.push("Other");
  }

  const majorOptions = options.majors?.map((major) => major.name) || [
    "SCIENCE",
    "SOCIAL",
  ];

  const showMajor =
    selectedSection === "High School" ||
    (selectedSection === "Middle School" &&
      Number(grade) >= 9 &&
      Number(grade) <= 12);

  const handleGradeChange = (e) => {
    const value = e.target.value;
    setGrade(value);

    // Auto-set section based on grade (only for numeric grades)
    const num = Number(value);
    if (value === "N" || value === "K1" || value === "K2") {
      setSelectedSection("ECP");
    } else if (num >= 1 && num <= 6) {
      setSelectedSection("Elementary School"); // Changed to match API format
    } else if (num >= 7 && num <= 10) {
      setSelectedSection("Middle School");
    } else if (num >= 11 && num <= 12) {
      setSelectedSection("High School");
    }
  };

  const handleSectionChange = (option) => {
    console.log("Section selected:", option); // Debug log
    setSelectedSection(option);

    // Auto-set grade based on selected section
    if (option === "ECP") {
      setGrade("N");
    } else if (
      option === "Elementary school" ||
      option === "Elementary School"
    ) {
      setGrade("1");
    } else if (option === "Middle School") {
      setGrade("7");
    } else if (option === "High School") {
      setGrade("10");
    }

    console.log(
      "Grade set to:",
      option === "Elementary school" || option === "Elementary School"
        ? "1"
        : option === "ECP"
        ? "N"
        : option === "Middle School"
        ? "7"
        : option === "High School"
        ? "10"
        : "none"
    ); // Debug log
  };

  // Dropdown grade options from API
  const gradeOptions = getGradeOptions(selectedSection);

  // Get major options based on selected grade
  const getMajorOptions = (selectedGrade) => {
    if (!options.classes || !selectedGrade) return [];

    const classesForGrade = options.classes.filter(
      (cls) => cls.grade === selectedGrade
    );

    // Get unique majors for this grade
    const uniqueMajors = [
      ...new Set(classesForGrade.map((cls) => cls.major_id)),
    ];

    // Map to major names using options.majors
    return uniqueMajors.map((majorId) => {
      const major = options.majors?.find((m) => m.major_id === majorId);
      return {
        value: majorId, // Send major_id
        label: major?.name || `Major ${majorId}`, // Display major name
      };
    });
  };

  const majorSelectOptions = getMajorOptions(grade);

  // Debug: Log program options
  console.log("Program Options:", programOptions);
  console.log("Raw Program Options from API:", options.programs);
  console.log("Section Options:", sectionOptions);
  console.log("Selected Section:", selectedSection);
  console.log("Current Grade:", grade);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>PROGRAM</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.programSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Section</div>
          </div>
          {sectionOptions.map((option) => (
            <div key={option} className={styles.optionItem}>
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
                  name="section"
                  value={option}
                  checked={selectedSection === option}
                  onChange={() => handleSectionChange(option)}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {selectedSection === option && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.label}>{option}</span>
              </label>
            </div>
          ))}
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Grade</div>
          </div>
          <Select
            id="grade"
            options={gradeOptions}
            placeholder="Select grade"
            value={
              grade ? gradeOptions.find((opt) => opt.value === grade) : null
            }
            onChange={(opt) => setGrade(opt ? opt.value : "")}
            isClearable
            styles={{
              control: (base) => ({
                ...base,
                fontWeight: grade ? "bold" : "400",
                color: grade ? "#000" : "rgba(128,128,128,0.6)",
                border: "none",
                boxShadow: "none",
                borderRadius: 0,
                borderBottom: "1px solid #000",
                background: "transparent",
              }),
              singleValue: (base) => ({
                ...base,
                fontWeight: grade ? "bold" : "400",
                color: grade ? "#000" : "rgba(128,128,128,0.6)",
              }),
              placeholder: (base) => ({
                ...base,
                color: "rgba(128,128,128,0.6)",
              }),
            }}
          />
          {showMajor && (
            <>
              <div className={styles.sectionTitle}>
                <div className={styles.sectionTitleText}>Major</div>
              </div>
              <Select
                id="major"
                options={majorSelectOptions}
                placeholder="Select major"
                value={
                  majorId
                    ? majorSelectOptions.find((opt) => opt.value === majorId)
                    : null
                }
                onChange={(opt) => setMajorId(opt ? opt.value : "")}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    fontWeight: majorId ? "bold" : "400",
                    color: majorId ? "#000" : "rgba(128,128,128,0.6)",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: 0,
                    borderBottom: "1px solid #000",
                    background: "transparent",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontWeight: majorId ? "bold" : "400",
                    color: majorId ? "#000" : "rgba(128,128,128,0.6)",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "rgba(128,128,128,0.6)",
                  }),
                }}
              />
            </>
          )}
        </div>
        <div className={styles.programSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Program</div>
          </div>
          {programOptions.map((option) => (
            <div
              key={option}
              className={
                option === "Other" || option === "Others"
                  ? `${styles.optionItem} ${styles.othersOption}`
                  : styles.optionItem
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
                  name="program"
                  value={option}
                  checked={selectedProgram === option}
                  onChange={() => setSelectedProgram(option)}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {selectedProgram === option && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.label}>{option}</span>
                {(option === "Other" || option === "Others") &&
                  (selectedProgram === "Other" ||
                    selectedProgram === "Others") && (
                    <input
                      className={styles.valueRegular}
                      type="text"
                      value={otherProgram}
                      onChange={(e) => setOtherProgram(e.target.value)}
                      placeholder="Enter other program"
                      style={{ marginLeft: 12, padding: 0 }}
                    />
                  )}
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgramSection;
