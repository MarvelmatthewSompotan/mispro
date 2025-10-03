// File: src/components/pages/StudentProfileHeader.js

import React from "react";
import styles from "./StudentProfileHeader.module.css";

const StudentProfileHeader = ({
  studentInfo,
  formData,
  photoPreview,
  isEditing,
  isUpdating,
  selectedVersionId,
  isHistoryVisible,
  isLoadingHistory,
  historyDates,
  historyRef,
  onViewHistoryClick,
  onHistoryDateChange,
  onEditClick,
  onCancelClick,
  onSaveClick,
  onAddPhotoClick,
  editableStatus, // <-- Prop added
  onStatusChange, // <-- Prop added
}) => {
  return (
    <div className={styles.profileHeader}>
      {/* Kolom Kiri: Foto */}
      <div className={styles.headerPhotoSection}>
        <img
          className={styles.profileImage}
          src={photoPreview || (formData && formData.photo_url)}
          alt=""
        />
      </div>

      {/* Kolom Tengah: Info & Status */}
      <div className={styles.headerInfoSection}>
        <div className={styles.studentIdContainer}>
          <span className={styles.idLabel}>Student ID</span>
          <b className={styles.idValue}>{formData.student_id}</b>
        </div>

        {/* --- [MODIFIED] Conditional rendering for View vs. Edit mode --- */}
        {isEditing ? (
          // EDIT MODE
          <div className={styles.statusAndEditPhotoContainer}>
            <div className={styles.statusGroup}>
              <div className={`${styles.statusTag} ${styles.statusTagActive}`}>
                Active
              </div>
              <div className={styles.statusDropdownWrapper}>
                <select
                  name="graduation"
                  value={editableStatus.graduation}
                  onChange={onStatusChange}
                  className={styles.statusDropdown}
                >
                  <option value="Not Graduated">Not Graduated</option>
                  <option value="Graduated">Graduated</option>
                </select>
                <span className={styles.dropdownArrow}>▼</span>
              </div>
            </div>
            <button
              className={styles.editPhotoButton}
              onClick={onAddPhotoClick}
            >
              Edit photo
            </button>
          </div>
        ) : (
          // VIEW MODE
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

      {/* Kolom Kanan: Tombol Aksi */}
      <div className={styles.headerActionSection}>
        {!isEditing && (
          <div className={styles.historyContainer} ref={historyRef}>
            <button
              className={styles.actionButton}
              onClick={onViewHistoryClick}
            >
              {selectedVersionId
                ? "Back to Latest Version"
                : "View version history"}
            </button>
            {isHistoryVisible && (
              <ul className={styles.historyDropdown}>
                {isLoadingHistory ? (
                  <li className={styles.historyInfoItem}>Loading...</li>
                ) : historyDates.length > 0 ? (
                  historyDates.map((version) => (
                    <li
                      key={version.version_id}
                      className={styles.historyItem}
                      onClick={() => onHistoryDateChange(version.version_id)}
                    >
                      {new Date(version.updated_at).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </li>
                  ))
                ) : (
                  <li className={styles.historyInfoItem}>No history found.</li>
                )}
              </ul>
            )}
          </div>
        )}

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
              {isUpdating ? "Saving..." : "Save changes"}
            </button>
          </>
        ) : (
          !selectedVersionId && (
            <button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onEditClick}
            >
              Edit
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default StudentProfileHeader;
