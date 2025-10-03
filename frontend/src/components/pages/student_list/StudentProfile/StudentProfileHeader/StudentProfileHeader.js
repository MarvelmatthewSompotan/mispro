// File: src/components/pages/StudentProfileHeader.js (Pembaruan)

import React from "react";
import styles from "./StudentProfileHeader.module.css";
// Anda mungkin perlu file gambar panah bawah jika belum ada
// import chevronDown from './chevron-down.svg'; 

const StudentProfileHeader = ({
  studentInfo,
  formData,
  photoPreview,
  isEditing,
  isUpdating,
  onEditClick,
  onCancelClick,
  onSaveClick,
  onAddPhotoClick,
  editableStatus,
  onStatusChange,
}) => {
  return (
    <div className={styles.profileHeader}>
      <div className={styles.headerPhotoSection}>
        <img
          className={styles.profileImage}
          src={photoPreview || (formData && formData.photo_url)}
          alt=""
        />
        {/* Tombol Edit Photo sekarang hanya akan muncul di mode edit dan posisinya akan diatur oleh CSS */}
        {/* Blok ini dihapus dari sini, akan dipindahkan ke .headerInfoSection */}
      </div>

      <div className={styles.headerInfoSection}>
        <div className={styles.studentIdContainer}>
          <span className={styles.idLabel}>Student ID</span>
          <b className={styles.idValue}>{formData.student_id}</b>
        </div>

        {isEditing ? (
          <>
            <div className={styles.statusAndEditPhotoContainer}> {/* Kontainer baru */}
              <div className={styles.statusTagContainer}>
                <div className={`${styles.statusTag} ${styles.statusTagActive}`}>
                  {editableStatus.activity}
                </div>
                <div className={styles.statusDropdownWrapper}>
                  <select
                    name="graduation"
                    value={editableStatus.graduation}
                    onChange={onStatusChange}
                    className={styles.statusDropdown}
                  >
                    <option value="Not Graduated">Not Graduated</option> {/* Tambahkan value */}
                    <option value="Graduated">Graduated</option>
                    <option value="Expelled">Expelled</option> {/* Opsi baru */}
                    <option value="Withdraw">Withdraw</option> {/* Opsi baru */}
                    <option value="Withdraw">Transfer</option> {/* Opsi baru */}
                  </select>
                  <span className={styles.dropdownArrow}>▼</span>
                </div>
              </div>
              {/* Tombol Edit Photo dipindahkan ke sini saat isEditing */}
              <button className={styles.editPhotoButton} onClick={onAddPhotoClick}>
                Edit photo
              </button>
            </div>
          </>
        ) : (
          // --- TAMPILAN VIEW MODE (Tidak Berubah) ---
          <div className={styles.statusTagContainer}>
            <div className={`${styles.statusTag} ${styles.statusTagNotActive}`}>
              Not Active
            </div>
            <div className={`${styles.statusTag} ${styles.statusTagGraduated}`}>
              Graduated
            </div>
          </div>
        )}
      </div>

      <div className={styles.headerActionSection}>
        {isEditing ? (
          <>
            <button
              className={styles.actionButton}
              onClick={onCancelClick}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onSaveClick}
              disabled={isUpdating}
            >
              Save changes
            </button>
          </>
        ) : (
          <button
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            onClick={onEditClick}
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default StudentProfileHeader;