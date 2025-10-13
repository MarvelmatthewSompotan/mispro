// src/components/pages/Registration.js

import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../atoms/Button";
import PopUpForm from "./PopUpRegis/PopUpForm";
import Pagination from "../../atoms/Pagination";
import StatusConfirmationPopup from "./PopUpRegis/StatusConfirmationPopup";
import styles from "./Registration.module.css";
import searchIcon from "../../../assets/Search-icon.png";
import {
  getRegistrations,
  getRegistrationOptions,
} from "../../../services/api";

const Registration = () => {
  const navigate = useNavigate();
  const [registrationData, setRegistrationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [perPage] = useState(25);
  const [sections, setSections] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [showPopupForm, setShowPopupForm] = useState(false);
  const REFRESH_INTERVAL = 5000;
  const [showStatusPopup, setShowStatusPopup] = useState(false);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  // Fetch options (sections, years, semesters)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await getRegistrationOptions();
        setSections(opts.sections || []);
        setSchoolYears(opts.school_years || []);
        setSemesters(opts.semesters || []);
      } catch (err) {
        console.error("Error fetching registration options:", err);
      }
    };
    fetchOptions();
  }, []);

  // 1. Tambahkan parameter 'options' untuk membedakan jenis fetch
  const fetchRegistrations = useCallback(
    async (filters = {}, page = 1, options = {}) => {
      // isBackgroundRefresh akan bernilai true jika kita menambahkannya saat memanggil fungsi
      const { isBackgroundRefresh = false } = options;

      try {
        // 2. Cek apakah ini BUKAN background refresh sebelum menampilkan loading
        if (!isBackgroundRefresh) {
          setLoading(true);
        }

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
        console.error("Error fetching registrations:", err);
        setRegistrationData([]);
        setTotalPages(1);
        setTotalRecords(0);
      } finally {
        // Pastikan loading selalu dimatikan setelah selesai
        setLoading(false);
      }
    },
    [perPage]
  );

  // Fetch data awal saat komponen pertama kali dimuat
  useEffect(() => {
    fetchRegistrations({}, 1); // Panggilan awal tetap menampilkan loading
  }, [fetchRegistrations]);

  // Auto fetch ketika filter/search berubah
  useEffect(() => {
    setCurrentPage(1);
    const filters = {
      search: search || undefined,
      school_year_id: selectedYear || undefined,
      semester_id: selectedSemester || undefined,
      section_id: selectedSections.length > 0 ? selectedSections : undefined,
    };
    fetchRegistrations(filters, 1); // Perubahan filter juga tetap menampilkan loading
  }, [
    search,
    selectedYear,
    selectedSemester,
    selectedSections,
    fetchRegistrations,
  ]);

  // Handle pagination change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      const filters = {
        search: search || undefined,
        school_year_id: selectedYear || undefined,
        semester_id: selectedSemester || undefined,
        section_id: selectedSections.length > 0 ? selectedSections : undefined,
      };
      fetchRegistrations(filters, newPage); // Pindah halaman juga menampilkan loading
    }
  };

  // useEffect BARU untuk auto-refresh
  useEffect(() => {
    const refreshData = () => {
      const currentFilters = {
        search: search || undefined,
        school_year_id: selectedYear || undefined,
        semester_id: selectedSemester || undefined,
        section_id: selectedSections.length > 0 ? selectedSections : undefined,
      };
      console.log("Auto refreshing registration list (background)...");

      // 3. Saat memanggil refresh, beri tanda bahwa ini adalah background refresh
      // Ini akan mencegah 'setLoading(true)' dipanggil
      fetchRegistrations(currentFilters, currentPage, {
        isBackgroundRefresh: true,
      });
    };

    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [
    search,
    selectedYear,
    selectedSemester,
    selectedSections,
    currentPage,
    fetchRegistrations,
  ]);

  // Handler lainnya
  const handleSectionToggle = (id) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleNewForm = () => setShowPopupForm(true);
  const handleClosePopup = () => setShowPopupForm(false);

  const handleCreateForm = (formData) => {
    navigate("/registration-form", {
      state: {
        ...formData,
        fromPopup: true,
      },
    });
    setShowPopupForm(false);
  };

  const handleRowClick = (row) => {
    const applicationId = row.application_form?.application_id || null;
    const version = row.version_id ?? null;
    navigate("/print", {
      state: { applicationId, version },
    });
  };

  // --- NEW HANDLER FOR STATUS BUTTON CLICK ---
  const handleStatusClick = (e, row) => {
    e.stopPropagation(); // Mencegah handleRowClick (navigate) terpicu
    setSelectedRegistration(row);
    setShowStatusPopup(true);
  };

  const handleCloseStatusPopup = () => {
    setShowStatusPopup(false);
    setSelectedRegistration(null);
  };

  // Mengupdate status di state lokal dan me-refresh data
  const handleUpdateStatus = (id, newStatus) => {
    // Opsi 1: Update di state lokal (Lebih cepat, tapi harus yakin API sukses)
    // newStatus sekarang adalah 'Confirmed' atau 'Cancelled'
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
    // Opsi 2: Refresh data dari server (Lebih aman)
    fetchRegistrations(
      {
        search: search || undefined,
        school_year_id: selectedYear || undefined,
        semester_id: selectedSemester || undefined,
        section_id: selectedSections.length > 0 ? selectedSections : undefined,
      },
      currentPage
    );
  };
  // ------------------------------------------

  const getStatusDisplay = (row) => {
    const status = row.application_form?.status?.toLowerCase() || "confirmed";
    const variant = status === "confirmed" ? "confirmed" : "cancelled";

    return (
      <Button variant={variant} onClick={(e) => handleStatusClick(e, row)}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Button>
    );
  };

  return (
    <div>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <Button onClick={handleNewForm} variant="solid">
          New Form
        </Button>
      </div>

      {/* Search Bar */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Find name or student id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <img src={searchIcon} alt="Search" className={styles.searchIconImg} />
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
                type="checkbox"
                checked={selectedSections.includes(section.section_id)}
                onChange={() => handleSectionToggle(section.section_id)}
              />
              <span className={styles.customCheckbox}></span>
              {section.name}
            </label>
          ))}

          {/* School Year */}
          <select
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value || null)}
            className={styles.yearSelect}
          >
            <option value="">Select School Year</option>
            {schoolYears.map((y) => (
              <option key={y.school_year_id} value={y.school_year_id}>
                {y.year}
              </option>
            ))}
          </select>

          {/* Semester */}
          <select
            value={selectedSemester || ""}
            onChange={(e) => setSelectedSemester(e.target.value || null)}
            className={styles.semesterSelect}
          >
            <option value="">Select Semester</option>
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
        Showing{" "}
        {loading
          ? "..."
          : `${(currentPage - 1) * perPage + 1}-${Math.min(
              currentPage * perPage,
              totalRecords
            )} of ${totalRecords}`}{" "}
        results
      </div>

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.registrationTable}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeaderCell}>Created at</th>
              <th className={styles.tableHeaderCell}>Name</th>{" "}
              {/* Pindah Name ke sini */}
              <th className={styles.tableHeaderCell}>Registration ID</th>
              <th className={styles.tableHeaderCell}>Section</th>
              <th className={styles.tableHeaderCell}>Status</th>
            </tr>
          </thead>
          <tbody>
            {!loading && registrationData.length > 0 ? (
              registrationData.map((row, idx) => (
                <tr
                  key={idx}
                  className={styles.tableRow}
                  // Hanya navigate jika status belum diklik (dicegah di handleStatusClick)
                  onClick={() => handleRowClick(row)}
                  style={{ cursor: "pointer" }}
                >
                  <td className={styles.tableCell}>
                    {new Date(row.registration_date).toLocaleDateString(
                      "id-ID",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </td>
                  <td className={styles.tableCellName}>{row.full_name}</td>
                  <td className={styles.tableCell}>{row.registration_id}</td>
                  <td className={styles.tableCell}>{row.section?.name}</td>
                  {/* --- STATUS BUTTON --- */}
                  <td className={styles.tableCell}>{getStatusDisplay(row)}</td>
                  {/* ---------------------------------- */}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className={styles.tableCell}>
                  {loading ? "Loading..." : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component */}
      {!loading && totalPages > 1 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
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

      {/* --- STATUS CONFIRMATION POPUP --- */}
      {showStatusPopup && selectedRegistration && (
        <StatusConfirmationPopup
          registration={selectedRegistration}
          onClose={handleCloseStatusPopup}
          onUpdateStatus={handleUpdateStatus} // Fungsi untuk refresh data/state
        />
      )}
      {/* ------------------------------------ */}
    </div>
  );
};

export default Registration;
