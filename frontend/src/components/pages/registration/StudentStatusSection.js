import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import {
  searchStudent,
  getStudentLatestApplication,
  getRegistrationOptions,
} from '../../../services/api';
import styles from './StudentStatusSection.module.css';

const StudentStatusSection = ({
  onSelectOldStudent,
  onDataChange,
  sharedData,
}) => {
  const [status, setStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Use shared data if available, otherwise fetch separately
  useEffect(() => {
    if (sharedData) {
      setStatusOptions(sharedData.student_status || []);
    } else {
      // Fallback to individual API call if shared data not available
      getRegistrationOptions()
        .then((data) => {
          setStatusOptions(data.student_status || []);
        })
        .catch((err) => {
          console.error('Failed to fetch student status options:', err);
        });
    }
  }, [sharedData]);

  const handleStatusChange = (option) => {
    setStatus(option);
    setStudentSearch('');
    setSearchResults([]);
    setSelectedStudent(null);

    // Kirim data ke parent component dengan input_name
    if (onDataChange) {
      onDataChange({
        student_status: option,
        input_name: option === 'Old' ? '' : null,
      });
    }
  };

  const handleSearchChange = async (value) => {
    setStudentSearch(value);

    // Update input_name setiap kali user mengetik
    if (onDataChange) {
      onDataChange({
        student_status: 'Old',
        input_name: '',
      });
    }

    if (value && value.length > 2) {
      setIsSearching(true);
      try {
        const results = await searchStudent(value);
        setSearchResults(results);
      } catch (err) {
        console.error('Error searching student:', err);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
    }
  };

  const handleSelectStudent = async (student) => {
    setStudentSearch(student.full_name || student.student_id);
    setSelectedStudent(student);
    setSearchResults([]);
    setIsSearching(true);

    try {
      // IMPORTANT: Update studentStatus FIRST dengan input_name
      if (onDataChange) {
        onDataChange({
          student_status: 'Old',
          input_name: student.student_id,
        });
      }

      const latestData = await getStudentLatestApplication(student.student_id);
      if (latestData.success && latestData.data) {
        console.log('Received application data:', latestData.data);

        // Kemudian kirim data ke parent untuk prefill semua form fields
        onSelectOldStudent(latestData.data);
      } else {
        console.error(
          'No application data found for student:',
          student.student_id
        );
        // Handle case ketika tidak ada data application
        // Tidak perlu onDataChange lagi karena sudah di atas
      }
    } catch (err) {
      console.error('Error getting latest application:', err);
      // Handle error case
      // Tidak perlu onDataChange lagi karena sudah di atas
    } finally {
      setIsSearching(false);
    }
  };

  // Convert search results to react-select options format
  const studentOptions = searchResults.map(student => ({
    value: student.student_id,
    label: `${student.full_name} (${student.student_id})`,
    student: student
  }));

  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      border: 'none',
      borderBottom: '1px solid #000',
      borderRadius: 0,
      boxShadow: 'none',
      background: 'transparent',
      '&:hover': {
        borderBottom: '1px solid #000',
      },
    }),
    input: (provided) => ({
      ...provided,
      fontFamily: 'Poppins, Arial, sans-serif',
      fontWeight: 'bold',
      fontSize: 16,
      color: '#000',
    }),
    placeholder: (provided) => ({
      ...provided,
      fontFamily: 'Poppins, Arial, sans-serif',
      fontWeight: 400,
      fontSize: 16,
      color: 'rgba(128, 128, 128, 0.6)',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#5f84fe' : state.isFocused ? '#f5f5f5' : 'white',
      color: state.isSelected ? 'white' : '#333',
      fontFamily: 'Poppins, Arial, sans-serif',
      fontSize: 14,
      cursor: 'pointer',
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 1000,
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    }),
    singleValue: (provided) => ({
      ...provided,
      fontFamily: 'Poppins, Arial, sans-serif',
      fontWeight: 'bold',
      fontSize: 16,
      color: '#000',
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT'S STATUS</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.statusOptions}>
          {/* New and Transferee options first */}
          {statusOptions.filter(option => option !== 'Old').map((option) => (
            <div
              key={option}
              className={option === 'New' ? styles.optionNew : styles.optionTransferee}
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
            </div>
          ))}

          {/* Old student option last (on the right) */}
          {statusOptions.includes('Old') && (
            <div className={styles.optionOld}>
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
                  value='Old'
                  checked={status === 'Old'}
                  onChange={() => handleStatusChange('Old')}
                  style={{
                    opacity: 0,
                    position: 'absolute',
                    width: 0,
                    height: 0,
                  }}
                />
                <span className={styles.radioButton}>
                  <span className={styles.radioButtonCircle} />
                  {status === 'Old' && (
                    <span className={styles.radioButtonSelected} />
                  )}
                </span>
                <span className={styles.statusLabel}>Old</span>
              </label>

              {/* Show searchable dropdown only for Old student status */}
              {status === 'Old' && (
                <div className={styles.studentIdField}>
                  <label htmlFor='studentSearch' className={styles.statusLabel}>
                    Search Student
                  </label>
                  <Select
                    id='studentSearch'
                    className={styles.studentSelect}
                    placeholder='Search by name or ID...'
                    isSearchable={true}
                    isClearable={true}
                    options={studentOptions}
                    value={selectedStudent ? {
                      value: selectedStudent.student_id,
                      label: `${selectedStudent.full_name} (${selectedStudent.student_id})`
                    } : null}
                    onChange={(option) => {
                      if (option) {
                        handleSelectStudent(option.student);
                      } else {
                        setSelectedStudent(null);
                        setStudentSearch('');
                        if (onDataChange) {
                          onDataChange({
                            student_status: 'Old',
                            input_name: '',
                          });
                        }
                      }
                    }}
                    onInputChange={(inputValue) => {
                      handleSearchChange(inputValue);
                    }}
                    isLoading={isSearching}
                    noOptionsMessage={() => 'No students found'}
                    styles={customSelectStyles}
                  />
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
