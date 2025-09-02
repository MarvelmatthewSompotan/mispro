import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PopUpConfirm from "../PopUpConfirm";
import styles from "./FormButtonSection.module.css";
import DuplicateStudentPopup from "./DuplicateStudentPopup";

const FormButtonSection = ({
  validationState,
  onSetErrors,
  draftId,
  allFormData,
  onReset,
  location,
}) => {
  const navigate = useNavigate();
  const locationState = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  const handleReset = () => {
    if (onReset) onReset();
  };

  const handleSubmit = () => {
    console.log("Data saat Submit:", JSON.stringify(allFormData, null, 2));

    // Debug: log semua data untuk memeriksa
    console.log("All Form Data:", allFormData);
    console.log("Validation State:", validationState);

    const errors = {};

    // Validasi Student Status Section
    if (
      !allFormData.studentStatus ||
      !allFormData.studentStatus.student_status
    ) {
      errors.studentStatus = { student_status: true };
    }

    // Validasi Student Information Section
    if (!allFormData.studentInfo || !allFormData.studentInfo.first_name) {
      errors.studentInfo = { ...errors.studentInfo, first_name: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.nickname) {
      errors.studentInfo = { ...errors.studentInfo, nickname: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.nisn) {
      errors.studentInfo = { ...errors.studentInfo, nisn: true };
    }

    // Validasi NIK hanya jika citizenship = "Indonesia"
    if (
      allFormData.studentInfo &&
      allFormData.studentInfo.citizenship === "Indonesia"
    ) {
      if (!allFormData.studentInfo.nik) {
        errors.studentInfo = { ...errors.studentInfo, nik: true };
      }
    }

    // Validasi KITAS hanya jika citizenship = "Non Indonesia" (country tidak required)
    if (
      allFormData.studentInfo &&
      allFormData.studentInfo.citizenship === "Non Indonesia"
    ) {
      if (!allFormData.studentInfo.kitas) {
        errors.studentInfo = { ...errors.studentInfo, kitas: true };
      }
    }

    // Field lain yang selalu required
    if (!allFormData.studentInfo || !allFormData.studentInfo.gender) {
      errors.studentInfo = { ...errors.studentInfo, gender: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.family_rank) {
      errors.studentInfo = { ...errors.studentInfo, family_rank: true };
    }
    if (
      !allFormData.studentInfo ||
      allFormData.studentInfo.citizenship === undefined ||
      allFormData.studentInfo.citizenship === null
    ) {
      errors.studentInfo = { ...errors.studentInfo, citizenship: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.religion) {
      errors.studentInfo = { ...errors.studentInfo, religion: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.place_of_birth) {
      errors.studentInfo = { ...errors.studentInfo, place_of_birth: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.date_of_birth) {
      errors.studentInfo = { ...errors.studentInfo, date_of_birth: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.email) {
      errors.studentInfo = { ...errors.studentInfo, email: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.previous_school) {
      errors.studentInfo = { ...errors.studentInfo, previous_school: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.phone_number) {
      errors.studentInfo = { ...errors.studentInfo, phone_number: true };
    }

    // Tambahkan kembali validasi academic status (required)
    if (!allFormData.studentInfo || !allFormData.studentInfo.academic_status) {
      errors.studentInfo = { ...errors.studentInfo, academic_status: true };
    }

    if (!allFormData.studentInfo || !allFormData.studentInfo.street) {
      errors.studentInfo = { ...errors.studentInfo, street: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.village) {
      errors.studentInfo = { ...errors.studentInfo, village: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.district) {
      errors.studentInfo = { ...errors.studentInfo, district: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.city_regency) {
      errors.studentInfo = { ...errors.studentInfo, city_regency: true };
    }
    if (!allFormData.studentInfo || !allFormData.studentInfo.province) {
      errors.studentInfo = { ...errors.studentInfo, province: true };
    }

    // Validasi Program Section
    if (!allFormData.program || !allFormData.program.section_id) {
      errors.program = { ...errors.program, section_id: true };
    }

    if (!allFormData.program) {
      errors.program = { ...errors.program, program_id: true };
    } else {
      if (
        !allFormData.program.program_id &&
        !allFormData.program.program_other
      ) {
        // dua-duanya kosong → invalid
        errors.program = { ...errors.program, program_id: true };
      }

      if (
        allFormData.program.program_id === null &&
        !allFormData.program.program_other
      ) {
        errors.program = { ...errors.program, program_other: true };
      }
    }

    if (!allFormData.program || !allFormData.program.class_id) {
      errors.program = { ...errors.program, class_id: true };
    }

    // Validasi Facilities Section
    if (!allFormData.facilities || !allFormData.facilities.residence_id) {
      errors.facilities = { ...errors.facilities, residence_id: true };
    }

    if (
      !allFormData.facilities ||
      !allFormData.facilities.transportation_policy
    ) {
      errors.facilities = { ...errors.facilities, transportation_policy: true };
    }
    if (
      !allFormData.facilities ||
      !allFormData.facilities.residence_hall_policy
    ) {
      errors.facilities = { ...errors.facilities, residence_hall_policy: true };
    }

    // Validasi Parent Guardian Section
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_name
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, father_name: true };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_phone
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, father_phone: true };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_street
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_street: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_village
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_village: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_district
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_district: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_city_regency
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_city_regency: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_province
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_province: true,
      };
    }

    // Validasi Mother fields
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_name
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, mother_name: true };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_phone
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, mother_phone: true };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_street
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_street: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_village
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_village: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_district
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_district: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_city_regency
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_city_regency: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_province
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_province: true,
      };
    }

    // Validasi Term of Payment Section
    if (!allFormData.termOfPayment || !allFormData.termOfPayment.tuition_fees) {
      errors.termOfPayment = { ...errors.termOfPayment, tuition_fees: true };
    }
    if (
      !allFormData.termOfPayment ||
      !allFormData.termOfPayment.residence_payment
    ) {
      errors.termOfPayment = {
        ...errors.termOfPayment,
        residence_payment: true,
      };
    }

    // Debug: log errors
    console.log("Validation Errors:", errors);

    // Cek jika ada error
    const hasErrors = Object.values(errors).some(
      (sectionErrors) => sectionErrors && Object.keys(sectionErrors).length > 0
    );

    if (hasErrors) {
      if (onSetErrors) {
        // Langsung kirim seluruh objek errors dalam satu kali panggilan
        onSetErrors(errors);
      }
      return;
    }

    // Jika tidak ada error, tampilkan popup konfirmasi
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmSubmit = () => {
    // Popup ditutup, data akan diproses di PopUpConfirm
    setShowConfirmation(false);
  };

  // BARU: Buat fungsi handler yang akan dipanggil jika backend menemukan duplikat
  const handleDuplicateFound = () => {
    // 1. Tutup popup konfirmasi yang sedang aktif
    setShowConfirmation(false);
    // 2. Tampilkan popup peringatan duplikat
    setShowDuplicatePopup(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.noteSection}>
        <div className={styles.noteLabel}>Note: </div>
        <div className={styles.noteText}>
          <span className={styles.noteContent}>
            Please make sure all the data above are accurate before pressing{" "}
          </span>
          <b>Done</b>
        </div>
        <div className={styles.noteText}>
          <span className={styles.noteContent}>
            Please keep in mind that this action cannot be{" "}
          </span>
          <b>undone</b>
          <span className={styles.noteContent}>.</span>
        </div>
      </div>
      <div className={styles.buttonSection}>
        <button
          className={styles.resetButton}
          onClick={handleReset}
          type="button"
        >
          Reset
        </button>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          type="button"
        >
          Submit
        </button>
      </div>

      {showConfirmation && (
        <PopUpConfirm
          onCancel={handleCancelConfirmation}
          onConfirm={handleConfirmSubmit}
          draftId={draftId}
          allFormData={allFormData}
          locationState={location}
          navigate={navigate}
          onDuplicateFound={handleDuplicateFound}
        />
      )}
      {/* BARU: Tambahkan render kondisional untuk popup peringatan duplikat */}
      {showDuplicatePopup && (
        <DuplicateStudentPopup onClose={() => setShowDuplicatePopup(false)} />
      )}
    </div>
  );
};

export default FormButtonSection;
