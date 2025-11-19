import React, { useEffect, useState, useCallback, useRef } from "react";
import styles from "./PopUpAutoGraduate.module.css";
import Button from "../../../atoms/Button";
import Checkbox from "../../../atoms/checkbox/Checkbox";
import ColumnHeader from "../../../atoms/columnHeader/ColumnHeader";
import {
  getAutoGraduatePreview,
  confirmAutoGraduate,
} from "../../../../services/api"; // Pastikan path api service benar
import placeholder from "../../../../assets/user.svg";

// Import komponen Popup tambahan
import ConfirmUpdatePopup from "../../../pages/student_list/PopUpUpdate/PopUpConfirmUpdate";
import UpdatedNotification from "../../../pages/student_list/UpdateNotification/UpdateNotification"; // Menggunakan file notifikasi yang baru

const REFRESH_INTERVAL = 5000;

const AutoGraduatePopup = ({ onClose, onSuccess }) => {
  const [students, setStudents] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [schoolYear, setSchoolYear] = useState("");
  const [loading, setLoading] = useState(true);

  // State untuk mengontrol Popup
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // Untuk popup konfirmasi merah
  const [isSuccessOpen, setIsSuccessOpen] = useState(false); // Untuk popup checklist hijau
  const [isUpdating, setIsUpdating] = useState(false); // Loading saat proses simpan

  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const fetchData = useCallback(async (isBackgroundRefresh = false) => {
    try {
      if (!isBackgroundRefresh) setLoading(true);
      const res = await getAutoGraduatePreview();
      if (res.success) {
        setSchoolYear(res.current_school_year);
        setStudents(res.students || []);
        // Jika Anda ingin default select all saat pertama load, biarkan ini.
        // Jika tidak, hapus bagian ini.
        if (!isBackgroundRefresh) {
          const allIds = (res.students || []).map((s) => s.id);
          setSelectedIds(allIds);
        }
      }
    } catch (error) {
      console.error("Error fetching auto graduate preview:", error);
      if (!isBackgroundRefresh) {
        alert("Failed to load student data.");
        if (onCloseRef.current) onCloseRef.current();
      }
    } finally {
      if (!isBackgroundRefresh) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(false);
  }, [fetchData]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Pause refresh jika sedang ada popup konfirmasi/sukses terbuka
      if (!isConfirmOpen && !isSuccessOpen) {
        console.log("Auto refreshing popup data...");
        fetchData(true);
      }
    }, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchData, isConfirmOpen, isSuccessOpen]);

  const handleSelectAll = () => {
    const allIds = students.map((s) => s.id);
    setSelectedIds(allIds);
  };

  const handleUnselectAll = () => {
    setSelectedIds([]);
  };

  const handleCheckboxChange = (id) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      return [...prev, id];
    });
  };

  // 1. Handler: Saat tombol "Confirm (n)" diklik
  const handleInitialConfirmClick = () => {
    if (selectedIds.length === 0) {
      alert("Please select at least one student.");
      return;
    }
    // Buka popup konfirmasi (PopUpConfirmUpdate)
    setIsConfirmOpen(true);
  };

  // 2. Handler: Saat user klik "Yes, I'm sure" di popup konfirmasi
  const handleExecuteUpdate = async () => {
    try {
      setIsUpdating(true);
      const res = await confirmAutoGraduate(selectedIds);

      if (res.success) {
        // Tutup popup konfirmasi, Buka popup sukses
        setIsConfirmOpen(false);
        setIsSuccessOpen(true);
      }
    } catch (error) {
      console.error("Error confirming auto graduate:", error);
      alert("Failed to process auto graduation.");
    } finally {
      setIsUpdating(false);
    }
  };

  // 3. Handler: Saat popup sukses selesai (setelah 2 detik timer di UpdateNotification habis)
  const handleFinish = () => {
    setIsSuccessOpen(false);
    onSuccess(); // Refresh data di parent page
    onClose(); // Tutup AutoGraduatePopup utama
  };

  return (
    <>
      <div className={styles.overlay}>
        <div className={styles.eautoGraduatePopup}>
          {/* Header Section */}
          <div className={styles.autoGraduateSy20252026Parent}>
            <div className={`${styles.autoGraduateSy} ${styles.headerTitle}`}>
              Auto graduate S.Y {schoolYear}
            </div>
            {!loading && (
              <div className={styles.unselectAllParent}>
                <div className={styles.unselectAll} onClick={handleUnselectAll}>
                  Unselect All
                </div>
                <div className={styles.selectAll} onClick={handleSelectAll}>
                  Select All
                </div>
              </div>
            )}
          </div>

          {/* Table Section */}
          <div className={styles.eautoGraduatePopupInner}>
            {loading ? (
              <div className={styles.loadingContainer}>
                Loading student data...
              </div>
            ) : (
              <div className={styles.tableWrapper}>
                <div className={styles.tableHeader}>
                  <div className={`${styles.headerCell} ${styles.alignCenter}`}>
                    <ColumnHeader title="No." disableSort disableFilter />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignCenter}`}>
                    <ColumnHeader title="" disableSort disableFilter />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader title="Photo" disableSort disableFilter />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader
                      title="Student ID"
                      disableSort
                      disableFilter
                    />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader
                      title="Student Name"
                      disableSort
                      disableFilter
                    />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader title="Section" disableSort disableFilter />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader title="Grade" disableSort disableFilter />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader
                      title="School Year"
                      disableSort
                      disableFilter
                    />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader title="Status" disableSort disableFilter />
                  </div>
                  <div className={`${styles.headerCell} ${styles.alignLeft}`}>
                    <ColumnHeader
                      title="Enrollment"
                      disableSort
                      disableFilter
                    />
                  </div>
                </div>

                <div className={styles.tableBody}>
                  {students.map((student, index) => {
                    const enrollmentStyle =
                      student.enrollment_status === "ACTIVE"
                        ? styles.active
                        : styles.inactive;
                    const statusStyle = styles.statusBadge;

                    return (
                      <div key={student.id} className={styles.tableRow}>
                        <div className={`${styles.cell} ${styles.alignCenter}`}>
                          {index + 1}
                        </div>
                        <div className={`${styles.cell} ${styles.alignCenter}`}>
                          <Checkbox
                            checked={selectedIds.includes(student.id)}
                            onChange={() => handleCheckboxChange(student.id)}
                          />
                        </div>
                        <div className={`${styles.cell} ${styles.alignLeft}`}>
                          <img
                            src={student.photo_url || placeholder}
                            alt=""
                            className={
                              student.photo_url
                                ? styles.photo
                                : styles.placeholderPhoto
                            }
                            onError={(e) => {
                              e.target.src = placeholder;
                            }}
                          />
                        </div>
                        <div
                          className={`${styles.cell} ${styles.alignLeft}`}
                          title={student.student_id}
                        >
                          {student.student_id}
                        </div>
                        <div
                          className={`${styles.cell} ${styles.alignLeft}`}
                          title={student.full_name}
                        >
                          {student.full_name}
                        </div>
                        <div className={`${styles.cell} ${styles.alignLeft}`}>
                          {student.section_name}
                        </div>
                        <div className={`${styles.cell} ${styles.alignLeft}`}>
                          {student.grade}
                        </div>
                        <div className={`${styles.cell} ${styles.alignLeft}`}>
                          {student.school_year}
                        </div>
                        <div className={`${styles.cell} ${styles.alignLeft}`}>
                          <div className={statusStyle}>
                            <div className={styles.statusText}>
                              {student.status}
                            </div>
                          </div>
                        </div>
                        <div className={`${styles.cell} ${styles.alignLeft}`}>
                          <div className={enrollmentStyle}>
                            <div className={styles.statusText}>
                              {student.enrollment_status}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className={styles.eautoGraduatePopupChild}>
            <div className={styles.buttonParent}>
              <Button variant="outline" onClick={onClose} disabled={isUpdating}>
                Cancel
              </Button>
              {/* Tombol Confirm dengan jumlah data yang diselect */}
              <Button
                variant="solid"
                onClick={handleInitialConfirmClick}
                disabled={loading || selectedIds.length === 0}
              >
                {`Confirm (${selectedIds.length})`}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Popup Konfirmasi (Merah) */}
      <ConfirmUpdatePopup
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleExecuteUpdate}
        isUpdating={isUpdating}
      />

      {/* Popup Sukses (Hijau - UpdatedNotification) */}
      <UpdatedNotification
        isOpen={isSuccessOpen}
        onClose={handleFinish} // Ketika timer 2 detik habis, jalankan handleFinish
      />
    </>
  );
};

export default AutoGraduatePopup;
