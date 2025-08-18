import React, { useState } from 'react';
import styles from './ParentGuardianSection.module.css';

const ParentGuardianSection = ({ onDataChange }) => {
  // State untuk Father
  const [father, setFather] = useState({
    name: '',
    company: '',
    occupation: '',
    phone: '',
    email: '',
    street: '',
    rt: '',
    rw: '',
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
    rt: '',
    rw: '',
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
    rt: '',
    rw: '',
    village: '',
    district: '',
    city: '',
    province: '',
    other: '',
  });

  // Helper untuk handle input change dan kirim data ke parent
  const handleChange = (setter, field, section) => (e) => {
    const value = e.target.value;
    setter((prev) => ({ ...prev, [field]: value }));

    // Kirim data ke parent component dengan format yang benar
    if (onDataChange) {
      // Buat object yang berisi semua data yang sudah diisi
      const allData = {};

      // Tambahkan data father dengan field mapping yang benar
      if (father.name) allData.father_name = father.name;
      if (father.company) allData.father_company = father.company;
      if (father.occupation) allData.father_occupation = father.occupation;
      if (father.phone) allData.father_phone = father.phone;
      if (father.email) allData.father_email = father.email;
      if (father.street) allData.father_address_street = father.street;
      if (father.rt) allData.father_address_rt = father.rt;
      if (father.rw) allData.father_address_rw = father.rw;
      if (father.village) allData.father_address_village = father.village;
      if (father.district) allData.father_address_district = father.district;
      if (father.city) allData.father_address_city_regency = father.city;
      if (father.province) allData.father_address_province = father.province;
      if (father.other) allData.father_address_other = father.other;
      if (father.company) allData.father_company_addresses = father.company;

      // Tambahkan data mother dengan field mapping yang benar
      if (mother.name) allData.mother_name = mother.name;
      if (mother.company) allData.mother_company = mother.company;
      if (mother.occupation) allData.mother_occupation = mother.occupation;
      if (mother.phone) allData.mother_phone = mother.phone;
      if (mother.email) allData.mother_email = mother.email;
      if (mother.street) allData.mother_address_street = mother.street;
      if (mother.rt) allData.mother_address_rt = mother.rt;
      if (mother.rw) allData.mother_address_rw = mother.rw;
      if (mother.village) allData.mother_address_village = mother.village;
      if (mother.district) allData.mother_address_district = mother.district;
      if (mother.city) allData.mother_address_city_regency = mother.city;
      if (mother.province) allData.mother_address_province = mother.province;
      if (mother.other) allData.mother_address_other = mother.other;
      if (mother.company) allData.mother_company_addresses = mother.company;

      // Tambahkan data guardian dengan field mapping yang benar
      if (guardian.name) allData.guardian_name = guardian.name;
      if (guardian.relationship)
        allData.relation_to_student = guardian.relationship;
      if (guardian.phone) allData.guardian_phone = guardian.phone;
      if (guardian.email) allData.guardian_email = guardian.email;
      if (guardian.street) allData.guardian_address_street = guardian.street;
      if (guardian.rt) allData.guardian_address_rt = guardian.rt;
      if (guardian.rw) allData.guardian_address_rw = guardian.rw;
      if (guardian.village) allData.guardian_address_village = guardian.village;
      if (guardian.district)
        allData.guardian_address_district = guardian.district;
      if (guardian.city) allData.guardian_address_city_regency = guardian.city;
      if (guardian.province)
        allData.guardian_address_province = guardian.province;
      if (guardian.other) allData.guardian_address_other = guardian.other;

      // Kirim semua data sekaligus
      onDataChange(allData);
    }
  };

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
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Name</div>
                  <input
                    className={`${styles.value} ${
                      father.name ? styles.filled : ''
                    }`}
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
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      father.phone ? styles.filled : ''
                    }`}
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
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Street</div>
                    <input
                      className={`${styles.value} ${
                        father.street ? styles.filled : ''
                      }`}
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
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Village</div>
                    <input
                      className={`${styles.value} ${
                        father.village ? styles.filled : ''
                      }`}
                      type='text'
                      value={father.village}
                      onChange={handleChange(setFather, 'village', 'father')}
                      placeholder='GIRIAN'
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>District</div>
                    <input
                      className={`${styles.value} ${
                        father.district ? styles.filled : ''
                      }`}
                      type='text'
                      value={father.district}
                      onChange={handleChange(setFather, 'district', 'father')}
                      placeholder='RANOWULU'
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>City/Regency</div>
                    <input
                      className={`${styles.value} ${
                        father.city ? styles.filled : ''
                      }`}
                      type='text'
                      value={father.city}
                      onChange={handleChange(setFather, 'city', 'father')}
                      placeholder='KOTAMOBAGU'
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Province</div>
                    <input
                      className={`${styles.value} ${
                        father.province ? styles.filled : ''
                      }`}
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
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Name</div>
                  <input
                    className={`${styles.value} ${
                      mother.name ? styles.filled : ''
                    }`}
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
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      mother.phone ? styles.filled : ''
                    }`}
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
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Street</div>
                    <input
                      className={`${styles.value} ${
                        mother.street ? styles.filled : ''
                      }`}
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
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Village</div>
                    <input
                      className={`${styles.value} ${
                        mother.village ? styles.filled : ''
                      }`}
                      type='text'
                      value={mother.village}
                      onChange={handleChange(setMother, 'village', 'mother')}
                      placeholder='GIRIAN'
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>District</div>
                    <input
                      className={`${styles.value} ${
                        mother.district ? styles.filled : ''
                      }`}
                      type='text'
                      value={mother.district}
                      onChange={handleChange(setMother, 'district', 'mother')}
                      placeholder='RANOWULU'
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>City/Regency</div>
                    <input
                      className={`${styles.value} ${
                        mother.city ? styles.filled : ''
                      }`}
                      type='text'
                      value={mother.city}
                      onChange={handleChange(setMother, 'city', 'mother')}
                      placeholder='KOTAMOBAGU'
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Province</div>
                    <input
                      className={`${styles.value} ${
                        mother.province ? styles.filled : ''
                      }`}
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
