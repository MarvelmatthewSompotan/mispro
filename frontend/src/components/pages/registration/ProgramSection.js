import React, { useState, useEffect } from "react";
import styles from "./ProgramSection.module.css";
import Select from "react-select";
import { getRegistrationOptions } from "../../../services/api";

const ProgramSection = ({ onDataChange, sharedData, prefill, errors }) => {
  // --- STATE LOKAL ---
  const [sections, setSections] = useState([]);
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [selectedSection, setSelectedSection] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedProgram, setSelectedProgram] = useState("");
  const [programOther, setProgramOther] = useState("");

  const OTHER = "OTHER";

  // --- LOGIKA UTAMA ---

  // 1. Mengambil data opsi dari API (tidak berubah)
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

  // 2. Mengisi data dari prefill (disederhanakan)
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      setSelectedSection(prefill.section_id || "");
      setSelectedMajor(prefill.major_id || "");
      setSelectedClass(prefill.class_id || "");
      if (prefill.program_id) {
        setSelectedProgram(prefill.program_id);
      } else if (prefill.program_other) {
        setSelectedProgram(OTHER);
      }
      setProgramOther(prefill.program_other || "");
    }
  }, [prefill]);

  // 3. [PERBAIKAN UTAMA #1] useEffect terpusat untuk sinkronisasi data
  //    Tugasnya hanya satu: mengirim data terbaru ke parent setiap ada perubahan.
  useEffect(() => {
    const dataToSync = {
      section_id: selectedSection,
      major_id: selectedMajor,
      class_id: selectedClass,
      program_id: selectedProgram === OTHER ? null : selectedProgram,
      program_other: programOther,
    };
    onDataChange(dataToSync);
    // eslint-disable-next-line
  }, [
    selectedSection,
    selectedMajor,
    selectedClass,
    selectedProgram,
    onDataChange,
  ]);

  // --- HANDLERS (FUNGSI UNTUK INTERAKSI USER) ---
  // Tugasnya hanya mengubah state lokal. Tidak perlu panggil onDataChange lagi.

  // [PERBAIKAN UTAMA #2] Handler radio button diperbaiki
  const handleSectionChange = (e, value) => {
    e.preventDefault();
    const newSection = selectedSection === value ? "" : value;
    setSelectedSection(newSection);

    // Reset fields lain jika section diubah
    if (selectedSection !== newSection) {
      setSelectedClass("");
      setSelectedMajor("");
    }
  };

  const handleProgramChange = (e, value) => {
    e.preventDefault();
    const newProgram = selectedProgram === value ? "" : value;
    setSelectedProgram(newProgram);

    // Reset input "Other" jika program lain dipilih
    if (newProgram !== OTHER) {
      setProgramOther("");
    }
  };

  const handleProgramOtherChange = (e) => {
    // Hanya update state lokal, tidak memicu onDataChange
    setProgramOther(e.target.value);
  };

  const handleProgramOtherBlur = () => {
    // Baru kirim data ke parent saat user selesai mengetik
    const dataToSync = {
      section_id: selectedSection,
      major_id: selectedMajor,
      class_id: selectedClass,
      program_id: selectedProgram === OTHER ? null : selectedProgram,
      program_other: programOther,
    };
    onDataChange(dataToSync);
  };


  const handleClassChange = (opt) => {
    const value = opt ? opt.value : "";
    setSelectedClass(value);

    // Jika grade dikosongkan, major juga kosong
    if (!value) {
      setSelectedMajor("");
      return;
    }

    // Logika untuk auto-select "No Major" di grade < 9
    const selectedClassData = classes.find((c) => c.class_id === value);
    if (selectedClassData) {
      const gradeNum = parseInt(selectedClassData.grade, 10);
      if (gradeNum < 9) {
        const noMajor = majors.find((mjr) => mjr.name === "No Major");
        setSelectedMajor(noMajor ? noMajor.major_id : "");
      } else {
        setSelectedMajor("");
      }
    }
  };

  const handleMajorChange = (opt) => {
    setSelectedMajor(opt ? opt.value : "");
  };

  // --- OPSI & LOGIKA TAMPILAN (TIDAK BERUBAH) ---
  // Semua kode di bawah ini sudah benar dan tidak perlu diubah.

  const sectionOptions = sections.map((sec) => ({
    value: sec.section_id,
    label: sec.name,
  }));

  const programOptions = programs.map((prog) => ({
    value: prog.name === "Other" ? OTHER : prog.program_id,
    label: prog.name,
  }));

  const gradeOptions = (() => {
    if (!selectedSection) return [];
    const selectedSectionData = sections.find(
      (sec) => sec.section_id === selectedSection
    );
    if (!selectedSectionData) return [];

    const sectionName = selectedSectionData.name;
    let gradeRange = [];

    if (sectionName === "ECP") {
      gradeRange = classes.filter((cls) =>
        ["N", "K1", "K2"].includes(cls.grade)
      );
    } else if (sectionName === "Elementary School") {
      gradeRange = classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 1 && grade <= 6;
      });
    } else if (sectionName === "Middle School") {
      gradeRange = classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 7 && grade <= 9;
      });
    } else if (sectionName === "High School") {
      gradeRange = classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 10 && grade <= 12;
      });
    }

    return gradeRange
      .map((cls) => ({ value: cls.class_id, label: cls.grade }))
      .sort((a, b) => {
        const gradeOrder = ["N", "K1", "K2"];
        const idxA = gradeOrder.indexOf(a.label);
        const idxB = gradeOrder.indexOf(b.label);
        if (idxA !== -1 || idxB !== -1) {
          return idxA - idxB;
        }
        return parseInt(a.label, 10) - parseInt(b.label, 10);
      });
  })();

  const majorSelectOptions = majors
    .filter((mjr) => mjr.name !== "No Major")
    .map((mjr) => ({
      value: mjr.major_id,
      label: mjr.name,
    }));

  const showMajor = (() => {
    if (!selectedClass) return false;
    const selectedClassData = classes.find((c) => c.class_id === selectedClass);
    if (selectedClassData) {
      const gradeNum = parseInt(selectedClassData.grade, 10);
      return !isNaN(gradeNum) && gradeNum >= 9;
    }
    return false;
  })();

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>PROGRAM</span>
      </div>
      <div className={styles.contentWrapper}>
        {/* --- BAGIAN SECTION & GRADE --- */}
        <div
          className={`${styles.programSection} ${
            errors?.section_id ? styles.programSectionErrorWrapper : ""
          }`}
        >
          <div className={styles.sectionTitle}>
            <div
              className={`${styles.sectionTitleText} ${
                errors?.section_id ? styles.programSectionErrorLabel : ""
              }`}
            >
              Section
            </div>
          </div>
          {sectionOptions.map((option) => (
            <div key={option.value} className={styles.optionItem}>
              <label
                className={styles.radioLabel}
                onClick={(e) => handleSectionChange(e, option.value)}
              >
                <input
                  type="radio"
                  name="section"
                  value={option.value}
                  checked={selectedSection === option.value}
                  readOnly
                  className={styles.hiddenRadio}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {selectedSection === option.value && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.label}>{option.label}</span>
              </label>
            </div>
          ))}

          <div className={styles.gradeField}>
            <div
              className={`${styles.sectionTitleText} ${
                errors?.class_id ? styles.programSectionErrorLabel : ""
              }`}
            >
              Grade
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
              onChange={handleClassChange}
              isClearable
              isDisabled={!selectedSection}
              classNamePrefix={
                errors?.class_id ? "react-select-error" : "react-select"
              }
              // Menambahkan styles agar transparan & tanpa border, sesuai style awal Anda
              styles={{
                control: (base) => ({
                  ...base,
                  border: 0,
                  boxShadow: "none",
                  backgroundColor: "transparent",
                  width: "150px", // Sesuaikan lebar jika perlu
                }),
              }}
            />
          </div>

          {showMajor && (
            <div className={styles.majorField}>
              <div
                className={`${styles.sectionTitleText} ${
                  errors?.major_id ? styles.programSectionErrorLabel : ""
                }`}
              >
                Major
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
                onChange={handleMajorChange}
                isClearable
                classNamePrefix={
                  errors?.major_id ? "react-select-error" : "react-select"
                }
                // Menambahkan styles agar transparan & tanpa border
                styles={{
                  control: (base) => ({
                    ...base,
                    border: 0,
                    boxShadow: "none",
                    backgroundColor: "transparent",
                    width: "200px", // Sesuaikan lebar jika perlu
                    
                  }),
                }}
              />
            </div>
          )}
        </div>

        {/* --- BAGIAN PROGRAM --- */}
        <div
          className={`${styles.programSection} ${
            errors?.program_id ? styles.programSectionErrorWrapper : ""
          }`}
        >
          <div className={styles.sectionTitle}>
            <div
              className={`${styles.sectionTitleText} ${
                errors?.program_id ? styles.programSectionErrorLabel : ""
              }`}
            >
              Program
            </div>
          </div>
          {programOptions.map((option) => (
            <div key={option.value} className={styles.optionItem}>
              <label
                className={styles.radioLabel}
                onClick={(e) => handleProgramChange(e, option.value)}
              >
                <input
                  type="radio"
                  name="program"
                  value={option.value}
                  checked={selectedProgram === option.value}
                  readOnly
                  className={styles.hiddenRadio}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {selectedProgram === option.value && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.label}>{option.label}</span>
                {option.value === OTHER && selectedProgram === OTHER && (
                  <input
                    className={styles.valueRegular}
                    type="text"
                    value={programOther}
                    onBlur={handleProgramOtherBlur} 
                    onClick={(e) => e.stopPropagation()}
                    onChange={handleProgramOtherChange}
                    placeholder="Enter other program"
                    style={{
                      marginLeft: 12,
                      padding: 0,
                      border: "none",
                      background: "transparent",
                      borderBottom: "1px solid #ccc",
                    }}
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
