import React from "react";
import styles from "./DuplicateStudentPopup.module.css";

const DuplicateStudentPopup = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.iconWrapper}>
          {/* Icon can be an SVG or an emoji */}
          ⚠️
        </div>
        <h3 className={styles.title}>Student Already Exists</h3>
        <p className={styles.message}>
          Please select "Old" status and input the student's name.
        </p>
        <button className={styles.closeButton} onClick={onClose}>
          Understood
        </button>
      </div>
    </div>
  );
};

export default DuplicateStudentPopup;
