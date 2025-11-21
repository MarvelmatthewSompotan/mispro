import React, { useState, useRef, useEffect } from "react";
import styles from "./PopUpForm.module.css";
import {
  startRegistration,
  getRegistrationOptions,
  addSchoolYear,
} from "../../../../services/api";
import Button from "../../../atoms/Button";

// Komponen Dropdown (tidak diubah)
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

  const selectedLabel = getLabelForValue(value) || "";

  const filteredOptions =
    isSearchable && searchTerm
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
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

  const displayValue = searchTerm || (isOpen ? "" : selectedLabel);
  const optionsToDisplay = isSearchable ? filteredOptions : options;

  return (
    <div
      className={styles.customSelectContainer}
      ref={selectRef}
      data-disabled={disabled}
      data-open={isOpen}
    >
      {isSearchable ? (
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
            if (newIsOpen) setSearchTerm("");
          }}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
          }}
          disabled={disabled}
          autoComplete="off"
        />
      ) : (
        <div
          className={`${styles.selectInput} ${
            !value ? styles.placeholder : ""
          }`}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          {selectedLabel || placeholder}
        </div>
      )}

      {isOpen && (
        <div className={styles.optionsMenu}>
          <div className={styles.optionsList}>
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

// ==================================================================
// === POPUP FORM — SUDAH DITAMBAHI DUKUNGAN EDIT USER ===
// ==================================================================
const PopUpForm = ({
  onClose,
  onCreate,
  type = "registration",

  // === EDIT MODE PROPS ===
  isEditMode = false,
  initialData = null,
}) => {
  const formRef = useRef();
  const [loading, setLoading] = useState(false);
  const [options, setOptions] = useState({
    schoolYears: [],
    semesters: [],
    roles: [],
  });

  // Fields untuk Registration (tidak diubah)
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");
  const [isAddingYear, setIsAddingYear] = useState(false);

  // === USER FIELDS ===
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // opsional saat edit
  const [role, setRole] = useState("");

  const [passwordError, setPasswordError] = useState("");

  // === PREFILL DATA SAAT EDIT MODE ===
  useEffect(() => {
    if (type === "user" && isEditMode && initialData) {
      setUsername(initialData.username || "");
      setName(initialData.full_name || "");
      setEmail(initialData.email || "");
      setPassword(""); // kosong (opsional)
      setRole(initialData.role || "");
    }
  }, [isEditMode, initialData, type]);


  const resetForm = () => {
    setSchoolYear("");
    setSemester("");
    setDate(new Date().toISOString().split("T")[0]);
    setUsername("");
    setName("");
    setEmail("");
    setPassword("");
    setRole("");
    setPasswordError("");
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

  // === HANDLE SUBMIT — MEMBEDAKAN CREATE & EDIT ===
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setPasswordError("");

    try {
      // ========== REGISTRATION ==========
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
        }
      }

      // ========== USER MODE ==========
      else if (type === "user") {
        // === EDIT MODE: password optional ===
        if (isEditMode) {
          if (!username || !name || !email || !role) {
            setLoading(false);
            return alert("Please fill all fields except password");
          }

          const body = {
            username,
            full_name: name,
            email,
            role,
          };

          // Jika password diisi, sertakan
          if (password) {
            if (password.length <= 8) {
              setPasswordError("Password must be more than 8 characters");
              setLoading(false);
              return;
            }
            body.password = password;
          }

          await onCreate(body);
        }

        // === CREATE MODE ===
        else {
          if (!username || !name || !email || !password || !role) {
            setLoading(false);
            return alert("Please fill all fields");
          }
          if (password.length <= 8) {
            setPasswordError("Password must be more than 8 characters");
            setLoading(false);
            return;
          }

          await onCreate(
            { username, full_name: name, email, password, role },
            resetForm
          );
        }
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  // OPTION MAPPERS (tidak diubah)
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
        {/* === TITLE DINAMIS === */}
        <div className={styles.createNewRegistration}>
          {type === "registration"
            ? "Create New Registration"
            : isEditMode
            ? "Edit User"
            : "Add New User"}
        </div>

        {/* === REGISTRATION FORM (tidak diubah) === */}
        {type === "registration" ? (
          <div className={styles.frameParent}>
            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder="Select Year"
                value={schoolYear}
                options={allSchoolYearOptions}
                onChange={(val) => {
                  if (val === "add_new") handleAddNewSchoolYear();
                  else setSchoolYear(val);
                }}
                disabled={isAddingYear}
                isSearchable={true}
              />
            </div>

            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder="Select Semester"
                value={semester}
                options={semesterOptions}
                onChange={(val) => setSemester(val)}
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
          // ============================================
          // === USER FORM — SEKARANG SUPPORT EDIT MODE ===
          // ============================================
          <div className={styles.frameParent}>
            {/* Username */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
              />
            </div>

            {/* Email */}
            <div className={styles.fieldWrapper}>
              <input
                className={styles.textInput}
                type="email"
                placeholder="User Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password — opsional saat edit */}
            <div className={styles.fieldWrapper}>
              <input
                className={`${styles.textInput} ${
                  passwordError ? styles.inputError : ""
                }`}
                type="password"
                placeholder={
                  isEditMode ? "New Password (optional)" : "User Password"
                }
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                required={!isEditMode} // hanya wajib saat create
              />
              {passwordError && (
                <span className={styles.errorMessage}>{passwordError}</span>
              )}
            </div>

            {/* Role */}
            <div className={styles.fieldWrapper}>
              <CustomSelect
                placeholder="Select Role"
                value={role}
                options={roleOptions}
                onChange={(val) => setRole(val)}
              />
            </div>
          </div>
        )}

        {/* BUTTONS */}
        <div className={styles.bAddSubjectParent}>
          <Button onClick={onClose} variant="outline">
            Cancel
          </Button>

          <Button
            type="submit"
            variant="solid"
            disabled={loading || isAddingYear}
            className={loading ? styles.loadingButton : ""}
          >
            {loading
              ? "Processing..."
              : isEditMode
              ? "Update"
              : "Create"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;
