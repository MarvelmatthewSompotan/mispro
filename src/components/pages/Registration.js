import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../atoms/Button";
import PopUpForm from "./PopUpForm";
import styles from "../styles/Registration.module.css";
import searchIcon from "../../assets/Search-icon.png";

const registrationData = [
  {
    date: "30 September 2025",
    registrationId: "ENG004ENG004ENG004ENG004",
    section: "HS",
    name: "JHOANNE  JENNIE ABIGAIL EUPHORIA  DOE",
    view: true,
  },
];

const Registration = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    ECP: false,
    ES: false,
    MS: false,
    HS: false,
  });
  const [year, setYear] = useState("2025/2026");
  const [semester, setSemester] = useState("Semester 1");
  const [showPopupForm, setShowPopupForm] = useState(false);

  const handleNewForm = () => {
    setShowPopupForm(true);
  };

  const handleClosePopup = () => {
    setShowPopupForm(false);
  };

  const handleCreateForm = (formData) => {
    console.log("Creating new form with data:", formData);
    // Di sini bisa ditambahkan logic untuk membuat form baru
    // Misalnya API call atau state management
    setShowPopupForm(false);
    // Navigate ke form registrasi dengan data yang dipilih
    navigate("/registration-form", { state: formData });
  };

  const handleFilterChange = (key) => {
    setFilters({ ...filters, [key]: !filters[key] });
  };

  const handleRowClick = (row) => {
    // Navigate to print page when row is clicked
    navigate("/print");
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
          type="text"
          placeholder="Find name or registration id"
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
          {["ECP", "ES", "MS", "HS"].map((key) => (
            <label key={key} className={styles.filterCheckboxLabel}>
              <input
                type="checkbox"
                checked={filters[key]}
                onChange={() => handleFilterChange(key)}
              />
              <span className={styles.customCheckbox}></span>
              {key}
            </label>
          ))}
          <select
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className={styles.yearSelect}
          >
            <option>School Year 2025/2026</option>
            <option>School Year 2024/2025</option>
          </select>
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className={styles.semesterSelect}
          >
            <option>Semester 1</option>
            <option>Semester 2</option>
          </select>
          {/* Ganti <a> dengan <button> agar aksesibel jika tidak ada href valid */}
          <button type="button" className={styles.seeAllForms}>
            See All Forms
          </button>
        </div>
      </div>
      {/* Results Info */}
      <div className={styles.resultsInfo}>Showing 1 out of 1 results</div>
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
            {registrationData.map((row, idx) => (
              <tr
                key={idx}
                className={styles.tableRow}
                onClick={() => handleRowClick(row)}
                style={{ cursor: "pointer" }}
              >
                <td className={styles.tableCell}>{row.date}</td>
                <td className={styles.tableCell}>{row.registrationId}</td>
                <td className={styles.tableCell}>{row.section}</td>
                <td className={styles.tableCellName}>{row.name}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Popup Form */}
      {showPopupForm && (
        <PopUpForm onClose={handleClosePopup} onCreate={handleCreateForm} />
      )}
    </div>
  );
};

export default Registration;
