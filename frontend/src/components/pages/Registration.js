  import React, { useState, useEffect } from 'react';
  import { useNavigate } from 'react-router-dom';
  import Button from '../atoms/Button';
  import PopUpForm from './PopUpForm';
  import Pagination from '../atoms/Pagination';
  import styles from '../styles/Registration.module.css';
  import searchIcon from '../../assets/Search-icon.png';
  import { getRegistrations, getRegistrationOptions } from '../../services/api';

  const Registration = () => {
    const navigate = useNavigate();

    // State data API
    const [registrationData, setRegistrationData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalRecords, setTotalRecords] = useState(0);
    const [perPage] = useState(10); // Jumlah data per halaman

    // Options dari backend
    const [sections, setSections] = useState([]);
    const [schoolYears, setSchoolYears] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Filter state
    const [selectedSections, setSelectedSections] = useState([]);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    const [showPopupForm, setShowPopupForm] = useState(false);

    // Fetch options (sections, years, semesters)
    useEffect(() => {
      const fetchOptions = async () => {
        try {
          const opts = await getRegistrationOptions();
          setSections(opts.sections || []);
          setSchoolYears(opts.school_years || []);
          setSemesters(opts.semesters || []);
        } catch (err) {
          console.error('Error fetching registration options:', err);
        }
      };
      fetchOptions();
    }, []);

    // Fetch registrations dari API dengan pagination
    const fetchRegistrations = async (filters = {}, page = 1) => {
      try {
        setLoading(true);
        const res = await getRegistrations({
          ...filters,
          page: page,
          per_page: perPage
        });
        
        // Update data dan pagination info
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
    };

    // Initial load
    useEffect(() => {
      fetchRegistrations();
      // eslint-disable-next-line 
    }, []);

    // Auto fetch ketika filter/search berubah
    useEffect(() => {
      setCurrentPage(1); // Reset ke halaman 1 saat filter berubah
      fetchRegistrations({
        search: search || undefined,
        school_year_id: selectedYear || undefined,
        semester_id: selectedSemester || undefined,
        section_id: selectedSections.length > 0 ? selectedSections : undefined,
      }, 1);
      // eslint-disable-next-line 
    }, [search, selectedYear, selectedSemester, selectedSections]);

    // Handle pagination change
    const handlePageChange = (newPage) => {
      if (newPage >= 1 && newPage <= totalPages) {
        setCurrentPage(newPage);
        fetchRegistrations({
          search: search || undefined,
          school_year_id: selectedYear || undefined,
          semester_id: selectedSemester || undefined,
          section_id: selectedSections.length > 0 ? selectedSections : undefined,
        }, newPage);
      }
    };

    // Toggle section checkbox
    const handleSectionToggle = (id) => {
      setSelectedSections((prev) =>
        prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
      );
    };

    // Popup form handlers
    const handleNewForm = () => setShowPopupForm(true);
    const handleClosePopup = () => setShowPopupForm(false);

    const handleCreateForm = (formData) => {
      navigate('/registration-form', { state: formData });
      setShowPopupForm(false);
    };

    // Row click → navigate ke print page
    const handleRowClick = (row) => {
      const applicationId = row.application_form?.application_id || null;
      const version = row.version_id ?? null;
      navigate('/print', {
        state: { applicationId, version },
      });
    };

    return (                                                                                                                                                                                                                                                                                                    
      <div className={styles.registrationPage}>
        {/* Top Bar */}
        <div className={styles.topBar}>
          <Button className={styles.newFormBtn} onClick={handleNewForm}>
            New Form
          </Button>
        </div>

        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type='text'
            placeholder='Find name or student id'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <img src={searchIcon} alt='Search' className={styles.searchIconImg} />
        </div>

        {/* Filters */}
        <div className={styles.filtersSection}>
          <div className={styles.filtersTitle}>Filters</div>
          <div className={styles.filtersRow}>
            {/* Sections */}
            {sections.map((section) => (
              <label
                key={section.section_id}
                className={styles.filterCheckboxLabel}
              >
                <input
                  type='checkbox'
                  checked={selectedSections.includes(section.section_id)}
                  onChange={() => handleSectionToggle(section.section_id)}
                />
                <span className={styles.customCheckbox}></span>
                {section.name}
              </label>
            ))}

            {/* School Year */}
            <select
              value={selectedYear || ''}
              onChange={(e) => setSelectedYear(e.target.value || null)}
              className={styles.yearSelect}
            >
              <option value=''>Select School Year</option>
              {schoolYears.map((y) => (
                <option key={y.school_year_id} value={y.school_year_id}>
                  {y.year}
                </option>
              ))}
            </select>

            {/* Semester */}
            <select
              value={selectedSemester || ''}
              onChange={(e) => setSelectedSemester(e.target.value || null)}
              className={styles.semesterSelect}
            >
              <option value=''>Select Semester</option>
              {semesters.map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Info */}
        <div className={styles.resultsInfo}>
          Showing {loading ? '...' : `${((currentPage - 1) * perPage) + 1}-${Math.min(currentPage * perPage, totalRecords)} of ${totalRecords}`} results
        </div>

        {/* Table */}
        <div className={styles.tableWrapper}>
          <table className={styles.registrationTable}>
            <thead>
              <tr className={styles.tableHeaderRow}>
                <th className={styles.tableHeaderCell}>Created at</th>
                <th className={styles.tableHeaderCell}>Registration ID</th>
                <th className={styles.tableHeaderCell}>Section</th>
                <th className={styles.tableHeaderCell}>Name</th>
              </tr>
            </thead>
            <tbody>
              {!loading && registrationData.length > 0 ? (
                registrationData.map((row, idx) => (
                  <tr
                    key={idx}
                    className={styles.tableRow}
                    onClick={() => handleRowClick(row)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className={styles.tableCell}>
                      {new Date(row.registration_date).toLocaleDateString(
                        'id-ID',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        }
                      )}
                    </td>
                    <td className={styles.tableCell}>{row.registration_id}</td>
                    <td className={styles.tableCell}>{row.section?.name}</td>
                    <td className={styles.tableCellName}>{row.full_name}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan='4' className={styles.tableCell}>
                    {loading ? 'Loading...' : 'No data available'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Component */}
        {!loading && totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Popup Form */}
        {showPopupForm && (
          <PopUpForm onClose={handleClosePopup} onCreate={handleCreateForm} />
        )}
      </div>
    );
  };

  export default Registration;
