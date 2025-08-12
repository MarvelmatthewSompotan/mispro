import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PopUpConfirm from "../PopUpConfirm";
import styles from "./FormButtonSection.module.css";

const FormButtonSection = ({
  validationState,
  onSetErrors,
  onSubmitRegistration,
  submitLoading = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = () => {
    // Reset semua form data
    console.log("Reset form");
    // Di sini bisa ditambahkan logic untuk reset semua form
    window.location.reload(); // Simple reset by reloading the page
  };

  const handleSubmit = () => {
    // Validasi form sebelum submit
    const errors = {};

    // Validasi Student Information Section
    if (validationState.studentInfo) {
      if (!validationState.studentInfo.firstName) {
        errors.studentInfo = { firstName: true };
      }
      if (!validationState.studentInfo.citizenship) {
        errors.studentInfo = {
          ...errors.studentInfo,
          citizenship: true,
        };
      }
    } else {
      // Jika validationState.studentInfo belum ada, set error untuk firstName dan citizenship
      errors.studentInfo = { firstName: true, citizenship: true };
    }

    // Jika ada error, tampilkan error dan jangan lanjut ke confirmation
    if (Object.keys(errors).length > 0) {
      if (onSetErrors) {
        onSetErrors("studentInfo", errors.studentInfo);
      }
      return;
    }

    // Jika tidak ada error, tampilkan popup confirmation
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    try {
      // Collect form data (dari popup form dan form registrasi)
      const formData = {
        // Data dari popup form
        ...location.state,
        // Data dari form registrasi (bisa ditambahkan state management di sini)
        submittedAt: new Date().toISOString(),
        registrationId: `REG${Date.now()}`, // Generate registration ID
      };

      // Submit ke API
      if (onSubmitRegistration) {
        await onSubmitRegistration(formData);
      } else {
        // Fallback jika tidak ada onSubmitRegistration
        console.log("Submit form confirmed", formData);

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Navigate ke halaman print dengan data form
        navigate("/print", { state: formData });
      }
    } catch (error) {
      console.error("Error submitting registration:", error);
      // Handle error - bisa ditampilkan toast atau alert
    } finally {
      setIsSubmitting(false);
    }
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
          disabled={isSubmitting || submitLoading}
        >
          Reset
        </button>
        <button
          className={styles.submitButton}
          onClick={handleSubmit}
          disabled={isSubmitting || submitLoading}
          type="button"
        >
          {isSubmitting || submitLoading ? "Submitting..." : "Submit"}
        </button>
      </div>

      {/* Popup Confirmation */}
      {showConfirmation && (
        <PopUpConfirm
          onCancel={handleCancelConfirmation}
          onConfirm={handleConfirmSubmit}
        />
      )}
    </div>
  );
};

export default FormButtonSection;
