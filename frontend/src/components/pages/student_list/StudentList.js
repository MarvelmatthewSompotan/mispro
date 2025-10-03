import React, { useState, useEffect } from 'react';
import styles from './StudentList.module.css';
import { useNavigate } from 'react-router-dom';
import searchIcon from '../../../assets/Search-icon.png';
import { getStudents, getRegistrationOptions } from '../../../services/api';

const StudentList = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sections, setSections] = useState([]);
  const [schoolYears, setSchoolYears] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedSemester, setSelectedSemester] = useState(null);
  const [gradeMap, setGradeMap] = useState(new Map());

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
        console.error('Error fetching registration options:', err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch data dari API menggunakan getStudents
  const fetchStudents = async (filters = {}) => {
    try {
      setLoading(true);
      const res = await getStudents(filters);
      setStudentData(res.data?.data || []);
    } catch (err) {
      console.error('Error fetching student data:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchStudents();
  }, []);

  // Auto fetch ketika filter/search berubah
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents({
        search: search || undefined,
        school_year_id: selectedYear || undefined,
        semester_id: selectedSemester || undefined,
        section_id: selectedSections.length > 0 ? selectedSections : undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedYear, selectedSemester, selectedSections]);

  const handleSectionToggle = (id) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className={styles.studentListContainer}>
      {/* Search Bar */}
      <div className={styles.searchContainer}>
        <input
          type='text'
          placeholder='Find name or student id'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />
        <img src={searchIcon} alt='Search' className={styles.searchIcon} />
      </div>

      {/* Filters */}
      <div className={styles.filterContainer}>
        <div className={styles.filterTitle}>Filters</div>
        <div className={styles.filterControls}>
          {/* Sections */}
          {sections.map((section) => (
            <label key={section.section_id} className={styles.checkboxLabel}>
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
            className={styles.filterSelect}
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
            className={styles.filterSelect}
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
      <div className={styles.resultsCount}>
        Showing {loading ? '...' : studentData.length} results
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
                const grade = gradeMap.get(student.class_id) || 'N/A';
                const sectionName =
                  sections.find((s) => s.section_id === student.section_id)
                    ?.name || 'N/A';

                return (
                  <tr
                    key={student.student_id}
                    className={styles.tableRow}
                    onClick={() =>
                      navigate(`/students/${student.student_id}`, {
                        state: { fromList: true },
                      })
                    }
                    style={{ cursor: 'pointer' }}
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
                <td colSpan='4' className={styles.tableCell}>
                  {loading ? 'Loading...' : 'No data available'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentList;
