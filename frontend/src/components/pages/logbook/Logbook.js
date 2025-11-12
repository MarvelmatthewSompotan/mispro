import React, { useState, useEffect, useCallback } from "react";
import styles from "./Logbook.module.css";
import TableHeaderController from "../../molecules/TableHeaderController/TableHeaderController";
import Button from "../../atoms/Button";
import ExportLogbookPopup from "./ExportLogbookPopup/ExportLogbookPopup";
import FilterPopup from "../../atoms/FilterPopUp";
import filterStyles from "../../atoms/FilterPopUp.module.css";
import Pagination from "../../atoms/Pagination"; // <-- 1. IMPORT Pagination
import { getLogbook, getRegistrationOptions } from "../../../services/api"; // <-- 2. IMPORT API
import placeholder from "../../../assets/user.svg"; // <-- 3. IMPORT Placeholder

// 1. Impor dari dnd-kit (Tetap Sama)
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// INITIAL_HEADERS tetap dipakai untuk urutan default dan dnd
const INITIAL_HEADERS = [
  "Photo",
  "Student ID",
  "Full Name",
  "Grade",
  "Section",
  "School Year",
  "Gender",
  "Registration Date",
  "Transportation",
  "NISN",
  "Family Rank",
  "Place DOB",
  "Age",
  "Religion",
  "Country",
  "Address",
  "Phone",
  "Father Name",
  "Father Occupation",
  "Father Phone",
  "Mother Name",
  "Mother Occupation",
  "Mother Phone",
  "NIK",
  "KITAS",
];

const REFRESH_INTERVAL = 5000; // --- TAMBAHAN ---

// Data statis DIHAPUS
// const logbookData = [ ... ];

// HEADER_KEY_MAP tetap dipakai untuk mapping data ke sel tabel
const HEADER_KEY_MAP = {
  Photo: "photo_url",
  "Student ID": "student_id",
  "Full Name": "full_name",
  Grade: "grade",
  Section: "section",
  "School Year": "school_year",
  Gender: "gender",
  "Registration Date": "registration_date",
  Transportation: "transportation",
  NISN: "nisn",
  "Family Rank": "family_rank",
  "Place DOB": "place_dob",
  Age: "age",
  Religion: "religion",
  Country: "country",
  Address: "address",
  Phone: "phone",
  "Father Name": "father_name",
  "Father Occupation": "father_occupation",
  "Father Phone": "father_phone",
  "Mother Name": "mother_name",
  "Mother Occupation": "mother_occupation",
  "Mother Phone": "mother_phone",
  NIK: "nik",
  KITAS: "kitas",
};

// ======================================================================
// --- 4. KONFIGURASI FILTER & SORT (BARU) ---
// ======================================================================

// Map Header Title -> API Sort Field Key
// Sesuai daftar 'Sort' dari requirements Anda
const SORT_CONFIG_MAP = {
  "Student ID": "student_id",
  "Full Name": "full_name",
  Grade: "grade",
  Section: "section",
  "School Year": "school_year",
  Gender: "gender",
  "Registration Date": "registration_date",
  Transportation: "transportation",
  "Family Rank": "family_rank",
  Age: "age",
  Religion: "religion",
  Country: "country",
  "Father Name": "father_name",
  "Father Occupation": "father_occupation",
  "Mother Name": "mother_name",
  "Mother Occupation": "mother_occupation",
  // Kolom tanpa sort (Photo, NISN, Place DOB, Address, Phone, dll)
};

