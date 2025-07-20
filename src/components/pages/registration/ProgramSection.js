import React, { useState } from "react";
import styles from "./ProgramSection.module.css";

const sectionOptions = [
  "ECP",
  "Elementary school",
  "Middle School",
  "High School",
];
const programOptions = ["UAN", "A Beka", "Oxford", "Cambridge", "Others"];
const majorOptions = ["SCIENCE", "SOCIAL"];

const ProgramSection = () => {
  const [selectedSection, setSelectedSection] = useState("");
  const [grade, setGrade] = useState("");
  const [major, setMajor] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [otherProgram, setOtherProgram] = useState("");

  const showMajor =
    selectedSection === "High School" ||
    (selectedSection === "Middle School" &&
      Number(grade) >= 9 &&
      Number(grade) <= 12);

  const handleGradeChange = (e) => {
    const value = e.target.value;
    setGrade(value);
    const num = Number(value);
    if (num >= 1 && num <= 6) {
      setSelectedSection("Elementary school");
    } else if (num >= 7 && num <= 10) {
      setSelectedSection("Middle School");
    } else if (num >= 11 && num <= 12) {
      setSelectedSection("High School");
    }
  };

  const handleSectionChange = (option) => {
    setSelectedSection(option);
    if (option === "ECP" || option === "Elementary school") {
      setGrade("1");
    } else if (option === "Middle School") {
      setGrade("7");
    } else if (option === "High School") {
      setGrade("10");
    }
  };

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
          <div className={styles.gradeField}>
            <label className={styles.label} htmlFor="grade">
              Grade
            </label>
            <input
              id="grade"
              className={styles.label}
              type="number"
              value={grade}
              onChange={handleGradeChange}
              placeholder="1"
              min="1"
              max="12"
            />
          </div>
          {showMajor && (
            <div className={styles.majorField}>
              <label className={styles.label} htmlFor="major">
                Major
              </label>
              <select
                id="major"
                className={styles.valueRegular}
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              >
                <option value="">Select major</option>
                {majorOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <img
                className={styles.majorDropdownIcon}
                alt=""
                src="Polygon 2.svg"
              />
            </div>
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
                option === "Others"
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
                {option === "Others" && selectedProgram === "Others" && (
                  <input
                    className={styles.valueRegular}
                    type="text"
                    value={otherProgram}
                    onChange={(e) => setOtherProgram(e.target.value)}
                    placeholder="Enter other program"
                    style={{ marginLeft: 12 }}
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
