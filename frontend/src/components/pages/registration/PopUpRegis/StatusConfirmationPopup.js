import React, { useState } from 'react';
import styles from './StatusConfirmationPopup.module.css';
import WarningSign from '../../../../assets/Warning_Sign.png';
import { updateRegistrationStatus } from '../../../../services/api';
import Button from '../../../atoms/Button';

const StatusConfirmationPopup = ({ registration, onClose, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!registration) return null;

  // Mengambil data untuk display (Registration ID dan Student ID)
  const registrationId = registration.registration_id;
  const studentId = registration.student_id;

  // Status dan ID Aplikasi untuk API
  // Mengambil status dari application_form
  const currentStatus = registration.application_form?.status || 'Confirmed';
  const applicationId = registration.application_form?.application_id;

  const isConfirmed = currentStatus.toLowerCase() === 'confirmed';

  const targetStatusAPI = isConfirmed ? 'Cancelled' : 'Confirmed';

  const handleUpdate = async () => {
    if (!applicationId) {
      alert('Application ID is missing. Cannot update status.');
      return;
    }

    // Debugging: Cek payload terakhir yang akan dikirim
    console.log('Application ID:', applicationId);
    console.log('Target Status (API Payload - Capitalized):', targetStatusAPI);

    setIsUpdating(true);
    try {
      // Panggil API dengan status Huruf Kapital di Awal
      await updateRegistrationStatus(applicationId, targetStatusAPI);

      // Setelah sukses, panggil callback di parent
      onUpdateStatus(registration.registration_id, targetStatusAPI);
      onClose();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Connection Error';
      alert(`Failed to update status: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popUp} onClick={(e) => e.stopPropagation()}>
        <img src={WarningSign} alt='Warning' className={styles.icon} />
        <h2 className={styles.title}>Confirm Update Registration Status</h2>

        <p className={styles.message}>
          Please double-check to make sure that all the information you've
          entered is correct. Once submitted, changes may not be possible.
        </p>

        <div className={styles.registrationInfo}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Name</span>
            <span className={styles.separator}>:</span>
            <span className={styles.infoValue}>{registration.full_name}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Student ID</span>
            <span className={styles.separator}>:</span>
            <span className={styles.infoValue}>{studentId}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Registration ID</span>
            <span className={styles.separator}>:</span>
            <span className={styles.infoValue}>{registrationId}</span>
          </div>

          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Status</span>
            <span className={styles.separator}>:</span>
            <span
              className={styles.infoValue}
              style={{ color: isConfirmed ? '#00F413' : '#EE0808' }}
            >
              {currentStatus.charAt(0).toUpperCase() +
                currentStatus.slice(1).toLowerCase()}
            </span>
          </div>
        </div>

        <div className={styles.rowBtn}>
          {/* Tombol Cancel*/}
          <Button
            className={styles.bAddSubject1}
            onClick={onClose}
            disabled={isUpdating}
            variant='outline'
          >
            Cancel
          </Button>

          {/* Tombol Yes, I'm sure */}
          <Button
            className={styles.bAddSubject}
            onClick={handleUpdate}
            disabled={isUpdating}
            variant='solid'
          >
            {isUpdating
              ? `${
                  targetStatusAPI === 'Confirmed' ? 'Confirming' : 'Cancelling'
                }...`
              : `Yes, I'm sure`}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationPopup;
