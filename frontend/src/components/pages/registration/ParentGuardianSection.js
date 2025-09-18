import React, { useState, useEffect } from "react";
import styles from "./ParentGuardianSection.module.css";

const ParentGuardianSection = ({ onDataChange, prefill, errors }) => {
  // State untuk Father
  const [father, setFather] = useState({
    name: "",
    company: "",
    occupation: "",
    phone: "",
    email: "",
    street: "",
    rt: "0",
    rw: "0",
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
    rt: "0",
    rw: "0",
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
    rt: "0",
    rw: "0",
    village: "",
    district: "",
    city: "",
    province: "",
    other: "",
  });

  // State untuk error fields Father
  const [fatherErrors, setFatherErrors] = useState({
    name: false,
    phone: false,
    email: false,
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
    email: false,
    street: false,
    village: false,
    district: false,
    city: false,
    province: false,
  });

  // useEffect untuk menangani error dari parent
  useEffect(() => {
    if (errors) {
      setFatherErrors((prev) => ({
        ...prev,
        ...(errors.father_name && { name: true }),
        ...(errors.father_phone && { phone: true }),
        ...(errors.father_email && { email: true }),
        ...(errors.father_address_street && { street: true }),
        ...(errors.father_address_village && { village: true }),
        ...(errors.father_address_district && { district: true }),
        ...(errors.father_address_city_regency && { city: true }),
        ...(errors.father_address_province && { province: true }),
      }));
      setMotherErrors((prev) => ({
        ...prev,
        ...(errors.mother_name && { name: true }),
        ...(errors.mother_phone && { phone: true }),
        ...(errors.mother_email && { email: true }),
        ...(errors.mother_address_street && { street: true }),
        ...(errors.mother_address_village && { village: true }),
        ...(errors.mother_address_district && { district: true }),
        ...(errors.mother_address_city_regency && { city: true }),
        ...(errors.mother_address_province && { province: true }),
      }));
    }
  }, [errors]);

  // useEffect untuk mengisi data saat 'prefill' ada
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      setFather({
        name: prefill.father_name || "",
        company: prefill.father_company || "",
        occupation: prefill.father_occupation || "",
        phone: prefill.father_phone || "",
        email: prefill.father_email || "",
        street: prefill.father_address_street || "",
        rt: prefill.father_address_rt || "0",
        rw: prefill.father_address_rw || "0",
        village: prefill.father_address_village || "",
        district: prefill.father_address_district || "",
        city: prefill.father_address_city_regency || "",
        province: prefill.father_address_province || "",
        other: prefill.father_address_other || "",
      });
      setMother({
        name: prefill.mother_name || "",
        company: prefill.mother_company || "",
        occupation: prefill.mother_occupation || "",
        phone: prefill.mother_phone || "",
        email: prefill.mother_email || "",
        street: prefill.mother_address_street || "",
        rt: prefill.mother_address_rt || "0",
        rw: prefill.mother_address_rw || "0",
        village: prefill.mother_address_village || "",
        district: prefill.mother_address_district || "",
        city: prefill.mother_address_city_regency || "",
        province: prefill.mother_address_province || "",
        other: prefill.mother_address_other || "",
      });
      setGuardian({
        name: prefill.guardian_name || "",
        relationship: prefill.relation_to_student || "",
        phone: prefill.guardian_phone || "",
        email: prefill.guardian_email || "",
        street: prefill.guardian_address_street || "",
        rt: prefill.guardian_address_rt || "0",
        rw: prefill.guardian_address_rw || "0",
        village: prefill.guardian_address_village || "",
        district: prefill.guardian_address_district || "",
        city: prefill.guardian_address_city_regency || "",
        province: prefill.guardian_address_province || "",
        other: prefill.guardian_address_other || "",
      });
    }
  }, [prefill]);

  // useEffect ini bertanggung jawab penuh untuk mengirim data ke parent
  useEffect(() => {
    const handleRtRw = (value) => (value && value.trim() !== "" ? value : "0");

    const allData = {
      // Data Ayah
      father_name: father.name,
      father_company: father.company,
      father_occupation: father.occupation,
      father_phone: father.phone,
      father_email: father.email,
      father_address_street: father.street,
      father_address_rt: handleRtRw(father.rt),
      father_address_rw: handleRtRw(father.rw),
      father_address_village: father.village,
      father_address_district: father.district,
      father_address_city_regency: father.city,
      father_address_province: father.province,
      father_address_other: father.other,
      father_company_addresses: father.company,

      // Data Ibu
      mother_name: mother.name,
      mother_company: mother.company,
      mother_occupation: mother.occupation,
      mother_phone: mother.phone,
      mother_email: mother.email,
      mother_address_street: mother.street,
      mother_address_rt: handleRtRw(mother.rt),
      mother_address_rw: handleRtRw(mother.rw),
      mother_address_village: mother.village,
      mother_address_district: mother.district,
      mother_address_city_regency: mother.city,
      mother_address_province: mother.province,
      mother_address_other: mother.other,
      mother_company_addresses: mother.company,

      // Data Wali
      guardian_name: guardian.name,
      relation_to_student: guardian.relationship,
      guardian_phone: guardian.phone,
      guardian_email: guardian.email,
      guardian_address_street: guardian.street,
      guardian_address_rt: handleRtRw(guardian.rt),
      guardian_address_rw: handleRtRw(guardian.rw),
      guardian_address_village: guardian.village,
      guardian_address_district: guardian.district,
      guardian_address_city_regency: guardian.city,
      guardian_address_province: guardian.province,
      guardian_address_other: guardian.other,
    };

    onDataChange(allData);
  }, [father, mother, guardian, onDataChange]);

  // Fungsi ini tugasnya hanya mengubah state lokal dan menghapus error
  const handleChange = (setter, field, section) => (e) => {
    const { value } = e.target;
    setter((prev) => ({ ...prev, [field]: value }));

    if (section === "father" && fatherErrors[field] && value.trim() !== "") {
      setFatherErrors((prev) => ({ ...prev, [field]: false }));
    }
    if (section === "mother" && motherErrors[field] && value.trim() !== "") {
      setMotherErrors((prev) => ({ ...prev, [field]: false }));
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
                    value={father.name}
                    onChange={handleChange(setFather, "name", "father")}
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
                    value={father.company}
                    onChange={handleChange(setFather, "company", "father")}
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
                    value={father.occupation}
                    onChange={handleChange(setFather, "occupation", "father")}
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
                      value={father.phone}
                      maxLength="20"
                      onChange={handleChange(setFather, "phone", "father")}
                      placeholder="089281560955"
                    />
                    {fatherErrors.phone && (
                      <div className={styles.inlineErrorMessage}>
                        {/* Pesan default diubah agar konsisten */}
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
                      value={father.email}
                      onChange={handleChange(setFather, "email", "father")}
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
                      value={father.street}
                      onChange={handleChange(setFather, "street", "father")}
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
                        value={father.rt}
                        onChange={handleChange(setFather, "rt", "father")}
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
                        onChange={handleChange(setFather, "rw", "father")}
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
                      value={father.village}
                      onChange={handleChange(setFather, "village", "father")}
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
                      value={father.district}
                      onChange={handleChange(setFather, "district", "father")}
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
                      value={father.city}
                      onChange={handleChange(setFather, "city", "father")}
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
                      value={father.province}
                      onChange={handleChange(setFather, "province", "father")}
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
                      value={father.other}
                      onChange={handleChange(setFather, "other", "father")}
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
                    value={mother.name}
                    onChange={handleChange(setMother, "name", "mother")}
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
                    value={mother.company}
                    onChange={handleChange(setMother, "company", "mother")}
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
                    value={mother.occupation}
                    onChange={handleChange(setMother, "occupation", "mother")}
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
                      value={mother.phone}
                      maxLength="20" // Atribut ini sudah membatasi input pengguna
                      onChange={handleChange(setMother, "phone", "mother")}
                      placeholder="089281560955"
                    />
                    {motherErrors.phone && (
                      <div className={styles.inlineErrorMessage}>
                        {/* Pesan error diubah sesuai requirement Anda */}
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
                      value={mother.email}
                      onChange={handleChange(setMother, "email", "mother")}
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
                      value={mother.street}
                      onChange={handleChange(setMother, "street", "mother")}
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
                        value={mother.rt}
                        onChange={handleChange(setMother, "rt", "mother")}
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
                        onChange={handleChange(setMother, "rw", "mother")}
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
                      value={mother.village}
                      onChange={handleChange(setMother, "village", "mother")}
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
                      value={mother.district}
                      onChange={handleChange(setMother, "district", "mother")}
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
                      value={mother.city}
                      onChange={handleChange(setMother, "city", "mother")}
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
                      value={mother.province}
                      onChange={handleChange(setMother, "province", "mother")}
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
                      value={mother.other}
                      onChange={handleChange(setMother, "other", "mother")}
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
                    value={guardian.name}
                    onChange={handleChange(setGuardian, "name", "guardian")}
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
                    value={guardian.relationship}
                    onChange={handleChange(
                      setGuardian,
                      "relationship",
                      "guardian"
                    )}
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
                    value={guardian.phone}
                    onChange={handleChange(setGuardian, "phone", "guardian")}
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
                    onChange={handleChange(setGuardian, "email", "guardian")}
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
                    value={guardian.street}
                    onChange={handleChange(setGuardian, "street", "guardian")}
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
                      value={guardian.rt}
                      onChange={handleChange(setGuardian, "rt", "guardian")}
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
                      onChange={handleChange(setGuardian, "rw", "guardian")}
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
                    onChange={handleChange(setGuardian, "village", "guardian")}
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
                    value={guardian.district}
                    onChange={handleChange(setGuardian, "district", "guardian")}
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
                    value={guardian.city}
                    onChange={handleChange(setGuardian, "city", "guardian")}
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
                    value={guardian.province}
                    onChange={handleChange(setGuardian, "province", "guardian")}
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
                    value={guardian.other}
                    onChange={handleChange(setGuardian, "other", "guardian")}
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
