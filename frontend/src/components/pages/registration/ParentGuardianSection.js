import React from "react";
import styles from "./ParentGuardianSection.module.css";

const ParentGuardianSection = ({ formData, onDataChange, errors }) => {
  // State untuk error highlight
  const [fatherErrors, setFatherErrors] = React.useState({});
  const [motherErrors, setMotherErrors] = React.useState({});

  React.useEffect(() => {
    if (errors) {
      setFatherErrors({
        name: !!errors.father_name,
        phone: !!errors.father_phone,
        email: !!errors.father_email,
        street: !!errors.father_address_street,
        village: !!errors.father_address_village,
        district: !!errors.father_address_district,
        city: !!errors.father_address_city_regency,
        province: !!errors.father_address_province,
      });
      setMotherErrors({
        name: !!errors.mother_name,
        phone: !!errors.mother_phone,
        email: !!errors.mother_email,
        street: !!errors.mother_address_street,
        village: !!errors.mother_address_village,
        district: !!errors.mother_address_district,
        city: !!errors.mother_address_city_regency,
        province: !!errors.mother_address_province,
      });
    }
  }, [errors]);

  // INI FUNGSI handleChange YANG BENAR:
  // Menerima satu 'key' (misal: "father_name") dan mengirim update ke parent.
  const handleChange = (key) => (e) => {
    const { value } = e.target;
    onDataChange({ [key]: value });
  };

  // Membuat variabel objek NESTED dari props formData yang FLAT.
  // Ini adalah "jembatan" agar JSX tidak perlu diubah.
  const father = {
    name: formData.father_name,
    company: formData.father_company,
    occupation: formData.father_occupation,
    phone: formData.father_phone,
    email: formData.father_email,
    street: formData.father_address_street,
    rt: formData.father_address_rt,
    rw: formData.father_address_rw,
    village: formData.father_address_village,
    district: formData.father_address_district,
    city: formData.father_address_city_regency,
    province: formData.father_address_province,
    other: formData.father_address_other,
  };

  const mother = {
    name: formData.mother_name,
    company: formData.mother_company,
    occupation: formData.mother_occupation,
    phone: formData.mother_phone,
    email: formData.mother_email,
    street: formData.mother_address_street,
    rt: formData.mother_address_rt,
    rw: formData.mother_address_rw,
    village: formData.mother_address_village,
    district: formData.mother_address_district,
    city: formData.mother_address_city_regency,
    province: formData.mother_address_province,
    other: formData.mother_address_other,
  };

  const guardian = {
    name: formData.guardian_name,
    relationship: formData.relation_to_student,
    phone: formData.guardian_phone,
    email: formData.guardian_email,
    street: formData.guardian_address_street,
    rt: formData.guardian_address_rt,
    rw: formData.guardian_address_rw,
    village: formData.guardian_address_village,
    district: formData.guardian_address_district,
    city: formData.guardian_address_city_regency,
    province: formData.guardian_address_province,
    other: formData.guardian_address_other,
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
                <div
                  className={`${styles.fieldGroup} ${
                    fatherErrors.name ? styles.parentErrorFieldWrapper : ""
                  }`}
                >
                  <div
                    className={`${styles.label} ${
                      fatherErrors.name ? styles.parentErrorLabel : ""
                    }`}
                  >
                    Name
                  </div>
                  <input
                    className={`${styles.value} ${
                      father.name ? styles.filled : ""
                    } ${fatherErrors.name ? styles.parentErrorInput : ""}`}
                    type="text"
                    value={father.name || ""}
                    onChange={handleChange("father_name")}
                    placeholder="John Doe"
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
                    value={father.company || ""}
                    onChange={handleChange("father_company")}
                    placeholder="PT. Multi Rakyat"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Occupation/Position</div>
                  <input
                    className={`${styles.value} ${
                      father.occupation ? styles.filled : ""
                    }`}
                    type="text"
                    value={father.occupation || ""}
                    onChange={handleChange("father_occupation")}
                    placeholder="Field Manager"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div
                  className={`${styles.fieldGroup} ${
                    fatherErrors.phone ? styles.parentErrorFieldWrapper : ""
                  }`}
                >
                  <div
                    className={`${styles.label} ${
                      fatherErrors.phone ? styles.parentErrorLabel : ""
                    }`}
                  >
                    Phone number
                  </div>
                  <div className={styles.inputWithError}>
                    <input
                      className={`${styles.value} ${
                        father.phone ? styles.filled : ""
                      } ${fatherErrors.phone ? styles.parentErrorInput : ""}`}
                      type="tel"
                      value={father.phone || ""}
                      maxLength="20"
                      onChange={handleChange("father_phone")}
                      placeholder="089281560955"
                    />
                    {fatherErrors.phone && (
                      <div className={styles.inlineErrorMessage}>
                        {typeof fatherErrors.phone === "string"
                          ? fatherErrors.phone
                          : "Phone number must be at most 20 characters"}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.fieldGroup} ${
                    fatherErrors.email ? styles.parentErrorFieldWrapper : ""
                  }`}
                >
                  <div
                    className={`${styles.label} ${
                      fatherErrors.email ? styles.parentErrorLabel : ""
                    }`}
                  >
                    Email
                  </div>
                  <div className={styles.inputWithError}>
                    <input
                      className={`${styles.value} ${
                        father.email ? styles.filled : ""
                      } ${fatherErrors.email ? styles.parentErrorInput : ""}`}
                      type="email"
                      value={father.email || ""}
                      onChange={handleChange("father_email")}
                      placeholder="Johndoehebat@gmail.com"
                    />
                    {fatherErrors.email && (
                      <div className={styles.inlineErrorMessage}>
                        {typeof fatherErrors.email === "string"
                          ? fatherErrors.email
                          : "Please enter a valid email address"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.addressSection}>
                <div className={styles.twoColumnRow}>
                  <div
                    className={`${styles.fieldGroup} ${
                      fatherErrors.street ? styles.parentErrorFieldWrapper : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        fatherErrors.street ? styles.parentErrorLabel : ""
                      }`}
                    >
                      Street
                    </div>
                    <input
                      className={`${styles.value} ${
                        father.street ? styles.filled : ""
                      } ${fatherErrors.street ? styles.parentErrorInput : ""}`}
                      type="text"
                      value={father.street || ""}
                      onChange={handleChange("father_address_street")}
                      placeholder="JL. Sarundajang 01"
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
                        value={father.rt || ""}
                        onChange={handleChange("father_address_rt")}
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
                        value={father.rw || ""}
                        onChange={handleChange("father_address_rw")}
                        placeholder="002"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div
                    className={`${styles.fieldGroup} ${
                      fatherErrors.village ? styles.parentErrorFieldWrapper : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        fatherErrors.village ? styles.parentErrorLabel : ""
                      }`}
                    >
                      Village
                    </div>
                    <input
                      className={`${styles.value} ${
                        father.village ? styles.filled : ""
                      } ${fatherErrors.village ? styles.parentErrorInput : ""}`}
                      type="text"
                      value={father.village || ""}
                      onChange={handleChange("father_address_village")}
                      placeholder="Girian"
                    />
                  </div>
                  <div
                    className={`${styles.fieldGroup} ${
                      fatherErrors.district
                        ? styles.parentErrorFieldWrapper
                        : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        fatherErrors.district ? styles.parentErrorLabel : ""
                      }`}
                    >
                      District
                    </div>
                    <input
                      className={`${styles.value} ${
                        father.district ? styles.filled : ""
                      } ${
                        fatherErrors.district ? styles.parentErrorInput : ""
                      }`}
                      type="text"
                      value={father.district || ""}
                      onChange={handleChange("father_address_district")}
                      placeholder="Danowudu"
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div
                    className={`${styles.fieldGroup} ${
                      fatherErrors.city ? styles.parentErrorFieldWrapper : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        fatherErrors.city ? styles.parentErrorLabel : ""
                      }`}
                    >
                      City/Regency
                    </div>
                    <input
                      className={`${styles.value} ${
                        father.city ? styles.filled : ""
                      } ${fatherErrors.city ? styles.parentErrorInput : ""}`}
                      type="text"
                      value={father.city || ""}
                      onChange={handleChange("father_address_city_regency")}
                      placeholder="Kotamobagu"
                    />
                  </div>
                  <div
                    className={`${styles.fieldGroup} ${
                      fatherErrors.province
                        ? styles.parentErrorFieldWrapper
                        : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        fatherErrors.province ? styles.parentErrorLabel : ""
                      }`}
                    >
                      Province
                    </div>
                    <input
                      className={`${styles.value} ${
                        father.province ? styles.filled : ""
                      } ${
                        fatherErrors.province ? styles.parentErrorInput : ""
                      }`}
                      type="text"
                      value={father.province || ""}
                      onChange={handleChange("father_address_province")}
                      placeholder="North Sulawesi"
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
                      value={father.other || ""}
                      onChange={handleChange("father_address_other")}
                      placeholder="Dahlia Apartement Unit 502"
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
                <div
                  className={`${styles.fieldGroup} ${
                    motherErrors.name ? styles.parentErrorFieldWrapper : ""
                  }`}
                >
                  <div
                    className={`${styles.label} ${
                      motherErrors.name ? styles.parentErrorLabel : ""
                    }`}
                  >
                    Name
                  </div>
                  <input
                    className={`${styles.value} ${
                      mother.name ? styles.filled : ""
                    } ${motherErrors.name ? styles.parentErrorInput : ""}`}
                    type="text"
                    value={mother.name || ""}
                    onChange={handleChange("mother_name")}
                    placeholder="Jane Doe"
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
                    value={mother.company || ""}
                    onChange={handleChange("mother_company")}
                    placeholder="PT. Multi Rakyat"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Occupation/Position</div>
                  <input
                    className={`${styles.value} ${
                      mother.occupation ? styles.filled : ""
                    }`}
                    type="text"
                    value={mother.occupation || ""}
                    onChange={handleChange("mother_occupation")}
                    placeholder="Field Manager"
                  />
                </div>
              </div>
              <div className={styles.twoColumnRow}>
                <div
                  className={`${styles.fieldGroup} ${
                    motherErrors.phone ? styles.parentErrorFieldWrapper : ""
                  }`}
                >
                  <div
                    className={`${styles.label} ${
                      motherErrors.phone ? styles.parentErrorLabel : ""
                    }`}
                  >
                    Phone number
                  </div>
                  <div className={styles.inputWithError}>
                    <input
                      className={`${styles.value} ${
                        mother.phone ? styles.filled : ""
                      } ${motherErrors.phone ? styles.parentErrorInput : ""}`}
                      type="tel"
                      value={mother.phone || ""}
                      maxLength="20"
                      onChange={handleChange("mother_phone")}
                      placeholder="089281560955"
                    />
                    {motherErrors.phone && (
                      <div className={styles.inlineErrorMessage}>
                        {typeof motherErrors.phone === "string"
                          ? motherErrors.phone
                          : "Phone number must be at most 20 characters"}
                      </div>
                    )}
                  </div>
                </div>
                <div
                  className={`${styles.fieldGroup} ${
                    motherErrors.email ? styles.parentErrorFieldWrapper : ""
                  }`}
                >
                  <div
                    className={`${styles.label} ${
                      motherErrors.email ? styles.parentErrorLabel : ""
                    }`}
                  >
                    Email
                  </div>
                  <div className={styles.inputWithError}>
                    <input
                      className={`${styles.value} ${
                        mother.email ? styles.filled : ""
                      } ${motherErrors.email ? styles.parentErrorInput : ""}`}
                      type="email"
                      value={mother.email || ""}
                      onChange={handleChange("mother_email")}
                      placeholder="Janedoehebat@gmail.com"
                    />
                    {motherErrors.email && (
                      <div className={styles.inlineErrorMessage}>
                        {typeof motherErrors.email === "string"
                          ? motherErrors.email
                          : "Please enter a valid email address"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={styles.addressSection}>
                <div className={styles.twoColumnRow}>
                  <div
                    className={`${styles.fieldGroup} ${
                      motherErrors.street ? styles.parentErrorFieldWrapper : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        motherErrors.street ? styles.parentErrorLabel : ""
                      }`}
                    >
                      Street
                    </div>
                    <input
                      className={`${styles.value} ${
                        mother.street ? styles.filled : ""
                      } ${motherErrors.street ? styles.parentErrorInput : ""}`}
                      type="text"
                      value={mother.street || ""}
                      onChange={handleChange("mother_address_street")}
                      placeholder="JL. Sarundajang 01"
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
                        value={mother.rt || ""}
                        onChange={handleChange("mother_address_rt")}
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
                        value={mother.rw || ""}
                        onChange={handleChange("mother_address_rw")}
                        placeholder="002"
                      />
                    </div>
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div
                    className={`${styles.fieldGroup} ${
                      motherErrors.village ? styles.parentErrorFieldWrapper : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        motherErrors.village ? styles.parentErrorLabel : ""
                      }`}
                    >
                      Village
                    </div>
                    <input
                      className={`${styles.value} ${
                        mother.village ? styles.filled : ""
                      } ${motherErrors.village ? styles.parentErrorInput : ""}`}
                      type="text"
                      value={mother.village || ""}
                      onChange={handleChange("mother_address_village")}
                      placeholder="Girian"
                    />
                  </div>
                  <div
                    className={`${styles.fieldGroup} ${
                      motherErrors.district
                        ? styles.parentErrorFieldWrapper
                        : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        motherErrors.district ? styles.parentErrorLabel : ""
                      }`}
                    >
                      District
                    </div>
                    <input
                      className={`${styles.value} ${
                        mother.district ? styles.filled : ""
                      } ${
                        motherErrors.district ? styles.parentErrorInput : ""
                      }`}
                      type="text"
                      value={mother.district || ""}
                      onChange={handleChange("mother_address_district")}
                      placeholder="Danowudu"
                    />
                  </div>
                </div>
                <div className={styles.twoColumnRow}>
                  <div
                    className={`${styles.fieldGroup} ${
                      motherErrors.city ? styles.parentErrorFieldWrapper : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        motherErrors.city ? styles.parentErrorLabel : ""
                      }`}
                    >
                      City/Regency
                    </div>
                    <input
                      className={`${styles.value} ${
                        mother.city ? styles.filled : ""
                      } ${motherErrors.city ? styles.parentErrorInput : ""}`}
                      type="text"
                      value={mother.city || ""}
                      onChange={handleChange("mother_address_city_regency")}
                      placeholder="Kotamobagu"
                    />
                  </div>
                  <div
                    className={`${styles.fieldGroup} ${
                      motherErrors.province
                        ? styles.parentErrorFieldWrapper
                        : ""
                    }`}
                  >
                    <div
                      className={`${styles.label} ${
                        motherErrors.province ? styles.parentErrorLabel : ""
                      }`}
                    >
                      Province
                    </div>
                    <input
                      className={`${styles.value} ${
                        mother.province ? styles.filled : ""
                      } ${
                        motherErrors.province ? styles.parentErrorInput : ""
                      }`}
                      type="text"
                      value={mother.province || ""}
                      onChange={handleChange("mother_address_province")}
                      placeholder="North Sulawesi"
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
                      value={mother.other || ""}
                      onChange={handleChange("mother_address_other")}
                      placeholder="Dahlia Apartement Unit 502"
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
                    value={guardian.name || ""}
                    onChange={handleChange("guardian_name")}
                    placeholder="John Doe"
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
                    value={guardian.relationship || ""}
                    onChange={handleChange("relation_to_student")}
                    placeholder="Uncle"
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
                    value={guardian.phone || ""}
                    onChange={handleChange("guardian_phone")}
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
                    value={guardian.email || ""}
                    onChange={handleChange("guardian_email")}
                    placeholder="Johndoe@gmail.com"
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
                    value={guardian.street || ""}
                    onChange={handleChange("guardian_address_street")}
                    placeholder="JL. Sarundajang 01"
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
                      value={guardian.rt || ""}
                      onChange={handleChange("guardian_address_rt")}
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
                      value={guardian.rw || ""}
                      onChange={handleChange("guardian_address_rw")}
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
                    value={guardian.village || ""}
                    onChange={handleChange("guardian_address_village")}
                    placeholder="Girian"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>District</div>
                  <input
                    className={`${styles.value} ${
                      guardian.district ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.district || ""}
                    onChange={handleChange("guardian_address_district")}
                    placeholder="Danowudu"
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
                    value={guardian.city || ""}
                    onChange={handleChange("guardian_address_city_regency")}
                    placeholder="Kotamobagu"
                  />
                </div>
                <div className={styles.fieldGroup}>
                  <div className={styles.label}>Province</div>
                  <input
                    className={`${styles.value} ${
                      guardian.province ? styles.filled : ""
                    }`}
                    type="text"
                    value={guardian.province || ""}
                    onChange={handleChange("guardian_address_province")}
                    placeholder="North Sulawesi"
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
                    value={guardian.other || ""}
                    onChange={handleChange("guardian_address_other")}
                    placeholder="Dahlia Apartement Unit 502"
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
