import React, { useState } from "react";
import styles from "./FormButtonSection.module.css";

const FormButtonSection = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReset = () => {
    // Reset semua form data
    console.log("Reset form");
    // Di sini bisa ditambahkan logic untuk reset semua form
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Submit form data
    console.log("Submit form");
    // Di sini bisa ditambahkan logic untuk submit form
    setTimeout(() => {
      setIsSubmitting(false);
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
          type="submit"
        >
          {isSubmitting ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
};

export default FormButtonSection;
