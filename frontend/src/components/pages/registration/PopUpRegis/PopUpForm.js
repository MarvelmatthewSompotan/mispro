import React, { useState, useRef, useEffect } from 'react';
import styles from './PopUpForm.module.css';
import {
  startRegistration,
  getRegistrationOptions,
  addSchoolYear,
} from '../../../../services/api';
import Button from '../../../atoms/Button';

const useInputStyling = (ref, value) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.classList.toggle(styles.hasValue, !!value);
    }
  }, [value]);
};

const PopUpForm = ({ onClose, onCreate, type = 'registration' }) => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    schoolYears: [],
    semesters: [],
    roles: [],
  });

  // Registration fields
  const [schoolYear, setSchoolYear] = useState('');
  const [semester, setSemester] = useState('');
  const [date, setDate] = useState('');
  const [isAddingYear, setIsAddingYear] = useState(false);

  // User fields
  const [username, setUsername] = useState('');
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
    const interval = setInterval(fetchOptions, 5000);
    return () => clearInterval(interval);
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
      fetchOptions();
      if (newYear?.school_year_id) setSchoolYear(newYear.school_year_id);
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
        if (!schoolYear || !semester) return alert('Please fill all fields');
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
          setLoading(false); // Matikan loading jika validasi gagal
          return alert('Please fill all fields');
        }
        onCreate({ username, email, password, role }, resetForm);
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

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
            {/* School Year */}
            <div className={styles.fieldWrapper}>
              <select
                ref={schoolYearRef} // <-- REF BARU
                className={styles.schoolYear} // <-- CLASS DARI CSS LAMA
                value={schoolYear}
                onChange={(e) =>
                  e.target.value === 'add_new'
                    ? handleAddNewSchoolYear()
                    : setSchoolYear(e.target.value)
                }
                disabled={isAddingYear}
                required
              >
                <option value=''>Select Year</option>
                {options.schoolYears.map((sy) => (
                  <option key={sy.school_year_id} value={sy.school_year_id}>
                    {sy.year}
                  </option>
                ))}
                <option value='add_new' style={{ color: 'var(--main-accent)' }}>
                  + Add more
                </option>
              </select>
            </div>

            {/* Semester */}
            <div className={styles.fieldWrapper}>
              <select
                ref={semesterRef} // <-- REF BARU
                className={styles.semester} // <-- CLASS DARI CSS LAMA
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                required
              >
                <option value=''>Select Semester</option>
                {options.semesters.map((s) => (
                  <option key={s.semester_id} value={s.semester_id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Date */}
            <div className={styles.fieldWrapper}>
              <input
                ref={dateRef} // <-- REF BARU
                className={styles.dateField} // <-- CLASS DARI CSS LAMA
                type='date'
                value={date}
                readOnly
              />
            </div>
          </div>
        ) : (
          <div className={styles.frameParent}>
            {/* Username */}
            <div className={styles.fieldWrapper}>
              <input
                ref={usernameRef} // <-- REF BARU
                className={styles.schoolYear} // <-- Gunakan class .schoolYear untuk input text
                type='text'
                placeholder='Username'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete='new-password'
              />
            </div>
            {/* User Email */}
            <div className={styles.fieldWrapper}>
              <input
                ref={emailRef} // <-- REF BARU
                className={styles.schoolYear} // <-- Gunakan class .schoolYear untuk input email
                type='email'
                placeholder='User Email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete='new-password'
              />
            </div>
            {/* User Password */}
            <div className={styles.fieldWrapper}>
              <input
                ref={passwordRef} // <-- REF BARU
                className={styles.schoolYear} // <-- Gunakan class .schoolYear untuk input password
                type='password'
                placeholder='User Password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete='new-password'
              />
            </div>
            {/* Role (Select) */}
            <div className={styles.fieldWrapper}>
              <select
                ref={roleRef} // <-- REF BARU
                className={styles.semester} // <-- Gunakan class .semester untuk select Role
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                autoComplete='off'
              >
                <option value=''>Select Role</option>
                {options.roles.map((r) => (
                  <option key={r} value={r}>
                    {r.charAt(0).toUpperCase() + r.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
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
            disabled={loading}
            className={loading ? styles.loadingButton : ''}
          >
            {loading ? 'Processing...' : 'Create'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;
