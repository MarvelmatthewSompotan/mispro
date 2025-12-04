// File: src/components/pages/studentProfileHeader/studentProfileHeader.js

import React, { useState } from 'react';
import styles from './StudentProfileHeader.module.css';
import Button from '../../../../Atoms/Button/Button';
import placeholder from '../../../../../assets/user.svg';

const getStatusVariant = (status) => {
  if (!status) return 'not-graduated';
  const lowerStatus = status.toLowerCase();
  if (lowerStatus.includes('not graduate')) return 'not-graduated';
  if (lowerStatus.includes('graduate')) return 'graduated';
  if (lowerStatus.includes('expelled')) return 'expelled';
  if (lowerStatus.includes('withdraw')) return 'withdraw';
  return 'not-graduated'; // Default variant
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
  onDownloadPdfClick,
}) => {
  const [isStatusDropdownOpen, setStatusDropdownOpen] = useState(false);

  const hasPreview = !!photoPreview;
  const hasFormDataUrl = !!(formData && formData.photo_url);

  const imageUrl =
    photoPreview || (formData && formData.photo_url) || placeholder;
  const imageClass =
    hasPreview || hasFormDataUrl
      ? styles.profileImage
      : styles.profilePlaceholder;
  return (
    <div className={styles.profileHeader}>
      {/* Kolom Kiri: Foto */}
      <div className={styles.headerPhotoSection}>
        <img
          className={imageClass} // Gunakan variabel kelas
          src={imageUrl} // Gunakan variabel URL
          alt=''
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
          <b className={styles.yearValue}>{formData.school_year || '-'}</b>
        </div>

        {isEditing ? (
          // --- EDIT MODE ---
          <div className={styles.statusAndEditPhotoContainer}>
            <div className={styles.statusGroup}>
              {/* This button now reflects the state but is not clickable */}
              <Button
                variant={
                  studentInfo.student_active === 'YES' ? 'active' : 'not-active'
                }
              >
                {studentInfo.student_active === 'YES' ? 'Active' : 'Not Active'}
              </Button>

              {/* New Status Dropdown Button */}
              <div className={styles.historyContainer}>
                {' '}
                {/* Re-using history container for positioning */}
                <Button
                  variant={getStatusVariant(studentInfo.status)}
                  showDropdownIcon={true}
                  onClick={() => setStatusDropdownOpen(!isStatusDropdownOpen)}
                >
                  {studentInfo.status || 'Select Status'}
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
              variant='solid'
            >
              Edit photo
            </Button>
          </div>
        ) : (
          // --- VIEW MODE ---
          !selectedVersionId && (
            // --- [UBAH] Tambahkan div untuk menampung button status dan PDF
            <div className={styles.statusAndActionGroup}>
              <div className={styles.statusTagContainer}>
                <Button
                  variant={
                    studentInfo.student_active === 'YES'
                      ? 'active'
                      : 'not-active'
                  }
                >
                  {studentInfo.student_active === 'YES'
                    ? 'Active'
                    : 'Not Active'}
                </Button>
                <Button variant={getStatusVariant(studentInfo.status)}>
                  {studentInfo.status || 'Not Graduated'}
                </Button>
              </div>
              {/* --- [BARU] Tombol Download PDF (desain sama dengan button edit) */}
              <Button
                className={`${styles.actionButton} ${styles.actionButtonPrimary}`} // Menggunakan style yang sama dengan Edit
                onClick={onDownloadPdfClick}
                variant='solid'
              >
                Download PDF
              </Button>
              {/* --- [AKHIR BARU] */}
            </div>
          )
        )}
      </div>

      {/* Kolom Kanan: Tombol Aksi */}
      <div className={styles.headerActionSection}>
        {!isEditing && (
          <div className={styles.historyContainer} ref={historyRef}>
            <Button variant='outline' onClick={onViewHistoryClick}>
              {selectedVersionId
                ? 'Back to Latest Version'
                : 'View version history'}
            </Button>
            {isHistoryVisible && (
              <ul className={styles.historyDropdown}>
                {isLoadingHistory ? (
                  <li className={styles.historyInfoItem}>Loading...</li>
                ) : historyDates.length > 0 ? (
                  historyDates.map((group, index) => (
                    <React.Fragment key={group.school_year || index}>
                      <li className={styles.historySchoolYear}>
                        {group.school_year}
                      </li>
                      {group.dates.map((version) => (
                        <li
                          key={version.version_id}
                          className={styles.historyItem}
                          onClick={() =>
                            onHistoryDateChange(version.version_id)
                          }
                        >
                          {/* Backend sudah memformat tanggalnya */}
                          {version.updated_at}
                        </li>
                      ))}
                    </React.Fragment>
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
              variant='outline'
            >
              Cancel
            </Button>
            <Button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onSaveClick}
              disabled={isUpdating}
              variant='solid'
            >
              {isUpdating ? 'Saving...' : 'Save changes'}
            </Button>
          </>
        ) : (
          !selectedVersionId && (
            <Button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={onEditClick}
              variant='solid'
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
