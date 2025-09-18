import React from "react";
import styles from "./WrongSectionPopup.module.css"; // Kita akan buat file CSS ini di langkah berikutnya

const WrongSectionPopup = ({ onClose }) => {
  return (
    <div className={styles.overlay}>
      <div className={styles.popup}>
        <div className={styles.iconWrapper}>
          {/* Icon can be an SVG or an emoji */}
          ⚠️
        </div>
        <h3 className={styles.title}>Incorrect Registration Status</h3>
        <p className={styles.message}>
          This student is being registered in a new section. Please use the
          'New' student status for this registration.
        </p>
        <button className={styles.closeButton} onClick={onClose}>
          Understood
        </button>
      </div>
    </div>
  );
};

export default WrongSectionPopup;