// Map Header Title -> Konfigurasi Filter
// Sesuai daftar 'Filter' dari requirements Anda
const FILTER_CONFIG_MAP = {
  // Filter Search
  "Full Name": { type: "search", apiKeys: ["search_name"] },
  "Family Rank": { type: "search", apiKeys: ["search_family_rank"] },
  Religion: { type: "search", apiKeys: ["search_religion"] },
  Country: { type: "search", apiKeys: ["search_country"] },
  "Father Name": { type: "search", apiKeys: ["search_father"] },
  "Mother Name": { type: "search", apiKeys: ["search_mother"] },

  // Filter Checkbox
  Grade: {
    type: "checkbox",
    apiKeys: ["grades"],
    optionsKey: "classes", // Dari getRegistrationOptions
    valueKey: "grade", // Sesuai Registration.js
    labelKey: "grade",
  },
  Section: {
    type: "checkbox",
    apiKeys: ["sections"],
    optionsKey: "sections", // Dari getRegistrationOptions
    valueKey: "name", // Sesuai Registration.js
    labelKey: "name",
  },
  Gender: {
    type: "checkbox",
    apiKeys: ["genders"],
    optionsKey: "genders", // Kita akan hardcode ini
    valueKey: "id",
    labelKey: "name",
  },
  Transportation: {
    type: "checkbox",
    apiKeys: ["transportations"],
    optionsKey: "transportations", // Dari getRegistrationOptions
    valueKey: "type", // Asumsi key dari API
    labelKey: "type",
  },
  "School Year": {
    type: "checkbox",
    apiKeys: ["school_years"],
    optionsKey: "schoolYears", // Dari getRegistrationOptions
    valueKey: "year", // Sesuai Registration.js
    labelKey: "year",
    singleSelect: true, // Sesuai requirement "hanya bisa pilih 1"
  },

  // Filter Range
  "Registration Date": {
    type: "date-range",
    apiKeys: ["start_date", "end_date"],
  },
  Age: { type: "number-range", apiKeys: ["min_age", "max_age"] },

  // Kolom tanpa filter (Student ID, Photo, NISN, dll)
};
// ======================================================================

// Komponen SortableHeader (Tetap Sama)
const SortableHeader = ({
  header,
  selectedColumns,
  handleColumnSelect,
  sortDirection,
  onSortClick,
  isFilterActive,
  isFilterApplied,
  onFilterClick,
  showFilterPopup,
  filterPopupNode,
  // Props baru untuk disable sort/filter
  disableSort,
  disableFilter,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: header });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableHeaderController
      ref={setNodeRef}
      style={style}
      listeners={listeners}
      {...attributes}
      title={header}
      controlsDisabled={header === "Photo"}
      showCheckbox={true}
      isChecked={selectedColumns.has(header)}
      onChange={(e) => handleColumnSelect(header, e.target.checked)}
      sortDirection={sortDirection}
      onSortClick={onSortClick}
      isFilterActive={isFilterActive}
      isFilterApplied={isFilterApplied}
      onFilterClick={onFilterClick}
      showFilterPopup={showFilterPopup}
      filterPopupNode={filterPopupNode}
      disableSort={disableSort}
      disableFilter={disableFilter}
    />
  );
};

