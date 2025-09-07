// File: src/components/pages/StudentProfile.js

import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import {
  getRegistrations,
  getRegistrationOptions,
} from "../../../../services/api";
import styles from "./StudentProfile.module.css";
import placeholderImage from "../../../../assets/user.png";

// Helper untuk menampilkan field Key-Value
const InfoField = ({ label, value }) => (
  <div className={styles.field}>
    <div className={styles.fieldLabel}>{label}</div>
    <b className={styles.fieldValue}>{value || "-"}</b>
  </div>
);

// Helper untuk menampilkan Radio Button visual
const RadioDisplay = ({ label, isSelected }) => (
  <div className={styles.optionItem}>
    <div className={styles.visualRadio}>
      <div
        className={`${styles.radioOuter} ${
          isSelected ? styles.radioOuterSelected : ""
        }`}
      />
      {isSelected && <div className={styles.radioInner} />}
    </div>
    <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{label}</span>
  </div>
);

// Helper untuk menampilkan Checkbox visual
const CheckboxDisplay = ({ label, isSelected }) => (
  <div className={styles.optionItem}>
    <div className={styles.visualCheckbox}>
      <div
        className={`${styles.checkboxOuter} ${
          isSelected ? styles.checkboxOuterSelected : ""
        }`}
      />
      {isSelected && <div className={styles.checkboxCheckmark}>✓</div>}
    </div>
    <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>{label}</span>
  </div>
);

