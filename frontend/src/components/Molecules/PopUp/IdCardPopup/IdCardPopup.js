import React, { useState, useEffect } from "react";
import styles from "./IdCardPopup.module.css";
import Button from "../../../Atoms/Button/Button";
import IdCardFront from "../../IdCard/IdCardFront";
import IdCardBack from "../../IdCard/IdCardBack";
import ReactDOM from "react-dom";
// [UPDATE] Import saveStudentCardNumber
import {
  getStudentLatestApplication,
  saveStudentCardNumber,
} from "../../../../services/api";

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

// [UPDATE] Tambahkan prop onSaveSuccess
const IdCardPopup = ({ isOpen, onClose, studentData, onSaveSuccess }) => {
  const [currentView, setCurrentView] = useState("front");

  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [idCardNumber, setIdCardNumber] = useState("");
  // [BARU] State untuk loading saat saving
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // Pastikan studentData.id ada sebelum fetch
    if (isOpen && studentData?.id) {
      setLoading(true);
      getStudentLatestApplication(studentData.id, "registration")
        .then((res) => {
          if (res?.success && res?.data?.idCardInfo) {
            const info = res.data.idCardInfo;
            setCardData(info);
            // Isi state input dengan data dari API jika ada
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
      setCardData(null);
      setIdCardNumber("");
    }
  }, [isOpen, studentData]);

  if (!isOpen) return null;

  const initialData = {
    first_name: studentData?.firstName,
    middle_name: studentData?.middleName,
    last_name: studentData?.lastName,
    student_id: studentData?.studentId,
    photo_url: studentData?.photoUrl,
    section_name: studentData?.sectionName,
    nisn: studentData?.nisn,
    place_of_birth: studentData?.placeOfBirth,
    date_of_birth: studentData?.dateOfBirth,
    school_year: studentData?.schoolYear,
  };

  const displayData = cardData || initialData;

  let variant = "ecp";
  const sectionName = displayData?.section_name || "";
  const type = sectionName.toLowerCase();

  if (type.includes("middle")) {
    variant = "ms";
  } else if (type.includes("high")) {
    variant = "hs";
  }

  const toggleView = () => {
    setCurrentView((prev) => (prev === "front" ? "back" : "front"));
  };

  // [BARU] Fungsi handle Export
  const handleExport = async () => {
    if (!studentData?.id) {
      alert("Student ID is missing.");
      return;
    }

    setIsSaving(true);
    try {
      // 1. Simpan Card Number ke backend
      await saveStudentCardNumber(studentData.id, idCardNumber);

      // 2. Trigger refresh di parent jika berhasil
      if (onSaveSuccess) {
        onSaveSuccess();
      }

      // 3. (Opsional) Di sini logika download gambar/pdf ID Card bisa dijalankan
      // Untuk sekarang kita anggap sukses dan tutup popup
      alert("ID Card exported and number saved successfully!");
      onClose();
    } catch (error) {
      console.error("Failed to save card number", error);
      alert("Failed to save ID Card number.");
    } finally {
      setIsSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className={styles.overlay}>
      <div className={styles.idCardPopup}>
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
        <div className={styles.previewContainer}>
          <button className={styles.navButton} onClick={toggleView}>
            <ArrowLeft />
          </button>
          <div className={styles.cardPreviewWrapper}>
            <div className={styles.cardScaleContainer}>
              {currentView === "front" ? (
                <IdCardFront
                  data={displayData}
                  variant={variant}
                  editable={true}
                  scale={0.6}
                />
              ) : (
                <IdCardBack data={displayData} variant={variant} />
              )}
            </div>
          </div>
          <button className={styles.navButton} onClick={toggleView}>
            <ArrowRight />
          </button>
        </div>

        <div className={styles.pageIndicator}>
          <span
            className={currentView === "front" ? styles.dotActive : styles.dot}
          ></span>
          <span
            className={currentView === "back" ? styles.dotActive : styles.dot}
          ></span>
        </div>

        <input
          type="text"
          className={styles.idCardNumberInput}
          placeholder="ID Card number"
          value={idCardNumber}
          onChange={(e) => setIdCardNumber(e.target.value)}
        />

        <div className={styles.footer}>
          <div className={styles.buttonGroup}>
            <Button
              variant="outline"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              className={styles.exportButton}
              onClick={handleExport} // [UPDATE] Pasang handler
              disabled={isSaving}
            >
              {isSaving ? "Exporting..." : "Export ID Card"}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default IdCardPopup;
