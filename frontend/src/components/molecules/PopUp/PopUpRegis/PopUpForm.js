import React, { useState, useRef, useEffect } from "react";
import styles from "./PopUpForm.module.css";
import {
  startRegistration,
  getRegistrationOptions,
  addSchoolYear,
} from "../../../../services/api";
import Button from "../../../atoms/Button";

// --- Komponen Dropdown Kustom (DIMODIFIKASI) ---
const CustomSelect = ({
  options,
  value,
  onChange,
  placeholder,
  disabled,
  isSearchable,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const selectRef = useRef(null);

  const getLabelForValue = (val) => {
    const option = options.find((opt) => opt.value === val);
    return option ? option.label : undefined;
  };

  // Label yang terpilih (atau string kosong jika tidak ada)
  const selectedLabel = getLabelForValue(value) || "";

  // Opsi yang difilter (HANYA jika searchable)
  const filteredOptions =
    isSearchable && searchTerm
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options; // Jika tidak searchable, biarkan semua opsi

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm(""); // Kosongkan pencarian saat menutup
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm("");
  };

  // Nilai display HANYA untuk input searchable
  const displayValue = searchTerm || (isOpen ? "" : selectedLabel);

  // Tentukan opsi mana yang akan di-map (hasil filter atau semua)
  // PERUBAHAN: Gunakan filteredOptions jika searchable, jika tidak, gunakan options
  const optionsToDisplay = isSearchable ? filteredOptions : options;

  return (
    <div
      className={styles.customSelectContainer}
      ref={selectRef}
      data-disabled={disabled}
      data-open={isOpen}
    >
      {/* === PERUBAHAN UTAMA: RENDER KONDISIONAL === */}
      {isSearchable ? (
        // --- 1. JIKA SEARCHABLE (Untuk School Year) ---
        <input
          type="text"
          className={`${styles.selectInput} ${
            !value && !displayValue ? styles.placeholder : ""
          }`}
          value={displayValue}
          placeholder={placeholder}
          onClick={() => {
            if (disabled) return;
            const newIsOpen = !isOpen;
            setIsOpen(newIsOpen);
            if (newIsOpen) {
              setSearchTerm("");
            }
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          disabled={disabled}
          autoComplete="off"
        />
      ) : (
        // --- 2. JIKA NON-SEARCHABLE (Untuk Semester / Role) ---
        <div
          className={`${styles.selectInput} ${
            !value ? styles.placeholder : ""
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {/* Gunakan logic display asli */}
          {selectedLabel || placeholder}
        </div>
      )}

      {isOpen && (
        <div className={styles.optionsMenu}>
          <div className={styles.optionsList}>
            {/* PERUBAHAN: Gunakan optionsToDisplay */}
            {optionsToDisplay.map((opt) => (
              <div
                key={opt.value}
                className={`${styles.optionItem} ${
                  opt.value === "add_new" ? styles.addMoreOption : ""
                } ${value === opt.value ? styles.selectedOption : ""}`}
                onClick={() => handleSelect(opt.value)}
              >
                {opt.label}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
// --- Akhir Komponen Dropdown Kustom ---

// ==================================================================
// === KOMPONEN POPUPFORM (Tidak ada perubahan di sini) ===
// ==================================================================
const PopUpForm = ({ onClose, onCreate, type = "registration" }) => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    schoolYears: [],
    semesters: [],
    roles: [],
  });

  // State fields tetap sama
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");
  const [isAddingYear, setIsAddingYear] = useState(false);

  // User fields
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("");

  const resetForm = () => {
    setSchoolYear("");
    setSemester("");
    setDate(new Date().toISOString().split("T")[0]); // Reset date ke hari ini
    setUsername("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
    formRef.current?.reset();
  };

  const fetchOptions = async () => {
    try {
      const data = await getRegistrationOptions();
      setOptions({
        schoolYears: data.school_years || [],
        semesters: data.semesters || [],
        roles: data.roles || [],
      });
    } catch (err) {
      console.error("Error fetching options:", err);
    }
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  useEffect(() => {
    if (type === "registration") {
      setDate(new Date().toISOString().split("T")[0]);
    }
  }, [type]);

  const handleAddNewSchoolYear = async () => {
    setIsAddingYear(true);
    try {
      const newYear = await addSchoolYear();
      await fetchOptions();
      if (newYear?.school_year_id) {
        setSchoolYear(newYear.school_year_id);
      }
    } catch (err) {
      alert("Failed to add new school year");
    } finally {
      setIsAddingYear(false);
    }
  };

  // --- PERUBAHAN DI SINI: Logika `handleSubmit` untuk membedakan Create vs Edit ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (type === "registration") {
        if (!schoolYear || !semester) {
          setLoading(false);
          return alert("Please fill all fields");
        }
        const res = await startRegistration(schoolYear, semester);
        if (res.success) {
          onCreate(
            {
              schoolYear,
              semester,
              date: res.data.registration_date,
              draftId: res.data.draft_id,
            },
            resetForm
          );
        } else {
          alert("Failed to start registration");
        }
      } else if (type === "user") {
        if (!username || !name || !email || !password || !role) {
          setLoading(false);
          return alert("Please fill all fields");
        }
        await onCreate(
          { username, full_name: name, email, password, role },
          resetForm
        );
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const mapOptions = (optionsArray, valueKey, labelKey) => {
    return optionsArray.map((opt) => ({
      value: opt[valueKey],
      label: opt[labelKey],
    }));
  };

  const mapRoleOptions = (optionsArray) => {
    return optionsArray.map((r) => ({
      value: r,
      label: r.charAt(0).toUpperCase() + r.slice(1).replace("_", " "),
    }));
  };

  const schoolYearOptions = mapOptions(
    options.schoolYears,
    "school_year_id",
    "year"
  );
  const semesterOptions = mapOptions(options.semesters, "semester_id", "name");
  const roleOptions = mapRoleOptions(options.roles);

  const allSchoolYearOptions = [
    ...schoolYearOptions,
    { value: "add_new", label: "+ Add more" },
  ];

  return (
    <div className={styles.overlay}>
      <form
        className={styles.popUpForm}
        onSubmit={handleSubmit}
        ref={formRef}
        autoComplete="off"
      >
        {/* --- PERUBAHAN DI SINI: Judul dinamis --- */}
        <div className={styles.createNewRegistration}>
          {type === "registration" ? "Create New Registration" : "Add New User"}
        </div>

        {type === "registration" ? (
          <div className={styles.frameParent}>
            {/* ... (Form registrasi tidak diubah) ... */}
            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder="Select Year"
                value={schoolYear}
                options={allSchoolYearOptions}
                onChange={(val) => {
                  if (val === "add_new") {
                    handleAddNewSchoolYear();
                  } else {
                    setSchoolYear(val);
                  }
                }}
                disabled={isAddingYear}
                isSearchable={true} // <-- Ini akan render <input>
              />
            </div>

            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder="Select Semester"
                value={semester}
                options={semesterOptions}
                onChange={(val) => setSemester(val)}
                // <-- Karena isSearchable tidak ada, ini akan render <div>
              />
            </div>

            <div className={styles.fieldWrapper}>
              <input
                className={styles.dateField}
                type="date"
                value={date}
                readOnly
              />
            </div>
          </div>
        ) : (
          <div className={styles.frameParent}>
            {/* ... (Field Username, Full Name, Email tidak diubah) ... */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {/* Full Name */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type="email"
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>
            <div className={styles.fieldWrapper}>
              {/* --- PERUBAHAN DI SINI: Placeholder & required dinamis --- */}
              <input
                className={styles.textInput}
                type="password"
                placeholder="User Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder="Select Role"
                value={role}
                options={roleOptions}
                onChange={(val) => setRole(val)}
                // <-- Karena isSearchable tidak ada, ini akan render <div>
              />
            </div>
          </div>
        )}

        <div className={styles.bAddSubjectParent}>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>
          {/* --- PERUBAHAN DI SINI: Teks tombol dinamis --- */}
          <Button
            type="submit"
            variant="solid"
            disabled={loading || isAddingYear}
            className={loading ? styles.loadingButton : ""}
          >
            {loading ? "Processing..." : isAddingYear ? "Adding..." : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;