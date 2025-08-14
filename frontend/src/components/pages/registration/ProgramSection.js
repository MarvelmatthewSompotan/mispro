import React, { useState, useEffect } from 'react';
import styles from './ProgramSection.module.css';
import Select from 'react-select';
import { getRegistrationOptions } from '../../../services/api';

const ProgramSection = ({ onDataChange, sharedData }) => {
  const [sections, setSections] = useState([]);
  const [majors, setMajors] = useState([]);
  const [classes, setClasses] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [selectedSection, setSelectedSection] = useState('');
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');
  const [programOther, setProgramOther] = useState('');

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
          console.error('Failed to fetch program options:', err);
        });
    }
  }, [sharedData]);

  const handleSectionChange = (opt) => {
    const value = opt ? opt.value : '';
    setSelectedSection(value);
    setSelectedMajor('');
    setSelectedClass('');

    onDataChange({
      section_id: value,
      major_id: '',
      class_id: '',
      program_id: selectedProgram,
      program_other: programOther,
    });
  };

  const handleMajorChange = (opt) => {
    const value = opt ? opt.value : '';
    setSelectedMajor(value);
    onDataChange({
      section_id: selectedSection,
      major_id: value,
      class_id: selectedClass,
      program_id: selectedProgram,
      program_other: programOther,
    });
  };

  const handleClassChange = (opt) => {
    const value = opt ? opt.value : '';
    setSelectedClass(value);

    const selectedClassData = classes.find((c) => c.class_id === value);
    if (selectedClassData) {
      const gradeNum = parseInt(selectedClassData.grade);
      if (gradeNum < 9) {
        setSelectedMajor(1); // default ke No Major
      }
    }

    onDataChange({
      section_id: selectedSection,
      major_id: selectedMajor,
      class_id: value,
      program_id: selectedProgram,
      program_other: programOther,
    });
  };

  const handleProgramChange = (opt) => {
    const value = opt ? opt.value : '';
    setSelectedProgram(value);
    onDataChange({
      section_id: selectedSection,
      major_id: selectedMajor,
      class_id: selectedClass,
      program_id: value,
      program_other: value === 'Other' ? programOther : '',
    });
    if (value !== 'Other') {
      setProgramOther('');
    }
  };

  const sectionOptions = sections.map((sec) => ({
    value: sec.section_id,
    label: sec.name,
  }));

  const programOptions = programs.map((prog) => ({
    value: prog.name === 'Other' ? 'Other' : prog.program_id,
    label: prog.name,
  }));

  // Filter kelas berdasarkan section_id saja dan hilangkan duplikat grade
  const gradeOptions = classes
    .filter((cls) =>
      selectedSection ? cls.section_id === selectedSection : true
    )
    .reduce((unique, cls) => {
      if (!unique.find((item) => item.label === cls.grade)) {
        unique.push({
          value: cls.class_id,
          label: cls.grade,
        });
      }
      return unique;
    }, [])
    .sort((a, b) => {
      const gradeOrder = ['N', 'K1', 'K2'];
      const idxA = gradeOrder.indexOf(a.label);
      const idxB = gradeOrder.indexOf(b.label);
      if (idxA !== -1 || idxB !== -1) {
        return idxA - idxB;
      }
      return parseInt(a.label) - parseInt(b.label);
    });

  const majorSelectOptions = majors
    .filter((mjr) => [2, 3].includes(mjr.major_id))
    .map((mjr) => ({
      value: mjr.major_id,
      label: mjr.name,
    }));

  const showMajor = (() => {
    const selectedClassData = classes.find((c) => c.class_id === selectedClass);
    if (selectedClassData) {
      const gradeNum = parseInt(selectedClassData.grade);
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
        <div className={styles.programSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Section</div>
          </div>
          {sectionOptions.map((option) => (
            <div key={option.value} className={styles.optionItem}>
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
                  name='section'
                  value={option.value}
                  checked={selectedSection === option.value}
                  onChange={() => handleSectionChange({ value: option.value })}
                  style={{
                    opacity: 0,
                    position: 'absolute',
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
                <span className={styles.label}>{option.label}</span>
              </label>
            </div>
          ))}

          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Grade</div>
          </div>
          <Select
            id='grade'
            options={gradeOptions}
            placeholder='Select grade'
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
                <div className={styles.sectionTitleText}>Major</div>
              </div>
              <Select
                id='major'
                options={majorSelectOptions}
                placeholder='Select major'
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

        <div className={styles.programSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Program</div>
          </div>
          {programOptions.map((option) => (
            <div key={option.value} className={styles.optionItem}>
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
                  name='program'
                  value={option.value}
                  checked={selectedProgram === option.value}
                  onChange={() => handleProgramChange({ value: option.value })}
                  style={{
                    opacity: 0,
                    position: 'absolute',
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
                <span className={styles.label}>{option.label}</span>
                {option.label === 'Other' &&
                  selectedProgram === option.value && (
                    <input
                      className={styles.valueRegular}
                      type='text'
                      value={programOther}
                      onChange={(e) => {
                        const value = e.target.value;
                        setProgramOther(value);
                        onDataChange({
                          section_id: selectedSection,
                          major_id: selectedMajor,
                          class_id: selectedClass,
                          program_id: selectedProgram,
                          program_other: value,
                        });
                      }}
                      placeholder='Enter other program'
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