const StudentProfile = () => {
  const { studentId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [regRes, optionsRes] = await Promise.all([
          getRegistrations(),
          getRegistrationOptions(),
        ]);

        const student = regRes.data.data.find(
          (s) => s.student_id === studentId
        );
        setOptions(optionsRes);

        if (student && student.application_form) {
          const combinedData = {
            student_id: student.student_id,
            ...student.application_form.student_information,
            ...student.application_form.program,
            ...student.application_form.facilities,
            ...student.application_form.parent_guardian_information,
            ...student.application_form.term_of_payment,
          };
          setProfileData(combinedData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentId]);

  const getNameById = (type, id) => {
    if (!options || !id) return id;
    const keyName = Object.keys(options[type][0])[0]; // Dapatkan nama key ID dinamis (misal: class_id)
    const item = options[type]?.find((i) => i[keyName] === id);
    return item?.name || item?.grade || item?.type || id;
  };

  if (loading)
    return <div style={{ padding: "20px" }}>Loading student profile...</div>;
  if (!profileData)
    return <div style={{ padding: "20px" }}>Student not found.</div>;

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className={styles.profilePage}>
      <div className={styles.topActionHeader}>
        <button className={styles.actionButton}>View version history</button>
        <button className={styles.actionButton}>Cancel</button>
        <button
          className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
        >
          Update
        </button>
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
            <b className={styles.fieldValue}>{profileData.student_id}</b>
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
                <InfoField label="First name" value={profileData.first_name} />
                <InfoField
                  label="Middle name"
                  value={profileData.middle_name}
                />
              </div>
              <div className={styles.row}>
                <InfoField label="Last name" value={profileData.last_name} />
                <InfoField label="Nickname" value={profileData.nickname} />
              </div>
              <div className={styles.row}>
                <InfoField label="NISN" value={profileData.nisn} />
                <InfoField label="NIK" value={profileData.nik} />
                <InfoField label="KITAS" value={profileData.kitas} />
              </div>
              <div className={styles.row}>
                <InfoField
                  label="Citizenship"
                  value={profileData.citizenship}
                />
                <InfoField label="Religion" value={profileData.religion} />
                <InfoField
                  label="Place of birth"
                  value={profileData.place_of_birth}
                />
                <InfoField
                  label="Date of birth"
                  value={formatDate(profileData.date_of_birth)}
                />
              </div>
              <div className={styles.row}>
                <InfoField label="Gender" value={profileData.gender} />
                <InfoField
                  label="Rank in the family"
                  value={profileData.family_rank}
                />
                <InfoField label="Age" value={profileData.age} />
              </div>
              <div className={styles.row}>
                <InfoField label="Email address" value={profileData.email} />
                <InfoField
                  label="Previous School"
                  value={profileData.previous_school}
                />
              </div>
              <div className={styles.row}>
                <InfoField
                  label="Phone number"
                  value={profileData.phone_number}
                />
                <InfoField
                  label="Academic status"
                  value={profileData.academic_status}
                />
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <InfoField label="Street" value={profileData.street} />
                  <div className={styles.rtRwGroup}>
                    <InfoField label="RT" value={profileData.rt} />
                    <InfoField label="RW" value={profileData.rw} />
                  </div>
                </div>
                <div className={styles.row}>
                  <InfoField label="Village" value={profileData.village} />
                  <InfoField label="District" value={profileData.district} />
                </div>
                <div className={styles.row}>
                  <InfoField
                    label="City/Regency"
                    value={profileData.city_regency}
                  />
                  <InfoField label="Province" value={profileData.province} />
                </div>
                <div className={styles.otherAddress}>
                  <span>
                    Other: (<b>{profileData.other || "-"}</b>)
                  </span>
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
                    isSelected={profileData.section_id === sec.section_id}
                  />
                ))}
              </div>
              <div className={styles.optionsRow}>
                <InfoField
                  label="Grade"
                  value={getNameById("classes", profileData.class_id)}
                />
                <InfoField
                  label="Major"
                  value={getNameById("majors", profileData.major_id)}
                />
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Program</div>
                {options?.programs.map((prog) => (
                  <RadioDisplay
                    key={prog.program_id}
                    label={prog.name}
                    isSelected={profileData.program_id === prog.program_id}
                  />
                ))}
                {profileData.program_other && (
                  <InfoField
                    label="Others:"
                    value={profileData.program_other}
                  />
                )}
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
                      profileData.transportation_id === t.transport_id
                    }
                  />
                ))}
                {profileData.transportation_id !== 1 && (
                  <InfoField
                    label="Pickup point"
                    value={getNameById(
                      "pickup_points",
                      profileData.pickup_point_id
                    )}
                  />
                )}
              </div>
              <div className={styles.optionsRow}>
                {" "}
                <CheckboxDisplay
                  label="Transportation Policy"
                  isSelected={profileData.transportation_policy === "Signed"}
                />{" "}
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Residence Hall</div>
                {options?.residence_halls.map((r) => (
                  <RadioDisplay
                    key={r.residence_id}
                    label={r.type}
                    isSelected={profileData.residence_id === r.residence_id}
                  />
                ))}
              </div>
              <div className={styles.optionsRow}>
                {" "}
                <CheckboxDisplay
                  label="Residence Hall Policy"
                  isSelected={profileData.residence_hall_policy === "Signed"}
                />{" "}
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
                <InfoField label="Name" value={profileData.father_name} />
              </div>
              <div className={styles.row}>
                <InfoField
                  label="Company Name"
                  value={profileData.father_company_name}
                />
                <InfoField
                  label="Occupation/Position"
                  value={profileData.father_occupation}
                />
              </div>
              <div className={styles.row}>
                <InfoField
                  label="Phone Number"
                  value={profileData.father_phone_number}
                />
                <InfoField label="Email" value={profileData.father_email} />
              </div>
            </div>
            <div className={styles.sectionContent}>
              <b>Mother's Information</b>
              <div className={styles.row}>
                <InfoField label="Name" value={profileData.mother_name} />
              </div>
              <div className={styles.row}>
                <InfoField
                  label="Company Name"
                  value={profileData.mother_company_name}
                />
                <InfoField
                  label="Occupation/Position"
                  value={profileData.mother_occupation}
                />
              </div>
              <div className={styles.row}>
                <InfoField
                  label="Phone Number"
                  value={profileData.mother_phone_number}
                />
                <InfoField label="Email" value={profileData.mother_email} />
              </div>
            </div>
          </div>

          {/* TERM OF PAYMENT */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>TERM OF PAYMENT</b>
            </div>

            {/* Wrapper untuk 3 kolom atas */}
            <div className={styles.paymentContentWrapper}>
              {/* Kolom 1: Tuition Fees */}
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>Tuition Fee</div>
                <div className={styles.paymentOptionGroup}>
                  <RadioDisplay
                    label="Full payment"
                    isSelected={profileData.tuition_fees === "Full payment"}
                  />
                  <RadioDisplay
                    label="Installment"
                    isSelected={profileData.tuition_fees === "Installment"}
                  />
                </div>
              </div>

              {/* Kolom 2: Residence Hall */}
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>Residence Hall</div>
                <div className={styles.paymentOptionGroup}>
                  <RadioDisplay
                    label="Full payment"
                    isSelected={
                      profileData.residence_payment === "Full payment"
                    }
                  />
                  <RadioDisplay
                    label="Installment"
                    isSelected={profileData.residence_payment === "Installment"}
                  />
                </div>
              </div>

              {/* Kolom 3: Financial Policy */}
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>
                  Financial Policy & Contract
                </div>
                <div className={styles.paymentOptionGroup}>
                  <CheckboxDisplay
                    label="Agree"
                    isSelected={
                      profileData.financial_policy_contract === "Signed"
                    }
                  />
                </div>
              </div>
            </div>

            {/* Bagian Discount di bawahnya */}
            <div className={styles.discountSection}>
              <div className={styles.paymentTitle}>Discount</div>
              <div className={styles.row}>
                <InfoField label="Discount" value={profileData.discount_name} />
                {profileData.discount_notes && (
                  <InfoField label="Notes" value={profileData.discount_notes} />
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
