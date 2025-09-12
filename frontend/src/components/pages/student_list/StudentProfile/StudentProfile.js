// File: src/components/pages/StudentProfile.js (Versi Final & Lengkap)

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import {
  getStudentLatestApplication,
  getRegistrationOptions,
  updateStudent,
} from "../../../../services/api";
import styles from "./StudentProfile.module.css";
import placeholderImage from "../../../../assets/user.png";

const RadioDisplay = ({
  label,
  isSelected,
  isEditing,
  name,
  value,
  onChange, // Ini akan menjadi fungsi handleRadioChange
}) => {
  const content = (
    <>
      <div className={styles.visualRadio}>
        <div
          className={`${styles.radioOuter} ${
            isSelected ? styles.radioOuterSelected : ""
          }`}
        />
        {isSelected && <div className={styles.radioInner} />}
      </div>
      <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>
        {label}
      </span>
    </>
  );

  if (isEditing) {
    return (
      <div
        className={styles.clickableLabel}
        onClick={() => onChange(name, value)} // Panggil handler dengan name & value
        style={{ cursor: "pointer" }}
      >
        {content}
      </div>
    );
  }

  return <div className={styles.optionItem}>{content}</div>;
};

const CheckboxDisplay = ({ label, isSelected, isEditing, name, onChange }) => {
  const content = (
    <>
      {" "}
      <div className={styles.visualCheckbox}>
        {" "}
        <div
          className={`${styles.checkboxOuter} ${
            isSelected ? styles.checkboxOuterSelected : ""
          }`}
        />{" "}
        {isSelected && <div className={styles.checkboxCheckmark}>✓</div>}{" "}
      </div>{" "}
      <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>
        {label}
      </span>{" "}
    </>
  );
  if (isEditing) {
    return (
      <label className={styles.clickableLabel}>
        {/* Checkbox asli untuk fungsionalitas */}
        <input
          type="checkbox"
          name={name}
          checked={isSelected}
          onChange={onChange}
          className={styles.hiddenInput}
        />
        {/* Tampilan visual kustom */}
        {content}
      </label>
    );
  }
  return <div className={styles.optionItem}>{content}</div>;
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentRes, optionsRes] = await Promise.all([
        getStudentLatestApplication(studentId),
        getRegistrationOptions(),
      ]);
      setOptions(optionsRes);
      if (studentRes.success) {
        const studentData = studentRes.data;
        const combinedData = {
          student_id: studentData.input_name,
          ...studentData.studentInfo,
          ...studentData.program,
          ...studentData.facilities,
          ...studentData.parentGuardian,
          ...studentData.termOfPayment,
        };
        setProfileData(combinedData);
        setFormData(combinedData);
      }
    } catch (err) {
      console.error("Error fetching student profile data:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRadioChange = (name, value) => {
    setFormData((prevData) => {
      const currentVal = prevData[name];
      const newVal = currentVal === value ? "" : value; // Logika unselect

      const newFormData = { ...prevData, [name]: newVal };

      // Logika dependen tetap berjalan di sini
      if (name === "section_id") {
        newFormData.class_id = "";
        newFormData.major_id = "";
      }

      if (name === "transportation_id") {
        const selectedTransport = options.transportations.find(
          (t) => String(t.transport_id) === String(newVal)
        );
        const transportType = selectedTransport
          ? selectedTransport.type.toLowerCase()
          : "";
        if (transportType === "own car" || transportType === "school bus") {
          const currentResidence = options.residence_halls.find(
            (r) => String(r.residence_id) === String(prevData.residence_id)
          );
          if (
            currentResidence &&
            currentResidence.type.toLowerCase().includes("dormitory")
          ) {
            newFormData.residence_id = "";
          }
        }
      }

      return newFormData;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prevData) => {
      // Salin state sebelumnya untuk dimodifikasi
      const newFormData = { ...prevData };

      const radioNames = [
        "section_id",
        "program_id",
        "transportation_id",
        "residence_id",
        "tuition_fees",
        "residence_payment",
      ];

      // Aturan untuk Checkbox Policy
      const isPolicyCheckbox = [
        "transportation_policy",
        "residence_hall_policy",
        "financial_policy_contract",
      ].includes(name);

      newFormData[name] = isPolicyCheckbox
        ? checked
          ? "Signed"
          : "Not Signed"
        : value;

      if (radioNames.includes(name)) {
        // INI UNTUK RADIO BUTTON
        // Jika nilai yang diklik sama dengan nilai saat ini, kosongkan. Jika beda, isi dengan nilai baru.
        newFormData[name] =
          String(prevData[name]) === String(value) ? "" : value;
      } else if (isPolicyCheckbox) {
        // INI UNTUK CHECKBOX
        newFormData[name] = checked ? "Signed" : "Not Signed";
      } else {
        // INI UNTUK SEMUA INPUT LAINNYA (text, select, date)
        newFormData[name] = value;
      }

      // === ATURAN 1: Logika untuk Bagian PROGRAM ===
      if (name === "section_id") {
        // Jika section diubah, reset grade dan major
        newFormData.class_id = "";
        newFormData.major_id = "";
      }

      if (name === "class_id") {
        // Jika grade diubah, cek apakah major perlu direset
        const selectedClass = options.classes.find(
          (c) => String(c.class_id) === String(value)
        );
        const gradeNum = selectedClass ? parseInt(selectedClass.grade, 10) : 0;
        // Jika grade di bawah 9, major tidak berlaku (direset)
        if (gradeNum < 9) {
          newFormData.major_id = "";
        }
      }

      // === ATURAN 2: Logika untuk Bagian FACILITIES ===
      if (name === "transportation_id") {
        // Jika transportasi diubah, cek apakah residence hall perlu direset
        const selectedTransport = options.transportations.find(
          (t) => String(t.transport_id) === String(value)
        );
        const transportType = selectedTransport
          ? selectedTransport.type.toLowerCase()
          : "";

        // Jika transportasi adalah 'own car' atau 'school bus'
        if (transportType === "own car" || transportType === "school bus") {
          // Cek residence hall yang sedang dipilih
          const currentResidence = options.residence_halls.find(
            (r) => String(r.residence_id) === String(prevData.residence_id)
          );
          // Jika yang dipilih adalah asrama (Dormitory), maka reset
          if (
            currentResidence &&
            currentResidence.type.toLowerCase().includes("dormitory")
          ) {
            newFormData.residence_id = "";
          }
        }
      }

      if (name === "discount_name" && !value) {
        newFormData.discount_notes = "";
      }

      return newFormData;
    });
  };

  const handleCancel = () => {
    setFormData(profileData);
    setIsEditing(false);
  };
  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateStudent(studentId, formData);
      alert("Student data updated successfully!");
      setIsEditing(false);
      fetchData();
    } catch (error) {
      console.error("Failed to update student:", error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getNameById = (type, id) => {
    if (!options || !id || !options[type] || !options[type].length) return id;
    const keyName = Object.keys(options[type][0])[0];
    const item = options[type]?.find((i) => String(i[keyName]) === String(id));
    return item?.name || item?.grade || item?.type || id;
  };

  // =================================================================================
  // ▼▼▼ LOGIKA BARU UNTUK MEMFILTER DROPDOWN SECARA DINAMIS (di-cache dengan useMemo) ▼▼▼
  // =================================================================================

  const filteredGrades = useMemo(() => {
    if (!isEditing || !options?.classes || !formData?.section_id) return [];
    const selectedSection = options.sections?.find(
      (sec) => String(sec.section_id) === String(formData.section_id)
    );
    if (!selectedSection) return [];

    const sectionName = selectedSection.name;
    if (sectionName === "ECP") {
      return options.classes.filter((cls) =>
        ["N", "K1", "K2"].includes(cls.grade)
      );
    }
    if (sectionName === "Elementary School") {
      return options.classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 1 && grade <= 6;
      });
    }
    if (sectionName === "Middle School") {
      return options.classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 7 && grade <= 9;
      });
    }
    if (sectionName === "High School") {
      return options.classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 10 && grade <= 12;
      });
    }
    return [];
  }, [isEditing, options, formData?.section_id]);

  const showMajorField = useMemo(() => {
    if (!isEditing || !options?.classes || !formData?.class_id) return false;
    const selectedClass = options.classes.find(
      (c) => String(c.class_id) === String(formData.class_id)
    );
    if (!selectedClass) return false;
    const gradeNum = parseInt(selectedClass.grade, 10);
    return gradeNum >= 9; // Tampilkan major untuk grade 9 ke atas
  }, [isEditing, options, formData?.class_id]);

  const filteredResidenceHalls = useMemo(() => {
    if (!options?.residence_halls) return [];
    const selectedTransport = options.transportations?.find(
      (t) => String(t.transport_id) === String(formData?.transportation_id)
    );
    const transportType = selectedTransport
      ? selectedTransport.type.toLowerCase()
      : "";
    const isTransportRestricted =
      transportType === "own car" || transportType === "school bus";

    if (isTransportRestricted) {
      // Sembunyikan semua opsi yang mengandung kata 'Dormitory'
      return options.residence_halls.filter(
        (r) => !r.type.toLowerCase().includes("dormitory")
      );
    }
    // Jika tidak ada batasan, tampilkan semua
    return options.residence_halls;
  }, [options, formData?.transportation_id]);

  if (loading)
    return <div style={{ padding: "20px" }}>Loading student profile...</div>;
  if (!formData)
    return <div style={{ padding: "20px" }}>Student not found.</div>;

  const formatDateForInput = (dateString) =>
    !dateString ? "" : new Date(dateString).toISOString().split("T")[0];
  const formatDateForDisplay = (dateString) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  const selectedTransportType =
    options?.transportations?.find(
      (t) => String(t.transport_id) === String(formData.transportation_id)
    )?.type || "";

  return (
    <div className={styles.profilePage}>
      <div className={styles.topActionHeader}>
        <button className={styles.actionButton}>View version history</button>
        {isEditing ? (
          <>
            <button
              className={styles.actionButton}
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={handleUpdate}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <button
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className={styles.profileContent}>
        <div className={styles.sidebar}>
          <img
            className={styles.profileImage}
            src={placeholderImage}
            alt="Student"
          />
          <div className={styles.studentIdContainer}>
            <div className={styles.fieldLabel}>ID</div>
            <b className={styles.fieldValue}>{formData.student_id}</b>
          </div>
        </div>

        <div className={styles.infoContainer}>
          {/* STUDENT'S INFORMATION */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>STUDENT’S INFORMATION</b>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>First name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.first_name || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Middle name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.middle_name || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Last name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.last_name || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Nickname</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.nickname || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>NISN</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nisn"
                      value={formData.nisn || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>{formData.nisn || "-"}</b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>NIK</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nik"
                      value={formData.nik || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>{formData.nik || "-"}</b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>KITAS</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="kitas"
                      value={formData.kitas || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>{formData.kitas || "-"}</b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Citizenship</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="citizenship"
                      value={formData.citizenship || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.citizenship || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Religion</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.religion || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Place of birth</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="place_of_birth"
                      value={formData.place_of_birth || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.place_of_birth || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Date of birth</div>
                  {isEditing ? (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formatDateForInput(formData.date_of_birth)}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formatDateForDisplay(formData.date_of_birth)}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Gender</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.gender || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Rank in the family</div>
                  {isEditing ? (
                    <input
                      type="number"
                      name="family_rank"
                      value={formData.family_rank || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.family_rank || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Email address</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>{formData.email || "-"}</b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Previous School</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="previous_school"
                      value={formData.previous_school || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.previous_school || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone number</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.phone_number || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Academic status</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="academic_status"
                      value={formData.academic_status || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.academic_status || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Street</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="street"
                        value={formData.street || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RT</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="rt"
                          value={formData.rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RW</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="rw"
                          value={formData.rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Village</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="village"
                        value={formData.village || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.village || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>District</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="district"
                        value={formData.district || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>City/Regency</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="city_regency"
                        value={formData.city_regency || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Province</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="province"
                        value={formData.province || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="other"
                      value={formData.other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>{formData.other || "-"}</b>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRAM */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>PROGRAM</b>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Section</div>
                {options?.sections.map((sec) => (
                  <RadioDisplay
                    key={sec.section_id}
                    label={sec.name}
                    isSelected={
                      String(formData.section_id) === String(sec.section_id)
                    }
                    isEditing={isEditing}
                    name="section_id"
                    value={sec.section_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Grade</div>
                  {isEditing ? (
                    <select
                      name="class_id"
                      value={formData.class_id || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      disabled={!formData.section_id} // Nonaktifkan jika section belum dipilih
                    >
                      <option value="">Select a grade</option>
                      {filteredGrades.map((opt) => (
                        <option key={opt.class_id} value={opt.class_id}>
                          {opt.grade}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <b className={styles.fieldValue}>
                      {getNameById("classes", formData.class_id)}
                    </b>
                  )}
                </div>
                {/* Tampilkan Major hanya jika kondisi terpenuhi */}
                {showMajorField && (
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Major</div>
                    {isEditing ? (
                      <select
                        name="major_id"
                        value={formData.major_id || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      >
                        <option value="">Select a major</option>
                        {options?.majors
                          .filter((mjr) => [2, 3].includes(mjr.major_id)) // Sesuai logika ProgramSection
                          .map((opt) => (
                            <option key={opt.major_id} value={opt.major_id}>
                              {opt.name}
                            </option>
                          ))}
                      </select>
                    ) : (
                      <b className={styles.fieldValue}>
                        {getNameById("majors", formData.major_id)}
                      </b>
                    )}
                  </div>
                )}
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Program</div>
                {options?.programs.map((prog) => (
                  <RadioDisplay
                    key={prog.program_id}
                    label={prog.name}
                    isSelected={
                      String(formData.program_id) === String(prog.program_id)
                    }
                    isEditing={isEditing}
                    name="program_id"
                    value={prog.program_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* FACILITIES */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>FACILITIES</b>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Transportation</div>
                {options?.transportations.map((t) => (
                  <RadioDisplay
                    key={t.transport_id}
                    label={t.type}
                    isSelected={
                      String(formData.transportation_id) ===
                      String(t.transport_id)
                    }
                    isEditing={isEditing}
                    name="transportation_id"
                    value={t.transport_id}
                    onChange={handleRadioChange}
                  />
                ))}
                {/* Tampilkan pickup point jika bukan 'Own car' */}
                {isEditing &&
                  selectedTransportType.toLowerCase() !== "own car" && (
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Pickup point</div>
                      <select
                        name="pickup_point_id"
                        value={formData.pickup_point_id || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      >
                        <option value="">Select pickup point</option>
                        {options?.pickup_points.map((opt) => (
                          <option
                            key={opt.pickup_point_id}
                            value={opt.pickup_point_id}
                          >
                            {opt.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                {!isEditing &&
                  selectedTransportType.toLowerCase() !== "own car" && (
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>Pickup point</div>
                      <b className={styles.fieldValue}>
                        {getNameById("pickup_points", formData.pickup_point_id)}
                      </b>
                    </div>
                  )}
              </div>
              <div className={styles.optionsRow}>
                <CheckboxDisplay
                  label="Transportation Policy"
                  isSelected={formData.transportation_policy === "Signed"}
                  isEditing={isEditing}
                  name="transportation_policy"
                  onChange={handleChange}
                />
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Residence Hall</div>
                {/* Gunakan data yang sudah difilter */}
                {filteredResidenceHalls.map((r) => (
                  <RadioDisplay
                    key={r.residence_id}
                    label={r.type}
                    isSelected={
                      String(formData.residence_id) === String(r.residence_id)
                    }
                    isEditing={isEditing}
                    name="residence_id"
                    value={r.residence_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
              <div className={styles.optionsRow}>
                <CheckboxDisplay
                  label="Residence Hall Policy"
                  isSelected={formData.residence_hall_policy === "Signed"}
                  isEditing={isEditing}
                  name="residence_hall_policy"
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* PARENT / GUARDIAN INFORMATION */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>PARENT / GUARDIAN INFORMATION</b>
            </div>
            <div className={styles.sectionContent}>
              <b>Father's Information</b>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="father_name"
                      value={formData.father_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_name || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Company Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="father_company"
                      value={formData.father_company || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_company || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Occupation/Position</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="father_occupation"
                      value={formData.father_occupation || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_occupation || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone Number</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="father_phone"
                      value={formData.father_phone || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_phone || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="father_email"
                      value={formData.father_email || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_email || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Street</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="father_address_street"
                        value={formData.father_address_street || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RT</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="father_address_rt"
                          value={formData.father_address_rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.father_address_rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RW</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="father_address_rw"
                          value={formData.father_address_rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.father_address_rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Village</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="father_address_village"
                        value={formData.father_address_village || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_village || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>District</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="father_address_district"
                        value={formData.father_address_district || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>City/Regency</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="father_address_city_regency"
                        value={formData.father_address_city_regency || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Province</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="father_address_province"
                        value={formData.father_address_province || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="father_address_other"
                      value={formData.father_address_other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_address_other || "-"}
                    </b>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
            </div>
            <div className={styles.sectionContent}>
              <b>Mother's Information</b>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mother_name"
                      value={formData.mother_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_name || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Company Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mother_company"
                      value={formData.mother_company || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_company || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Occupation/Position</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mother_occupation"
                      value={formData.mother_occupation || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_occupation || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone Number</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="mother_phone"
                      value={formData.mother_phone || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_phone || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="mother_email"
                      value={formData.mother_email || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_email || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Street</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="mother_address_street"
                        value={formData.mother_address_street || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RT</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="mother_address_rt"
                          value={formData.mother_address_rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.mother_address_rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RW</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="mother_address_rw"
                          value={formData.mother_address_rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.mother_address_rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Village</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="mother_address_village"
                        value={formData.mother_address_village || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_village || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>District</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="mother_address_district"
                        value={formData.mother_address_district || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>City/Regency</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="mother_address_city_regency"
                        value={formData.mother_address_city_regency || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Province</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="mother_address_province"
                        value={formData.mother_address_province || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mother_address_other"
                      value={formData.mother_address_other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_address_other || "-"}
                    </b>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
            </div>
            <div className={styles.sectionContent}>
              <b>Authorized Guardian's Information</b>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="guardian_name"
                      value={formData.guardian_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_name || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>
                    Relationship to student
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="relation_to_student"
                      value={formData.relation_to_student || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.relation_to_student || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone Number</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="guardian_phone"
                      value={formData.guardian_phone || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_phone || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="guardian_email"
                      value={formData.guardian_email || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_email || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Street</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_street"
                        value={formData.guardian_address_street || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RT</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="guardian_address_rt"
                          value={formData.guardian_address_rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.guardian_address_rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RW</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="guardian_address_rw"
                          value={formData.guardian_address_rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.guardian_address_rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Village</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_village"
                        value={formData.guardian_address_village || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_village || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>District</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_district"
                        value={formData.guardian_address_district || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>City/Regency</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_city_regency"
                        value={formData.guardian_address_city_regency || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Province</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_province"
                        value={formData.guardian_address_province || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="guardian_address_other"
                      value={formData.guardian_address_other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_address_other || "-"}
                    </b>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
            </div>
          </div>

          {/* TERM OF PAYMENT */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>TERM OF PAYMENT</b>
            </div>
            <div className={styles.paymentContentWrapper}>
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>Tuition Fee</div>
                <div className={styles.paymentOptionGroup}>
                  {options?.tuition_fees?.map((option) => (
                    <RadioDisplay
                      key={option}
                      label={option}
                      isSelected={formData.tuition_fees === option}
                      isEditing={isEditing}
                      name="tuition_fees"
                      value={option}
                      onChange={handleRadioChange}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>Residence Hall</div>
                <div className={styles.paymentOptionGroup}>
                  {options?.residence_payment?.map((option) => (
                    <RadioDisplay
                      key={option}
                      label={option}
                      isSelected={formData.residence_payment === option}
                      isEditing={isEditing}
                      name="residence_payment"
                      value={option}
                      onChange={handleRadioChange}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>
                  Financial Policy & Contract
                </div>
                <div className={styles.paymentOptionGroup}>
                  <CheckboxDisplay
                    label="Agree"
                    isSelected={formData.financial_policy_contract === "Signed"}
                    isEditing={isEditing}
                    name="financial_policy_contract"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className={styles.discountSection}>
              <div className={styles.paymentTitle}>Discount</div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Discount</div>
                  {isEditing ? (
                    <select
                      name="discount_name"
                      value={formData.discount_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    >
                      <option value="">Select discount type</option>
                      {options?.discount_types?.map((d) => (
                        <option key={d.discount_type_id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.discount_name || "-"}
                    </b>
                  )}
                </div>

                {/* --- PERBAIKAN 1: Logika untuk menampilkan Notes --- */}
                {formData.discount_name && (
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Notes</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="discount_notes"
                        value={formData.discount_notes || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.discount_notes || "-"}
                      </b>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
