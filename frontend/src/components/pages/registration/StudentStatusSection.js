import React, { useState, useEffect } from 'react';
import {
  searchStudent,
  getStudentLatestApplication,
  getRegistrationOptions,
} from '../../../services/api';
import styles from './StudentStatusSection.module.css';

const StudentStatusSection = ({ onSelectOldStudent, onDataChange, sharedData }) => {
  const [status, setStatus] = useState('');
  const [statusOptions, setStatusOptions] = useState([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

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

    // Kirim data ke parent component
    if (onDataChange) {
      onDataChange({ student_status: option });
    }
  };

  const handleSearchChange = async (value) => {
    setStudentSearch(value);
    if (value.length > 2) {
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
    setSearchResults([]);
    setIsSearching(true);

    try {
      const latestData = await getStudentLatestApplication(student.student_id);
      if (latestData.success) {
        // Kirim data ke parent untuk prefill semua form fields
        onSelectOldStudent(latestData.data);
      }
    } catch (err) {
      console.error('Error getting latest application:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT'S STATUS</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.statusOptions}>
          {statusOptions.map((option) => (
            <div
              key={option}
              className={option === 'Old' ? styles.optionOld : styles.optionNew}
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

              {/* Show search field only for Old student status */}
              {option === 'Old' && status === 'Old' && (
                <div className={styles.studentIdField}>
                  <label htmlFor='studentSearch' className={styles.statusLabel}>
                    Search Student
                  </label>
                  <input
                    id='studentSearch'
                    className={styles.studentIdValue}
                    type='text'
                    value={studentSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder='Enter Name or ID'
                    style={{
                      border: 'none',
                      outline: 'none',
                      background: 'transparent',
                      fontFamily: 'Poppins, Arial, sans-serif',
                      fontWeight: 'bold',
                      fontSize: 16,
                      padding: 3,
                      margin: 0,
                    }}
                  />
                  {isSearching && (
                    <div className={styles.searching}>Searching...</div>
                  )}
                  {searchResults.length > 0 && (
                    <ul className={styles.searchDropdown}>
                      {searchResults.map((student) => (
                        <li
                          key={student.student_id}
                          onClick={() => handleSelectStudent(student)}
                          className={styles.searchItem}
                        >
                          {student.full_name} ({student.student_id})
                        </li>
                      ))}
                    </ul>
                  )}
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
