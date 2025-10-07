// File: src/components/pages/StudentProfileHeader/StudentProfileHeader.js

import React, { useState } from "react";
import styles from "./StudentProfileHeader.module.css";
import Button from "../../../../atoms/Button";

const getStatusVariant = (status) => {
  if (!status) return "not-graduated";
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes("not graduate")) return "not-graduated";
  if (lowerStatus.includes("graduate")) return "graduated";
  if (lowerStatus.includes("expelled")) return "expelled";
  if (lowerStatus.includes("withdraw")) return "withdraw";
  return "not-graduated"; // Default variant
};

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
  statusOptions,
  onAddPhotoClick,
  editableStatus, // <-- Prop added
  onStatusChange, // <-- Prop added
}) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);
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
          <b className={styles.idValue}>
            {formData.student_id || studentInfo.student_id}
          </b>
        </div>

        <div className={styles.schoolYearContainer}>
          <span className={styles.yearLabel}>School year</span>
          <b className={styles.yearValue}>{formData.school_year || "-"}</b>
        </div>

        {isEditing ? (
          // --- EDIT MODE ---
          <div className={styles.statusAndEditPhotoContainer}>
            <div className={styles.statusGroup}>
              {/* This button now reflects the state but is not clickable */}
              <Button
                variant={
                  studentInfo.student_active === "YES" ? "active" : "not-active"
                }
              >
                {studentInfo.student_active === "YES" ? "Active" : "Not Active"}
              </Button>

              {/* New Status Dropdown Button */}
              <div className={styles.historyContainer}>
                {" "}
                {/* Re-using history container for positioning */}
                <Button
                  variant={getStatusVariant(studentInfo.status)}
                  showDropdownIcon={true}
                  onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  {studentInfo.status || "Select Status"}
                </Button>
                {isStatusDropdownOpen && (
                  <ul className={styles.historyDropdown}>
                    {statusOptions.length > 0 ? (
                      statusOptions.map((option) => (
                        <li
                          key={option}
                          className={styles.historyItem}
                          onClick={() => {
                            onStatusChange(option);
                            setStatusDropdownOpen(false);
                          }}
                        >
                          {option}
                        </li>
                      ))
                    ) : (
                      <li className={styles.historyInfoItem}>No options.</li>
                    )}
                  </ul>
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
          // --- VIEW MODE ---
          <div className={styles.statusTagContainer}>
            <Button
              variant={
                studentInfo.student_active === "YES" ? "active" : "not-active"
              }
            >
              {studentInfo.student_active === "YES" ? "Active" : "Not Active"}
            </Button>
            <Button variant={getStatusVariant(studentInfo.status)}>
              {studentInfo.status || "Not Graduated"}
            </Button>
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
