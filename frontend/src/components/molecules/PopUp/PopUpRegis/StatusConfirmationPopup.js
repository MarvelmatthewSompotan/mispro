import React, { useState, useEffect } from 'react';
import styles from './StatusConfirmationPopup.module.css';

import WarningSign from '../../../../assets/Warning_Sign.png';
import {
  cancelRegistration,
  getRegistrationPreview,
} from '../../../../services/api';

import Button from '../../../atoms/Button';

const reasonOptions = [
  { label: 'Withdraw', value: 'cancellationOfEnrollment' },
  { label: 'Invalid Data', value: 'invalidData' },
];

const StatusConfirmationPopup = ({ registration, onClose, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [reasonError, setReasonError] = useState('');
  const [targetStatus, setTargetStatus] = useState(null);

  // === TASK 1: TAMBAHAN STATE UNTUK ERROR BACKEND ===
  const [apiError, setApiError] = useState('');
  // ================================================

  const [isLoading, setIsLoading] = useState(true);
  const [fullData, setFullData] = useState(null);

  useEffect(() => {
    if (!registration || !registration.application_id) {
      console.error('Missing registration/application ID.');
      setIsLoading(false);
      return;
    }

    const fetch = async () => {
      setIsLoading(true);
      try {
        const version = registration.version_id ?? null;
        const response = await getRegistrationPreview(
          registration.application_id,
          version
        );

        setFullData(response.data);

        const currentStatus =
          response.data?.application_form?.status ||
          response.data?.application_status ||
          'N/A';

        const initialTarget =
          currentStatus.toLowerCase() === 'confirmed'
            ? 'Cancelled'
            : 'Confirmed';

        setTargetStatus(initialTarget);
      } catch (error) {
        console.error('Failed loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetch();
  }, [registration]);

  const handleToggleStatus = () => {
    // === TASK 1: BERSIHKAN ERROR JIKA STATUS DIGANTI ===
    setApiError('');
    // ================================================

    setTargetStatus((prev) => {
      const next = prev === 'Confirmed' ? 'Cancelled' : 'Confirmed';

      if (next !== 'Cancelled') {
        setSelectedReason('');
        setReasonError('');
      }

      return next;
    });
  };

  const showReasonField = targetStatus === 'Cancelled';

  const handleUpdate = async () => {
    const applicationId = registration.application_id;

    if (!applicationId) {
      console.error('Missing application ID.');
      return;
    }

    setIsUpdating(true);
    // === TASK 1: BERSIHKAN ERROR SEBELUM API CALL ===
    setApiError('');
    // ===============================================

    try {
      if (targetStatus === 'Cancelled') {
        if (!selectedReason) {
          setReasonError('Cancellation reason must be selected.');
          // Pastikan stop loading jika validasi gagal
          setIsUpdating(false);
          return;
        }

        await cancelRegistration(applicationId, selectedReason);
      }

      // Ini hanya berjalan jika API call (await) di atas SUKSES
      onUpdateStatus(registration.registration_id, targetStatus);
      onClose();
    } catch (err) {
      // === TASK 1: TANGKAP DAN TAMPILKAN ERROR BACKEND ===
      console.error('Failed updating:', err);
      // Ambil pesan error dari response backend (jika ada),
      // atau gunakan pesan error default
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        'An unexpected error occurred. Please try again.';

      setApiError(errorMessage);
      // ==================================================
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReasonChange = (e) => {
    setSelectedReason(e.target.value);
    if (reasonError) setReasonError('');

    // === TASK 1: BERSIHKAN ERROR JIKA REASON DIGANTI ===
    if (apiError) setApiError('');
    // =================================================
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popUp} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <img src={WarningSign} alt='Warning' className={styles.icon} />
          <h2 className={styles.title}>Confirm Update Registration Status</h2>
          <p className={styles.message}>
            Please double-check your changes. Once submitted, some changes may
            not be reversible.
          </p>
        </div>

        {isLoading ? (
          <div style={{ padding: 20 }}>Loading student details…</div>
        ) : !fullData ? (
          <div style={{ padding: 20, color: 'red' }}>
            Error loading data. Please close and try again.
          </div>
        ) : (
          <div className={styles.after}>
            <div
              className={styles.registrationInfo}
              style={{
                border:
                  targetStatus === 'Confirmed'
                    ? '4px solid #00F413'
                    : '4px solid #EE0808',
              }}
            >
              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Name</span>
                <span className={styles.separator}>:</span>
                <span className={styles.infoValue}>
                  {registration.full_name || 'N/A'}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Student ID</span>
                <span className={styles.separator}>:</span>
                <span className={styles.infoValue}>
                  {fullData.student_id || 'N/A'}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Registration ID</span>
                <span className={styles.separator}>:</span>
                <span className={styles.infoValue}>
                  {registration.registration_id || 'N/A'}
                </span>
              </div>

              <div className={styles.infoRow}>
                <span className={styles.infoLabel}>Status</span>
                <span className={styles.separator}>:</span>

                <div
                  className={styles.editableStatus}
                  style={{
                    color: targetStatus === 'Confirmed' ? '#00F413' : '#EE0808',
                  }}
                  onClick={handleToggleStatus}
                >
                  <span style={{ textDecoration: 'underline' }}>
                    {targetStatus}
                  </span>
                </div>
              </div>

              {showReasonField && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Reason</span>
                  <span className={styles.separator}>:</span>

                  <select
                    className={styles.reasonSelect}
                    value={selectedReason}
                    onChange={handleReasonChange}
                  >
                    <option value='' disabled>
                      Select reason
                    </option>
                    {reasonOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>

                  {reasonError && (
                    <div className={styles.reasonError}>{reasonError}</div>
                  )}

                  {/* NOTE: Kita tidak meletakkan apiError di sini
                    karena ini HANYA MUNCUL jika 'showReasonField' true.
                    Error backend bisa terjadi kapan saja.
                  */}
                </div>
              )}

              {!showReasonField && (
                <div className={styles.infoRow}>
                  <span className={styles.infoLabel}>Reason</span>
                  <span className={styles.separator}>:</span>
                  <span className={styles.infoValue}>-</span>
                </div>
              )}
            </div>
          </div>
        )}

        {apiError && <div className={styles.reasonError}>{apiError}</div>}

        <div className={styles.button}>
          <div className={styles.rowBtn}>
            <Button
              className={styles.bAddSubject1}
              onClick={onClose}
              disabled={isUpdating || isLoading}
              variant='solid'
            >
              Cancel
            </Button>

            <Button
              className={styles.bAddSubject}
              onClick={handleUpdate}
              disabled={isUpdating || isLoading}
              variant='outline'
            >
              {isUpdating
                ? targetStatus === 'Confirmed'
                  ? 'Confirming...'
                  : 'Cancelling...'
                : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationPopup;
