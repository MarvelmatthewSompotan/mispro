import React, { useState, useRef, useEffect } from 'react';
import styles from './PopUpForm.module.css';
import {
  startRegistration,
  getRegistrationOptions,
  addSchoolYear,
} from '../../../../services/api';
import Button from '../../../atoms/Button';

const CustomSelect = ({ options, value, onChange, placeholder, disabled }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

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

// --- PERUBAHAN DI SINI: Menambahkan prop `initialData` dan `isEditMode` ---
const PopUpForm = ({
  onClose,
  onCreate,
  type = 'registration',
  initialData, // Data untuk mengisi form (mode edit)
  isEditMode = false, // Penanda mode edit
}) => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    schoolYears: [],
    semesters: [],
    roles: [],
  });

  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('');
  const [date, setDate] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);

  // --- PERUBAHAN DI SINI: Isi state dari `initialData` jika ada ---
  const [username, setUsername] = useState(initialData?.username || '');
  const [name, setName] = useState(initialData?.full_name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [password, setPassword] = useState(''); // Password selalu kosong saat edit
  const [role, setRole] = useState(initialData?.role || '');

  const resetForm = () => {
    setSchoolYear('');
    setSemester('');
    setDate(new Date().toISOString().split('T')[0]);
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

  // --- PERUBAHAN DI SINI: Logika `handleSubmit` untuk membedakan Create vs Edit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === 'registration') {
        // ... (Logika registrasi tidak diubah) ...
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
        // Siapkan data payload
        const userData = { username, full_name: name, email, role };

        if (isEditMode) {
          // --- LOGIKA UNTUK EDIT ---
          // Hanya tambahkan password jika diisi (opsional)
          if (password) {
            userData.password = password;
          }
          // Panggil onCreate (yaitu handleUpdateUser)
          // handleUpdateUser tidak butuh resetForm
          await onCreate(userData);
          
        } else {
          // --- LOGIKA UNTUK CREATE (KODE ASLI ANDA) ---
          // Validasi password (wajib untuk user baru)
          if (!username || !name || !email || !password || !role) {
            setLoading(false);
            // Kita gunakan 'alert' di sini agar konsisten dengan kode asli
            return alert('Please fill all fields');
          }
          userData.password = password; // Tambahkan password ke payload
          // Panggil onCreate (yaitu handleAddUser)
          await onCreate(userData, resetForm);
        }
      }
    } catch (err) {
      console.error(err);
      // Biarkan error handling (popup) dilakukan oleh parent (Users.js)
      // kecuali untuk 'alert' yang sudah ada
      if (
        !err.message.includes('HTTP error') &&
        !err.message.includes('Failed to fetch')
      ) {
        alert('An error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

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

  const schoolYearOptions = mapOptions(
    options.schoolYears,
    'school_year_id',
    'year'
  );
  const semesterOptions = mapOptions(options.semesters, 'semester_id', 'name');
  const roleOptions = mapRoleOptions(options.roles);

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
        {/* --- PERUBAHAN DI SINI: Judul dinamis --- */}
        <div className={styles.createNewRegistration}>
          {type === 'registration'
            ? 'Create New Registration'
            : isEditMode
            ? 'Edit User'
            : 'Create new user'}
        </div>

        {type === 'registration' ? (
          <div className={styles.frameParent}>
            {/* ... (Form registrasi tidak diubah) ... */}
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

            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder='Select Semester'
                value={semester}
                options={semesterOptions}
                onChange={(val) => setSemester(val)}
              />
            </div>

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
            {/* ... (Field Username, Full Name, Email tidak diubah) ... */}
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
            <div className={styles.fieldWrapper}>
              {/* --- PERUBAHAN DI SINI: Placeholder & required dinamis --- */}
              <input
                className={styles.textInput}
                type='password'
                placeholder={
                  isEditMode
                    ? 'New Password (leave blank to keep)'
                    : 'User Password'
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required={!isEditMode} // Password HANYA wajib jika BUKAN mode edit
                autoComplete='new-password'
              />
            </div>

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
          {/* --- PERUBAHAN DI SINI: Teks tombol dinamis --- */}
          <Button
            type='submit'
            variant='solid'
            disabled={loading || isAddingYear}
            className={loading ? styles.loadingButton : ''}
          >
            {loading
              ? 'Processing...'
              : isAddingYear
              ? 'Adding...'
              : isEditMode
              ? 'Update'
              : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;