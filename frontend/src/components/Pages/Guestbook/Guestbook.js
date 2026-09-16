import React, { useState, useEffect, useCallback, useMemo } from "react";
import styles from "./Guestbook.module.css";

import SearchBar from "../../Molecules/SearchBar/SearchBar";
import ColumnHeader from "../../Molecules/ColumnHeader/ColumnHeader";
import Pagination from "../../Molecules/Pagination/Pagination";
import Button from "../../Atoms/Button/Button";
import ResetFilterButton from "../../Atoms/ResetFilterButton/ResetFilterButton";
import PopUpForm from '../../Molecules/PopUp/PopUpGuest/PopUpForm';
import { getOptions } from "../../../utils/masterData";

import {
  getGuestbook,
  createGuestbook,
  updateGuestbook
} from "../../../services/api";

import editPenIcon from "../../../assets/edit_pen_icon.svg";

const highlightText = (text, keyword) => {
  if (!keyword) return text;

  const regex = new RegExp(`(${keyword})`, "gi");
  const parts = String(text).split(regex);

  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase() ? (
      <mark key={i} style={{ backgroundColor: "#ffe58a", padding: 0 }}>
        {part}
      </mark>
    ) : (
      part
    )
  );
};

// Komponen Row dipisah agar lebih bersih
const GuestbookRow = ({ data, onEdit, search }) => {
  return (
    <div className={styles.guestbookDataRow}>
      <div className={styles.tableCell}>{data.id}</div>
      <div className={styles.tableCell}>{data.date_visit}</div>
      <div className={styles.tableCell}>
        {highlightText(data.visitor_display, search)}
      </div>
      <div className={styles.tableCell}>
        {highlightText(data.student_name, search)}
      </div>
      <div className={styles.tableCell}>{data.grade}</div>
      <div className={styles.tableCell}>{data.previous_school}</div>
      <div className={styles.tableCell}>{data.address}</div>
      <div className={styles.tableCell}>{data.contact}</div>
      <div className={styles.tableCell}>{data.remarks}</div>

      <div className={styles.tableCell}>
        <div
          className={styles.tableEditButton}
          onClick={(e) => {
            e.stopPropagation();
            onEdit(data);
          }}
        >
          <img src={editPenIcon} alt="Edit" className={styles.editButtonIcon} />
        </div>
      </div>
    </div>
  );
};

