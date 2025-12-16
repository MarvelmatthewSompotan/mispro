import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Pagination from '../../../atoms/Pagination';
import styles from './CanceledRegistration.module.css';
import searchIcon from '../../../../assets/Search-icon.png';
import ColumnHeader from '../../../atoms/columnHeader/ColumnHeader';
import Button from '../../../atoms/Button';
import ResetFilterButton from '../../../atoms/resetFilterButton/ResetFilterButton';

import {
  getCancelledRegistrations,
  getRegistrationOptions,
} from '../../../../services/api';

const CanceledRegistrationRow = ({ registration, onRowClick }) => {
  return (
    <div
      className={styles.registrationDataRow}
      onClick={() => onRowClick(registration)}
    >
      {/* 1. Registration Date */}
      <div className={styles.tableCell}>
        {registration.registration_date
          ? new Date(registration.registration_date).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '-'}
      </div>

      {/* 2. Cancellation Date */}
      <div className={styles.tableCell}>
        {registration.cancelled_at
          ? new Date(registration.cancelled_at).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })
          : '-'}
      </div>

      {/* 3. Student Name */}
      <div className={styles.tableCell}>{registration.full_name}</div>

      {/* 4. Grade */}
      <div className={styles.tableCell}>{registration.grade || 'N/A'}</div>

      {/* 5. Section */}
      <div className={styles.tableCell}>
        {registration.section || registration.section_name || 'N/A'}
      </div>

      {/* 6. Type */}
      <div className={styles.tableCell}>{registration.student_status || '-'}</div>

      {/* 7. Notes */}
      <div className={styles.tableCell}>
        {registration.notes ||
          registration.application_form?.notes ||
          registration.cancellation_notes ||
          '-'}
      </div>
    </div>
  );
};

