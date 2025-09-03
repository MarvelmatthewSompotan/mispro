import React, { useState, useEffect, useRef } from "react";
import styles from "./ProgramSection.module.css";
import Select from "react-select";
import { getRegistrationOptions } from "../../../services/api";

const ProgramSection = ({
  onDataChange,
  sharedData,
  prefill,
  errors,
  forceError,
}) => {
  const [sections, setSections] = useState([]);
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programOther, setProgramOther] = useState("");

  // Tambahkan ref untuk tracking apakah ini adalah prefill pertama kali
  const isInitialPrefill = useRef(true);
  const hasInitialized = useRef(false);

  // add near top-level of the component
  const OTHER = "OTHER";

  useEffect(() => {
    if (sharedData) {
      setSections(sharedData.sections || []);
      setMajors(sharedData.majors || []);
      setClasses(sharedData.classes || []);
      setPrograms(sharedData.programs || []);
    } else {
      getRegistrationOptions()
        .then((data) => {
          setSections(data.sections || []);
          setMajors(data.majors || []);
          setClasses(data.classes || []);
          setPrograms(data.programs || []);
        })
        .catch((err) => {
          console.error("Failed to fetch program options:", err);
        });
    }
  }, [sharedData]);

  // Prefill hanya sekali saat component pertama kali mount atau saat prefill berubah signifikan
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      // Jika ini prefill pertama kali atau prefill berubah signifikan
      if (isInitialPrefill.current || !hasInitialized.current) {
        console.log("Initial prefilling ProgramSection with:", prefill);

        if (prefill.section_id) setSelectedSection(prefill.section_id);
        if (prefill.major_id) setSelectedMajor(prefill.major_id);
        if (prefill.class_id) setSelectedClass(prefill.class_id);
        if (prefill.program_id) {
          setSelectedProgram(prefill.program_id);
        } else if (prefill.program_other) {
          setSelectedProgram(OTHER);
        }
        if (prefill.program_other) setProgramOther(prefill.program_other);

        hasInitialized.current = true;
        isInitialPrefill.current = false;
      }
    } else if (Object.keys(prefill).length === 0 && hasInitialized.current) {
      // Jika prefill menjadi empty object (reset form), reset semua field
      console.log("Resetting ProgramSection form");
      setSelectedSection("");
      setSelectedMajor("");
      setSelectedClass("");
      setSelectedProgram("");
      setProgramOther("");

      hasInitialized.current = false;
    }
  }, [prefill]);

  const handleSectionChange = (opt) => {
    const value = opt ? opt.value : "";

    // Jika user mengklik option yang sudah dipilih, batalkan pilihan
    if (selectedSection === value) {
      setSelectedSection("");
      setSelectedMajor("");
      setSelectedClass("");

      onDataChange({
        section_id: value,
        major_id: "",
        class_id: "",
        program_id: selectedProgram === OTHER ? null : selectedProgram,
        program_other: programOther,
      });
    } else {
      // Jika user memilih option baru
      setSelectedSection(value);

      // Auto-select grade berdasarkan section
      let autoGrade = "";
      const selectedSectionData = sections.find(
        (sec) => sec.section_id === value
      );

      if (selectedSectionData) {
        const sectionName = selectedSectionData.name;
        if (sectionName === "ECP") {
          autoGrade = "N";
        } else if (sectionName === "Elementary School") {
          autoGrade = "1";
        } else if (sectionName === "Middle School") {
          autoGrade = "7";
        } else if (sectionName === "High School") {
          autoGrade = "10";
        }
      }

      // Cari class_id yang sesuai dengan section dan grade
      let autoClass = "";
      if (autoGrade && value) {
        const autoClassData = classes.find(
          (cls) => cls.section_id === value && cls.grade === autoGrade
        );
        if (autoClassData) {
          autoClass = autoClassData.class_id;
          setSelectedClass(autoClassData.class_id);
        }
      } else {
        setSelectedClass("");
      }

      setSelectedMajor("");

      onDataChange({
        section_id: value,
        major_id: "",
        class_id: autoClass,
        program_id: selectedProgram === OTHER ? null : selectedProgram,
        program_other: programOther,
      });
    }
  };

  const handleMajorChange = (opt) => {
    const value = opt ? opt.value : "";
    setSelectedMajor(value);
    onDataChange({
      section_id: selectedSection,
      major_id: value,
      class_id: selectedClass,
      program_id: selectedProgram === OTHER ? null : selectedProgram,
      program_other: programOther,
    });
  };

  const handleClassChange = (opt) => {
    const value = opt ? opt.value : "";
    setSelectedClass(value);

    const selectedClassData = classes.find((c) => c.class_id === value);
    if (selectedClassData) {
      const gradeNum = parseInt(selectedClassData.grade);
      // Middle School grade 9 ke atas (termasuk grade 9) akan menampilkan major
      if (gradeNum < 9) {
        setSelectedMajor(1); // default ke No Major untuk ECP, Elementary, dan Middle School grade 7-8
      } else {
        setSelectedMajor(""); // Biarkan user pilih major untuk Middle School grade 9 dan High School
      }
    }

    onDataChange({
      section_id: selectedSection,
      major_id: selectedMajor,
      class_id: value,
      program_id: selectedProgram === OTHER ? null : selectedProgram,
      program_other: programOther,
    });
  };

  const handleProgramChange = (opt) => {
    const value = opt ? opt.value : "";

    // deselect if clicking the same radio
    if (selectedProgram === value) {
      setSelectedProgram("");
      setProgramOther("");
      onDataChange({
        section_id: selectedSection,
        major_id: selectedMajor,
        class_id: selectedClass,
        program_id: "",
        program_other: "",
      });
    } else {
      setSelectedProgram(value);

      if (value !== OTHER) {
        setProgramOther("");
        onDataChange({
          section_id: selectedSection,
          major_id: selectedMajor,
          class_id: selectedClass,
          program_id: value,
          program_other: "",
        });
      } else {
        onDataChange({
          section_id: selectedSection,
          major_id: selectedMajor,
          class_id: selectedClass,
          program_id: null,
          program_other: programOther,
        });
      }
    }
  };

  const sectionOptions = sections.map((sec) => ({
    value: sec.section_id,
    label: sec.name,
  }));

  const programOptions = programs.map((prog) => ({
    value: prog.name === "Other" ? OTHER : prog.program_id,
    label: prog.name,
  }));

  // Filter kelas berdasarkan section yang dipilih
  const gradeOptions = (() => {
    if (!selectedSection) return [];

    const selectedSectionData = sections.find(
      (sec) => sec.section_id === selectedSection
    );
    if (!selectedSectionData) return [];

    const sectionName = selectedSectionData.name;
    let gradeRange = [];

    // Tentukan range grade berdasarkan section
    if (sectionName === "ECP") {
      // ECP: grade N, K1, K2 (class_id 1-3)
      gradeRange = classes.filter((cls) =>
        ["N", "K1", "K2"].includes(cls.grade)
      );
    } else if (sectionName === "Elementary School") {
      // Elementary: grade 1-6 (class_id 4-9)
      gradeRange = classes.filter((cls) => {
        const grade = parseInt(cls.grade);
        return grade >= 1 && grade <= 6;
      });
    } else if (sectionName === "Middle School") {
      // Middle School: grade 7-9 (class_id 10-12)
      gradeRange = classes.filter((cls) => {
        const grade = parseInt(cls.grade);
        return grade >= 7 && grade <= 9;
      });
    } else if (sectionName === "High School") {
      // High School: grade 10-12 (class_id 13-15)
      gradeRange = classes.filter((cls) => {
        const grade = parseInt(cls.grade);
        return grade >= 10 && grade <= 12;
      });
    }

    // Convert ke format yang dibutuhkan Select component
    return gradeRange
      .map((cls) => ({
        value: cls.class_id,
        label: cls.grade,
      }))
      .sort((a, b) => {
        // Sort berdasarkan urutan grade yang benar
        const gradeOrder = ["N", "K1", "K2"];
        const idxA = gradeOrder.indexOf(a.label);
        const idxB = gradeOrder.indexOf(b.label);

        if (idxA !== -1 || idxB !== -1) {
          return idxA - idxB;
        }
        return parseInt(a.label) - parseInt(b.label);
      });
  })();

  const majorSelectOptions = majors
    .filter((mjr) => [2, 3].includes(mjr.major_id))
    .map((mjr) => ({
      value: mjr.major_id,
      label: mjr.name,
    }));

  const showMajor = (() => {
    if (!selectedClass) return false;

    const selectedClassData = classes.find((c) => c.class_id === selectedClass);
    if (selectedClassData) {
      const gradeNum = parseInt(selectedClassData.grade);
      // Tampilkan major untuk Middle School grade 9 ke atas (termasuk grade 9)
      return gradeNum >= 9;
    }
    return false;
  })();

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>PROGRAM</span>
      </div>
      <div className={styles.contentWrapper}>
        <div
          className={`${styles.programSection} ${
            errors?.section_id || forceError?.section_id
              ? styles.programSectionErrorWrapper
              : ""
          }`}
        >
          <div
            className={`${styles.sectionTitle} ${
              errors?.section_id || forceError?.section_id
                ? styles.programSectionErrorWrapper
                : ""
            }`}
          >
            <div
              className={`${styles.sectionTitleText} ${
                errors?.section_id || forceError?.section_id
                  ? styles.programSectionErrorLabel
                  : ""
              }`}
            >
              Section
            </div>
          </div>
          {sectionOptions.map((option) => (
            <div key={option.value} className={styles.optionItem}>
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
                  value={option.value}
                  checked={selectedSection === option.value}
                  onChange={() => handleSectionChange({ value: option.value })}
                  onClick={() => handleSectionChange({ value: option.value })}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {selectedSection === option.value && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span
                  className={`${styles.label} ${
                    errors?.section_id || forceError?.section_id
                  }`}
                >
                  {option.label}
                </span>
              </label>
            </div>
          ))}

          <div className={styles.sectionTitle}>
            <div
              className={`${styles.sectionTitleText} ${
                errors?.class_id || forceError?.class_id
                  ? styles.programSectionErrorLabel
                  : ""
              }`}
            >
              Grade
            </div>
          </div>
          <Select
            id="grade"
            options={gradeOptions}
            placeholder="Select grade"
            value={
              selectedClass
                ? gradeOptions.find((opt) => opt.value === selectedClass)
                : null
            }
            onChange={(opt) => handleClassChange(opt)}
            isClearable
          />

          {showMajor && (
            <>
              <div className={styles.sectionTitle}>
                <div
                  className={`${styles.sectionTitleText} ${
                    errors?.major_id || forceError?.major_id
                      ? styles.programSectionErrorLabel
                      : ""
                  }`}
                >
                  Major
                </div>
              </div>
              <Select
                id="major"
                options={majorSelectOptions}
                placeholder="Select major"
                value={
                  selectedMajor
                    ? majorSelectOptions.find(
                        (opt) => opt.value === selectedMajor
                      )
                    : null
                }
                onChange={(opt) => handleMajorChange(opt)}
                isClearable
              />
            </>
          )}
        </div>

        <div
          className={`${styles.programSection} ${
            errors?.program_id || forceError?.program_id
              ? styles.programSectionErrorWrapper
              : ""
          }`}
        >
          <div
            className={`${styles.sectionTitle} ${
              errors?.program_id || forceError?.program_id
                ? styles.programSectionErrorWrapper
                : ""
            }`}
          >
            <div
              className={`${styles.sectionTitleText} ${
                errors?.program_id || forceError?.program_id
                  ? styles.programSectionErrorLabel
                  : ""
              }`}
            >
              Program
            </div>
          </div>
          {programOptions.map((option) => (
            <div key={option.value} className={styles.optionItem}>
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
                  value={option.value}
                  checked={selectedProgram === option.value}
                  onChange={() => handleProgramChange({ value: option.value })}
                  onClick={() => handleProgramChange({ value: option.value })}
                  style={{
                    opacity: 0,
                    position: "absolute",
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {selectedProgram === option.value && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span
                  className={`${styles.label} ${
                    errors?.program_id || forceError?.program_id
                  }`}
                >
                  {option.label}
                </span>
                {option.label === "Other" &&
                  selectedProgram === option.value && (
                    <input
                      className={styles.valueRegular}
                      type="text"
                      value={programOther}
                      onChange={(e) => {
                        const value = e.target.value;
                        setProgramOther(value);
                        onDataChange({
                          section_id: selectedSection,
                          major_id: selectedMajor,
                          class_id: selectedClass,
                          program_id: null,
                          program_other: value,
                        });
                      }}
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