const Guestbook = () => {
  // --- States ---
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sorts, setSorts] = useState([{ field: "date_visit", order: "desc" }]);
  const [filters, setFilters] = useState({});
  const [filterOptions, setFilterOptions] = useState({ classes: [] });
  
  const [guestbookData, setGuestbookData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [showPopupForm, setShowPopupForm] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  // --- 1. Fetch Options (Grade) ---
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const opts = await getOptions();
        setFilterOptions((prev) => ({
          ...prev,
          classes: opts.classes || [],
        }));
      } catch (err) {
        console.error('Error fetching options:', err);
      }
    };
    fetchFilterOptions();
  }, []);

  // --- 2. Fetch Data dari API ---
  const fetchGuestbookData = useCallback(async (page = 1) => {
    setLoading(true);

    const apiParams = {
      page,
      per_page: 25,
    };

    if (search) apiParams.search_name = search;
    if (filters.class_id?.length) apiParams.class_id = filters.class_id;
    if (filters.start_date) apiParams.start_date = filters.start_date;
    if (filters.end_date) apiParams.end_date = filters.end_date;
    if (sorts.length > 0) apiParams.sort = sorts;

    try {
      const res = await getGuestbook(apiParams);
      setGuestbookData(res.data || []);
      setTotalPages(res.meta?.last_page || 1);
      setCurrentPage(res.meta?.current_page || 1);
    } catch (error) {
      console.error("Failed to fetch guestbook:", error);
      setGuestbookData([]);
    } finally {
      setLoading(false);
    }
  }, [
    search,
    filters.class_id,
    filters.start_date,
    filters.end_date,
    sorts,
  ]);

  // Trigger fetch saat page, search, filter, atau sort berubah
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchGuestbookData(currentPage);
    }, 500); // Debounce 500ms agar tidak spam API saat ngetik

    return () => clearTimeout(delayDebounceFn);
  }, [fetchGuestbookData, currentPage]);

  // --- 3. Flattening Data ---
  // Kita melakukan flattening di client agar 1 row API (yang berisi array students) 
  // pecah menjadi beberapa baris di table UI.
  const displayData = useMemo(() => {
    return guestbookData.flatMap((item) =>
      (item.students || []).map((student, idx) => ({
        ...item,
        student_name: student.name,
        class_id: student.class_id,
        grade: student.grade || "-",
        previous_school: student.previous_school,
        visitor_display: (item.visitors || [])
          .map((v) =>
            v.relation?.trim()
              ? `${v.name} (${v.relation})`
              : v.name
          )
          .join(", "),
        uniqueKey: `${item.id}-${student.name}-${idx}`,
      }))
    );
  }, [guestbookData]);

  // --- 4. Handlers ---
  const handleSortChange = (fieldKey) => {
    setSorts((prev) => {
      const current = prev[0]?.field === fieldKey ? prev[0] : null;
      if (!current) return [{ field: fieldKey, order: "asc" }];
      if (current.order === "asc") return [{ field: fieldKey, order: "desc" }];
      return [];
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (filterKey, selectedValue) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      if (filterKey === 'date_range' && Array.isArray(selectedValue)) {
        const [startDate, endDate] = selectedValue;
        newFilters['start_date'] = startDate || undefined;
        newFilters['end_date'] = endDate || undefined;
      } else {
        if (selectedValue && selectedValue.length > 0) {
          newFilters[filterKey] = selectedValue;
        } else {
          delete newFilters[filterKey];
        }
      }
      return newFilters;
    });
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setFilters({});
    setSorts([]);
    setCurrentPage(1);
  };

  const handleEdit = (row) => {
    // Cari data asli (bukan yang sudah di-flatten) untuk dikirim ke popup
    const original = guestbookData.find((g) => g.id === row.id);
    if (original) {
      const cloned = structuredClone(original);
      setSelectedData(cloned);
      setShowPopupForm(true);
    }
  };

  const handleSubmitGuestbook = async (formData) => {
    try {
      if (selectedData?.id) {
        await updateGuestbook(selectedData.id, formData);
      } else {
        await createGuestbook(formData);
      }

      handleClosePopup();
      fetchGuestbookData(currentPage);

    } catch (error) {
      console.error("Failed to save guestbook:", error);
      alert("Failed to save data");
    }
  };

  const handleClosePopup = () => {
    setShowPopupForm(false);
    setSelectedData(null);
  };

  return (
    <div className={styles.guestbookContainer}>
      <div className={styles.frameParent}>
        <div>
          <h1 className={styles.title}>Guestbook</h1>
          <div className={styles.searchAndFilterContainer}>
            <SearchBar
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Find visitor or student name"
            />
            <ResetFilterButton onClick={handleResetFilters} />
          </div>
        </div>

        <div className={styles.rightHeaderSection}>
          <Button onClick={() => setShowPopupForm(true)} variant="solid">
            Add New
          </Button>
        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeaderGrid}>
          <ColumnHeader
            title="ID"
            hasSort
            fieldKey="guestbook_id"
            sortOrder={sorts.find(s => s.field === 'guestbook_id')?.order}
            onSort={handleSortChange}
          />
          <ColumnHeader
            title='Date Visit'
            hasSort
            fieldKey='date_visit'
            sortOrder={sorts.find(s => s.field === 'date_visit')?.order}
            onSort={handleSortChange}
            hasFilter
            filterType='date-range'
            filterKey='date_range'
            onFilterChange={handleFilterChange}
            currentFilterValue={[filters.start_date, filters.end_date]}
          />
          <ColumnHeader title="Name of Visitor" />
          <ColumnHeader title="Student Name" />
          <ColumnHeader
            title="Grade"
            hasFilter
            filterKey="class_id"
            onFilterChange={handleFilterChange}
            filterOptions={filterOptions.classes}
            valueKey="class_id"
            labelKey="grade"
            currentFilterValue={filters.class_id}
          />
          <ColumnHeader title="Prev School" />
          <ColumnHeader title="Address" />
          <ColumnHeader title="Telp / Email" />
          <ColumnHeader title="Remarks" />
          <ColumnHeader title="Actions" />
        </div>

        <div className={styles.tableBody}>
          {loading ? (
            <div className={styles.messageCell}>Loading data...</div>
          ) : displayData.length > 0 ? (
            displayData.map((row) => (
              <GuestbookRow 
                key={row.uniqueKey} 
                data={row} 
                onEdit={handleEdit} 
                search={search}
              />
            ))
          ) : (
            <div className={styles.messageCell}>No data available</div>
          )}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 20 }}>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      </div>

      {showPopupForm && (
        <PopUpForm
          onClose={handleClosePopup}
          onSubmit={handleSubmitGuestbook}
          initialData={selectedData}
        />
      )}
    </div>
  );
};

export default Guestbook;