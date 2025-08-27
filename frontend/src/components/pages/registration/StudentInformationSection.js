import React, { useState, useEffect, useCallback, useRef } from 'react';
import styles from './StudentInformationSection.module.css';
import Select from 'react-select';
import { getRegistrationOptions } from '../../../services/api';

const genderOptions = ['MALE', 'FEMALE'];
const citizenshipOptions = ['Indonesia', 'Non Indonesia'];

const StudentInformationSection = ({
  prefill,
  onDataChange,
  onValidationChange,
  errors,
  forceError,
}) => {
  const [academicStatusOptions, setAcademicStatusOptions] = useState([]);
  const [academicStatus, setAcademicStatus] = useState('');

  const [firstName, setFirstName] = useState('');
  const [firstNameError, setFirstNameError] = useState(false);
  const [citizenshipError, setCitizenshipError] = useState(false);
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [nickname, setNickname] = useState('');
  const [nisn, setNisn] = useState('');
  const [nik, setNik] = useState('');
  const [kitas, setKitas] = useState('');
  const [foreignCountry, setForeignCountry] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [rank, setRank] = useState('');
  const [citizenship, setCitizenship] = useState('');
  const [religion, setReligion] = useState('');
  const [placeOfBirth, setPlaceOfBirth] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [email, setEmail] = useState('');
  const [previousSchool, setPreviousSchool] = useState('');
  const [phone, setPhone] = useState('');
  const [academicStatusOther, setAcademicStatusOther] = useState('');
  const [street, setStreet] = useState('');
  const [rt, setRt] = useState('0');
  const [rw, setRw] = useState('0');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('');
  const [city, setCity] = useState('');
  const [province, setProvince] = useState('');
  const [otherAddress, setOtherAddress] = useState('');

  // Tambahkan ref untuk tracking apakah ini adalah prefill pertama kali
  const isInitialPrefill = useRef(true);
  const hasInitialized = useRef(false);

  // Fetch dropdown data
  useEffect(() => {
    getRegistrationOptions()
      .then((data) => {
        setAcademicStatusOptions(data.academic_status || []);
      })
      .catch((err) => {
        console.error('Failed to fetch academic status options:', err);
      });
  }, []);

  // Prefill hanya sekali saat component pertama kali mount atau saat prefill berubah signifikan
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      console.log('Prefilling StudentInformationSection with:', prefill);

      if (prefill.first_name) setFirstName(prefill.first_name);
      if (prefill.middle_name) setMiddleName(prefill.middle_name);
      if (prefill.last_name) setLastName(prefill.last_name);
      if (prefill.nickname) setNickname(prefill.nickname);
      if (prefill.nisn) setNisn(prefill.nisn);
      if (prefill.nik) setNik(prefill.nik);
      if (prefill.kitas) setKitas(prefill.kitas);
      if (prefill.country) setForeignCountry(prefill.country);
      if (prefill.gender) setGender(prefill.gender);
      if (prefill.family_rank) setRank(prefill.family_rank);
      if (prefill.citizenship) setCitizenship(prefill.citizenship);
      if (prefill.religion) setReligion(prefill.religion);
      if (prefill.place_of_birth) setPlaceOfBirth(prefill.place_of_birth);
      if (prefill.date_of_birth) setDateOfBirth(prefill.date_of_birth);
      if (prefill.email) setEmail(prefill.email);
      if (prefill.previous_school) setPreviousSchool(prefill.previous_school);
      if (prefill.phone_number) setPhone(prefill.phone_number);
      if (prefill.academic_status) setAcademicStatus(prefill.academic_status);
      if (prefill.academic_status_other)
        setAcademicStatusOther(prefill.academic_status_other);
      if (prefill.street) setStreet(prefill.street);
      if (prefill.rt) setRt(prefill.rt);
      if (prefill.rw) setRw(prefill.rw);
      if (prefill.village) setVillage(prefill.village);
      if (prefill.district) setDistrict(prefill.district);
      if (prefill.city_regency) setCity(prefill.city_regency);
      if (prefill.province) setProvince(prefill.province);
      if (prefill.other) setOtherAddress(prefill.other);
    } else if (Object.keys(prefill).length === 0) {
      // Jika prefill menjadi empty object (reset form), reset semua field
      console.log('Resetting StudentInformationSection form');
      setFirstName('');
      setMiddleName('');
      setLastName('');
      setNickname('');
      setNisn('');
      setNik('');
      setKitas('');
      setForeignCountry('');
      setGender('');
      setAge('');
      setRank('');
      setCitizenship('');
      setReligion('');
      setPlaceOfBirth('');
      setDateOfBirth('');
      setEmail('');
      setPreviousSchool('');
      setPhone('');
      setAcademicStatus('');
      setAcademicStatusOther('');
      setStreet('');
      setRt('0');
      setRw('0');
      setVillage('');
      setDistrict('');
      setCity('');
      setProvince('');
      setOtherAddress('');
    }
  }, [prefill]);

  // Terima error state dari parent component
  useEffect(() => {
    if (errors) {
      // Student Information fields
      if (errors.first_name !== undefined) setFirstNameError(errors.first_name);
      if (errors.nickname !== undefined) setNicknameError(errors.nickname);
      if (errors.nisn !== undefined) setNisnError(errors.nisn);
      if (errors.nik !== undefined) setNikError(errors.nik);
      if (errors.kitas !== undefined) setKitasError(errors.kitas);
      if (errors.gender !== undefined) setGenderError(errors.gender);
      if (errors.family_rank !== undefined) setRankError(errors.family_rank);
      if (errors.citizenship !== undefined)
        setCitizenshipError(errors.citizenship);
      if (errors.religion !== undefined) setReligionError(errors.religion);
      if (errors.place_of_birth !== undefined)
        setPlaceOfBirthError(errors.place_of_birth);
      if (errors.date_of_birth !== undefined)
        setDateOfBirthError(errors.date_of_birth);
      if (errors.email !== undefined) setEmailError(errors.email);
      if (errors.previous_school !== undefined)
        setPreviousSchoolError(errors.previous_school);
      if (errors.phone_number !== undefined) setPhoneError(errors.phone_number);
      if (errors.street !== undefined) setStreetError(errors.street);
      if (errors.rt !== undefined) setRtError(errors.rt); // Tambah error handling untuk RT
      if (errors.rw !== undefined) setRwError(errors.rw); // Tambah error handling untuk RW
      if (errors.village !== undefined) setVillageError(errors.village);
      if (errors.district !== undefined) setDistrictError(errors.district);
      if (errors.city_regency !== undefined) setCityError(errors.city_regency);
      if (errors.province !== undefined) setProvinceError(errors.province);
      if (errors.other !== undefined) setOtherAddressError(errors.other); // Tambah error handling untuk Other Address
      if (errors.academic_status !== undefined)
        setAcademicStatusError(errors.academic_status); // Tambahkan kembali
    }
  }, [errors]);

  // Terima forceError prop untuk testing
  useEffect(() => {
    if (forceError) {
      if (forceError.first_name) setFirstNameError(true);
      if (forceError.nickname) setNicknameError(true);
      if (forceError.nisn) setNisnError(true);
      if (forceError.nik) setNikError(true);
      if (forceError.kitas) setKitasError(true);
      if (forceError.gender) setGenderError(true);
      if (forceError.family_rank) setRankError(true);
      if (forceError.citizenship) setCitizenshipError(true);
      if (forceError.religion) setReligionError(true);
      if (forceError.place_of_birth) setPlaceOfBirthError(true);
      if (forceError.date_of_birth) setDateOfBirthError(true);
      if (forceError.email) setEmailError(true);
      if (forceError.previous_school) setPreviousSchoolError(true);
      if (forceError.phone_number) setPhoneError(true);
      if (forceError.street) setStreetError(true);
      if (forceError.rt) setRtError(true); // Tambah forceError untuk RT
      if (forceError.rw) setRwError(true); // Tambah forceError untuk RW
      if (forceError.village) setVillageError(true);
      if (forceError.district) setDistrictError(true);
      if (forceError.city_regency) setCityError(true);
      if (forceError.province) setProvinceError(true);
      if (forceError.other) setOtherAddressError(true); // Tambah forceError untuk Other Address
      if (forceError.academic_status) setAcademicStatusError(true); // Tambahkan kembali
    }
  }, [forceError]);

  // Validasi NIK (16 angka)
  const validateNIK = (value) => {
    if (value && value.length !== 16) {
      setNikError(true);
      return false;
    }
    setNikError(false);
    return true;
  };

  // Validasi KITAS (16 angka)
  const validateKITAS = (value) => {
    if (value && value.length !== 16) {
      setKitasError(true);
      return false;
    }
    setKitasError(false);
    return true;
  };

  // Validasi NISN (10 angka)
  const validateNISN = (value) => {
    if (value && value.length !== 10) {
      setNisnError(true);
      return false;
    }
    setNisnError(false);
    return true;
  };

  const handleFirstName = (value) => {
    setFirstName(value);
    if (firstNameError && value.trim()) setFirstNameError(false);
    onDataChange({ first_name: value });
  };

  const handleMiddleName = (value) => {
    setMiddleName(value);
    onDataChange({ middle_name: value });
  };

  const handleLastName = (value) => {
    setLastName(value);
    onDataChange({ last_name: value });
  };

  const handleNickname = (value) => {
    setNickname(value);
    if (nicknameError && value.trim()) setNicknameError(false);
    onDataChange({ nickname: value });
  };

  const handleNisn = (value) => {
    setNisn(value);
    validateNISN(value);
    onDataChange({ nisn: value });
  };

  const handleNik = (value) => {
    setNik(value);
    validateNIK(value);
    onDataChange({ nik: value });
  };

  const handleKitas = (value) => {
    setKitas(value);
    validateKITAS(value);
    onDataChange({ kitas: value });
  };

  const handleForeignCountry = (value) => {
    setForeignCountry(value);
    onDataChange({ country: value });
  };

  const handleGender = (value) => {
    setGender(value);
    if (genderError && value) setGenderError(false);
    onDataChange({ gender: value });
  };

  const handleFamilyRank = (value) => {
    setRank(value);
    if (rankError && value.trim()) setRankError(false);
    onDataChange({ family_rank: value });
  };

  const handleCitizenship = (opt) => {
    const value = opt ? opt.value : '';
    setCitizenship(value);
    if (citizenshipError && value) setCitizenshipError(false);
    onDataChange({ citizenship: value });
  };

  const handleReligion = (value) => {
    setReligion(value);
    if (religionError && value.trim()) setReligionError(false);
    onDataChange({ religion: value });
  };

  const handlePlaceOfBirth = (value) => {
    setPlaceOfBirth(value);
    if (placeOfBirthError && value.trim()) setPlaceOfBirthError(false);
    onDataChange({ place_of_birth: value });
  };

  const handleDateOfBirth = (value) => {
    setDateOfBirth(value);
    if (dateOfBirthError && value) setDateOfBirthError(false);
    onDataChange({ date_of_birth: value });
  };

  const handleEmail = (value) => {
    setEmail(value);
    if (emailError && value.trim()) setEmailError(false);
    onDataChange({ email: value });
  };

  const handlePreviousSchool = (value) => {
    setPreviousSchool(value);
    if (previousSchoolError && value.trim()) setPreviousSchoolError(false);
    onDataChange({ previous_school: value });
  };

  const handlePhone = (value) => {
    setPhone(value);
    if (phoneError && value.trim()) setPhoneError(false);
    onDataChange({ phone_number: value });
  };

  const handleStreet = (value) => {
    setStreet(value);
    if (streetError && value.trim()) setStreetError(false);
    onDataChange({ street: value });
  };

  const handleRt = (value) => {
    setRt(value);
    if (rtError && value.trim()) setRtError(false); // Clear error jika ada value
    // Kirim "0" jika value kosong, otherwise kirim value asli
    onDataChange({ rt: value.trim() === '' ? '0' : value });
  };

  const handleRw = (value) => {
    setRw(value);
    if (rwError && value.trim()) setRwError(false); // Clear error jika ada value
    // Kirim "0" jika value kosong, otherwise kirim value asli
    onDataChange({ rw: value.trim() === '' ? '0' : value });
  };

  const handleVillage = (value) => {
    setVillage(value);
    if (villageError && value.trim()) setVillageError(false);
    onDataChange({ village: value });
  };

  const handleDistrict = (value) => {
    setDistrict(value);
    if (districtError && value.trim()) setDistrictError(false);
    onDataChange({ district: value });
  };

  const handleCity = (value) => {
    setCity(value);
    if (cityError && value.trim()) setCityError(false);
    onDataChange({ city_regency: value });
  };

  const handleProvince = (value) => {
    setProvince(value);
    if (provinceError && value.trim()) setProvinceError(false);
    onDataChange({ province: value });
  };

  const handleOtherAddress = (value) => {
    setOtherAddress(value);
    if (otherAddressError && value.trim()) setOtherAddressError(false); // Clear error jika ada value
    onDataChange({ other: value });
  };

  // Kirim status validasi ke parent component
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange({
        firstName: !firstNameError && firstName.trim() !== '',
        citizenship: !citizenshipError && citizenship !== '',
        // Tambahkan field lain sesuai kebutuhan
      });
    }
  }, [firstNameError, firstName, citizenshipError, citizenship]);

  // Terima error state dari parent component
  React.useEffect(() => {
    if (errors && errors.firstName !== undefined) {
      setFirstNameError(errors.firstName);
    } else {
      setFirstNameError(false);
    }

    if (errors && errors.citizenship !== undefined) {
      setCitizenshipError(errors.citizenship);
    } else {
      setCitizenshipError(false);
    }
  }, [errors]);

  // Terima forceError prop untuk testing
  React.useEffect(() => {
    if (forceError && forceError.firstName) {
      setFirstNameError(true);
    }
  }, [forceError]);

  const updateAge = useCallback(
    (newAge) => {
      setAge(newAge);
      onDataChange({ age: newAge });
    },
    [onDataChange]
  );

  // Tambahkan useEffect untuk menampilkan age otomatis
  useEffect(() => {
    if (dateOfBirth) {
      try {
        const dob = new Date(dateOfBirth);
        const now = new Date();

        // Pastikan tanggal valid
        if (isNaN(dob.getTime())) {
          updateAge('');
          return;
        }

        // Pastikan tanggal tidak di masa depan
        if (dob > now) {
          updateAge('');
          return;
        }

        // Hitung umur dalam tahun dan bulan (sementara, nanti akan diganti backend)
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();

        if (months < 0 || (months === 0 && now.getDate() < dob.getDate())) {
          years--;
          months += 12;
        }

        const calculatedAge = `${years} Tahun, ${months} Bulan`;
        updateAge(calculatedAge);
      } catch (error) {
        console.error('Error calculating age:', error);
        updateAge('');
      }
    } else {
      updateAge('');
    }
  }, [dateOfBirth, updateAge]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT'S INFORMATION</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.infoSection}>
          <div className={styles.row}>
            <div
              className={`${styles.nameField} ${
                firstNameError ? styles.errorFieldWrapper : ''
              }`}
            >
              {firstNameError ? (
                <div
                  className={styles.errorContainer}
                  onClick={() => setFirstNameError(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setFirstNameError(false);
                    }
                  }}
                  tabIndex={0}
                  role='button'
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.errorLabel}>First name</div>
                  <div className={styles.errorMessage}>
                    THIS FIELD NEEDS TO BE FILLED
                  </div>
                </div>
              ) : (
                <>
                  <label className={styles.label} htmlFor='firstName'>
                    First name
                  </label>
                  <input
                    id='firstName'
                    className={`${styles.label} ${firstName ? 'hasValue' : ''}`}
                    type='text'
                    value={firstName}
                    onChange={(e) => {
                      handleFirstName(e.target.value);
                      if (firstNameError && e.target.value.trim()) {
                        setFirstNameError(false);
                      }
                    }}
                    onFocus={() => {
                      if (firstNameError) {
                        setFirstNameError(false);
                      }
                    }}
                    placeholder='First name'
                  />
                </>
              )}
            </div>
            <div className={styles.nameField}>
              <label className={styles.label} htmlFor='middleName'>
                Middle name
              </label>
              <input
                id='middleName'
                className={`${styles.label} ${middleName ? 'hasValue' : ''}`}
                type='text'
                value={middleName}
                onChange={(e) => handleMiddleName(e.target.value)}
                placeholder='Middle name'
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor='lastName'>
                Last name
              </label>
              <input
                id='lastName'
                className={`${styles.label} ${lastName ? 'hasValue' : ''}`}
                type='text'
                value={lastName}
                onChange={(e) => handleLastName(e.target.value)}
                placeholder='Last name'
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor='nickname'>
                Nickname
              </label>
              <input
                id='nickname'
                className={`${styles.valueHighlight} ${
                  nickname ? 'hasValue' : ''
                }`}
                type='text'
                value={nickname}
                onChange={(e) => handleNickname(e.target.value)}
                placeholder='Nickname'
              />
            </div>
          </div>
          <div className={styles.row}>
            <div
              className={`${styles.citizenshipField} ${
                citizenshipError ? styles.errorFieldWrapper : ''
              }`}
            >
              {citizenshipError ? (
                <div
                  className={styles.errorContainer}
                  onClick={() => setCitizenshipError(false)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setCitizenshipError(false);
                    }
                  }}
                  tabIndex={0}
                  role='button'
                  style={{ cursor: 'pointer' }}
                >
                  <div className={styles.errorLabel}>Citizenship</div>
                  <div className={styles.errorMessage}>
                    THIS FIELD NEEDS TO BE FILLED
                  </div>
                </div>
              ) : (
                <>
                  <label className={styles.label} htmlFor='citizenship'>
                    Citizenship
                  </label>
                  <Select
                    id='citizenship'
                    options={citizenshipOptions.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                    placeholder='Select citizenship'
                    value={
                      citizenship
                        ? { value: citizenship, label: citizenship }
                        : null
                    }
                    onChange={(opt) => {
                      handleCitizenship(opt);
                      if (citizenshipError && opt) {
                        setCitizenshipError(false);
                      }
                    }}
                    onFocus={() => {
                      if (citizenshipError) {
                        setCitizenshipError(false);
                      }
                    }}
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontWeight: citizenship ? 'bold' : '400',
                        color: citizenship ? '#000' : 'rgba(128,128,128,0.6)',
                        border: 'none',
                        boxShadow: 'none',
                        borderRadius: 0,
                        borderBottom: 'none',
                        background: 'transparent',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontWeight: citizenship ? 'bold' : '400',
                        color: citizenship ? '#000' : 'rgba(128,128,128,0.6)',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: 'rgba(128,128,128,0.6)',
                      }),
                    }}
                  />
                </>
              )}
            </div>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor='religion'>
                Religion
              </label>
              <input
                id='religion'
                className={`${styles.valueHighlight} ${
                  religion ? 'hasValue' : ''
                }`}
                type='text'
                value={religion}
                onChange={(e) => handleReligion(e.target.value)}
                placeholder='Religion'
              />
            </div>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor='placeOfBirth'>
                Place of birth
              </label>
              <input
                id='placeOfBirth'
                className={`${styles.valueHighlight} ${
                  placeOfBirth ? 'hasValue' : ''
                }`}
                type='text'
                value={placeOfBirth}
                onChange={(e) => handlePlaceOfBirth(e.target.value)}
                placeholder='Place of birth'
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor='dateOfBirth'>
                Date of birth
              </label>
              <div className={styles.dateInputWrapper}>
                <input
                  id='dateOfBirth'
                  type='date'
                  value={dateOfBirth}
                  onChange={(e) => {
                    handleDateOfBirth(e.target.value);
                    if (dateOfBirthError && e.target.value) {
                      setDateOfBirthError(false);
                    }
                  }}
                  onFocus={() => {
                    if (dateOfBirthError) {
                      setDateOfBirthError(false);
                    }
                  }}
                  className={`${styles.dateInput} ${
                    dateOfBirth ? 'hasValue' : ''
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                <div className={styles.calendarIcon}>
                  <svg
                    width='20'
                    height='20'
                    viewBox='0 0 24 24'
                    fill='none'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      d='M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z'
                      stroke='currentColor'
                      strokeWidth='1.5'
                      strokeMiterlimit='10'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {citizenship === 'Non Indonesia' && (
            <div className={styles.row}>
              <div className={styles.nicknameField}>
                <label className={styles.label} htmlFor='foreignCountry'>
                  Country of origin
                </label>
                <input
                  id='foreignCountry'
                  className={`${styles.valueHighlight} ${
                    foreignCountry ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={foreignCountry}
                  onChange={(e) => handleForeignCountry(e.target.value)}
                  placeholder='Country of Origin'
                />
              </div>
            </div>
          )}
          <div className={styles.row}>
            {citizenship === 'Non Indonesia' && (
              <div className={styles.nicknameField}>
                <label className={styles.label} htmlFor='kitas'>
                  KITAS
                </label>
                <input
                  id='kitas'
                  className={`${styles.valueHighlight} ${
                    kitas ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={kitas}
                  onChange={(e) => handleKitas(e.target.value)}
                  placeholder='KITAS'
                />
              </div>
            )}
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor='nisn'>
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <input
                id='nisn'
                className={`${styles.label} ${nisn ? 'hasValue' : ''}`}
                type='text'
                value={nisn}
                onChange={(e) => handleNisn(e.target.value)}
                placeholder='NISN'
              />
            </div>
            {citizenship === 'Indonesia' && (
              <div className={styles.nicknameField}>
                <label className={styles.label} htmlFor='nik'>
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  id='nik'
                  className={`${styles.label} ${nik ? 'hasValue' : ''}`}
                  type='text'
                  value={nik}
                  onChange={(e) => handleNik(e.target.value)}
                  placeholder='NIK'
                />
              </div>
            )}
          </div>
          <div className={styles.row}>
            <div className={styles.genderField}>
              <label className={styles.label} htmlFor='gender'>
                Gender
              </label>
              <Select
                id='gender'
                options={genderOptions.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                placeholder='Select gender'
                value={gender ? { value: gender, label: gender } : null}
                onChange={(opt) => handleGender(opt ? opt.value : '')}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    fontWeight: gender ? 'bold' : '400',
                    color: gender ? '#000' : 'rgba(128,128,128,0.6)',
                    border: 'none',
                    boxShadow: 'none',
                    borderRadius: 0,
                    borderBottom: 'none',
                    background: 'transparent',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontWeight: gender ? 'bold' : '400',
                    color: gender ? '#000' : 'rgba(128,128,128,0.6)',
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: 'rgba(128,128,128,0.6)',
                  }),
                }}
              />
            </div>
            <div className={`${styles.genderField} ${styles.rankField}`}>
              <label className={styles.label} htmlFor='rank'>
                Rank in the family
              </label>
              <input
                id='rank'
                className={`${styles.valueSmall} ${rank ? 'hasValue' : ''}`}
                type='number'
                value={rank}
                onChange={(e) => handleFamilyRank(e.target.value)}
                placeholder='1'
                min='1'
                max='99'
              />
            </div>
            <div className={`${styles.genderField} ${styles.ageField}`}>
              <label className={styles.label} htmlFor='age'>
                Age
              </label>
              <div
                className={`${styles.valueSmall} ${age ? 'hasValue' : ''}`}
                id='age'
              >
                {age || <>&nbsp;</>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.infoSection}>
          <div className={styles.topRow}>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor='email'>
                Email address
              </label>
              <input
                id='email'
                className={`${styles.valueHighlight} ${
                  email ? 'hasValue' : ''
                }`}
                type='email'
                value={email}
                onChange={(e) => handleEmail(e.target.value)}
                placeholder='Email address'
                style={{ borderBottom: 'none', boxShadow: 'none' }}
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor='previousSchool'>
                Previous school
              </label>
              <input
                id='previousSchool'
                className={`${styles.valueHighlight} ${
                  previousSchool ? 'hasValue' : ''
                }`}
                type='text'
                value={previousSchool}
                onChange={(e) => handlePreviousSchool(e.target.value)}
                placeholder='Previous School'
              />
            </div>
          </div>
          <div className={styles.topRow}>
            <div className={`${styles.citizenshipField} ${styles.noBorder}`}>
              <label className={styles.label} htmlFor='phone'>
                Phone number
              </label>
              <input
                id='phone'
                className={`${styles.valueHighlight} ${
                  phone ? 'hasValue' : ''
                }`}
                type='text'
                value={phone}
                onChange={(e) => handlePhone(e.target.value)}
                placeholder='Phone number'
              />
            </div>
            <div className={`${styles.academicStatusField} ${styles.noBorder}`}>
              <label className={styles.label} htmlFor='academicStatus'>
                Academic status
              </label>
              <div className={styles.academicStatusOptions}>
                <div className={styles.academicStatusOption}>
                  <Select
                    id='academicStatus'
                    options={academicStatusOptions.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                    placeholder='Select status'
                    value={
                      academicStatus
                        ? { value: academicStatus, label: academicStatus }
                        : null
                    }
                    onChange={(opt) => {
                      const selectedValue = opt ? opt.value : '';

                      // ✅ PERBAIKAN: Handle semua kasus termasuk 'OTHER'
                      if (selectedValue === 'OTHER') {
                        setAcademicStatus('OTHER');
                        // setAcademicStatusOther(''); // ← Hapus baris ini
                        onDataChange({
                          academic_status: 'OTHER',
                          academic_status_other: academicStatusOther, // ← Gunakan nilai yang sudah ada
                        });
                      } else {
                        setAcademicStatus(selectedValue);
                        setAcademicStatusOther('');
                        onDataChange({
                          academic_status: selectedValue,
                          academic_status_other: '',
                        });
                      }

                      // HILANGKAN error state academic status setelah memilih
                      if (academicStatusError) {
                        setAcademicStatusError(false);
                      }
                    }}
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontWeight: academicStatus ? 'bold' : '400', // ✅ PERBAIKAN: Hapus kondisi !== 'Other'
                        color: academicStatus
                          ? '#000'
                          : 'rgba(128,128,128,0.6)',
                        border: 'none',
                        boxShadow: 'none',
                        borderRadius: 0,
                        borderBottom: 'none',
                        background: 'transparent',
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontWeight: academicStatus ? 'bold' : '400', // ✅ PERBAIKAN: Hapus kondisi !== 'Other'
                        color: academicStatus
                          ? '#000'
                          : 'rgba(128,128,128,0.6)',
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: 'rgba(128,128,128,0.6)',
                      }),
                    }}
                  />
                </div>
                <div className={styles.academicStatusOption}>
                  <label className={styles.otherLabel}>
                    <input
                      type='radio'
                      name='academicStatusType'
                      value='OTHER'
                      checked={academicStatus === 'OTHER'}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAcademicStatus('OTHER');
                          // setAcademicStatusOther(''); // ← Hapus baris ini
                          onDataChange({
                            academic_status: 'OTHER',
                            academic_status_other: academicStatusOther, // ← Gunakan nilai yang sudah ada
                          });
                        }

                        // HILANGKAN error state academic status setelah memilih
                        if (academicStatusError) {
                          setAcademicStatusError(false);
                        }
                      }}
                      className={styles.hiddenRadio}
                    />
                    <span className={styles.otherText}>Other</span>

                    {/* ✅ Tampilkan input field jika OTHER dipilih */}
                    {academicStatus === 'OTHER' && (
                      <input
                        className={styles.otherInput}
                        type='text'
                        value={academicStatusOther}
                        onChange={(e) => {
                          const value = e.target.value;
                          setAcademicStatusOther(value);

                          // ✅ Kirim kedua field sekaligus
                          onDataChange({
                            academic_status: 'OTHER',
                            academic_status_other: value,
                          });
                        }}
                        placeholder='Enter academic status'
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.infoSection}>
          <div className={styles.addressSection}>
            <div className={styles.addressRow}>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor='street'>
                  Street
                </label>
                <input
                  id='street'
                  className={`${styles.valueHighlight} ${
                    street ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={street}
                  onChange={(e) => handleStreet(e.target.value)}
                  placeholder='Street'
                />
              </div>
              <div className={styles.rtrwGroup}>
                <div className={styles.rtField}>
                  <label className={styles.label} htmlFor='rt'>
                    RT
                  </label>
                  <input
                    id='rt'
                    className={`${styles.label} ${rt ? 'hasValue' : ''}`}
                    type='text'
                    value={rt}
                    onChange={(e) => handleRt(e.target.value)}
                    placeholder='RT'
                  />
                </div>
                <div className={styles.rtField}>
                  <label className={styles.label} htmlFor='rw'>
                    RW
                  </label>
                  <input
                    id='rw'
                    className={`${styles.label} ${rw ? 'hasValue' : ''}`}
                    type='text'
                    value={rw}
                    onChange={(e) => handleRw(e.target.value)}
                    placeholder='RW'
                  />
                </div>
              </div>
            </div>
            <div className={styles.addressRow}>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor='village'>
                  Village
                </label>
                <input
                  id='village'
                  className={`${styles.valueHighlight} ${
                    village ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={village}
                  onChange={(e) => handleVillage(e.target.value)}
                  placeholder='Village'
                />
              </div>
              <div className={styles.districtField}>
                <label className={styles.label} htmlFor='district'>
                  District
                </label>
                <input
                  id='district'
                  className={`${styles.valueHighlight} ${
                    district ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={district}
                  onChange={(e) => handleDistrict(e.target.value)}
                  placeholder='District'
                />
              </div>
            </div>
            <div className={styles.addressRow}>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor='city'>
                  City/Regency
                </label>
                <input
                  id='city'
                  className={`${styles.valueHighlight} ${
                    city ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={city}
                  onChange={(e) => handleCity(e.target.value)}
                  placeholder='City/Regency'
                />
              </div>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor='province'>
                  Province
                </label>
                <input
                  id='province'
                  className={`${styles.valueHighlight} ${
                    province ? 'hasValue' : ''
                  }`}
                  type='text'
                  value={province}
                  onChange={(e) => handleProvince(e.target.value)}
                  placeholder='Province'
                />
              </div>
            </div>
            <div className={styles.otherAddressWrapper}>
              <div className={styles.districtField}>
                <label className={styles.valueHighlight} htmlFor='otherAddress'>
                  Other
                </label>
                <div className={styles.otherAddressParent}>
                  <span className={styles.bracket}>(</span>
                  <input
                    id='otherAddress'
                    className={`${styles.apartementUnit} ${
                      otherAddress ? 'hasValue' : ''
                    }`}
                    type='text'
                    value={otherAddress}
                    onChange={(e) => handleOtherAddress(e.target.value)}
                    placeholder='Other address'
                  />
                  <span className={styles.bracket}>)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInformationSection;
