import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// Komponen Button tidak lagi dipakai untuk status, diganti dengan div
// import Button from '../../atoms/Button'; 
import PopUpForm from './PopUpRegis/PopUpForm';
import Pagination from '../../atoms/Pagination';
import StatusConfirmationPopup from './PopUpRegis/StatusConfirmationPopup';
import styles from './Registration.module.css';
import searchIcon from '../../../assets/Search-icon.png';
import copyIcon from '../../../assets/Copy_icon.png';
import ColumnHeader from '../../atoms/columnHeader/ColumnHeader';
import Button from '../../atoms/Button'; // Import Button tetap ada untuk "New Form"

import {
  getRegistrations,
} from '../../../services/api';


// --- Komponen Internal BARU untuk Satu Baris Data (Mengikuti Pola StudentList) ---
const RegistrationRow = ({ registration, onRowClick, onStatusClick }) => {
    // Menentukan style untuk badge status
    const status = registration.application_form?.status?.toLowerCase() || 'confirmed';
    const statusStyle = status === 'confirmed' ? styles.statusConfirmed : styles.statusCancelled;

    return (
        <div className={styles.registrationDataRow} onClick={() => onRowClick(registration)}>
            {/* 1. Registration Date */}
            <div className={styles.tableCell}>
                {new Date(registration.registration_date).toLocaleDateString(
                    'id-ID',
                    {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    }
                )}
            </div>
            {/* 2. Registration ID */}
            <div className={styles.tableCell}>{registration.registration_id}</div>
            {/* 3. Student Name */}
            <div className={styles.tableCell}>{registration.full_name}</div>
            {/* 4. Grade */}
            <div className={styles.tableCell}>
              {registration.grade || (registration.application_form?.grade) || 'N/A'}
            </div>
            {/* 5. Section */}
            <div className={styles.tableCell}>
              {registration.section?.name || 'N/A'}
            </div>
            {/* 6. Status Badge */}
            {/* --- PERUBAHAN: Menghapus style inline justifyContent: 'center' --- */}
            <div className={styles.tableCell}>
                <div 
                    className={statusStyle} 
                    onClick={(e) => {
                        e.stopPropagation(); // Mencegah klik pada baris
                        onStatusClick(registration);
                    }}
                >
                    <div className={styles.statusText}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </div>
                </div>
            </div>
        </div>
    );
};


