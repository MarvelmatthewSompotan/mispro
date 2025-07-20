import React from "react";
import styles from "../styles/PopUpConfirm.module.css";

const PopUpConfirm = ({ onCancel, onConfirm }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popUpConfirm}>
        <div className={styles.confirmStudentInformation}>
          Confirm Student Information
        </div>
        <div className={styles.pleaseDoubleCheckThatContainer}>
          <p className={styles.pleaseDoubleCheckThat}>
            Please double-check that all the information you've entered is
            correct.
          </p>
          <p className={styles.pleaseDoubleCheckThat}>&nbsp;</p>
          <p className={styles.pleaseDoubleCheckThat}>
            Once submitted, changes may not be possible.
          </p>
        </div>
        <div className={styles.areYouSure}>
          Are you sure you want to continue?
        </div>
        <div className={styles.bAddSubjectParent}>
          <button
            className={styles.bAddSubject1}
            onClick={onCancel}
            type="button"
          >
            Cancel
          </button>
          <button
            className={styles.bAddSubject}
            onClick={onConfirm}
            type="button"
          >
            Yes, I’m sure
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopUpConfirm;
