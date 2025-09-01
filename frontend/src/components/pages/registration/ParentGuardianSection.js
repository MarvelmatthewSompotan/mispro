import React, { useState, useEffect, useRef } from 'react';
import styles from './ParentGuardianSection.module.css';

const ParentGuardianSection = ({ onDataChange, prefill, prefillTrigger, errors, forceError }) => {
  // State untuk Father
  const [father, setFather] = useState({
    name: '',
    company: '',
    occupation: '',
    phone: '',
    email: '',
    street: '',
    rt: '0',
    rw: '0',
    village: '',
    district: '',
    city: '',
    province: '',
    other: '',
  });

  // State untuk Mother
  const [mother, setMother] = useState({
    name: '',
    company: '',
    occupation: '',
    phone: '',
    email: '',
    street: '',
    rt: '0',
    rw: '0',
    village: '',
    district: '',
    city: '',
    province: '',
    other: '',
  });

  // State untuk Guardian
  const [guardian, setGuardian] = useState({
    name: '',
    relationship: '',
    phone: '',
    email: '',
    street: '',
    rt: '0',
    rw: '0',
    village: '',
    district: '',
    city: '',
    province: '',
    other: '',
  });

  // State untuk error fields Father
  const [fatherErrors, setFatherErrors] = useState({
    name: false,
    phone: false,
    street: false,
    village: false,
    district: false,
    city: false,
    province: false,
  });

  // State untuk error fields Mother
  const [motherErrors, setMotherErrors] = useState({
    name: false,
    phone: false,
    street: false,
    village: false,
    district: false,
    city: false,
    province: false,
  });

  // State untuk error fields Guardian (jika diperlukan)
  const [guardianErrors, setGuardianErrors] = useState({
    name: false,
    phone: false,
    street: false,
    village: false,
    district: false,
    city: false,
    province: false,
  });

  // State untuk mengakumulasi semua data
  const [allParentData, setAllParentData] = useState({});

  // Effect untuk handle errors dari parent component - PERBAIKAN: Jangan reset error state yang sudah ada
  useEffect(() => {
    if (errors) {
      // Update father errors - hanya update field yang ada di errors, jangan reset yang lain
      setFatherErrors(prev => ({
        ...prev, // Pertahankan error state yang sudah ada
        ...(errors.father_name !== undefined && { name: errors.father_name }),
        ...(errors.father_phone !== undefined && { phone: errors.father_phone }),
        ...(errors.father_address_street !== undefined && { street: errors.father_address_street }),
        ...(errors.father_address_village !== undefined && { village: errors.father_address_village }),
        ...(errors.father_address_district !== undefined && { district: errors.father_address_district }),
        ...(errors.father_address_city_regency !== undefined && { city: errors.father_address_city_regency }),
        ...(errors.father_address_province !== undefined && { province: errors.father_address_province })
      }));

      // Update mother errors - hanya update field yang ada di errors, jangan reset yang lain
      setMotherErrors(prev => ({
        ...prev, // Pertahankan error state yang sudah ada
        ...(errors.mother_name !== undefined && { name: errors.mother_name }),
        ...(errors.mother_phone !== undefined && { phone: errors.mother_phone }),
        ...(errors.mother_address_street !== undefined && { street: errors.mother_address_street }),
        ...(errors.mother_address_village !== undefined && { village: errors.mother_address_village }),
        ...(errors.mother_address_district !== undefined && { district: errors.mother_address_district }),
        ...(errors.mother_address_city_regency !== undefined && { city: errors.mother_address_city_regency }),
        ...(errors.mother_address_province !== undefined && { province: errors.mother_address_province })
      }));
    }
  }, [errors]);

  // Effect untuk handle forceError dari parent component - PERBAIKAN: Jangan reset error state yang sudah ada
  useEffect(() => {
    if (forceError) {
      // Force error untuk father fields - hanya update field yang ada di forceError, jangan reset yang lain
      setFatherErrors(prev => ({
        ...prev, // Pertahankan error state yang sudah ada
        ...(forceError.father_name && { name: true }),
        ...(forceError.father_phone && { phone: true }),
        ...(forceError.father_address_street && { street: true }),
        ...(forceError.father_address_village && { village: true }),
        ...(forceError.father_address_district && { district: true }),
        ...(forceError.father_address_city_regency && { city: true }),
        ...(forceError.father_address_province && { province: true })
      }));

      // Force error untuk mother fields - hanya update field yang ada di forceError, jangan reset yang lain
      setMotherErrors(prev => ({
        ...prev, // Pertahankan error state yang sudah ada
        ...(forceError.mother_name && { name: true }),
        ...(forceError.mother_phone && { phone: true }),
        ...(forceError.mother_address_street && { street: true }),
        ...(forceError.mother_address_village && { village: true }),
        ...(forceError.mother_address_district && { district: true }),
        ...(forceError.mother_address_city_regency && { city: true }),
        ...(forceError.mother_address_province && { province: true })
      }));
    }
  }, [forceError]);

  // Function untuk mengupdate data dan mengirim ke parent
  const updateAndSendData = () => {
    const allData = {};

    // Father data dengan field mapping yang benar - kirim semua field
    allData.father_name = father.name || "";
    allData.father_company = father.company || "";
    allData.father_occupation = father.occupation || "";
    allData.father_phone = father.phone || "";
    allData.father_email = father.email || "";
    allData.father_address_street = father.street || "";
    allData.father_address_rt = father.rt || "";
    allData.father_address_rw = father.rw || "";
    allData.father_address_village = father.village || "";
    allData.father_address_district = father.district || "";
    allData.father_address_city_regency = father.city || "";
    allData.father_address_province = father.province || "";
    allData.father_address_other = father.other || "";

    // Mother data dengan field mapping yang benar - kirim semua field
    allData.mother_name = mother.name || "";
    allData.mother_company = mother.company || "";
    allData.mother_occupation = mother.occupation || "";
    allData.mother_phone = mother.phone || "";
    allData.mother_email = mother.email || "";
    allData.mother_address_street = mother.street || "";
    allData.mother_address_rt = mother.rt || "";
    allData.mother_address_rw = mother.rw || "";
    allData.mother_address_village = mother.village || "";
    allData.mother_address_district = mother.district || "";
    allData.mother_address_city_regency = mother.city || "";
    allData.mother_address_province = mother.province || "";
    allData.mother_address_other = mother.other || "";

    // Guardian data dengan field mapping yang benar - kirim semua field
    allData.guardian_name = guardian.name || "";
    allData.relation_to_student = guardian.relationship || "";
    allData.guardian_phone = guardian.phone || "";
    allData.guardian_email = guardian.email || "";
    allData.guardian_address_street = guardian.street || "";
    allData.guardian_address_rt = guardian.rt || "";
    allData.guardian_address_rw = guardian.rw || "";
    allData.guardian_address_village = guardian.village || "";
    allData.guardian_address_district = guardian.district || "";
    allData.guardian_address_city_regency = guardian.city || "";
    allData.guardian_address_province = guardian.province || "";
    allData.guardian_address_other = guardian.other || "";

    console.log("ParentGuardianSection - Data being sent:", allData);
    console.log("ParentGuardianSection - Data type:", typeof allData);
    console.log("ParentGuardianSection - Data keys:", Object.keys(allData));

    setAllParentData(allData);
    onDataChange("parentGuardian", allData);
  };

  // Helper untuk handle input change dengan validasi
  const handleChange = (setter, field, section) => (e) => {
    const value = e.target.value;

    // Hitung next state untuk section yang sedang diedit agar tidak pakai state lama
    const nextFather =
      section === 'father' ? { ...father, [field]: value } : father;
    const nextMother =
      section === 'mother' ? { ...mother, [field]: value } : mother;
    const nextGuardian =
      section === 'guardian' ? { ...guardian, [field]: value } : guardian;

    // Update local state
    setter((prev) => ({ ...prev, [field]: value }));

    // Validasi field required dan update error state - PERBAIKAN: Pertahankan error state field lain
    if (section === 'father' && ['name', 'phone', 'street', 'village', 'district', 'city', 'province'].includes(field)) {
      setFatherErrors(prev => ({
        ...prev, // Pertahankan error state field lain
        [field]: !value.trim() // Hanya update field yang sedang diedit
      }));
    }

    if (section === 'mother' && ['name', 'phone', 'street', 'village', 'district', 'city', 'province'].includes(field)) {
      setMotherErrors(prev => ({
        ...prev, // Pertahankan error state field lain
        [field]: !value.trim() // Hanya update field yang sedang diedit
      }));
    }

    // Kirim data ke parent component dengan format yang benar
    if (onDataChange) {
      const allData = {};

      // Helper function untuk handle rt/rw fields
      const handleRtRw = (value) => {
        return value.trim() === '' ? '0' : value;
      };

      // Father
      allData.father_name = nextFather.name;
      allData.father_company = nextFather.company || '';
      allData.father_occupation = nextFather.occupation || '';
      allData.father_phone = nextFather.phone;
      allData.father_email = nextFather.email;
      allData.father_address_street = nextFather.street;
      allData.father_address_rt = handleRtRw(nextFather.rt);
      allData.father_address_rw = handleRtRw(nextFather.rw);
      allData.father_address_village = nextFather.village;
      allData.father_address_district = nextFather.district;
      allData.father_address_city_regency = nextFather.city;
      allData.father_address_province = nextFather.province;
      allData.father_address_other = nextFather.other || '';
      allData.father_company_addresses = nextFather.company;

      // Mother
      allData.mother_name = nextMother.name;
      allData.mother_company = nextMother.company || '';
      allData.mother_occupation = nextMother.occupation || '';
      allData.mother_phone = nextMother.phone;
      allData.mother_email = nextMother.email;
      allData.mother_address_street = nextMother.street;
      allData.mother_address_rt = handleRtRw(nextMother.rt);
      allData.mother_address_rw = handleRtRw(nextMother.rw);
      allData.mother_address_village = nextMother.village;
      allData.mother_address_district = nextMother.district;
      allData.mother_address_city_regency = nextMother.city;
      allData.mother_address_province = nextMother.province;
      allData.mother_address_other = nextMother.other || '';
      allData.mother_company_addresses = nextMother.company;

      // Guardian
      allData.guardian_name = nextGuardian.name || '';
      allData.relation_to_student = nextGuardian.relationship || '';
      allData.guardian_phone = nextGuardian.phone || '';
      allData.guardian_email = nextGuardian.email || '';
      allData.guardian_address_street = nextGuardian.street || '';
      allData.guardian_address_rt = handleRtRw(nextGuardian.rt);
      allData.guardian_address_rw = handleRtRw(nextGuardian.rw);
      allData.guardian_address_village = nextGuardian.village || '';
      allData.guardian_address_district = nextGuardian.district || '';
      allData.guardian_address_city_regency = nextGuardian.city || '';
      allData.guardian_address_province = nextGuardian.province || '';
      allData.guardian_address_other = nextGuardian.other || '';

      onDataChange(allData);
    }
  };

  // Tambahkan ref untuk tracking apakah ini adalah prefill pertama kali
  const isInitialPrefill = useRef(true);
  const hasInitialized = useRef(false);

  // ✅ Perbaiki useEffect untuk prefill data: hanya apply saat berbeda signifikan
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      // Jika ini prefill pertama kali atau prefill berubah signifikan
      if (isInitialPrefill.current || !hasInitialized.current) {
        console.log('Initial prefilling ParentGuardianSection with:', prefill);

        // ✅ Mapping data father dari backend ke state local
        const fatherData = {
          name: prefill.father_name || '',
          company: prefill.father_company || '',
          occupation: prefill.father_occupation || '',
          phone: prefill.father_phone || '',
          email: prefill.father_email || '',
          street: prefill.father_address_street || '',
          rt: prefill.father_address_rt || '0',
          rw: prefill.father_address_rw || '0',
          village: prefill.father_address_village || '',
          district: prefill.father_address_district || '',
          city: prefill.father_address_city_regency || '',
          province: prefill.father_address_province || '',
          other: prefill.father_address_other || '',
        };

        // ✅ Mapping data mother dari backend ke state local
        const motherData = {
          name: prefill.mother_name || '',
          company: prefill.mother_company || '',
          occupation: prefill.mother_occupation || '',
          phone: prefill.mother_phone || '',
          email: prefill.mother_email || '',
          street: prefill.mother_address_street || '',
          rt: prefill.father_address_rt || '0',
          rw: prefill.father_address_rw || '0',
          village: prefill.mother_address_village || '',
          district: prefill.mother_address_district || '',
          city: prefill.mother_address_city_regency || '',
          province: prefill.mother_address_province || '',
          other: prefill.mother_address_other || '',
        };

        // ✅ Mapping data guardian dari backend ke state local
        const guardianData = {
          name: prefill.guardian_name || '',
          relationship: prefill.relation_to_student || '',
          phone: prefill.guardian_phone || '',
          email: prefill.guardian_email || '',
          street: prefill.guardian_address_street || '',
          rt: prefill.guardian_address_rt || '0',
          rw: prefill.guardian_address_rw || '0',
          village: prefill.guardian_address_village || '',
          district: prefill.guardian_address_district || '',
          city: prefill.guardian_address_city_regency || '',
          province: prefill.guardian_address_province || '',
          other: prefill.guardian_address_other || '',
        };

        // ✅ Set state dengan data yang sudah di-mapping
        setFather(fatherData);
        setMother(motherData);
        setGuardian(guardianData);

        // Reset error states saat prefill - PERBAIKAN: Hanya reset jika tidak ada errors dari parent
        if (!errors) {
          setFatherErrors({
            name: false,
            phone: false,
            street: false,
            village: false,
            district: false,
            city: false,
            province: false,
          });
          setMotherErrors({
            name: false,
            phone: false,
            street: false,
            village: false,
            district: false,
            city: false,
            province: false,
          });
          setGuardianErrors({
            name: false,
            phone: false,
            street: false,
            village: false,
            district: false,
            city: false,
            province: false,
          });
        }

        // ✅ Kirim data ke parent component setelah prefill
        if (onDataChange) {
          const allData = {
            // Father data
            father_name: fatherData.name,
            father_company: fatherData.company,
            father_occupation: fatherData.occupation,
            father_phone: fatherData.phone,
            father_email: fatherData.email,
            father_address_street: fatherData.street,
            father_address_rt: fatherData.rt,
            father_address_rw: fatherData.rw,
            father_address_village: fatherData.village,
            father_address_district: fatherData.district,
            father_address_city_regency: fatherData.city,
            father_address_province: fatherData.province,
            father_address_other: fatherData.other,
            father_company_addresses: fatherData.company,

            // Mother data
            mother_name: motherData.name,
            mother_company: motherData.company,
            mother_occupation: motherData.occupation,
            mother_phone: motherData.phone,
            mother_email: motherData.email,
            mother_address_street: motherData.street,
            mother_address_rt: motherData.rt,
            mother_address_rw: motherData.rw,
            mother_address_village: motherData.village,
            mother_address_district: motherData.district,
            mother_address_city_regency: motherData.city,
            mother_address_province: motherData.province,
            mother_address_other: motherData.other,
            mother_company_addresses: motherData.company,

            // Guardian data
            guardian_name: guardianData.name,
            relation_to_student: guardianData.relationship,
            guardian_phone: guardianData.phone,
            guardian_email: guardianData.email,
            guardian_address_street: guardianData.street,
            guardian_address_rt: guardianData.rt,
            guardian_address_rw: guardianData.rw,
            guardian_address_village: guardianData.village,
            guardian_address_district: guardianData.district,
            guardian_address_city_regency: guardianData.city,
            guardian_address_province: guardianData.province,
            guardian_address_other: guardianData.other,
          };

          onDataChange(allData);
        }

        hasInitialized.current = true;
        isInitialPrefill.current = false;
      }
    } else if (Object.keys(prefill).length === 0 && hasInitialized.current) {
      // Jika prefill menjadi empty object (reset form), reset semua field
      console.log('Resetting ParentGuardianSection form');

      const emptyData = {
        name: '',
        company: '',
        occupation: '',
        phone: '',
        email: '',
        street: '',
        rt: '0',
        rw: '0',
        village: '',
        district: '',
        city: '',
        province: '',
        other: '',
      };

      setFather(emptyData);
      setMother(emptyData);
      setGuardian({ ...emptyData, relationship: '' });

      // Reset error states - PERBAIKAN: Hanya reset jika tidak ada errors dari parent
      if (!errors) {
        setFatherErrors({
          name: false,
          phone: false,
          street: false,
          village: false,
          district: false,
          city: false,
          province: false,
        });
        setMotherErrors({
          name: false,
          phone: false,
          street: false,
          village: false,
          district: false,
          city: false,
          province: false,
        });
        setGuardianErrors({
          name: false,
          phone: false,
          street: false,
          village: false,
          district: false,
          city: false,
          province: false,
        });
      }

      hasInitialized.current = false;
    }
  }, [prefill, onDataChange, errors]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>PARENT / GUARDIAN INFORMATION</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.parentSection}>
          {/* Father's Information */}
          <div className={styles.parentInfoSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionTitleText}>
                Father's Information
              </div>
            </div>
            <div className={styles.parentInfoContent}>
              <div className={styles.fullWidthField}>
                <div className={`${styles.fieldGroup} ${fatherErrors.name ? styles.parentErrorFieldWrapper : ''}`}>
                  <div className={`${styles.label} ${fatherErrors.name ? styles.parentErrorLabel : ''}`}>Name</div>
                  <input
                    className={`${styles.value} ${
                      father.name ? styles.filled : ''
                    } ${fatherErrors.name ? styles.parentErrorInput : ''}`}
                    type='text'
                    value={father.name}
                    onChange={handleChange(setFather, 'name', 'father')}
                    placeholder='JOHN DOE'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Company name</div>
                  <input
                    className={`${styles.value} ${
                      father.company ? styles.filled : ''
                    }`}
                    type='text'
                    value={father.company}
                    onChange={handleChange(setFather, 'company', 'father')}
                    placeholder='PT. MULTI RAKYAT'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Occupation/Position</div>
                  <input
                    className={`${styles.value} ${
                      father.occupation ? styles.filled : ''
                    }`}
                    type='text'
                    value={father.occupation}
                    onChange={handleChange(setFather, 'occupation', 'father')}
                    placeholder='FIELD MANAGER'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={`${styles.fieldGroup} ${fatherErrors.phone ? styles.parentErrorFieldWrapper : ''}`}>
                  <div className={`${styles.label} ${fatherErrors.phone ? styles.parentErrorLabel : ''}`}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      father.phone ? styles.filled : ''
                    } ${fatherErrors.phone ? styles.parentErrorInput : ''}`}
                    type='tel'
                    value={father.phone}
                    onChange={handleChange(setFather, 'phone', 'father')}
                    placeholder='089281560955'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Email</div>
                  <input
                    className={`${styles.value} ${
                      father.email ? styles.filled : ''
                    }`}
                    type='email'
                    value={father.email}
                    onChange={handleChange(setFather, 'email', 'father')}
                    placeholder='JOHNDOEHEBAT@GMAIL.COM'
                  />
                </div>
              </div>
              <div className={styles.addressSection}>
                <div className={styles.twoColumnRow}>
                  <div className={`${styles.fieldGroup} ${fatherErrors.street ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${fatherErrors.street ? styles.parentErrorLabel : ''}`}>Street</div>
                    <input
                      className={`${styles.value} ${
                        father.street ? styles.filled : ''
                      } ${fatherErrors.street ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={father.street}
                      onChange={handleChange(setFather, 'street', 'father')}
                      placeholder='JL. SARUNDAJANG 01'
                    />
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.rtField}>
                      <div className={styles.label}>RT</div>
                      <input
                        className={`${styles.value} ${
                          father.rt ? styles.filled : ''
                        }`}
                        type='text'
                        value={father.rt}
                        onChange={handleChange(setFather, 'rt', 'father')}
                        placeholder='001'
                      />
                    </div>
                    <div className={styles.rwField}>
                      <div className={styles.label}>RW</div>
                      <input
                        className={`${styles.value} ${
                          father.rw ? styles.filled : ''
                        }`}
                        type='text'
                        value={father.rw}
                        onChange={handleChange(setFather, 'rw', 'father')}
                        placeholder='002'
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={`${styles.fieldGroup} ${fatherErrors.village ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${fatherErrors.village ? styles.parentErrorLabel : ''}`}>Village</div>
                    <input
                      className={`${styles.value} ${
                        father.village ? styles.filled : ''
                      } ${fatherErrors.village ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={father.village}
                      onChange={handleChange(setFather, 'village', 'father')}
                      placeholder='GIRIAN'
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${fatherErrors.district ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${fatherErrors.district ? styles.parentErrorLabel : ''}`}>District</div>
                    <input
                      className={`${styles.value} ${
                        father.district ? styles.filled : ''
                      } ${fatherErrors.district ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={father.district}
                      onChange={handleChange(setFather, 'district', 'father')}
                      placeholder='RANOWULU'
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={`${styles.fieldGroup} ${fatherErrors.city ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${fatherErrors.city ? styles.parentErrorLabel : ''}`}>City/Regency</div>
                    <input
                      className={`${styles.value} ${
                        father.city ? styles.filled : ''
                      } ${fatherErrors.city ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={father.city}
                      onChange={handleChange(setFather, 'city', 'father')}
                      placeholder='KOTAMOBAGU'
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${fatherErrors.province ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${fatherErrors.province ? styles.parentErrorLabel : ''}`}>Province</div>
                    <input
                      className={`${styles.value} ${
                        father.province ? styles.filled : ''
                      } ${fatherErrors.province ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={father.province}
                      onChange={handleChange(setFather, 'province', 'father')}
                      placeholder='NORTH SULAWESI'
                    />
                  </div>
                </div>
                <div className={styles.otherField}>
                  <div className={styles.label}>Other</div>
                  <div className={styles.otherValue}>
                    <span className={styles.bracket}>(</span>
                    <input
                      className={`${styles.value} ${
                        father.other ? styles.filled : ''
                      }`}
                      type='text'
                      value={father.other}
                      onChange={handleChange(setFather, 'other', 'father')}
                      placeholder='DAHLIA APARTEMENT UNIT 5023'
                    />
                    <span className={styles.bracket}>)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Mother's Information */}
          <div className={styles.parentInfoSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionTitleText}>
                Mother's Information
              </div>
            </div>
            <div className={styles.parentInfoContent}>
              <div className={styles.fullWidthField}>
                <div className={`${styles.fieldGroup} ${motherErrors.name ? styles.parentErrorFieldWrapper : ''}`}>
                  <div className={`${styles.label} ${motherErrors.name ? styles.parentErrorLabel : ''}`}>Name</div>
                  <input
                    className={`${styles.value} ${
                      mother.name ? styles.filled : ''
                    } ${motherErrors.name ? styles.parentErrorInput : ''}`}
                    type='text'
                    value={mother.name}
                    onChange={handleChange(setMother, 'name', 'mother')}
                    placeholder='JOHN DOE'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Company name</div>
                  <input
                    className={`${styles.value} ${
                      mother.company ? styles.filled : ''
                    }`}
                    type='text'
                    value={mother.company}
                    onChange={handleChange(setMother, 'company', 'mother')}
                    placeholder='PT. MULTI RAKYAT'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Occupation/Position</div>
                  <input
                    className={`${styles.value} ${
                      mother.occupation ? styles.filled : ''
                    }`}
                    type='text'
                    value={mother.occupation}
                    onChange={handleChange(setMother, 'occupation', 'mother')}
                    placeholder='FIELD MANAGER'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={`${styles.fieldGroup} ${motherErrors.phone ? styles.parentErrorFieldWrapper : ''}`}>
                  <div className={`${styles.label} ${motherErrors.phone ? styles.parentErrorLabel : ''}`}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      mother.phone ? styles.filled : ''
                    } ${motherErrors.phone ? styles.parentErrorInput : ''}`}
                    type='tel'
                    value={mother.phone}
                    onChange={handleChange(setMother, 'phone', 'mother')}
                    placeholder='089281560955'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Email</div>
                  <input
                    className={`${styles.value} ${
                      mother.email ? styles.filled : ''
                    }`}
                    type='email'
                    value={mother.email}
                    onChange={handleChange(setMother, 'email', 'mother')}
                    placeholder='JOHNDOEHEBAT@GMAIL.COM'
                  />
                </div>
              </div>
              <div className={styles.addressSection}>
                <div className={styles.twoColumnRow}>
                  <div className={`${styles.fieldGroup} ${motherErrors.street ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${motherErrors.street ? styles.parentErrorLabel : ''}`}>Street</div>
                    <input
                      className={`${styles.value} ${
                        mother.street ? styles.filled : ''
                      } ${motherErrors.street ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={mother.street}
                      onChange={handleChange(setMother, 'street', 'mother')}
                      placeholder='JL. SARUNDAJANG 01'
                    />
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.rtField}>
                      <div className={styles.label}>RT</div>
                      <input
                        className={`${styles.value} ${
                          mother.rt ? styles.filled : ''
                        }`}
                        type='text'
                        value={mother.rt}
                        onChange={handleChange(setMother, 'rt', 'mother')}
                        placeholder='001'
                      />
                    </div>
                    <div className={styles.rwField}>
                      <div className={styles.label}>RW</div>
                      <input
                        className={`${styles.value} ${
                          mother.rw ? styles.filled : ''
                        }`}
                        type='text'
                        value={mother.rw}
                        onChange={handleChange(setMother, 'rw', 'mother')}
                        placeholder='002'
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={`${styles.fieldGroup} ${motherErrors.village ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${motherErrors.village ? styles.parentErrorLabel : ''}`}>Village</div>
                    <input
                      className={`${styles.value} ${
                        mother.village ? styles.filled : ''
                      } ${motherErrors.village ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={mother.village}
                      onChange={handleChange(setMother, 'village', 'mother')}
                      placeholder='GIRIAN'
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${motherErrors.district ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${motherErrors.district ? styles.parentErrorLabel : ''}`}>District</div>
                    <input
                      className={`${styles.value} ${
                        mother.district ? styles.filled : ''
                      } ${motherErrors.district ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={mother.district}
                      onChange={handleChange(setMother, 'district', 'mother')}
                      placeholder='RANOWULU'
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={`${styles.fieldGroup} ${motherErrors.city ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${motherErrors.city ? styles.parentErrorLabel : ''}`}>City/Regency</div>
                    <input
                      className={`${styles.value} ${
                        mother.city ? styles.filled : ''
                      } ${motherErrors.city ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={mother.city}
                      onChange={handleChange(setMother, 'city', 'mother')}
                      placeholder='KOTAMOBAGU'
                    />
                  </div>
                  <div className={`${styles.fieldGroup} ${motherErrors.province ? styles.parentErrorFieldWrapper : ''}`}>
                    <div className={`${styles.label} ${motherErrors.province ? styles.parentErrorLabel : ''}`}>Province</div>
                    <input
                      className={`${styles.value} ${
                        mother.province ? styles.filled : ''
                      } ${motherErrors.province ? styles.parentErrorInput : ''}`}
                      type='text'
                      value={mother.province}
                      onChange={handleChange(setMother, 'province', 'mother')}
                      placeholder='NORTH SULAWESI'
                    />
                  </div>
                </div>
                <div className={styles.otherField}>
                  <div className={styles.label}>Other</div>
                  <div className={styles.otherValue}>
                    <span className={styles.bracket}>(</span>
                    <input
                      className={`${styles.value} ${
                        mother.other ? styles.filled : ''
                      }`}
                      type='text'
                      value={mother.other}
                      onChange={handleChange(setMother, 'other', 'mother')}
                      placeholder='DAHLIA APARTEMENT UNIT 5023'
                    />
                    <span className={styles.bracket}>)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Guardian's Information */}
          <div className={styles.parentInfoSection}>
            <div className={styles.sectionTitle}>
              <div className={styles.sectionTitleText}>
                Authorized Guardian's Information
              </div>
            </div>
            <div className={styles.parentInfoContent}>
              <div className={styles.fullWidthField}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Name</div>
                  <input
                    className={`${styles.value} ${
                      guardian.name ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.name}
                    onChange={handleChange(setGuardian, 'name', 'guardian')}
                    placeholder='JOHN DOE'
                  />
                </div>
              </div>
              <div className={styles.fullWidthField}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Relationship to student</div>
                  <input
                    className={`${styles.value} ${
                      guardian.relationship ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.relationship}
                    onChange={handleChange(
                      setGuardian,
                      'relationship',
                      'guardian'
                    )}
                    placeholder='UNCLE'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      guardian.phone ? styles.filled : ''
                    }`}
                    type='tel'
                    value={guardian.phone}
                    onChange={handleChange(setGuardian, 'phone', 'guardian')}
                    placeholder='082176543890'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Email</div>
                  <input
                    className={`${styles.value} ${
                      guardian.email ? styles.filled : ''
                    }`}
                    type='email'
                    value={guardian.email}
                    onChange={handleChange(setGuardian, 'email', 'guardian')}
                    placeholder='JOHNDOE@GMAIL.COM'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Street</div>
                  <input
                    className={`${styles.value} ${
                      guardian.street ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.street}
                    onChange={handleChange(setGuardian, 'street', 'guardian')}
                    placeholder='JL. SARUNDAJANG 01'
                  />
                </div>
                <div className={styles.rtRwGroup}>
                  <div className={styles.rtField}>
                    <div className={styles.label}>RT</div>
                    <input
                      className={`${styles.value} ${
                        guardian.rt ? styles.filled : ''
                      }`}
                      type='text'
                      value={guardian.rt}
                      onChange={handleChange(setGuardian, 'rt', 'guardian')}
                      placeholder='001'
                    />
                  </div>
                  <div className={styles.rwField}>
                    <div className={styles.label}>RW</div>
                    <input
                      className={`${styles.value} ${
                        guardian.rw ? styles.filled : ''
                      }`}
                      type='text'
                      value={guardian.rw}
                      onChange={handleChange(setGuardian, 'rw', 'guardian')}
                      placeholder='002'
                    />
                  </div>
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Village</div>
                  <input
                    className={`${styles.value} ${
                      guardian.village ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.village}
                    onChange={handleChange(setGuardian, 'village', 'guardian')}
                    placeholder='GIRIAN'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>District</div>
                  <input
                    className={`${styles.value} ${
                      guardian.district ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.district}
                    onChange={handleChange(setGuardian, 'district', 'guardian')}
                    placeholder='RANOWULU'
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>City/Regency</div>
                  <input
                    className={`${styles.value} ${
                      guardian.city ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.city}
                    onChange={handleChange(setGuardian, 'city', 'guardian')}
                    placeholder='KOTAMOBAGU'
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Province</div>
                  <input
                    className={`${styles.value} ${
                      guardian.province ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.province}
                    onChange={handleChange(setGuardian, 'province', 'guardian')}
                    placeholder='NORTH SULAWESI'
                  />
                </div>
              </div>
              <div className={styles.otherField}>
                <div className={styles.label}>Other</div>
                <div className={styles.otherValue}>
                  <span className={styles.bracket}>(</span>
                  <input
                    className={`${styles.value} ${
                      guardian.other ? styles.filled : ''
                    }`}
                    type='text'
                    value={guardian.other}
                    onChange={handleChange(setGuardian, 'other', 'guardian')}
                    placeholder='DAHLIA APARTEMENT UNIT 5023'
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

export default ParentGuardianSection;