const Registration = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(25);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const REFRESH_INTERVAL = 5000;
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);


  // =================================================================
  // --- SEMUA LOGIKA, FETCH, DAN HANDLER DI BAWAH INI TETAP SAMA ---
  // =================================================================

  const fetchRegistrations = useCallback(
    async (filters = {}, page = 1, options = {}) => {
      const { isBackgroundRefresh = false } = options;
      if (!isBackgroundRefresh) setLoading(true);
      try {
        const res = await getRegistrations({
          ...filters,
          page: page,
          per_page: perPage,
        });
        setRegistrationData(res.data.data || []);
        setTotalPages(res.data.last_page || 1);
        setTotalRecords(res.data.total || 0);
        setCurrentPage(res.data.current_page || 1);
      } catch (err) {
        console.error('Error fetching registrations:', err);
        setRegistrationData([]);
        setTotalPages(1);
        setTotalRecords(0);
      } finally {
        setLoading(false);
      }
    },
    [perPage]
  );

  useEffect(() => {
    fetchRegistrations({}, 1);
  }, [fetchRegistrations]);

  useEffect(() => {
    setCurrentPage(1);
    const filters = { search: search || undefined };
    fetchRegistrations(filters, 1);
  }, [search, fetchRegistrations]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const filters = { search: search || undefined };
      fetchRegistrations(filters, newPage);
    }
  };

  useEffect(() => {
    const refreshData = () => {
      const currentFilters = { search: search || undefined };
      console.log('Auto refreshing registration list (background)...');
      fetchRegistrations(currentFilters, currentPage, {
        isBackgroundRefresh: true,
      });
    };
    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [search, currentPage, fetchRegistrations]);

  const handleNewForm = () => setShowPopupForm(true);
  const handleClosePopup = () => setShowPopupForm(false);

  const handleCreateForm = (formData) => {
    navigate('/registration-form', {
      state: { ...formData, fromPopup: true },
    });
    setShowPopupForm(false);
  };

  const handleRowClick = (row) => {
    const applicationId = row.application_id || null;
    const version = row.version_id ?? null;
    navigate('/print', {
      state: { applicationId, version },
    });
  };

  const handleStatusClick = (row) => {
    setSelectedRegistration(row);
    setShowStatusPopup(true);
  };

  const handleCloseStatusPopup = () => {
    setShowStatusPopup(false);
    setSelectedRegistration(null);
  };

  const handleUpdateStatus = (id, newStatus) => {
    setRegistrationData((prevData) =>
      prevData.map((reg) => {
        if (reg.registration_id === id && reg.application_form) {
          return {
            ...reg,
            application_form: {
              ...reg.application_form,
              status: newStatus,
            },
          };
        }
        return reg;
      })
    );
    fetchRegistrations({ search: search || undefined }, currentPage);
  };

  // ===================================================================
  // --- STRUKTUR JSX DI-REFACTOR MENGGUNAKAN CSS GRID DI BAWAH INI ---
  // ===================================================================

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.frameParent}>
        <div>
          <div className={styles.title}>Registration</div>
          <div className={styles.searchBar}>
            <input
              type='text'
              placeholder='Find name or registration id'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <img
              src={searchIcon}
              alt='Search'
              className={styles.searchIconImg}
              style={{ right: '12px' }}
            />
          </div>
        </div>
        <div>
          <div
            style={{
              marginBottom: '20px',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button onClick={handleNewForm} variant='solid'>
              New Form
            </Button>
          </div>
          <div className={styles.ufileAltParent} title='Total Registrations'>
            <img
              src={copyIcon}
              alt='Total Registrations'
              style={{ width: '16px', height: '20px' }}
            />
            <div className={styles.div}>{loading ? '...' : totalRecords}</div>
          </div>
        </div>
      </div>

      {/* STRUKTUR GRID BARU MENGGANTIKAN TABLE */}
      <div className={styles.tableContainer}>
        {/* Header Grid */}
        <div className={styles.tableHeaderGrid}>
          <ColumnHeader title='Registration Date' hasSort={true} hasFilter={true} />
          <ColumnHeader title='Registration ID' hasSort={true} hasFilter={true} />
          <ColumnHeader title='Student Name' hasSort={true} hasFilter={true} />
          <ColumnHeader title='Grade' hasSort={true} hasFilter={true} />
          <ColumnHeader title='Section' hasSort={true} hasFilter={true} />
          <ColumnHeader title='Status' hasSort={true} hasFilter={true} /> 
        </div>

        {/* Body Grid */}
        <div className={styles.tableBody}>
          {loading ? (
            <div className={styles.messageCell}>Loading...</div>
          ) : registrationData.length > 0 ? (
            registrationData.map((row, idx) => (
              <RegistrationRow
                key={idx}
                registration={row}
                onRowClick={handleRowClick}
                onStatusClick={handleStatusClick}
              />
            ))
          ) : (
            <div className={styles.messageCell}>No data available</div>
          )}
        </div>
      </div>

      {/* Pagination & Popup (Tidak Berubah) */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginTop: '20px',
          }}
        >
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      )}

      {showPopupForm && (
        <PopUpForm onClose={handleClosePopup} onCreate={handleCreateForm} />
      )}

      {showStatusPopup && selectedRegistration && (
        <StatusConfirmationPopup
          registration={selectedRegistration}
          onClose={handleCloseStatusPopup}
          onUpdateStatus={handleUpdateStatus}
        />
      )}
    </div>
  );
};

export default Registration;

