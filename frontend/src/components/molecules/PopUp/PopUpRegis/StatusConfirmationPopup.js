import React, { useState } from 'react';
import styles from './StatusConfirmationPopup.module.css';
import WarningSign from '../../../../assets/Warning_Sign.png';
import { updateRegistrationStatus } from '../../../../services/api';
import Button from '../../../atoms/Button';

const reasonOptions = [
  { label: 'Withdraw', value: 'Withdraw' },
  { label: 'Invalid Data', value: 'Invalid' },
];

const StatusConfirmationPopup = ({ registration, onClose, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  if (!registration) return null;

  const registrationId = registration.registration_id;
  const studentId = registration.student_id;
  const currentStatus = registration.application_status || 'N/A';
  const applicationId = registration.application_id;

  const isConfirmed = currentStatus.toLowerCase() === 'confirmed';

  const displayStatusFrom =
    currentStatus.charAt(0).toUpperCase() +
    currentStatus.slice(1).toLowerCase();

  const targetStatusAPI = isConfirmed ? 'Cancelled' : 'Confirmed';

  const showReasonField = targetStatusAPI === 'Cancelled';

  const handleUpdate = async () => {
    if (!applicationId) {
      console.error('Application ID is missing. Cannot update status.');
      return;
    }

    let reasonPayload = undefined;
    if (showReasonField) {
      if (!selectedReason) {
        setReasonError('Cancellation reason must be selected.');
        return;
      }
      reasonPayload = selectedReason;
    }

    setReasonError('');

    console.log('Application ID:', applicationId);
    console.log('Target Status (API Payload - Capitalized):', targetStatusAPI);
    if (showReasonField) {
      console.log('Reason Payload (API Payload):', reasonPayload);
    }

    setIsUpdating(true);
    try {
      await updateRegistrationStatus(
        applicationId,
        targetStatusAPI,
        reasonPayload
      );
      onUpdateStatus(registration.registration_id, targetStatusAPI);
      onClose();
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      const errorMessage = error.response?.data?.message || 'Connection Error';

      if (backendErrors && Object.keys(backendErrors).length > 0) {
        console.error('Backend validation details:', backendErrors);
      }

      console.error(`Failed to update status: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
    if (reasonError) {
      setReasonError('');
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popUp} onClick={(e) => e.stopPropagation()}>
        {/* Task 1: Container "header" */}
        <div className={styles.header}>
          <img src={WarningSign} alt='Warning' className={styles.icon} />
          <h2 className={styles.title}>Confirm Update Registration Status</h2>
          <p className={styles.message}>
            Please double-check to make sure that all the information you've
            entered is correct. Once submitted, changes may not be possible.
          </p>
        </div>

        {/* Task 2: Container "before" */}
        <div className={styles.before}>
          <div className={styles.wrapper}>
            <div className={styles.textInfo}>From</div>
          </div>
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
                {displayStatusFrom}
              </span>
            </div>
          </div>
        </div>

        {/* Task 3: Container "after" */}
        <div className={styles.after}>
          <div className={styles.wrapper}>
            <div className={styles.textInfo}>To</div>
          </div>
          <div
            className={styles.registrationInfo}
            style={{
              border:
                targetStatusAPI === 'Confirmed'
                  ? '4px solid #00F413'
                  : '4px solid #EE0808',
            }}
          >
            {/* <div className={styles.infoRow}>
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
            </div> */}

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={styles.separator}>:</span>
              <span
                className={styles.infoValue}
                style={{
                  color:
                    targetStatusAPI === 'Confirmed' ? '#00F413' : '#EE0808',
                }}
              >
                {targetStatusAPI}
              </span>
            </div>
            {showReasonField && (
              <div className={styles.infoRow} style={{ alignItems: 'center' }}>
                <span className={styles.infoLabel}>Reason</span>
                <span className={styles.separator}>:</span>
                <div style={{ flexGrow: 1 }}>
                  <select
                    className={styles.reasonSelect}
                    value={selectedReason}
                    onChange={handleReasonChange}
                  >
                    <option value='' disabled>
                      Select reason
                    </option>
                    {reasonOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {/* Tampilkan error jika ada */}
                  {reasonError && (
                    <div className={styles.reasonError}>{reasonError}</div>
                  )}
                </div>
              </div>
            )}

            {/* Jika status target adalah Confirmed, tampilkan Reason sebagai nilai statis/empty */}
            {!showReasonField && (
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Reason</span>
                <span className={styles.separator}>:</span>
                <span className={styles.infoValue}>-</span>
              </div>
            )}
          </div>
        </div>

        {/* Task 4: Container "button" */}
        <div className={styles.button}>
          <div className={styles.rowBtn}>
            {/* Tombol Cancel*/}
            <Button
              className={styles.bAddSubject1}
              onClick={onClose}
              disabled={isUpdating}
              variant='solid'
            >
              Cancel
            </Button>

            {/* Tombol Yes, I'm sure */}
            <Button
              className={styles.bAddSubject}
              onClick={handleUpdate}
              disabled={isUpdating}
              variant='outline'
            >
              {isUpdating
                ? `${
                    targetStatusAPI === 'Confirmed'
                      ? 'Confirming'
                      : 'Cancelling'
                  }...`
                : `Yes, I'm sure`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationPopup;
