import React, { useState, useRef, useEffect } from 'react';
import styles from './PopUpForm.module.css';
import {
  startRegistration,
  getRegistrationOptions,
  addSchoolYear,
} from '../../../../services/api';
import Button from '../../../atoms/Button';

// --- Komponen Dropdown Kustom ---
// Dibuat di dalam file yang sama agar mudah
const CustomSelect = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Helper untuk menutup dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getLabelForValue = (val) => {
    const option = options.find((opt) => opt.value === val);
    return option ? option.label : placeholder;
  };

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const selectedLabel = getLabelForValue(value);

  return (
    <div
      className={styles.customSelectContainer}
      ref={selectRef}
      data-disabled={disabled}
    >
      <div
        className={`${styles.selectInput} ${!value ? styles.placeholder : ''}`}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        {selectedLabel}
      </div>

      {isOpen && (
        <div className={styles.optionsMenu}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`${styles.optionItem} ${
                opt.value === 'add_new' ? styles.addMoreOption : ''
              } ${value === opt.value ? styles.selectedOption : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
// --- Akhir Komponen Dropdown Kustom ---

const PopUpForm = ({ onClose, onCreate, type = 'registration' }) => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    schoolYears: [],
    semesters: [],
    roles: [],
  });

  // State fields tetap sama
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('');
  const [date, setDate] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);

  // User fields
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');

  const schoolYearRef = useRef(null);
  const semesterRef = useRef(null);
  const dateRef = useRef(null);
  const usernameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const roleRef = useRef(null);

  // Panggil helper styling untuk setiap field
  useInputStyling(schoolYearRef, schoolYear);
  useInputStyling(semesterRef, semester);
  useInputStyling(dateRef, date);

  // Styling untuk fields User
  useInputStyling(usernameRef, username);
  useInputStyling(emailRef, email);
  useInputStyling(passwordRef, password);
  useInputStyling(roleRef, role);

  const resetForm = () => {
    setSchoolYear('');
    setSemester('');
    setDate(new Date().toISOString().split('T')[0]); // Reset date ke hari ini
    setUsername('');
    setName('');
    setEmail('');
    setPassword('');
    setRole('');
    formRef.current?.reset();
  };

  const fetchOptions = async () => {
    try {
      const data = await getRegistrationOptions();
      setOptions({
        schoolYears: data.school_years || [],
        semesters: data.semesters || [],
        roles: data.roles || [],
      });
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (type === 'registration') {
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [type]);

  const handleAddNewSchoolYear = async () => {
    setIsAddingYear(true);
    try {
      const newYear = await addSchoolYear();
      await fetchOptions();
      if (newYear?.school_year_id) {
        setSchoolYear(newYear.school_year_id);
      }
    } catch (err) {
      alert('Failed to add new school year');
    } finally {
      setIsAddingYear(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'registration') {
        if (!schoolYear || !semester) {
          setLoading(false);
          return alert('Please fill all fields');
        }
        const res = await startRegistration(schoolYear, semester);
        if (res.success) {
          onCreate(
            {
              schoolYear,
              semester,
              date: res.data.registration_date,
              draftId: res.data.draft_id,
            },
            resetForm
          );
        } else {
          alert('Failed to start registration');
        }
      } else if (type === 'user') {
        if (!username || !email || !password || !role) {
          setLoading(false);
          return alert('Please fill all fields');
        }
        // <-- TASK 3: Tambahkan 'name' ke data yang dikirim
        await onCreate({ username, name, email, password, role }, resetForm);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // --- Helper untuk mapping options ---
  const mapOptions = (optionsArray, valueKey, labelKey) => {
    return optionsArray.map((opt) => ({
      value: opt[valueKey],
      label: opt[labelKey],
    }));
  };

  const mapRoleOptions = (optionsArray) => {
    return optionsArray.map((r) => ({
      value: r,
      label: r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' '),
    }));
  };

  // Map options untuk Select
  const schoolYearOptions = mapOptions(
    options.schoolYears,
    'school_year_id',
    'year'
  );
  const semesterOptions = mapOptions(options.semesters, 'semester_id', 'name');
  const roleOptions = mapRoleOptions(options.roles);

  // Gabungkan "Add more" ke school year
  const allSchoolYearOptions = [
    ...schoolYearOptions,
    { value: 'add_new', label: '+ Add more' },
  ];

  return (
    <div className={styles.overlay}>
      <form
        className={styles.popUpForm}
        onSubmit={handleSubmit}
        ref={formRef}
        autoComplete='off'
      >
        <div className={styles.createNewRegistration}>
          {type === 'registration' ? 'Create New Registration' : 'Add New User'}
        </div>

        {type === 'registration' ? (
          <div className={styles.frameParent}>
            {/* School Year (Dropdown Kustom) */}
            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder='Select Year'
                value={schoolYear}
                options={allSchoolYearOptions}
                onChange={(val) => {
                  if (val === 'add_new') {
                    handleAddNewSchoolYear();
                  } else {
                    setSchoolYear(val);
                  }
                }}
                disabled={isAddingYear}
              />
            </div>

            {/* Semester (Dropdown Kustom) */}
            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder='Select Semester'
                value={semester}
                options={semesterOptions}
                onChange={(val) => setSemester(val)}
              />
            </div>

            {/* Date (Tetap sama) */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.dateField}
                type='date'
                value={date}
                readOnly
              />
            </div>
          </div>
        ) : (
          <div className={styles.frameParent}>
            {/* Username (Tetap sama) */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete='new-password'
              />
            </div>

            {/* --- TASK 3: INPUT FIELD "FULL NAME" BARU --- */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type='text'
                placeholder='Full Name'
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete='name'
              />
            </div>
            {/* ------------------------------------------- */}

            {/* User Email */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type='email'
                placeholder='User Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='new-password'
              />
            </div>
            {/* User Password (Tetap sama) */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type='password'
                placeholder='User Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='new-password'
              />
            </div>

            {/* Role (Dropdown Kustom) */}
            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder='Select Role'
                value={role}
                options={roleOptions}
                onChange={(val) => setRole(val)}
              />
            </div>
          </div>
        )}

        <div className={styles.bAddSubjectParent}>
          <Button onClick={onClose} variant='outline'>
            Cancel
          </Button>
          <Button
            type='submit'
            variant='solid'
            disabled={loading || isAddingYear}
            className={loading ? styles.loadingButton : ''}
          >
            {loading ? 'Processing...' : isAddingYear ? 'Adding...' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;