const Logbook = () => {
  // --- 5. STATE BARU ---
  const [logbookData, setLogbookData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterOptions, setFilterOptions] = useState({
    classes: [],
    sections: [],
    schoolYears: [],
    transportations: [], // Asumsi ini ada di getRegistrationOptions
    genders: [
      { id: "MALE", name: "Male" },
      { id: "FEMALE", name: "Female" },
    ],
  });

  // --- STATE LAMA (diganti/disesuaikan) ---
  const [columns, setColumns] = useState(INITIAL_HEADERS);
  const [selectedColumns, setSelectedColumns] = useState(
    new Set(INITIAL_HEADERS)
  );
  const [isExportPopupOpen, setIsExportPopupOpen] = useState(false);

  // State filter & sort baru (mengikuti pola Registration.js)
  const [filters, setFilters] = useState({}); // Menyimpan semua filter yang TEPAT
  const [sorts, setSorts] = useState([]); // Menyimpan sort yang TEPAT

  // State untuk popup filter
  const [activeFilter, setActiveFilter] = useState(null); // { column, config }

  const sensors = useSensors(useSensor(PointerSensor));

  // --- 6. FUNGSI FETCH DATA ---

  // Mengambil Opsi Filter (Grade, Section, SchoolYear)
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const opts = await getRegistrationOptions();
        setFilterOptions((prev) => ({
          ...prev,
          classes: opts.classes || [],
          sections: opts.sections || [],
          schoolYears: opts.school_years || [],
          transportations: opts.transportations || [], // Asumsi
        }));
      } catch (err) {
        console.error("Error fetching registration options:", err);
      }
    };
    fetchFilterOptions();
  }, []);

  // Fungsi utama untuk mengambil data logbook
  const fetchLogbookData = useCallback(
    async (page = 1, options = {}) => {
      // --- MODIFIKASI ---
      const { isBackgroundRefresh = false } = options; // --- TAMBAHAN ---
      if (!isBackgroundRefresh) setLoading(true); // --- MODIFIKASI ---

      // 1. Siapkan parameter API dari state 'filters' dan 'sorts'
      const apiParams = {
        page: page,
        per_page: 25, // atau buat ini jadi state jika perlu
      };

      // 2. Terjemahkan state 'filters' ke 'apiParams'
      for (const headerTitle in filters) {
        const config = FILTER_CONFIG_MAP[headerTitle];
        const value = filters[headerTitle]; // Ini bisa string, array string, atau array date

        if (config && value) {
          if (config.type === "search") {
            // cth: apiKeys: ['search_name']
            apiParams[config.apiKeys[0]] = value;
          } else if (config.type === "checkbox") {
            // cth: apiKeys: ['grades']
            apiParams[config.apiKeys[0]] = value;
          } else if (config.type === "date-range") {
            // cth: apiKeys: ['start_date', 'end_date']
            apiParams[config.apiKeys[0]] = value[0] || undefined;
            apiParams[config.apiKeys[1]] = value[1] || undefined;
          } else if (config.type === "number-range") {
            // cth: apiKeys: ['min_age', 'max_age']
            apiParams[config.apiKeys[0]] = value[0] || undefined;
            apiParams[config.apiKeys[1]] = value[1] || undefined;
          }
        }
      }

      // 3. Tambahkan 'sorts'
      // State 'sorts' sudah dalam format: [{ field: 'full_name', order: 'asc' }]
      apiParams.sort = sorts.length > 0 ? sorts : undefined;

      // 4. Panggil API
      try {
        const res = await getLogbook(apiParams);
        setLogbookData(res.data || []);
        setTotalPages(res.meta?.last_page || 1);
        setCurrentPage(res.meta?.current_page || 1);
      } catch (error) {
        console.error("Failed to fetch logbook data:", error);
        setLogbookData([]);
        setTotalPages(1);
        setCurrentPage(1);
      } finally {
        if (!isBackgroundRefresh) setLoading(false); // --- MODIFIKASI ---
      }
    },
    [filters, sorts]
  ); // <-- Dependencies: filters dan sorts

  // 5. Trigger fetch data ketika filter, sort berubah
  useEffect(() => {
    // Reset ke halaman 1 setiap kali filter atau sort berubah
    fetchLogbookData(1);
  }, [filters, sorts, fetchLogbookData]); // fetchLogbookData di-include

  // --- TAMBAHAN: useEffect untuk Background Refresh ---
  useEffect(() => {
    const refreshData = () => {
      console.log("Auto refreshing logbook data (background)...");
      // Panggil fetchLogbookData dengan page saat ini dan opsi background
      fetchLogbookData(currentPage, { isBackgroundRefresh: true });
    };

    const intervalId = setInterval(refreshData, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [currentPage, fetchLogbookData]); // fetchLogbookData sudah mencakup (filters, sorts)
  // --------------------------------------------------

  // Handler untuk Pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    fetchLogbookData(page); // Panggil fetch data untuk halaman baru
  };

  // --- 7. HANDLER UNTUK UI (Tombol Select, DND, Export) ---

  // Fungsi handleColumnSelect, selectAll, unselectAll (Tetap Sama)
  const handleColumnSelect = (columnTitle, isChecked) => {
    const newSelectedColumns = new Set(selectedColumns);
    if (isChecked) {
      newSelectedColumns.add(columnTitle);
    } else {
      newSelectedColumns.delete(columnTitle);
    }
    setSelectedColumns(newSelectedColumns);
  };
  const selectAllColumns = () => {
    setSelectedColumns(new Set(columns));
  };
  const unselectAllColumns = () => {
    setSelectedColumns(new Set());
  };

  // Fungsi DND (Tetap Sama)
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setColumns((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Fungsi Export Popup (Tetap Sama)
  const handleOpenExportPopup = () => {
    setIsExportPopupOpen(true);
  };
  const handleCloseExportPopup = () => {
    setIsExportPopupOpen(false);
  };

  // --- 8. HANDLER BARU (Filter & Sort) ---

  // Handle KLIK TOMBOL SORT di header
  const handleSortClick = (headerTitle) => {
    const fieldKey = SORT_CONFIG_MAP[headerTitle];
    if (!fieldKey) return; // Tidak bisa di-sort

    setSorts((prev) => {
      // Logbook.js hanya support single sort, mirip Registration.js
      const current = prev[0]?.field === fieldKey ? prev[0] : null;
      let next;

      if (!current) next = { field: fieldKey, order: "asc" };
      else if (current.order === "asc")
        next = { field: fieldKey, order: "desc" };
      else next = null; // asc -> desc -> none

      return next ? [next] : [];
    });
  };

  // Handle KLIK TOMBOL FILTER di header (Membuka Popup)
  const handleFilterClick = (headerTitle) => {
    const config = FILTER_CONFIG_MAP[headerTitle];
    if (!config) return; // Tidak bisa di-filter

    setActiveFilter({
      column: headerTitle,
      config: config,
      initialValue: filters[headerTitle], // Kirim nilai yang sudah ada
    });
  };

  // Handle TUTUP Popup
  const handleFilterClose = () => setActiveFilter(null);

  // Handle SUBMIT dari Popup
  const handleFilterSubmit = (value) => {
    const column = activeFilter.column;

    setFilters((prev) => {
      const newFilters = { ...prev };

      // Cek apakah value "kosong"
      const isEmpty =
        value === null ||
        value === undefined ||
        value === "" ||
        (Array.isArray(value) && value.length === 0) ||
        (Array.isArray(value) && value.every((v) => v === "" || v === null)); // Untuk range [ "", "" ]

      if (isEmpty) {
        delete newFilters[column]; // Hapus filter jika kosong
      } else {
        newFilters[column] = value; // Set filter jika ada isi
      }
      return newFilters;
    });

    setActiveFilter(null); // Tutup popup
  };

  // --- 9. RENDER JSX ---
  return (
    <div className={styles.logbookPage}>
      <div className={styles.logbookContainer}>
        <header className={styles.logbookHeader}>
          <h1>Logbooks</h1>
          <Button variant="solid" onClick={handleOpenExportPopup}>
            Download PDF
          </Button>
        </header>
        <div className={styles.selectionControls}>
          <Button className={styles.btnChipDanger} onClick={unselectAllColumns}>
            Unselect All
          </Button>
          <Button className={styles.btnChipPrimary} onClick={selectAllColumns}>
            Select All
          </Button>
        </div>

        <div className={styles.tableWrapper}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className={styles.logbookTable}>
              <thead>
                <tr>
                  <SortableContext
                    items={columns}
                    strategy={horizontalListSortingStrategy}
                  >
                    {/* --- MAPPING HEADER (DIMODIFIKASI) --- */}
                    {columns.map((header) => {
                      // Cek config
                      const sortField = SORT_CONFIG_MAP[header];
                      const filterConfig = FILTER_CONFIG_MAP[header];

                      // Dapatkan sort order
                      const sortOrder =
                        sorts.find((s) => s.field === sortField)?.order ||
                        "none";

                      // Cek apakah filter ter-apply
                      const appliedValue = filters[header];
                      const isFilterApplied =
                        appliedValue != null &&
                        appliedValue !== "" &&
                        !(
                          Array.isArray(appliedValue) &&
                          appliedValue.length === 0
                        ) &&
                        !(
                          Array.isArray(appliedValue) &&
                          appliedValue.every((v) => v === "")
                        );

                      // Cek apakah popup filter ini sedang aktif
                      const isFilterActive = activeFilter?.column === header;

                      // Siapkan node popup jika aktif
                      let filterPopupNode = null;
                      if (isFilterActive) {
                        const config = activeFilter.config;
                        const options = filterOptions[config.optionsKey] || [];

                        filterPopupNode = (
                          <FilterPopup
                            options={options}
                            valueKey={config.valueKey}
                            labelKey={config.labelKey}
                            filterType={config.type}
                            filterKey={config.apiKeys[0]} // Untuk placeholder di search
                            initialValue={activeFilter.initialValue}
                            singleSelect={config.singleSelect || false} // Kirim prop singleSelect
                            onSubmit={handleFilterSubmit}
                            onClose={handleFilterClose}
                            className={
                              config.type === "date-range" ||
                              config.type === "number-range"
                                ? filterStyles.popupDateRange
                                : ""
                            }
                          />
                        );
                      }

                      return (
                        <SortableHeader
                          key={header}
                          header={header}
                          selectedColumns={selectedColumns}
                          handleColumnSelect={handleColumnSelect}
                          // Sort props
                          sortDirection={sortOrder}
                          onSortClick={() => handleSortClick(header)}
                          disableSort={!sortField} // Disable jika tidak ada di map
                          // Filter props
                          isFilterActive={isFilterActive}
                          isFilterApplied={isFilterApplied}
                          onFilterClick={() => handleFilterClick(header)}
                          disableFilter={!filterConfig} // Disable jika tidak ada di map
                          // Popup props
                          showFilterPopup={isFilterActive}
                          filterPopupNode={filterPopupNode}
                        />
                      );
                    })}
                  </SortableContext>
                </tr>
              </thead>

              {/* --- MAPPING BODY (DIMODIFIKASI) --- */}
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={columns.length} className={styles.messageCell}>
                      Loading...
                    </td>
                  </tr>
                ) : logbookData.length > 0 ? (
                  logbookData.map((item) => (
                    <tr key={item.student_id}>
                      {columns.map((header) => {
                        const dataKey = HEADER_KEY_MAP[header];
                        const isSelected = selectedColumns.has(header);

                        if (header === "Photo") {
                          return (
                            <td
                              key={header}
                              className={`${styles.cellPhoto} ${
                                isSelected ? styles.selectedCell : ""
                              }`}
                            >
                              <img
                                src={item[dataKey] || placeholder} // Gunakan placeholder
                                alt={item.full_name}
                                className={styles.studentPhoto}
                              />
                            </td>
                          );
                        }

                        return (
                          <td
                            key={header}
                            className={isSelected ? styles.selectedCell : ""}
                          >
                            {item[dataKey] || "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={columns.length} className={styles.messageCell}>
                      No data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </DndContext>
        </div>

        {/* --- 10. TAMBAHKAN PAGINATION --- */}
        {!loading && totalPages > 1 && (
          <div className={styles.paginationContainer}>
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>{" "}
      <ExportLogbookPopup
        isOpen={isExportPopupOpen}
        onClose={handleCloseExportPopup}
        columns={columns}
        selectedColumns={selectedColumns}
        logbookData={logbookData} // Kirim data dinamis
      />
    </div>
  );
};

export default Logbook;
