import React, { useEffect } from "react";
import styles from "./UpdateNotification.module.css";

const UpdatedNotification = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      // Set timer untuk menutup notifikasi setelah 2 detik
      const timer = setTimeout(() => {
        onClose();
      }, 2000);

      // Membersihkan timer jika komponen di-unmount sebelum waktunya habis
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.notificationContent}>
        {/* Ikon centang menggunakan SVG */}
        <svg className={styles.checkmarkIcon} viewBox="0 0 52 52">
          <circle
            className={styles.checkmarkCircle}
            cx="26"
            cy="26"
            r="25"
            fill="none"
          />
          <path
            className={styles.checkmarkCheck}
            fill="none"
            d="M14.1 27.2l7.1 7.2 16.7-16.8"
          />
        </svg>
        <div className={styles.message}>Update Successfully</div>
      </div>
    </div>
  );
};

export default UpdatedNotification;
