import React, { useState } from "react";
import styles from "./ParentGuardianSection.module.css";

const ParentGuardianSection = () => {
  // State untuk Father
  const [father, setFather] = useState({
    name: "",
    company: "",
    occupation: "",
    phone: "",
    email: "",
    street: "",
    rt: "",
    rw: "",
    village: "",
    district: "",
    city: "",
    province: "",
    other: "",
  });
  // State untuk Mother
  const [mother, setMother] = useState({
    name: "",
    company: "",
    occupation: "",
    phone: "",
    email: "",
    street: "",
    rt: "",
    rw: "",
    village: "",
    district: "",
    city: "",
    province: "",
    other: "",
  });
  // State untuk Guardian
  const [guardian, setGuardian] = useState({
    name: "",
    relationship: "",
    phone: "",
    email: "",
    street: "",
    rt: "",
    rw: "",
    village: "",
    district: "",
    city: "",
    province: "",
    other: "",
  });

  // Helper untuk handle input change
  const handleChange = (setter, field) => (e) => {
    setter((prev) => ({ ...prev, [field]: e.target.value }));
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
                      father.name ? styles.filled : ""
                    }`}
                    type="text"
                    value={father.name}
                    onChange={handleChange(setFather, "name")}
                    placeholder="JOHN DOE"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Company name</div>
                  <input
                    className={`${styles.value} ${
                      father.company ? styles.filled : ""
                    }`}
                    type="text"
                    value={father.company}
                    onChange={handleChange(setFather, "company")}
                    placeholder="PT. MULTI RAKYAT"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Occupation/Position</div>
                  <input
                    className={`${styles.value} ${
                      father.occupation ? styles.filled : ""
                    }`}
                    type="text"
                    value={father.occupation}
                    onChange={handleChange(setFather, "occupation")}
                    placeholder="FIELD MANAGER"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      father.phone ? styles.filled : ""
                    }`}
                    type="tel"
                    value={father.phone}
                    onChange={handleChange(setFather, "phone")}
                    placeholder="089281560955"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Email</div>
                  <input
                    className={`${styles.value} ${
                      father.email ? styles.filled : ""
                    }`}
                    type="email"
                    value={father.email}
                    onChange={handleChange(setFather, "email")}
                    placeholder="JOHNDOEHEBAT@GMAIL.COM"
                  />
                </div>
              </div>
              <div className={styles.addressSection}>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Street</div>
                    <input
                      className={`${styles.value} ${
                        father.street ? styles.filled : ""
                      }`}
                      type="text"
                      value={father.street}
                      onChange={handleChange(setFather, "street")}
                      placeholder="JL. SARUNDAJANG 01"
                    />
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.rtField}>
                      <div className={styles.label}>RT</div>
                      <input
                        className={`${styles.value} ${
                          father.rt ? styles.filled : ""
                        }`}
                        type="text"
                        value={father.rt}
                        onChange={handleChange(setFather, "rt")}
                        placeholder="001"
                      />
                    </div>
                    <div className={styles.rwField}>
                      <div className={styles.label}>RW</div>
                      <input
                        className={`${styles.value} ${
                          father.rw ? styles.filled : ""
                        }`}
                        type="text"
                        value={father.rw}
                        onChange={handleChange(setFather, "rw")}
                        placeholder="002"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Village</div>
                    <input
                      className={`${styles.value} ${
                        father.village ? styles.filled : ""
                      }`}
                      type="text"
                      value={father.village}
                      onChange={handleChange(setFather, "village")}
                      placeholder="GIRIAN"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>District</div>
                    <input
                      className={`${styles.value} ${
                        father.district ? styles.filled : ""
                      }`}
                      type="text"
                      value={father.district}
                      onChange={handleChange(setFather, "district")}
                      placeholder="RANOWULU"
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>City/Regency</div>
                    <input
                      className={`${styles.value} ${
                        father.city ? styles.filled : ""
                      }`}
                      type="text"
                      value={father.city}
                      onChange={handleChange(setFather, "city")}
                      placeholder="KOTAMOBAGU"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Province</div>
                    <input
                      className={`${styles.value} ${
                        father.province ? styles.filled : ""
                      }`}
                      type="text"
                      value={father.province}
                      onChange={handleChange(setFather, "province")}
                      placeholder="NORTH SULAWESI"
                    />
                  </div>
                </div>
                <div className={styles.otherField}>
                  <div className={styles.label}>Other</div>
                  <div className={styles.otherValue}>
                    <span className={styles.bracket}>(</span>
                    <input
                      className={`${styles.value} ${
                        father.other ? styles.filled : ""
                      }`}
                      type="text"
                      value={father.other}
                      onChange={handleChange(setFather, "other")}
                      placeholder="DAHLIA APARTEMENT UNIT 5023"
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
                      mother.name ? styles.filled : ""
                    }`}
                    type="text"
                    value={mother.name}
                    onChange={handleChange(setMother, "name")}
                    placeholder="JOHN DOE"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Company name</div>
                  <input
                    className={`${styles.value} ${
                      mother.company ? styles.filled : ""
                    }`}
                    type="text"
                    value={mother.company}
                    onChange={handleChange(setMother, "company")}
                    placeholder="PT. MULTI RAKYAT"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Occupation/Position</div>
                  <input
                    className={`${styles.value} ${
                      mother.occupation ? styles.filled : ""
                    }`}
                    type="text"
                    value={mother.occupation}
                    onChange={handleChange(setMother, "occupation")}
                    placeholder="FIELD MANAGER"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      mother.phone ? styles.filled : ""
                    }`}
                    type="tel"
                    value={mother.phone}
                    onChange={handleChange(setMother, "phone")}
                    placeholder="089281560955"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Email</div>
                  <input
                    className={`${styles.value} ${
                      mother.email ? styles.filled : ""
                    }`}
                    type="email"
                    value={mother.email}
                    onChange={handleChange(setMother, "email")}
                    placeholder="JOHNDOEHEBAT@GMAIL.COM"
                  />
                </div>
              </div>
              <div className={styles.addressSection}>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Street</div>
                    <input
                      className={`${styles.value} ${
                        mother.street ? styles.filled : ""
                      }`}
                      type="text"
                      value={mother.street}
                      onChange={handleChange(setMother, "street")}
                      placeholder="JL. SARUNDAJANG 01"
                    />
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.rtField}>
                      <div className={styles.label}>RT</div>
                      <input
                        className={`${styles.value} ${
                          mother.rt ? styles.filled : ""
                        }`}
                        type="text"
                        value={mother.rt}
                        onChange={handleChange(setMother, "rt")}
                        placeholder="001"
                      />
                    </div>
                    <div className={styles.rwField}>
                      <div className={styles.label}>RW</div>
                      <input
                        className={`${styles.value} ${
                          mother.rw ? styles.filled : ""
                        }`}
                        type="text"
                        value={mother.rw}
                        onChange={handleChange(setMother, "rw")}
                        placeholder="002"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Village</div>
                    <input
                      className={`${styles.value} ${
                        mother.village ? styles.filled : ""
                      }`}
                      type="text"
                      value={mother.village}
                      onChange={handleChange(setMother, "village")}
                      placeholder="GIRIAN"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>District</div>
                    <input
                      className={`${styles.value} ${
                        mother.district ? styles.filled : ""
                      }`}
                      type="text"
                      value={mother.district}
                      onChange={handleChange(setMother, "district")}
                      placeholder="RANOWULU"
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>City/Regency</div>
                    <input
                      className={`${styles.value} ${
                        mother.city ? styles.filled : ""
                      }`}
                      type="text"
                      value={mother.city}
                      onChange={handleChange(setMother, "city")}
                      placeholder="KOTAMOBAGU"
                    />
                  </div>
                  <div className={styles.fieldGroup}>
                    <div className={styles.label}>Province</div>
                    <input
                      className={`${styles.value} ${
                        mother.province ? styles.filled : ""
                      }`}
                      type="text"
                      value={mother.province}
                      onChange={handleChange(setMother, "province")}
                      placeholder="NORTH SULAWESI"
                    />
                  </div>
                </div>
                <div className={styles.otherField}>
                  <div className={styles.label}>Other</div>
                  <div className={styles.otherValue}>
                    <span className={styles.bracket}>(</span>
                    <input
                      className={`${styles.value} ${
                        mother.other ? styles.filled : ""
                      }`}
                      type="text"
                      value={mother.other}
                      onChange={handleChange(setMother, "other")}
                      placeholder="DAHLIA APARTEMENT UNIT 5023"
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
                      guardian.name ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.name}
                    onChange={handleChange(setGuardian, "name")}
                    placeholder="JOHN DOE"
                  />
                </div>
              </div>
              <div className={styles.fullWidthField}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Relationship to student</div>
                  <input
                    className={`${styles.value} ${
                      guardian.relationship ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.relationship}
                    onChange={handleChange(setGuardian, "relationship")}
                    placeholder="UNCLE"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Phone number</div>
                  <input
                    className={`${styles.value} ${
                      guardian.phone ? styles.filled : ""
                    }`}
                    type="tel"
                    value={guardian.phone}
                    onChange={handleChange(setGuardian, "phone")}
                    placeholder="082176543890"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Email</div>
                  <input
                    className={`${styles.value} ${
                      guardian.email ? styles.filled : ""
                    }`}
                    type="email"
                    value={guardian.email}
                    onChange={handleChange(setGuardian, "email")}
                    placeholder="JOHNDOE@GMAIL.COM"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Street</div>
                  <input
                    className={`${styles.value} ${
                      guardian.street ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.street}
                    onChange={handleChange(setGuardian, "street")}
                    placeholder="JL. SARUNDAJANG 01"
                  />
                </div>
                <div className={styles.rtRwGroup}>
                  <div className={styles.rtField}>
                    <div className={styles.label}>RT</div>
                    <input
                      className={`${styles.value} ${
                        guardian.rt ? styles.filled : ""
                      }`}
                      type="text"
                      value={guardian.rt}
                      onChange={handleChange(setGuardian, "rt")}
                      placeholder="001"
                    />
                  </div>
                  <div className={styles.rwField}>
                    <div className={styles.label}>RW</div>
                    <input
                      className={`${styles.value} ${
                        guardian.rw ? styles.filled : ""
                      }`}
                      type="text"
                      value={guardian.rw}
                      onChange={handleChange(setGuardian, "rw")}
                      placeholder="002"
                    />
                  </div>
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Village</div>
                  <input
                    className={`${styles.value} ${
                      guardian.village ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.village}
                    onChange={handleChange(setGuardian, "village")}
                    placeholder="GIRIAN"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>District</div>
                  <input
                    className={`${styles.value} ${
                      guardian.district ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.district}
                    onChange={handleChange(setGuardian, "district")}
                    placeholder="RANOWULU"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>City/Regency</div>
                  <input
                    className={`${styles.value} ${
                      guardian.city ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.city}
                    onChange={handleChange(setGuardian, "city")}
                    placeholder="KOTAMOBAGU"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Province</div>
                  <input
                    className={`${styles.value} ${
                      guardian.province ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.province}
                    onChange={handleChange(setGuardian, "province")}
                    placeholder="NORTH SULAWESI"
                  />
                </div>
              </div>
              <div className={styles.otherField}>
                <div className={styles.label}>Other</div>
                <div className={styles.otherValue}>
                  <span className={styles.bracket}>(</span>
                  <input
                    className={`${styles.value} ${
                      guardian.other ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.other}
                    onChange={handleChange(setGuardian, "other")}
                    placeholder="DAHLIA APARTEMENT UNIT 5023"
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
