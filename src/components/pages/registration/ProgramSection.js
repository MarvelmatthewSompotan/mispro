import React, { useState } from "react";
import styles from "./ProgramSection.module.css";
import Select from "react-select";

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

  // Dropdown grade options
  let gradeOptions = [];
  if (selectedSection === "ECP") {
    gradeOptions = [
      { value: "N", label: "N" },
      { value: "K1", label: "K1" },
      { value: "K2", label: "K2" },
    ];
  } else if (selectedSection === "Elementary school") {
    gradeOptions = [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
      { value: "5", label: "5" },
      { value: "6", label: "6" },
    ];
  } else if (selectedSection === "Middle School") {
    gradeOptions = [
      { value: "7", label: "7" },
      { value: "8", label: "8" },
      { value: "9", label: "9" },
    ];
  } else if (selectedSection === "High School") {
    gradeOptions = [
      { value: "10", label: "10" },
      { value: "11", label: "11" },
      { value: "12", label: "12" },
    ];
  }
  const majorSelectOptions = majorOptions.map((opt) => ({
    value: opt,
    label: opt,
  }));

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
                  major
                    ? majorSelectOptions.find((opt) => opt.value === major)
                    : null
                }
                onChange={(opt) => setMajor(opt ? opt.value : "")}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    fontWeight: major ? "bold" : "400",
                    color: major ? "#000" : "rgba(128,128,128,0.6)",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: 0,
                    borderBottom: "1px solid #000",
                    background: "transparent",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontWeight: major ? "bold" : "400",
                    color: major ? "#000" : "rgba(128,128,128,0.6)",
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
