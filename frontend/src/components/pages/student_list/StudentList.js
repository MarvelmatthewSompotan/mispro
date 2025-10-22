import React, { useState, useEffect, useCallback } from "react";
import styles from "./StudentList.module.css";
import { useNavigate } from "react-router-dom";
import searchIcon from "../../../assets/Search-icon.png";
import placeholderPhoto from "../../../assets/user.png";
import { getStudents, getRegistrationOptions } from "../../../services/api"; 
import Pagination from "../../atoms/Pagination";
import ColumnHeader from "../../atoms/columnHeader/ColumnHeader";

const ITEMS_PER_PAGE = 25; // Sesuai dengan JSON backend
const StudentRow = ({ student, onClick }) => {
  const enrollmentStyle =
    student.enrollment_status === "ACTIVE" ? styles.active : styles.status;

  const statusStyle = styles.status;

  return (
    <div className={styles.studentDataRow} onClick={onClick}>
      {/* 1. Photo (Disesuaikan: pakai photo_url) */}
      <div className={styles.tableCell}>
        <img
          src={student.photo_url || placeholderPhoto} // Fallback ke placeholder
          alt="avatar"
          className={styles.photo}
        />
      </div>
      {/* 2. Student ID (Sudah Benar) */}
      <div className={styles.tableCell} title={student.student_id}>
        {student.student_id}
      </div>
      {/* 3. Student Name (Disesuaikan: pakai full_name) */}
      <div className={styles.tableCell} title={student.full_name}>
        {student.full_name}
      </div>
      {/* 4. Grade (Disesuaikan: pakai grade langsung) */}
      <div className={styles.tableCell} title={student.grade}>
        {student.grade}
      </div>
      {/* 5. Section (Disesuaikan: pakai section_name langsung) */}
      <div className={styles.tableCell} title={student.section_name}>
        {student.section_name}
      </div>
      {/* 6. School Year (Disesuaikan: pakai school_year) */}
      <div className={styles.tableCell} title={student.school_year}>
        {student.school_year}
      </div>
      {/* 7. Enrollment (Disesuaikan: pakai enrollment_status) */}
      <div className={styles.tableCell}>
        <div className={enrollmentStyle}>
          <div className={styles.statusText}>{student.enrollment_status}</div>
        </div>
      </div>
      {/* 8. Status (Disesuaikan: pakai student_status) */}
      <div className={styles.tableCell}>
        <div className={statusStyle}>
          <div className={styles.statusText}>{student.student_status}</div>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Utama StudentList ---
const StudentList = () => {
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // --- STATE BARU untuk Filter & Sort ---
  const [searchName, setSearchName] = useState("");

  // State untuk menampung semua filter dari ColumnHeader
  const [filters, setFilters] = useState({});

  // State untuk menampung semua sort
  const [sorts, setSorts] = useState([{ field: "student_id", order: "asc" }]);
  const [filterOptions, setFilterOptions] = useState({
    sections: [],
    classes: [],
    schoolYears: [],
    enrollmentStatus: [
      { id: "ACTIVE", name: "Active" },
      { id: "INACTIVE", name: "Inactive" },
    ],
    studentStatus: [
      { id: "Not Graduate", name: "Not Graduate" },
      { id: "Graduate", name: "Graduate" },
      { id: "Withdraw", name: "Withdraw" },
      { id: "Expelled", name: "Expelled" },
    ],
  });

  // --- Logika Fetching Data (Disesuaikan) ---
  const fetchStudents = useCallback(
    async (page = 1) => {
      setLoading(true);
      try {
        const allParams = {
          ...filters,
          search_name: searchName || undefined,
          sort: sorts.length > 0 ? sorts : undefined,
          page: page,
          per_page: ITEMS_PER_PAGE,
        };

        const res = await getStudents(allParams);
        const data = res.data?.data || [];
        setStudentData(data);
        setTotalPages(res.data?.last_page || 1);
        setCurrentPage(res.data?.current_page || 1);
      } catch (err) {
        console.error("Error fetching student data:", err);
      } finally {
        setLoading(false);
      }
    },
    [searchName, filters, sorts] // fetchStudents akan dibuat ulang jika ini berubah
  );

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const opts = await getRegistrationOptions(); // Panggil API Anda
        setFilterOptions((prev) => ({
          ...prev,
          sections: opts.sections || [],
          classes: opts.classes || [],
          schoolYears: opts.school_years || [],
        }));
      } catch (err) {
        console.error("Error fetching registration options:", err);
      }
    };
    fetchFilterOptions();
  }, []); // Hanya jalan sekali saat komponen mount

  // --- useEffect untuk Debounce Search (Disesuaikan) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Reset ke halaman 1
      fetchStudents(1);
    }, 300); // Waktu tunggu 300ms
    return () => clearTimeout(timer);
  }, [searchName]); // Hanya trigger saat searchName berubah

  // --- useEffect untuk Filter dan Sort ---
  useEffect(() => {
    if (!searchName) {
      // Hindari double-fetch saat search
      fetchStudents(1);
    }
  }, [filters, sorts, fetchStudents]); // Pastikan fetchStudents ada di dependency array

  const handlePageChange = (page) => {
    fetchStudents(page);
  };

  // --- FUNGSI BARU: Handler untuk Sort ---
  const handleSortChange = (fieldKey) => {
    setSorts((prevSorts) => {
      const existingSortIndex = prevSorts.findIndex(
        (s) => s.field === fieldKey
      );
      let newSorts = [...prevSorts];

      if (existingSortIndex > -1) {
        const existingSort = newSorts[existingSortIndex];
        // 1. Jika sudah ada: Balik urutannya (asc -> desc)
        if (existingSort.order === "asc") {
          existingSort.order = "desc";
        } else {
          // 2. Jika sudah 'desc': Hapus dari sorting
          newSorts.splice(existingSortIndex, 1);
        }
      } else {
        // 3. Jika belum ada: Tambahkan sebagai 'asc'
        newSorts.push({ field: fieldKey, order: "asc" });
      }

      // 4. Jika tidak ada sort, kembalikan ke default
      if (newSorts.length === 0) {
        newSorts = [{ field: "student_id", order: "asc" }];
      }

      return newSorts;
    });
  };

  // --- FUNGSI BARU: Handler untuk Filter ---
  const handleFilterChange = (filterKey, selectedValues) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };

      if (selectedValues && selectedValues.length > 0) {
        let paramKey = filterKey;
        if (filterKey === "grade") paramKey = "class_id";
        if (filterKey === "section") paramKey = "section_id";

        newFilters[paramKey] = selectedValues;
      } else {
        // Jika array value kosong, hapus key dari state filter
        delete newFilters[filterKey];
      }
      return newFilters;
    });
  };

  const getSortOrder = (fieldKey) => {
    return sorts.find((s) => s.field === fieldKey)?.order;
  };

  return (
    <div className={styles.studentListContainer}>
      <h1 className={styles.pageTitle}>Student List</h1>

      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="Find name or student id"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          className={styles.searchInput}
        />
        <img src={searchIcon} alt="Search" className={styles.searchIcon} />
      </div>

      <div className={styles.tableContainer}>
        {/* Header Grid (Disesuaikan: Tambahkan props) */}
        <div className={styles.tableHeaderGrid}>
          <ColumnHeader title="Photo" hasSort={false} hasFilter={false} />

          <ColumnHeader
            title="Student ID"
            hasSort={true}
            fieldKey="student_id" // (Backend sortable key)
            sortOrder={getSortOrder("student_id")}
            onSort={handleSortChange}
            hasFilter={false}
          />
          <ColumnHeader
            title="Student Name"
            hasSort={true}
            fieldKey="full_name" // (Backend sortable key)
            sortOrder={getSortOrder("full_name")}
            onSort={handleSortChange}
            hasFilter={false}
          />
          <ColumnHeader
            title="Grade"
            hasSort={true}
            fieldKey="grade"
            sortOrder={getSortOrder("grade")}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey="class_id" // (Backend filter key)
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.classes}
            valueKey="class_id" // <-- TAMBAHKAN INI
            labelKey="grade"
          />
          <ColumnHeader
            title="Section"
            hasSort={true}
            fieldKey="section"
            sortOrder={getSortOrder("section")}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey="section_id"
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.sections}
            valueKey="class_id" // <-- TAMBAHKAN INI
            labelKey="grade" // Kirim opsi ke <FilterButton>
          />
          <ColumnHeader
            title="School Year"
            hasSort={false} // API tidak bisa sort by school_year
            hasFilter={true}
            filterKey="school_year_id"
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.schoolYears} // Kirim opsi ke <FilterButton>
            valueKey="class_id" // <-- TAMBAHKAN INI
            labelKey="grade"
          />
          <ColumnHeader
            title="Enrollment"
            hasSort={true}
            fieldKey="enrollment_status"
            sortOrder={getSortOrder("enrollment_status")}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey="enrollment_status"
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.enrollmentStatus} // Kirim opsi ke <FilterButton>
            valueKey="class_id" // <-- TAMBAHKAN INI
            labelKey="grade"
          />
          <ColumnHeader
            title="Status"
            hasSort={true}
            fieldKey="student_status"
            sortOrder={getSortOrder("student_status")}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey="student_status"
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.studentStatus} // Kirim opsi ke <FilterButton>
            valueKey="class_id" // <-- TAMBAHKAN INI
            labelKey="grade"
          />
        </div>

        {/* Body Grid (Disesuaikan: Menggunakan StudentRow baru) */}
        <div className={styles.tableBody}>
          {loading ? (
            <div className={styles.messageCell}>Loading...</div>
          ) : studentData.length > 0 ? (
            studentData.map((student) => (
              <StudentRow
                key={student.student_id}
                student={student} // Kirim seluruh objek student
                onClick={() => navigate(`/students/${student.student_id}`)}
              />
            ))
          ) : (
            <div className={styles.messageCell}>No data available</div>
          )}
        </div>
      </div>

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
