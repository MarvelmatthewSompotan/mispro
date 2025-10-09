import React, { useState, useEffect, useCallback } from "react";
import styles from "./StudentList.module.css";
import { useNavigate } from "react-router-dom";
import searchIcon from "../../../assets/Search-icon.png";
import { getStudents, getRegistrationOptions } from "../../../services/api";
import Pagination from "../../atoms/Pagination"; 

const ITEMS_PER_PAGE = 25; // Tentukan jumlah item per halaman (sesuaikan dengan backend)

const StudentList = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [sections, setSections] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [gradeMap, setGradeMap] = useState(new Map());
  const REFRESH_INTERVAL = 5000;

  // 2. Tambahkan State untuk Paginasi
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalData, setTotalData] = useState(0);


  // Fetch options (sections, years, semesters)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const opts = await getRegistrationOptions();
        setSections(opts.sections || []);
        setSchoolYears(opts.school_years || []);
        setSemesters(opts.semesters || []);

        const newGradeMap = new Map();
        if (opts.classes && Array.isArray(opts.classes)) {
          opts.classes.forEach((cls) => {
            newGradeMap.set(cls.class_id, cls.grade);
          });
        }
        setGradeMap(newGradeMap);
      } catch (err) {
        console.error("Error fetching registration options:", err);
      }
    };
    fetchOptions();
  }, []);


  // 3. Modifikasi fetchStudents untuk menerima 'page' dan 'limit'
  const fetchStudents = useCallback(async (filters = {}, options = {}) => {
    const { isBackgroundRefresh = false } = options;
    // eslint-disable-next-line
    const { page = 1, per_page = ITEMS_PER_PAGE } = filters; 

    try {
      if (!isBackgroundRefresh) {
        setLoading(true);
      }

      const res = await getStudents(filters); 
      
      const data = res.data?.data || [];
      const totalCount = res.data?.total || data.length; 
      const lastPage = res.data?.last_page || 1;
      const fetchedCurrentPage = res.data?.current_page || page;


      setStudentData(data);
      setTotalData(totalCount);
      setTotalPages(lastPage);
      setCurrentPage(fetchedCurrentPage);

    } catch (err) {
      console.error("Error fetching student data:", err);
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  }, []);


  // Helper untuk mendapatkan filter saat ini
  const getCurrentFilters = useCallback((page) => ({
    search: search || undefined,
    school_year_id: selectedYear || undefined,
    semester_id: selectedSemester || undefined,
    section_id: selectedSections.length > 0 ? selectedSections : undefined,
    page: page, 
    per_page: ITEMS_PER_PAGE, 
  }), [search, selectedYear, selectedSemester, selectedSections]);


  // Fetch data awal saat komponen pertama kali dimuat
  useEffect(() => {
    // Panggilan awal mengambil halaman 1
    fetchStudents(getCurrentFilters(1)); 
    // eslint-disable-next-line
  }, [fetchStudents]); 

  // Auto fetch ketika filter/search berubah (debounce)
  useEffect(() => {
    // Jika filter berubah, kita harus kembali ke halaman 1
    const newFilters = getCurrentFilters(1); 

    const timer = setTimeout(() => {
      setCurrentPage(1); 
      fetchStudents(newFilters);
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedYear, selectedSemester, selectedSections, fetchStudents, getCurrentFilters]);

  // useEffect untuk auto-refresh
  useEffect(() => {
    const refreshData = () => {
      // Auto-refresh menggunakan currentPage saat ini
      const currentFilters = getCurrentFilters(currentPage);
      console.log("Auto refreshing student list (background)...");

      // Beri tanda bahwa ini adalah background refresh
      fetchStudents(currentFilters, { isBackgroundRefresh: true });
    };

    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);

    return () => clearInterval(intervalId);
  }, [search, selectedYear, selectedSemester, selectedSections, fetchStudents, currentPage, getCurrentFilters]);

  const handleSectionToggle = (id) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  // 4. Handler untuk Paginasi
  const handlePageChange = useCallback((page) => {
    if (page < 1 || page > totalPages) return;
    
    // Setel state di sini dulu untuk responsifitas UI
    setCurrentPage(page);

    const newFilters = getCurrentFilters(page);
    fetchStudents(newFilters);
  }, [fetchStudents, getCurrentFilters, totalPages]);


  return (
    <div className={styles.studentListContainer}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Find name or student id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <img src={searchIcon} alt="Search" className={styles.searchIcon} />
      </div>

      {/* Filters */}
      <div className={styles.filterContainer}>
        <div className={styles.filterTitle}>Filters</div>
        <div className={styles.filterControls}>
          {sections.map((section) => (
            <label key={section.section_id} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedSections.includes(section.section_id)}
                onChange={() => handleSectionToggle(section.section_id)}
              />
              <span className={styles.customCheckbox}></span>
              {section.name}
            </label>
          ))}
          <select
            value={selectedYear || ""}
            onChange={(e) => setSelectedYear(e.target.value || null)}
            className={styles.filterSelect}
          >
            <option value="">Select School Year</option>
            {schoolYears.map((y) => (
              <option key={y.school_year_id} value={y.school_year_id}>
                {y.year}
              </option>
            ))}
          </select>
          <select
            value={selectedSemester || ""}
            onChange={(e) => setSelectedSemester(e.target.value || null)}
            className={styles.filterSelect}
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
      <div className={styles.resultsCount}>
        Showing {loading ? "..." : totalData} results
      </div>

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.studentTable}>
          <thead>
            <tr className={styles.tableHeaderRow}>
              <th className={styles.tableHeader}>Student ID</th>
              <th className={styles.tableHeader}>Name</th>
              <th className={styles.tableHeader}>Section</th>
              <th className={styles.tableHeader}>Grade</th>
            </tr>
          </thead>
          <tbody>
            {!loading && studentData.length > 0 ? (
              studentData.map((student) => {
                const grade = gradeMap.get(student.class_id) || "N/A";
                const sectionName =
                  sections.find((s) => s.section_id === student.section_id)
                    ?.name || "N/A";

                return (
                  <tr
                    key={student.student_id}
                    className={styles.tableRow}
                    onClick={() =>
                      navigate(`/students/${student.student_id}`, {
                        state: { fromList: true },
                      })
                    }
                    style={{ cursor: "pointer" }}
                  >
                    <td className={styles.tableCell}>{student.student_id}</td>
                    <td className={styles.tableCellName}>
                      {student.full_name}
                    </td>
                    <td className={styles.tableCell}>{sectionName}</td>
                    <td className={styles.tableCell}>{grade}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="4" className={styles.tableCell}>
                  {loading ? "Loading..." : "No data available"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* 5. Implementasi Komponen Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
};

export default StudentList;