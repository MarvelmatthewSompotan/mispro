import React, { useState, useRef, useEffect } from "react";
import styles from "./PopUpForm.module.css";
import {
  startRegistration,
  getRegistrationOptions,
  addSchoolYear,
} from "../../../../services/api";
import Button from "../../../atoms/Button";

const PopUpForm = ({ onClose, onCreate }) => {
  const [schoolYear, setSchoolYear] = useState("");
  const [semester, setSemester] = useState("");
  const [date, setDate] = useState("");

  const [schoolYearOptions, setSchoolYearOptions] = useState([]);
  const [semesterOptions, setSemesterOptions] = useState([]);
  const [isAddingYear, setIsAddingYear] = useState(false);

  const schoolYearRef = useRef(null);
  const semesterRef = useRef(null);
  const dateRef = useRef(null);

  // Fungsi fetchOptions tidak perlu diubah
  const fetchOptions = () => {
    getRegistrationOptions()
      .then((data) => {
        setSchoolYearOptions(data.school_years || []);
        setSemesterOptions(data.semesters || []);
      })
      .catch((err) => {
        // Jangan tampilkan error di console jika popup tidak terlihat
        // Ini mencegah spam di console saat komponen berjalan di background
        // console.error("Error fetching registration options:", err);
      });
  };

  // 1. Logika auto-refresh dan pengambilan data awal digabung di sini
  useEffect(() => {
    // Ambil data pertama kali saat komponen dimuat
    fetchOptions();

    // Atur interval untuk refresh data setiap 5 detik
    const REFRESH_INTERVAL = 5000;
    const intervalId = setInterval(fetchOptions, REFRESH_INTERVAL);

    // Penting: Hentikan interval saat komponen ditutup (unmount)
    // untuk mencegah memory leak dan pemanggilan API yang tidak perlu.
    return () => clearInterval(intervalId);
  }, []); // Dependency array kosong `[]` agar efek ini hanya berjalan sekali saat mount

  // 2. Hapus useEffect lama yang hanya memanggil fetchOptions sekali
  // useEffect(() => {
  //   fetchOptions();
  // }, []);

  // Set today's date once on mount
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
  }, []);

  useEffect(() => {
    if (schoolYearRef.current) {
      schoolYearRef.current.classList.toggle(styles.hasValue, !!schoolYear);
    }
    if (semesterRef.current) {
      semesterRef.current.classList.toggle(styles.hasValue, !!semester);
    }
    if (dateRef.current) {
      dateRef.current.classList.toggle(styles.hasValue, !!date);
    }
  }, [schoolYear, semester, date]);

  const handleAddNewSchoolYear = async () => {
    setIsAddingYear(true);
    try {
      const newSchoolYearData = await addSchoolYear();
      // Panggil fetchOptions untuk refresh list setelah berhasil menambah
      fetchOptions();
      if (newSchoolYearData && newSchoolYearData.school_year_id) {
        setSchoolYear(newSchoolYearData.school_year_id);
      }
    } catch (error) {
      console.error("Error adding new school year:", error);
      alert("Failed to add new school year. Please try again.");
    } finally {
      setIsAddingYear(false);
    }
  };

  const handleSchoolYearChange = (e) => {
    const { value } = e.target;
    if (value === "add_new") {
      handleAddNewSchoolYear();
    } else {
      setSchoolYear(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (schoolYear && semester) {
      startRegistration(schoolYear, semester)
        .then((response) => {
          if (response.success) {
            onCreate({
              schoolYear,
              semester,
              date: response.data.registration_date,
              draftId: response.data.draft_id,
            });
          } else {
            alert(
              "Failed to start registration: " +
                (response.error || "Unknown error")
            );
          }
        })
        .catch((error) => {
          console.error("Error starting registration:", error);
          alert("Failed to start registration: " + error.message);
        });
    } else {
      alert("Please fill all fields");
    }
  };

  return (
    <div className={styles.overlay}>
      <form className={styles.popUpForm} onSubmit={handleSubmit}>
        <div className={styles.createNewRegistration}>
          Create new registration form
        </div>

        <div className={styles.frameParent}>
          {/* School Year Field */}
          <div className={styles.fieldWrapper}>
            <select
              ref={schoolYearRef}
              className={styles.schoolYear}
              value={schoolYear}
              onChange={handleSchoolYearChange}
              required
              disabled={isAddingYear}
            >
              <option value="">Select year</option>
              {schoolYearOptions.map((sy) => (
                <option key={sy.school_year_id} value={sy.school_year_id}>
                  {sy.year}
                </option>
              ))}
              <option
                value="add_new"
                style={{ color: "var(--main-accent)" }}
              >
                + Add more
              </option>
            </select>
          </div>

          {/* Semester Field */}
          <div className={styles.fieldWrapper}>
            <select
              ref={semesterRef}
              className={styles.semester}
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              required
            >
              <option value="">Select semester</option>
              {semesterOptions.map((s) => (
                <option key={s.semester_id} value={s.semester_id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Date Field (readonly, auto today) */}
          <div className={styles.fieldWrapper}>
            <input
              ref={dateRef}
              className={styles.dateField}
              type="date"
              value={date}
              readOnly
            />
          </div>
        </div>

        <div className={styles.bAddSubjectParent}>
          <Button
            className={styles.bAddSubject}
            onClick={onClose}
            variant="outline"
          >
            Cancel
          </Button>
          <Button className={styles.bAddSubject1} type="submit" variant="solid">
            Create
          </Button>
        </div>
      </form>
    </div>
  );
};

export default PopUpForm;