const CanceledRegistration = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [perPage] = useState(25);

  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sorts, setSorts] = useState([]);
  const [filterOptions, setFilterOptions] = useState({
    sections: [],
    classes: [],
    studentType: [
      { id: 'New', name: 'New' },
      { id: 'Old', name: 'Old' },
    ],
  });
  const fetchControllerRef = useRef(null);

  const fetchRegistrations = useCallback(
    async (currentFilters = {}, page = 1, currentSorts = []) => {
      setLoading(true);

      const controller = new AbortController();
      const signal = controller.signal;

      fetchControllerRef.current?.abort();
      fetchControllerRef.current = controller;

      const mappedFilters = {
        search: search || undefined,
        search_name: currentFilters.search_name || undefined,

        grade: currentFilters.grade || undefined,
        section: currentFilters.section || undefined,

        reg_start_date: currentFilters.reg_start_date || undefined,
        reg_end_date: currentFilters.reg_end_date || undefined,

        cancel_start_date: currentFilters.cancel_start_date || undefined,
        cancel_end_date: currentFilters.cancel_end_date || undefined,

        filter_notes: currentFilters.filter_notes || undefined,

        student_status: currentFilters.student_status || undefined,
      };

      const allParams = {
        ...mappedFilters,
        sort: currentSorts.length > 0 ? currentSorts : undefined,
        page: page,
        per_page: perPage,
      };

      try {
        const res = await getCancelledRegistrations(allParams, { signal });

        setRegistrationData(res.data.data || []);
        setTotalPages(res.data.last_page || 1);
        setCurrentPage(res.data.current_page || 1);
      } catch (err) {
        if (err.name === 'AbortError') {
          console.log('Fetch aborted');
          return;
        }
        console.error('Error fetching canceled registrations:', err);
        setRegistrationData([]);
      } finally {
        setLoading(false);
      }
    },
    [perPage, search]
  );

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const opts = await getRegistrationOptions();
        setFilterOptions((prev) => ({
          ...prev,
          sections: opts.sections || [],
          classes: opts.classes || [],
        }));
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRegistrations(filters, 1, sorts);
    }, 400);
    return () => {
      clearTimeout(timer);
      fetchControllerRef.current?.abort();
    };
  }, [search, filters, sorts, fetchRegistrations]);

  const handleSortChange = (fieldKey) => {
    setSorts((prev) => {
      const current = prev[0]?.field === fieldKey ? prev[0] : null;
      let next;
      if (!current) {
        next = { field: fieldKey, order: 'asc' };
      } else if (current.order === 'asc') {
        next = { field: fieldKey, order: 'desc' };
      } else {
        next = null;
      }
      return next ? [next] : [];
    });
  };

  const handleFilterChange = (filterKey, selectedValue) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (filterKey === 'reg_date_range' && Array.isArray(selectedValue)) {
        const [startDate, endDate] = selectedValue;
        if (startDate || endDate) {
          newFilters['reg_start_date'] = startDate || undefined;
          newFilters['reg_end_date'] = endDate || undefined;
        } else {
          delete newFilters['reg_start_date'];
          delete newFilters['reg_end_date'];
        }
        delete newFilters[filterKey];
      } else if (filterKey === 'cancel_date_range' && Array.isArray(selectedValue)) {
        const [startDate, endDate] = selectedValue;
        if (startDate || endDate) {
          newFilters['cancel_start_date'] = startDate || undefined;
          newFilters['cancel_end_date'] = endDate || undefined;
        } else {
          delete newFilters['cancel_start_date'];
          delete newFilters['cancel_end_date'];
        }
        delete newFilters[filterKey];
      } else {
        const isArray = Array.isArray(selectedValue);
        if (isArray && selectedValue.length > 0) {
          newFilters[filterKey] = selectedValue;
        } else if (!isArray && selectedValue) {
          newFilters[filterKey] = selectedValue;
        } else {
          delete newFilters[filterKey];
        }
      }
      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({});
    setSorts([]);
  };

  const getSortOrder = (fieldKey) => {
    return sorts.find((s) => s.field === fieldKey)?.order;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchRegistrations(filters, newPage, sorts);
    }
  };

  const handleRowClick = (row) => {
    const applicationId = row.application_id || null;
    const version = row.version_id ?? null;
    navigate('/print', {
      state: { applicationId, version },
    });
  };

  const handleBackToRegistration = () => {
    navigate('/registration');
  };

  return (
    <div className={styles.registrationContainer}>
      <div className={styles.frameParent}>
        <div className={styles.headerTopRow}>
          <div>
            <div className={styles.title}>Canceled Registration</div>
            <div className={styles.searchAndFilterContainer}>
              <div className={styles.searchBar}>
                <input
                  type='text'
                  placeholder='Find name or student id'
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className={styles.searchInput}
                />
                <img
                  src={searchIcon}
                  alt='Search'
                  className={styles.searchIconImg}
                />
              </div>
              <ResetFilterButton onClick={handleResetFilters} />
            </div>
          </div>

          <div className={styles.actionButtonsContainer}>
            <Button onClick={handleBackToRegistration} variant='solid'>
              Back to registration
            </Button>
          </div>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderGrid}>
          <ColumnHeader
            title='Registration Date'
            hasSort={true}
            fieldKey='registration_date'
            sortOrder={getSortOrder('registration_date')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='date-range'
            filterKey='reg_date_range'
            onFilterChange={handleFilterChange}
            currentFilterValue={[filters.reg_start_date, filters.reg_end_date]}
          />
          <ColumnHeader
            title='Cancellation Date'
            hasSort={true}
            fieldKey='cancelled_at'
            sortOrder={getSortOrder('cancelled_at')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='date-range'
            filterKey='cancel_date_range'
            onFilterChange={handleFilterChange}
            currentFilterValue={[filters.cancel_start_date, filters.cancel_end_date]}
          />
          <ColumnHeader
            title='Student Name'
            hasSort={true}
            fieldKey='full_name'
            sortOrder={getSortOrder('full_name')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='search'
            filterKey='search_name'
            onFilterChange={handleFilterChange}
            currentFilterValue={filters.search_name}
          />
          <ColumnHeader
            title='Grade'
            hasSort={true}
            fieldKey='grade'
            sortOrder={getSortOrder('grade')}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey='grade'
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.classes}
            valueKey='grade'
            labelKey='grade'
            currentFilterValue={filters.grade}
          />
          <ColumnHeader
            title='Section'
            hasSort={true}
            fieldKey='section'
            sortOrder={getSortOrder('section')}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey='section'
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.sections}
            valueKey='name'
            labelKey='name'
            currentFilterValue={filters.section}
          />
          <ColumnHeader
            title='Type'
            hasSort={true}
            fieldKey='student_status'
            sortOrder={getSortOrder('student_status')}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey='student_status'
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.studentType}
            valueKey='id'
            labelKey='name'
            currentFilterValue={filters.student_status}
          />
          <ColumnHeader
            title='Notes'
            hasSort={false}
            fieldKey='notes'
            hasFilter={true}
            filterType='search'
            filterKey='filter_notes'
            onFilterChange={handleFilterChange}
            currentFilterValue={filters.filter_notes}
          />
        </div>

        <div className={styles.tableBody}>
          {loading ? (
            <div className={styles.messageCell}>Loading...</div>
          ) : registrationData.length > 0 ? (
            registrationData.map((row, idx) => (
              <CanceledRegistrationRow
                key={idx}
                registration={{
                  ...row,
                  // fallback mapping dari struktur backend yang umum
                  notes:
                    row.notes ||
                    row.application_form?.notes ||
                    row.cancellation_notes ||
                    null,
                  student_status: row.student_status,
                }}
                onRowClick={handleRowClick}
              />
            ))
          ) : (
            <div className={styles.messageCell}>No canceled registrations found</div>
          )}
        </div>
      </div>

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
    </div>
  );
};

export default CanceledRegistration;