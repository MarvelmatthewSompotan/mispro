import React, { useState, useEffect } from "react";
import styles from "./IdCardPopup.module.css";
import Button from "../../../Atoms/Button/Button";
import IdCardFront from "../../IdCard/IdCardFront";
import IdCardBack from "../../IdCard/IdCardBack";
import ReactDOM from "react-dom";
// Import API
import { getStudentLatestApplication } from "../../../../services/api";

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

const IdCardPopup = ({ isOpen, onClose, studentData }) => {
  const [currentView, setCurrentView] = useState("front"); // 'front' or 'back'

  // State untuk data API dan Loading
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState("");

  // Fetch data saat popup open & ada ID student
  useEffect(() => {
    if (isOpen && studentData?.id) {
      setLoading(true);
      // Gunakan source='registration'
      getStudentLatestApplication(studentData.id, "registration")
        .then((res) => {
          if (res?.success && res?.data?.idCardInfo) {
            const info = res.data.idCardInfo;
            setCardData(info);
            // Set nomor kartu dari API
            setIdCardNumber(info.card_number || "");
          }
        })
        .catch((err) => {
          console.error("Failed to fetch ID Card info", err);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      // Reset card data jika ditutup atau ganti student
      setCardData(null);
      setIdCardNumber("");
    }
  }, [isOpen, studentData]);

  if (!isOpen) return null;

  // --- PERBAIKAN DI SINI ---
  // Kita buat Initial Data dari props 'studentData' (camelCase)
  // dan mengubahnya menjadi format API (snake_case) agar IdCardFront bisa membacanya
  // selagi menunggu loading API selesai.
  const initialData = {
    first_name: studentData?.firstName,
    last_name: studentData?.lastName,
    student_id: studentData?.studentId,
    photo_url: studentData?.photoUrl,
    section_name: studentData?.sectionName,
    nisn: studentData?.nisn,
    place_of_birth: studentData?.placeOfBirth,
    date_of_birth: studentData?.dateOfBirth,
    school_year: studentData?.schoolYear,
    // valid_until mungkin kosong di props, biarkan handling di Back component
  };

  // Prioritas Data:
  // 1. Data dari API (cardData) jika sudah load.
  // 2. Data dari Props (initialData) sebagai fallback agar tidak kosong.
  const displayData = cardData || initialData;

  // Tentukan variant
  let variant = "ecp";
  const sectionName = displayData?.section_name || "";
  const type = sectionName.toLowerCase();

  if (type.includes("middle")) {
    variant = "ms";
  } else if (type.includes("high")) {
    variant = "hs";
  }
  // -------------------------

  // Handle Switch View
  const toggleView = () => {
    setCurrentView((prev) => (prev === "front" ? "back" : "front"));
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.idCardPopup}>
        {/* Header Section */}
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
            {loading && !cardData ? (
              <div className={styles.cardScaleContainer}>
                {currentView === "front" ? (
                  <IdCardFront
                    data={displayData}
                    variant={variant}
                    editable={true} // Aktifkan mode drag
                    scale={0.6}
                  />
                ) : (
                  <IdCardBack data={displayData} variant={variant} />
                )}
              </div>
            ) : (
              <div className={styles.cardScaleContainer}>
                {currentView === "front" ? (
                  // Pass displayData yang sudah pasti snake_case
                  <IdCardFront
                    data={displayData}
                    variant={variant}
                    editable={true} // Aktifkan mode drag
                    scale={0.6}
                  />
                ) : (
                  <IdCardBack data={displayData} variant={variant} />
                )}
              </div>
            )}
          </div>

          {/* Tombol Kanan */}
          <button className={styles.navButton} onClick={toggleView}>
            <ArrowRight />
          </button>
        </div>

        {/* Indikator Halaman */}
        <div className={styles.pageIndicator}>
          <span
            className={currentView === "front" ? styles.dotActive : styles.dot}
          ></span>
          <span
            className={currentView === "back" ? styles.dotActive : styles.dot}
          ></span>
        </div>

        {/* Input Nomor Kartu */}
        <input
          type="text"
          className={styles.idCardNumberInput}
          placeholder="ID Card number"
          value={idCardNumber}
          onChange={(e) => setIdCardNumber(e.target.value)}
        />

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
