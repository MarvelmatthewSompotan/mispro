import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PopUpConfirm from "../PopUpConfirm";
import styles from "./FormButtonSection.module.css";

const FormButtonSection = ({
  validationState,
  onSetErrors,
  draftId,
  allFormData,
  onReset,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = () => {
    if (onReset) onReset();
  };

  const handleSubmit = () => {
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
    if (
      !allFormData.studentInfo ||
      allFormData.studentInfo.citizenship === undefined ||
      allFormData.studentInfo.citizenship === null
    ) {
      errors.studentInfo = { ...errors.studentInfo, citizenship: true };
    }

    // Validasi Program Section
    if (!allFormData.program || !allFormData.program.section_id) {
      errors.program = { ...errors.program, section_id: true };
    }
    if (!allFormData.program || !allFormData.program.program_id) {
      errors.program = { ...errors.program, program_id: true };
    }
    if (!allFormData.program || !allFormData.program.class_id) {
      errors.program = { ...errors.program, class_id: true };
    }

    // Validasi Facilities Section
    if (!allFormData.facilities || !allFormData.facilities.transportation_id) {
      errors.facilities = { ...errors.facilities, transportation_id: true };
    }
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

    // Validasi Parent Guardian Section - minimal father name required
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_name
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, father_name: true };
    }

    // Validasi Term of Payment Section
    if (!allFormData.termOfPayment || !allFormData.termOfPayment.payment_type) {
      errors.termOfPayment = { ...errors.termOfPayment, payment_type: true };
    }

    // Debug: log errors
    console.log("Validation Errors:", errors);

    // Cek jika ada error
    const hasErrors = Object.values(errors).some(
      (sectionErrors) => sectionErrors && Object.keys(sectionErrors).length > 0
    );

    if (hasErrors) {
      if (onSetErrors) {
        Object.entries(errors).forEach(([sectionName, errorData]) => {
          onSetErrors(sectionName, errorData);
        });
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
          locationState={location.state}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default FormButtonSection;
