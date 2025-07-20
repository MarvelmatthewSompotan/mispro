import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PopUpConfirm from "../PopUpConfirm";
import styles from "./FormButtonSection.module.css";

const FormButtonSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleReset = () => {
    // Reset semua form data
    console.log("Reset form");
    // Di sini bisa ditambahkan logic untuk reset semua form
  };

  const handleSubmit = () => {
    // Tampilkan popup confirmation terlebih dahulu
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmation(false);
    setIsSubmitting(true);

    // Submit form data
    console.log("Submit form confirmed");
    // Di sini bisa ditambahkan logic untuk submit form ke API

    // Collect form data (dari popup form dan form registrasi)
    const formData = {
      // Data dari popup form
      ...location.state,
      // Data dari form registrasi (bisa ditambahkan state management di sini)
      submittedAt: new Date().toISOString(),
      registrationId: `REG${Date.now()}`, // Generate registration ID
    };

    setTimeout(() => {
      setIsSubmitting(false);
      // Navigate ke halaman print dengan data form
      navigate("/print", { state: formData });
    }, 2000);
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
          disabled={isSubmitting}
          type="button"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
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
