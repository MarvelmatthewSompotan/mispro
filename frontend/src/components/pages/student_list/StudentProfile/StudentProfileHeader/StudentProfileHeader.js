// File: src/components/pages/StudentProfileHeader.js

import React, { useState } from "react";
import styles from "./StudentProfileHeader.module.css";
import Button from "../../../../atoms/Button";

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
  editableStatus, 
  onStatusChange,
}) => {

  const [isDropdownOpen, setDropdownOpen] = useState(false);

  const getStatusVariant = (status) => {
    const lowerCaseStatus =
      status?.toLowerCase().replace(" ", "-") || "not-graduated";
    return lowerCaseStatus;
  };

  const handleDropdownToggle = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const handleStatusSelect = (status) => {
    if (onStatusChange) {
      onStatusChange({
        target: {
          name: "statusreg",
          value: status,
        },
      });
    }
    setDropdownOpen(false);
  };

  // Daftar opsi untuk dropdown
  const statusOptions = ["Not Graduated", "Graduated", "Expelled", "Withdraw"];

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

        {isEditing ? (
          <div className={styles.statusAndEditPhotoContainer}>
            <div className={styles.statusGroup}>
              <Button variant="active">Active</Button>
              <div className={styles.statusDropdownWrapper}>
                <Button
                  variant={getStatusVariant(editableStatus?.statusreg)}
                  showDropdownIcon={true}
                  onClick={handleDropdownToggle}
                >
                  {editableStatus?.statusreg || "Not Graduated"}
                </Button>
                {isDropdownOpen && (
                  <div className={styles.statusDropdownMenu}>
                    {statusOptions.map((option) => (
                      <Button
                        key={option}
                        variant={getStatusVariant(option)}
                        fullWidth={true}
                        onClick={() => handleStatusSelect(option)}
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <Button
              className={styles.editPhotoButton}
              onClick={onAddPhotoClick}
              variant="solid"
            >
              Edit photo
            </Button>
          </div>
        ) : (
          // --- VIEW MODE (STATIC) ---
          <div className={styles.statusTagContainer}>
            {/* Tombol status di-set statis menjadi "Not Active" dan "Graduated" */}
            <Button variant="not-active">Not Active</Button>
            <Button variant="graduated">Graduated</Button>
          </div>
        )}
      </div>

      {/* Kolom Kanan: Tombol Aksi */}
      <div className={styles.headerActionSection}>
        {!isEditing && (
          <div className={styles.historyContainer} ref={historyRef}>
            <Button variant="outline" onClick={onViewHistoryClick}>
              {selectedVersionId
                ? "Back to Latest Version"
                : "View version history"}
            </Button>
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
            <Button
              className={styles.actionButton}
              onClick={onCancelClick}
              disabled={isUpdating}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onSaveClick}
              disabled={isUpdating}
              variant="solid"
            >
              {isUpdating ? "Saving..." : "Save changes"}
            </Button>
          </>
        ) : (
          !selectedVersionId && (
            <Button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onEditClick}
              variant="solid"
            >
              Edit
            </Button>
          )
        )}
      </div>
    </div>
  );
};

export default StudentProfileHeader;
