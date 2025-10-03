import React, { useState } from 'react';
import styles from '../styles/StatusConfirmationPopup.module.css'; 
import { FaExclamationTriangle } from 'react-icons/fa'; 
import { updateRegistrationStatus } from '../../services/api'; 

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

  const actionMessage = isConfirmed 
    ? "membatalkan" 
    : "mengkonfirmasi";
  
  const handleUpdate = async () => {
    if (!applicationId) {
      alert("Application ID is missing. Cannot update status.");
      return;
    }
    
    // Debugging: Cek payload terakhir yang akan dikirim
    console.log("Application ID:", applicationId);
    console.log("Target Status (API Payload - Capitalized):", targetStatusAPI);
    
    setIsUpdating(true);
    try {
      // Panggil API dengan status Huruf Kapital di Awal
      await updateRegistrationStatus(applicationId, targetStatusAPI);
      
      // Setelah sukses, panggil callback di parent
      onUpdateStatus(registration.registration_id, targetStatusAPI);
      onClose(); 
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Kesalahan koneksi";
      alert(`Failed to update status: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };


  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.popUp} onClick={(e) => e.stopPropagation()}>
        <FaExclamationTriangle className={styles.icon} />
        <h2 className={styles.title}>Update Status Pendaftaran</h2>
        
        <p className={styles.message}>
          Anda akan **{actionMessage}** pendaftaran untuk siswa ini. 
          Mohon konfirmasi tindakan Anda.
        </p>
        
        <div className={styles.registrationInfo}>
          {/* DISPLAY: Registration ID dan Student ID tetap ditampilkan */}
          <p><strong>Registration ID:</strong> {registrationId}</p>
          <p><strong>Student ID:</strong> {studentId}</p>
          <p><strong>Nama Siswa:</strong> {registration.full_name}</p>
          <p><strong>Status Saat Ini:</strong> 
            <span style={{ fontWeight: 'bold', color: isConfirmed ? '#059669' : '#ff3860' }}>
              {currentStatus.toUpperCase()}
            </span>
          </p>
        </div>

        <div className={styles.bAddSubjectParent}>
          {/* Tombol Cancel*/}
          <button 
            className={styles.bAddSubject1} 
            onClick={onClose}
            type="button"
            disabled={isUpdating}
          >
            Cancel
          </button>
          
          {/* Tombol Yes, I'm sure */}
          <button
            className={styles.bAddSubject}
            onClick={handleUpdate}
            type="button"
            disabled={isUpdating}
          >
            {isUpdating 
              ? `Proses ${targetStatusAPI === 'Confirmed' ? 'Konfirmasi' : 'Pembatalan'}...`
              : `Yes, I'm sure`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StatusConfirmationPopup;