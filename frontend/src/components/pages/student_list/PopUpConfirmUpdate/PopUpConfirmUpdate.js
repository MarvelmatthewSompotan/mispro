import React from "react";
import styles from "./PopUpConfirmUpdate.module.css";

const ConfirmUpdatePopup = ({ isOpen, onClose, onConfirm, isUpdating }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <div className={styles.title}>Confirm Student Update Information</div>
        <div className={styles.messageContainer}>
          <p>
            Please double-check that all the information you've entered is
            correct.
          </p>
          <p>Once submitted, changes may not be possible.</p>
        </div>
        <div className={styles.confirmationText}>
          Are you sure you want to continue?
        </div>
        <div className={styles.buttonGroup}>
          <button
            className={styles.cancelButton}
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Yes, I'm sure"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmUpdatePopup;
