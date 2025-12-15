import React, { useState } from "react";
import styles from "./IdCardPopup.module.css";
import Button from "../../../Atoms/Button/Button";
import IdCardFront from "../../IdCard/IdCardFront";
import IdCardBack from "../../IdCard/IdCardBack";
import ReactDOM from "react-dom";

// Icon Panah Sederhana (SVG Inline)
const ArrowLeft = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 18L9 12L15 6"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9 18L15 12L9 6"
      stroke="#333"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IdCardPopup = ({ isOpen, onClose, studentData, sectionType }) => {
  const [currentView, setCurrentView] = useState("front"); // 'front' or 'back'

  if (!isOpen) return null;

  // Tentukan variant code ('ecp', 'ms', atau 'hs')
  let variant = "ecp"; // Default
  const type = sectionType ? sectionType.toLowerCase() : "";

  if (type === "ms" || type.includes("middle")) {
    variant = "ms";
  } else if (type === "hs" || type.includes("high")) {
    variant = "hs";
  }

  // Handle Switch View
  const toggleView = () => {
    setCurrentView((prev) => (prev === "front" ? "back" : "front"));
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.idCardPopup}>
        {/* Header Section - Text berubah tergantung sisi kartu */}
        <div className={styles.headerTextGroup}>
          <div className={styles.adjustStudentPhoto}>
            {currentView === "front"
              ? "Adjust student photo"
              : "ID Card Back View"}
          </div>
          {currentView === "front" && (
            <div className={styles.makeSureTo}>
              *Make sure to keep the student image inside and in the middle of
              the box
            </div>
          )}
        </div>

        {/* Card Preview Section dengan Navigasi */}
        <div className={styles.previewContainer}>
          {/* Tombol Kiri */}
          <button className={styles.navButton} onClick={toggleView}>
            <ArrowLeft />
          </button>

          {/* Area Kartu */}
          <div className={styles.cardPreviewWrapper}>
            <div className={styles.cardScaleContainer}>
              {currentView === "front" ? (
                <IdCardFront data={studentData} variant={variant} />
              ) : (
                <IdCardBack data={studentData} variant={variant} />
              )}
            </div>
          </div>

          {/* Tombol Kanan */}
          <button className={styles.navButton} onClick={toggleView}>
            <ArrowRight />
          </button>
        </div>

        {/* Indikator Halaman Kecil (Optional, untuk UX) */}
        <div className={styles.pageIndicator}>
          <span
            className={currentView === "front" ? styles.dotActive : styles.dot}
          ></span>
          <span
            className={currentView === "back" ? styles.dotActive : styles.dot}
          ></span>
        </div>

        {/* ID Number Box */}
        <div className={styles.idCardNumberWrapper}>
          <div className={styles.idCardNumberLabel}>ID Card number</div>
          <div className={styles.idCardNumberValue}>
            {studentData.studentId || "-"}
          </div>
        </div>

        {/* Footer Buttons */}
        <div className={styles.footer}>
          <div className={styles.buttonGroup}>
            <Button
              variant="outline"
              onClick={onClose}
              className={styles.cancelButton}
            >
              Cancel
            </Button>
            <Button variant="solid" className={styles.exportButton}>
              Export ID Card
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IdCardPopup;
