// File: src/components/molecules/ConfirmBackPopup/ConfirmBackPopup.js

import React from "react";
// Impor style dari file CSS modul baru di bawah ini
import styles from "./PopUpBackConfirm.module.css";
// Pastikan path ke komponen Button Anda benar
import Button from "../../../atoms/Button";

/**
 * Popup untuk konfirmasi kembali/meninggalkan halaman
 * @param {object} props
 * @param {boolean} props.isOpen - Status apakah modal terbuka
 * @param {function} props.onClose - Fungsi untuk menutup modal (klik "Cancel")
 * @param {function} props.onConfirm - Fungsi untuk konfirmasi (klik "Yes, Discard")
 */
const ConfirmBackPopup = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Menggunakan e.stopPropagation() agar klik di dalam modal tidak menutup modal
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Teks Header yang Anda minta */}
        <h3>Are you sure you want to go back?</h3>

        {/* Teks Body yang Anda minta */}
        <p>
          You have unsaved progress. Leaving this page will discard all your
          progress. Are you sure you want to continue?
        </p>

        <div className={styles.modalActions}>
          <Button variant="solid" onClick={onConfirm}>
            Yes, I'm Sure
          </Button>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmBackPopup;