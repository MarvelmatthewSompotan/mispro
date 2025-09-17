// File: src/components/pages/StudentProfile.js (Versi Final & Lengkap)

import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useParams } from "react-router-dom";
import {
  getStudentLatestApplication,
  getRegistrationOptions,
  updateStudent,
  getStudentHistoryDates,
  getHistoryDetail,
} from "../../../../services/api";
import Select from "react-select";
import styles from "./StudentProfile.module.css";
import placeholderImage from "../../../../assets/user.png";
import ConfirmUpdatePopup from "../PopUpConfirmUpdate/PopUpConfirmUpdate.js";
import UpdatedNotification from "../UpdateNotification/UpdateNotification.js";
import gsap from "gsap";

const RadioDisplay = ({
  label,
  isSelected,
  isEditing,
  name,
  value,
  onChange, // Ini akan menjadi fungsi handleRadioChange
}) => {
  const content = (
    <>
      <div className={styles.visualRadio}>
        <div
          className={`${styles.radioOuter} ${
            isSelected ? styles.radioOuterSelected : ""
          }`}
        />
        {isSelected && <div className={styles.radioInner} />}
      </div>
      <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>
        {label}
      </span>
    </>
  );

  if (isEditing) {
    return (
      <div
        className={styles.clickableLabel}
        onClick={() => onChange(name, value)} // Panggil handler dengan name & value
        style={{ cursor: "pointer" }}
      >
        {content}
      </div>
    );
  }

  return <div className={styles.optionItem}>{content}</div>;
};

const CheckboxDisplay = ({ label, isSelected, isEditing, name, onChange }) => {
  const content = (
    <>
      {" "}
      <div className={styles.visualCheckbox}>
        {" "}
        <div
          className={`${styles.checkboxOuter} ${
            isSelected ? styles.checkboxOuterSelected : ""
          }`}
        />{" "}
        {isSelected && <div className={styles.checkboxCheckmark}>✓</div>}{" "}
      </div>{" "}
      <span style={{ fontWeight: isSelected ? "bold" : "normal" }}>
        {label}
      </span>{" "}
    </>
  );
  if (isEditing) {
    return (
      <label className={styles.clickableLabel}>
        {/* Checkbox asli untuk fungsionalitas */}
        <input
          type="checkbox"
          name={name}
          checked={isSelected}
          onChange={onChange}
          className={styles.hiddenInput}
        />
        {/* Tampilan visual kustom */}
        {content}
      </label>
    );
  }
  return <div className={styles.optionItem}>{content}</div>;
};

const StudentProfile = () => {
  const { studentId } = useParams();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [options, setOptions] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errors, setErrors] = useState({});
  const [studentInfo, setStudentInfo] = useState({});
  const [academicStatusOptions, setAcademicStatusOptions] = useState([]);
  const [genderOptions, setGenderOptions] = useState([]);
  const [scrollTrigger, setScrollTrigger] = useState(0);
  const [historyDates, setHistoryDates] = useState([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const citizenshipOptions = [
    { value: "Indonesia", label: "Indonesia" },
    { value: "Non Indonesia", label: "Non Indonesia" },
  ];
  const historyRef = useRef(null);

  const [validationMessages, setValidationMessages] = useState({
    nik: "",
    kitas: "",
    nisn: "",
  });

  // Fetch options untuk dropdowns
  useEffect(() => {
    getRegistrationOptions()
      .then((data) => {
        setAcademicStatusOptions(
          data.academic_status?.map((opt) => ({ value: opt, label: opt })) || []
        );
        setGenderOptions(
          data.genders?.map((opt) => ({ value: opt, label: opt })) || []
        );
      })
      .catch((err) => console.error("Failed to fetch options:", err));
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [studentRes, optionsRes] = await Promise.all([
        getStudentLatestApplication(studentId),
        getRegistrationOptions(),
      ]);
      setOptions(optionsRes);
      if (studentRes.success) {
        const studentData = studentRes.data;
        const combinedData = {
          student_id: studentData.input_name,
          ...studentData.studentInfo,
          ...studentData.program,
          ...studentData.facilities,
          ...studentData.parentGuardian,
          ...studentData.termOfPayment,
        };
        setProfileData(combinedData);
        setFormData(combinedData);
        setStudentInfo(studentData.studentInfo || {});
      }
    } catch (err) {
      console.error("Error fetching student profile data:", err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- [BARU] Handler untuk mengambil dan menampilkan history ---
  const handleViewHistoryClick = async () => {
    // Jika sedang dalam mode view history, tombol ini akan kembali ke data terbaru
    if (selectedVersionId) {
      setSelectedVersionId(null);
      setIsHistoryVisible(false);
      setFormData(profileData); // Reset ke data terbaru yang sudah disimpan
      setStudentInfo(profileData);
      return;
    }

    // Toggle tampilan dropdown
    setIsHistoryVisible(!isHistoryVisible);

    // Jika dropdown dibuka dan data history belum ada, fetch data
    if (!isHistoryVisible && historyDates.length === 0) {
      setIsLoadingHistory(true);
      try {
        const dates = await getStudentHistoryDates(studentId);
        setHistoryDates(dates);
      } catch (error) {
        console.error("Failed to fetch history dates:", error);
      } finally {
        setIsLoadingHistory(false);
      }
    }
  };

  // --- [BARU] Handler saat memilih tanggal dari dropdown history ---
  const handleHistoryDateChange = async (versionId) => {

    if (!versionId) {
      setSelectedVersionId(null);
      setFormData(profileData);
      setStudentInfo(profileData);
      setIsHistoryVisible(false);
      return;
    }

    setSelectedVersionId(versionId);
    setLoading(true); // Tampilkan loading global
    try {
      const historyDetail = await getHistoryDetail(versionId);
      if (historyDetail.success) {
        const snapshotData = historyDetail.data_snapshot.request_data;

        // Re-construct studentInfo dari snapshot
        const studentInfoSnapshot = {
          first_name: snapshotData.first_name,
          middle_name: snapshotData.middle_name,
          last_name: snapshotData.last_name,
          nickname: snapshotData.nickname,
          citizenship: snapshotData.citizenship,
          country: snapshotData.country,
          religion: snapshotData.religion,
          place_of_birth: snapshotData.place_of_birth,
          date_of_birth: snapshotData.date_of_birth,
          email: snapshotData.email,
          phone_number: snapshotData.phone_number,
          previous_school: snapshotData.previous_school,
          academic_status: snapshotData.academic_status,
          academic_status_other: snapshotData.academic_status_other,
          gender: snapshotData.gender,
          family_rank: snapshotData.family_rank,
          nisn: snapshotData.nisn,
          nik: snapshotData.nik,
          kitas: snapshotData.kitas,
          street: snapshotData.street,
          rt: snapshotData.rt,
          rw: snapshotData.rw,
          village: snapshotData.village,
          district: snapshotData.district,
          city_regency: snapshotData.city_regency,
          province: snapshotData.province,
          other: snapshotData.other,
        };

        // Re-construct formData dari snapshot
        const combinedData = {
          student_id: historyDetail.student_id,
          ...studentInfoSnapshot, // studentInfo fields
          section_id: snapshotData.section_id,
          program_id: snapshotData.program_id, // program fields
          class_id: snapshotData.class_id,
          major_id: snapshotData.major_id,
          program_other: snapshotData.program_other,
          transportation_id: snapshotData.transportation_id,
          pickup_point_id: snapshotData.pickup_point_id, // facilities fields
          pickup_point_custom: snapshotData.pickup_point_custom,
          transportation_policy: snapshotData.transportation_policy,
          residence_id: snapshotData.residence_id,
          residence_hall_policy: snapshotData.residence_hall_policy,
          father_name: snapshotData.father_name,
          mother_name: snapshotData.mother_name, // parent/guardian fields
          father_company: snapshotData.father_company,
          father_occupation: snapshotData.father_occupation,
          father_phone: snapshotData.father_phone,
          father_email: snapshotData.father_email,
          father_address_street: snapshotData.father_address_street,
          father_address_rt: snapshotData.father_address_rt,
          father_address_rw: snapshotData.father_address_rw,
          father_address_village: snapshotData.father_address_village,
          father_address_district: snapshotData.father_address_district,
          father_address_city_regency: snapshotData.father_address_city_regency,
          father_address_province: snapshotData.father_address_province,
          father_address_other: snapshotData.father_address_other,
          mother_phone: snapshotData.mother_phone,
          mother_email: snapshotData.mother_email,
          mother_address_street: snapshotData.mother_address_street,
          mother_address_rt: snapshotData.mother_address_rt,
          mother_address_rw: snapshotData.mother_address_rw,
          mother_address_village: snapshotData.mother_address_village,
          mother_address_district: snapshotData.mother_address_district,
          mother_address_city_regency: snapshotData.mother_address_city_regency,
          mother_address_province: snapshotData.mother_address_province,
          mother_address_other: snapshotData.mother_address_other,
          guardian_name: snapshotData.guardian_name,
          relation_to_student: snapshotData.relation_to_student,
          guardian_phone: snapshotData.guardian_phone,
          guardian_email: snapshotData.guardian_email,
          guardian_address_street: snapshotData.guardian_address_street,
          guardian_address_rt: snapshotData.guardian_address_rt,
          guardian_address_rw: snapshotData.guardian_address_rw,
          guardian_address_village: snapshotData.guardian_address_village,
          guardian_address_district: snapshotData.guardian_address_district,
          guardian_address_city_regency:
            snapshotData.guardian_address_city_regency,
          guardian_address_province: snapshotData.guardian_address_province,
          guardian_address_other: snapshotData.guardian_address_other,
          tuition_fees: snapshotData.tuition_fees,
          residence_payment: snapshotData.residence_payment, // payment fields
          financial_policy_contract: snapshotData.financial_policy_contract,
          discount_name: snapshotData.discount_name,
          discount_notes: snapshotData.discount_notes,
        };

        setStudentInfo(studentInfoSnapshot);
        setFormData(combinedData);
        setIsHistoryVisible(false);
      }
    } catch (error) {
      console.error("Failed to fetch history detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearError = (section, fieldName) => {
    if (errors[section] && errors[section][fieldName]) {
      // Buat salinan dari error section yang relevan
      const newSectionErrors = { ...errors[section] };
      // Hapus key error dari salinan tersebut
      delete newSectionErrors[fieldName];

      // Perbarui state errors utama
      setErrors((prevErrors) => ({
        ...prevErrors,
        [section]: newSectionErrors,
      }));
    }
  };

  // Handler untuk input biasa di student info
  const handleStudentInfoChange = (e) => {
    const { name, value } = e.target;
    clearError("studentInfo", name);

    // Real-time validation for specific fields
    if (name === "nik" && value && value.length !== 16) {
      setValidationMessages((prev) => ({
        ...prev,
        nik: "NIK must be 16 digits",
      }));
    } else if (name === "nik") {
      setValidationMessages((prev) => ({ ...prev, nik: "" }));
    }

    if (name === "kitas" && value && (value.length < 11 || value.length > 16)) {
      setValidationMessages((prev) => ({
        ...prev,
        kitas: "KITAS must be 11-16 characters",
      }));
    } else if (name === "kitas") {
      setValidationMessages((prev) => ({ ...prev, kitas: "" }));
    }

    if (name === "nisn" && value && value.length !== 10) {
      setValidationMessages((prev) => ({
        ...prev,
        nisn: "NISN must be 10 digits",
      }));
    } else if (name === "nisn") {
      setValidationMessages((prev) => ({ ...prev, nisn: "" }));
    }
    setStudentInfo((prev) => ({ ...prev, [name]: value }));
  };

  // Handler khusus untuk react-select
  const handleStudentInfoSelectChange = (name, selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    clearError("studentInfo", name);
    setStudentInfo((prev) => {
      const newData = { ...prev, [name]: value };
      if (name === "citizenship") {
        if (value === "Indonesia") {
          newData.kitas = "";
          newData.country = "";
        } else if (value === "Non Indonesia") newData.nik = "";
      }
      if (name === "academic_status" && value !== "OTHER") {
        newData.academic_status_other = "";
      }
      return newData;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    const studentInfoFields = [
      "first_name",
      "nickname",
      "nisn",
      "nik",
      "kitas",
      "gender",
      "family_rank",
      "citizenship",
      "religion",
      "place_of_birth",
      "date_of_birth",
      "email",
      "previous_school",
      "phone_number",
      "academic_status",
      "street",
      "village",
      "district",
      "city_regency",
      "province",
    ];
    const parentFields = [
      "father_name",
      "father_phone",
      "father_email",
      "father_address_street",
      "father_address_village",
      "father_address_district",
      "father_address_city_regency",
      "father_address_province",
      "mother_name",
      "mother_phone",
      "mother_email",
      "mother_address_street",
      "mother_address_village",
      "mother_address_district",
      "mother_address_city_regency",
      "mother_address_province",
    ];

    if (studentInfoFields.includes(name)) {
      clearError("studentInfo", name);
    } else if (parentFields.includes(name)) {
      clearError("parentGuardian", name);
    } else {
      clearError("facilities", name);
    }

    setFormData((prevData) => {
      // Salin state sebelumnya untuk dimodifikasi
      const newFormData = { ...prevData };

      const radioNames = [
        "section_id",
        "program_id",
        "transportation_id",
        "residence_id",
        "tuition_fees",
        "residence_payment",
      ];

      // Aturan untuk Checkbox Policy
      const isPolicyCheckbox = [
        "transportation_policy",
        "residence_hall_policy",
        "financial_policy_contract",
      ].includes(name);

      newFormData[name] = isPolicyCheckbox
        ? checked
          ? "Signed"
          : "Not Signed"
        : value;

      if (radioNames.includes(name)) {
        // INI UNTUK RADIO BUTTON
        // Jika nilai yang diklik sama dengan nilai saat ini, kosongkan. Jika beda, isi dengan nilai baru.
        newFormData[name] =
          String(prevData[name]) === String(value) ? "" : value;
      } else if (isPolicyCheckbox) {
        // INI UNTUK CHECKBOX
        newFormData[name] = checked ? "Signed" : "Not Signed";
      } else {
        // INI UNTUK SEMUA INPUT LAINNYA (text, select, date)
        newFormData[name] = value;
      }

      // === ATURAN 1: Logika untuk Bagian PROGRAM ===
      if (name === "section_id") {
        // Jika section diubah, reset grade dan major
        newFormData.class_id = "";
        newFormData.major_id = "";
      }

      if (name === "class_id") {
        // Jika grade diubah, cek apakah major perlu direset
        const selectedClass = options.classes.find(
          (c) => String(c.class_id) === String(value)
        );
        const gradeNum = selectedClass ? parseInt(selectedClass.grade, 10) : 0;
        // Jika grade di bawah 9, major tidak berlaku (direset)
        if (gradeNum < 9) {
          newFormData.major_id = "";
        }
      }

      // === ATURAN 2: Logika untuk Bagian FACILITIES ===
      if (name === "transportation_id") {
        // Jika transportasi diubah, cek apakah residence hall perlu direset
        const selectedTransport = options.transportations.find(
          (t) => String(t.transport_id) === String(value)
        );
        const transportType = selectedTransport
          ? selectedTransport.type.toLowerCase()
          : "";

        // Jika transportasi adalah 'own car' atau 'school bus'
        if (transportType === "own car" || transportType === "school bus") {
          // Cek residence hall yang sedang dipilih
          const currentResidence = options.residence_halls.find(
            (r) => String(r.residence_id) === String(prevData.residence_id)
          );
          // Jika yang dipilih adalah asrama (Dormitory), maka reset
          if (
            currentResidence &&
            currentResidence.type.toLowerCase().includes("dormitory")
          ) {
            newFormData.residence_id = "";
          }
        }
      }

      if (name === "discount_name" && !value) {
        newFormData.discount_notes = "";
      }

      return newFormData;
    });
  };

  const handleRadioChange = (name, value) => {
    clearError("facilities", name);
    setFormData((prevData) => {
      const currentVal = prevData[name];
      const newVal = currentVal === value ? "" : value;
      const newFormData = { ...prevData, [name]: newVal };

      if (name === "transportation_id") {
        const selectedTransport = options.transportations.find(
          (t) => String(t.transport_id) === String(newVal)
        );
        const transportType = selectedTransport
          ? selectedTransport.type.toLowerCase()
          : "";
        if (transportType === "own car" || transportType === "school bus") {
          const currentResidence = options.residence_halls.find(
            (r) => String(r.residence_id) === String(prevData.residence_id)
          );
          if (
            currentResidence &&
            currentResidence.type.toLowerCase().includes("dormitory")
          ) {
            newFormData.residence_id = "";
          }
        }
      }
      return newFormData;
    });
  };

  const handleCancel = () => {
    setFormData(profileData);
    setStudentInfo(profileData); // Reset student info as well
    setIsEditing(false);
    setErrors({});
    setValidationMessages({ nik: "", kitas: "", nisn: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Menggabungkan data dari kedua state untuk validasi yang komprehensif
    const fullFormData = { ...formData, ...studentInfo };

    // 1. Validasi Student Information
    const studentInfoErrors = {};
    const requiredStudentFields = {
      first_name: "First name is required",
      nickname: "Nickname is required",
      nisn: "NISN is required",
      gender: "Gender is required",
      family_rank: "Rank is required",
      citizenship: "Citizenship is required",
      religion: "Religion is required",
      place_of_birth: "Place of birth is required",
      date_of_birth: "Date of birth is required",
      email: "A valid email is required",
      previous_school: "Previous school is required",
      phone_number: "Phone number is required",
      academic_status: "Academic status is required",
      street: "Street is required",
      village: "Village is required",
      district: "District is required",
      city_regency: "City/Regency is required",
      province: "Province is required",
    };
    for (const field in requiredStudentFields) {
      if (!fullFormData[field] || String(fullFormData[field]).trim() === "") {
        studentInfoErrors[field] = requiredStudentFields[field];
      }
    }
    if (fullFormData.email && !emailRegex.test(fullFormData.email)) {
      studentInfoErrors.email = "Invalid email format.";
    }
    if (fullFormData.citizenship === "Indonesia" && !fullFormData.nik?.trim()) {
      studentInfoErrors.nik = "NIK is required.";
    }
    if (
      fullFormData.citizenship === "Non Indonesia" &&
      !fullFormData.kitas?.trim()
    ) {
      studentInfoErrors.kitas = "KITAS is required.";
    }

    if (fullFormData.citizenship === "Indonesia") {
      if (!fullFormData.nik?.trim()) studentInfoErrors.nik = "NIK is required.";
      else if (fullFormData.nik.length !== 16)
        studentInfoErrors.nik = "NIK must be 16 digits.";
    }
    if (fullFormData.citizenship === "Non Indonesia") {
      if (!fullFormData.kitas?.trim())
        studentInfoErrors.kitas = "KITAS is required.";
      else if (fullFormData.kitas.length < 11 || fullFormData.kitas.length > 16)
        studentInfoErrors.kitas = "KITAS must be 11-16 characters.";
    }
    if (fullFormData.nisn && fullFormData.nisn.length !== 10) {
      studentInfoErrors.nisn = "NISN must be 10 digits.";
    }
    if (
      fullFormData.academic_status === "OTHER" &&
      !fullFormData.academic_status_other?.trim()
    ) {
      studentInfoErrors.academic_status = "Please specify the academic status.";
    }
    if (Object.keys(studentInfoErrors).length > 0) {
      newErrors.studentInfo = studentInfoErrors;
    }

    // 2. Validasi Facilities
    const facilitiesErrors = {};
    if (!fullFormData.transportation_id) {
      facilitiesErrors.transportation_id = "Transportation is required.";
    }
    if (!fullFormData.residence_id) {
      facilitiesErrors.residence_id = "Residence Hall is required.";
    }
    if (fullFormData.transportation_policy !== "Signed") {
      facilitiesErrors.transportation_policy = "Policy must be signed.";
    }
    if (fullFormData.residence_hall_policy !== "Signed") {
      facilitiesErrors.residence_hall_policy = "Policy must be signed.";
    }
    if (Object.keys(facilitiesErrors).length > 0) {
      newErrors.facilities = facilitiesErrors;
    }

    // 3. Validasi Parent/Guardian Information (Versi Lengkap)
    const parentErrors = {};
    // Ayah
    if (!fullFormData.father_name?.trim())
      parentErrors.father_name = "Father's name is required.";
    if (!fullFormData.father_phone?.trim())
      parentErrors.father_phone = "Father's phone is required.";
    if (
      !fullFormData.father_email?.trim() ||
      !emailRegex.test(fullFormData.father_email)
    ) {
      parentErrors.father_email = "A valid email for the father is required.";
    }
    if (!fullFormData.father_address_street?.trim())
      parentErrors.father_address_street =
        "Father's street address is required.";
    if (!fullFormData.father_address_village?.trim())
      parentErrors.father_address_village = "Father's village is required.";
    if (!fullFormData.father_address_district?.trim())
      parentErrors.father_address_district = "Father's district is required.";
    if (!fullFormData.father_address_city_regency?.trim())
      parentErrors.father_address_city_regency =
        "Father's city/regency is required.";
    if (!fullFormData.father_address_province?.trim())
      parentErrors.father_address_province = "Father's province is required.";

    // Ibu
    if (!fullFormData.mother_name?.trim())
      parentErrors.mother_name = "Mother's name is required.";
    if (!fullFormData.mother_phone?.trim())
      parentErrors.mother_phone = "Mother's phone is required.";
    if (
      !fullFormData.mother_email?.trim() ||
      !emailRegex.test(fullFormData.mother_email)
    ) {
      parentErrors.mother_email = "A valid email for the mother is required.";
    }
    if (!fullFormData.mother_address_street?.trim())
      parentErrors.mother_address_street =
        "Mother's street address is required.";
    if (!fullFormData.mother_address_village?.trim())
      parentErrors.mother_address_village = "Mother's village is required.";
    if (!fullFormData.mother_address_district?.trim())
      parentErrors.mother_address_district = "Mother's district is required.";
    if (!fullFormData.mother_address_city_regency?.trim())
      parentErrors.mother_address_city_regency =
        "Mother's city/regency is required.";
    if (!fullFormData.mother_address_province?.trim())
      parentErrors.mother_address_province = "Mother's province is required.";

    if (Object.keys(parentErrors).length > 0) {
      newErrors.parentGuardian = parentErrors;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (Object.keys(errors).length > 0 && scrollTrigger > 0) {
      const sectionOrder = ["studentInfo", "facilities", "parentGuardian"];
      const firstErrorSectionKey = sectionOrder.find(
        (key) => errors[key] && Object.keys(errors[key]).length > 0
      );

      if (firstErrorSectionKey) {
        const targetElement = document.getElementById(firstErrorSectionKey);
        if (targetElement) {
          gsap.to(window, {
            duration: 0.8,
            scrollTo: { y: targetElement, offsetY: 100 },
            ease: "power2.inOut",
          });
        }
      }
    }
  }, [scrollTrigger]);

  const handleSaveClick = () => {
    const isValid = validateForm();
    if (isValid) {
      setErrors({});
      // Before opening popup, combine studentInfo back into the main formData
      setFormData((prev) => ({ ...prev, ...studentInfo }));
      setIsPopupOpen(true);
    } else {
      // === TAMBAHKAN BARIS INI UNTUK MENGAKTIFKAN SCROLL ===
      setScrollTrigger((prev) => prev + 1);
    }
  };

  // Fungsi ini akan dijalankan saat tombol "Yes, I'm sure" di popup diklik
  const handleConfirmUpdate = async () => {
    setIsUpdating(true);
    try {
      await updateStudent(studentId, formData);
      setShowSuccess(true);
      setIsEditing(false);
      setIsPopupOpen(false); // Tutup popup setelah berhasil
      fetchData();
    } catch (error) {
      console.error("Failed to update student:", error);
      alert(`Update failed: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const getNameById = (type, id) => {
    if (!options || !id || !options[type] || !options[type].length) return id;
    const keyName = Object.keys(options[type][0])[0];
    const item = options[type]?.find((i) => String(i[keyName]) === String(id));
    return item?.name || item?.grade || item?.type || id;
  };

  const filteredGrades = useMemo(() => {
    if (!isEditing || !options?.classes || !formData?.section_id) return [];
    const selectedSection = options.sections?.find(
      (sec) => String(sec.section_id) === String(formData.section_id)
    );
    if (!selectedSection) return [];

    const sectionName = selectedSection.name;
    if (sectionName === "ECP") {
      return options.classes.filter((cls) =>
        ["N", "K1", "K2"].includes(cls.grade)
      );
    }
    if (sectionName === "Elementary School") {
      return options.classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 1 && grade <= 6;
      });
    }
    if (sectionName === "Middle School") {
      return options.classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 7 && grade <= 9;
      });
    }
    if (sectionName === "High School") {
      return options.classes.filter((cls) => {
        const grade = parseInt(cls.grade, 10);
        return grade >= 10 && grade <= 12;
      });
    }
    return [];
  }, [isEditing, options, formData?.section_id]);

  const showMajorField = useMemo(() => {
    // Kondisi isEditing dihapus agar pengecekan hanya berdasarkan data
    if (!options?.classes || !formData?.class_id) return false;
    const selectedClass = options.classes.find(
      (c) => String(c.class_id) === String(formData.class_id)
    );
    if (!selectedClass) return false;
    const gradeNum = parseInt(selectedClass.grade, 10);
    return gradeNum >= 9;
  }, [options, formData?.class_id]);

  const filteredResidenceHalls = useMemo(() => {
    if (!options?.residence_halls) return [];
    const selectedTransport = options.transportations?.find(
      (t) => String(t.transport_id) === String(formData?.transportation_id)
    );
    const transportType = selectedTransport
      ? selectedTransport.type.toLowerCase()
      : "";
    const isTransportRestricted =
      transportType === "own car" || transportType === "school bus";

    if (isTransportRestricted) {
      // Sembunyikan semua opsi yang mengandung kata 'Dormitory'
      return options.residence_halls.filter(
        (r) => !r.type.toLowerCase().includes("dormitory")
      );
    }
    // Jika tidak ada batasan, tampilkan semua
    return options.residence_halls;
  }, [options, formData?.transportation_id]);

  if (loading) return <div style={{ padding: "20px" }}></div>;
  if (!formData)
    return <div style={{ padding: "20px" }}>Student not found.</div>;

  const formatDateForInput = (dateString) =>
    !dateString ? "" : new Date(dateString).toISOString().split("T")[0];
  const formatDateForDisplay = (dateString) =>
    !dateString
      ? "-"
      : new Date(dateString).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
  const selectedTransportType =
    options?.transportations?.find(
      (t) => String(t.transport_id) === String(formData.transportation_id)
    )?.type || "";

  return (
    <div className={styles.profilePage}>
      <div className={styles.topActionHeader}>
        <div className={styles.historyContainer} ref={historyRef}>
          <button
            className={styles.actionButton}
            onClick={handleViewHistoryClick}
            disabled={isEditing}
          >
            {selectedVersionId
              ? "Back to Latest Version"
              : "View version history"}
          </button>
          {isHistoryVisible && (
            <ul className={styles.historyDropdown}>
              {isLoadingHistory ? (
                <li className={styles.historyInfoItem}>Loading...</li>
              ) : historyDates.length > 0 ? (
                historyDates.map((version) => (
                  <li
                    key={version.version_id}
                    className={styles.historyItem}
                    onClick={() => handleHistoryDateChange(version.version_id)}
                  >
                    {new Date(version.updated_at).toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </li>
                ))
              ) : (
                <li className={styles.historyInfoItem}>No history found.</li>
              )}
            </ul>
          )}
        </div>

        {isEditing ? (
          <>
            <button
              className={styles.actionButton}
              onClick={handleCancel}
              disabled={isUpdating}
            >
              Cancel
            </button>
            <button
              className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
              onClick={handleSaveClick}
              disabled={isUpdating}
            >
              {isUpdating ? "Saving..." : "Save"}
            </button>
          </>
        ) : (
          <button
            className={`${styles.actionButton} ${styles.actionButtonPrimary}`}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </button>
        )}
      </div>

      <div className={styles.profileContent}>
        <div className={styles.sidebar}>
          <img
            className={styles.profileImage}
            src={placeholderImage}
            alt="Student"
          />
          <div className={styles.studentIdContainer}>
            <div className={styles.fieldLabel}>ID</div>
            <b className={styles.fieldValue}>{formData.student_id}</b>
          </div>
        </div>

        <div className={styles.infoContainer}>
          {/* STUDENT'S INFORMATION */}
          <div id="studentInfo" className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>STUDENT’S INFORMATION</b>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.first_name
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="first_name"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.first_name ? styles.errorLabel : ""
                    }`}
                  >
                    First name
                  </label>
                  {isEditing ? (
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={studentInfo.first_name || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.first_name ? styles.errorInput : ""
                      }`}
                      placeholder={
                        errors.studentInfo?.first_name || "First name"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.first_name || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <label htmlFor="middle_name" className={styles.fieldLabel}>
                    Middle name
                  </label>
                  {isEditing ? (
                    <input
                      id="middle_name"
                      type="text"
                      name="middle_name"
                      value={studentInfo.middle_name || ""}
                      onChange={handleStudentInfoChange}
                      className={styles.formInput}
                      placeholder="Middle name"
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.middle_name || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="last_name" className={styles.fieldLabel}>
                    Last name
                  </label>
                  {isEditing ? (
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={studentInfo.last_name || ""}
                      onChange={handleStudentInfoChange}
                      className={styles.formInput}
                      placeholder="Last name"
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.last_name || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.nickname ? styles.errorFieldWrapper : ""
                  }`}
                >
                  <label
                    htmlFor="nickname"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.nickname ? styles.errorLabel : ""
                    }`}
                  >
                    Nickname
                  </label>
                  {isEditing ? (
                    <input
                      id="nickname"
                      type="text"
                      name="nickname"
                      value={studentInfo.nickname || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.nickname ? styles.errorInput : ""
                      }`}
                      placeholder={errors.studentInfo?.nickname || "Nickname"}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.nickname || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.citizenship
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="citizenship"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.citizenship ? styles.errorLabel : ""
                    }`}
                  >
                    Citizenship
                  </label>
                  {isEditing ? (
                    <div className={styles.selectWrapper}>
                      <Select
                        id="citizenship"
                        name="citizenship"
                        options={citizenshipOptions}
                        value={
                          studentInfo.citizenship
                            ? {
                                value: studentInfo.citizenship,
                                label: studentInfo.citizenship,
                              }
                            : null
                        }
                        onChange={(opt) =>
                          handleStudentInfoSelectChange("citizenship", opt)
                        }
                        placeholder={
                          errors.studentInfo?.citizenship ||
                          "Select citizenship"
                        }
                        isClearable
                        // Gunakan prefix 'react-select' dan biarkan CSS global yang menghandle error
                        classNamePrefix={
                          errors.studentInfo?.citizenship
                            ? "react-select-error"
                            : "react-select"
                        }
                      />
                    </div>
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.citizenship || "-"}
                    </b>
                  )}
                </div>
                {studentInfo.citizenship === "Indonesia" && (
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.nik ? styles.errorFieldWrapper : ""
                    }`}
                  >
                    <label
                      htmlFor="nik"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.nik ? styles.errorLabel : ""
                      }`}
                    >
                      NIK
                    </label>
                    {isEditing ? (
                      <div className={styles.inputWithError}>
                        <input
                          id="nik"
                          type="text"
                          name="nik"
                          value={studentInfo.nik || ""}
                          onChange={handleStudentInfoChange}
                          maxLength={16}
                          className={`${styles.formInput} ${
                            errors.studentInfo?.nik || validationMessages.nik
                              ? styles.errorInput
                              : ""
                          }`}
                          placeholder={
                            errors.studentInfo?.nik || "NIK (16 digits)"
                          }
                        />
                        {validationMessages.nik && (
                          <div className={styles.inlineErrorMessageRight}>
                            {validationMessages.nik}
                          </div>
                        )}
                      </div>
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.nik || "-"}
                      </b>
                    )}
                  </div>
                )}
                {studentInfo.citizenship === "Non Indonesia" && (
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.kitas ? styles.errorFieldWrapper : ""
                    }`}
                  >
                    <label
                      htmlFor="kitas"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.kitas ? styles.errorLabel : ""
                      }`}
                    >
                      KITAS
                    </label>
                    {isEditing ? (
                      <div className={styles.inputWithError}>
                        <input
                          id="kitas"
                          type="text"
                          name="kitas"
                          value={studentInfo.kitas || ""}
                          onChange={handleStudentInfoChange}
                          maxLength={16}
                          className={`${styles.formInput} ${
                            errors.studentInfo?.kitas ||
                            validationMessages.kitas
                              ? styles.errorInput
                              : ""
                          }`}
                          placeholder={
                            errors.studentInfo?.kitas ||
                            "KITAS (11-16 characters)"
                          }
                        />
                        {validationMessages.kitas && (
                          /* ===== UBAH CLASSNAME DI SINI ===== */
                          <div className={styles.inlineErrorMessageRight}>
                            {validationMessages.kitas}
                          </div>
                        )}
                      </div>
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.kitas || "-"}
                      </b>
                    )}
                  </div>
                )}
              </div>
              {studentInfo.citizenship === "Non Indonesia" && (
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="country" className={styles.fieldLabel}>
                      Country of origin
                    </label>
                    {isEditing ? (
                      <input
                        id="country"
                        type="text"
                        name="country"
                        value={studentInfo.country || ""}
                        onChange={handleStudentInfoChange}
                        className={styles.formInput}
                        placeholder="Country of origin"
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.country || "-"}
                      </b>
                    )}
                  </div>
                </div>
              )}
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.nisn ? styles.errorFieldWrapper : ""
                  }`}
                >
                  <label
                    htmlFor="nisn"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.nisn ? styles.errorLabel : ""
                    }`}
                  >
                    NISN
                  </label>
                  {isEditing ? (
                    <div className={styles.inputWithError}>
                      <input
                        id="nisn"
                        type="text"
                        name="nisn"
                        value={studentInfo.nisn || ""}
                        onChange={handleStudentInfoChange}
                        maxLength={10}
                        className={`${styles.formInput} ${
                          errors.studentInfo?.nisn || validationMessages.nisn
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.studentInfo?.nisn || "NISN (10 digits)"
                        }
                      />
                      {validationMessages.nisn && (
                        /* ===== UBAH CLASSNAME DI SINI ===== */
                        <div className={styles.inlineErrorMessageRight}>
                          {validationMessages.nisn}
                        </div>
                      )}
                    </div>
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.nisn || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.religion ? styles.errorFieldWrapper : ""
                  }`}
                >
                  <label
                    htmlFor="religion"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.religion ? styles.errorLabel : ""
                    }`}
                  >
                    Religion
                  </label>
                  {isEditing ? (
                    <input
                      id="religion"
                      type="text"
                      name="religion"
                      value={studentInfo.religion || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.religion ? styles.errorInput : ""
                      }`}
                      placeholder={errors.studentInfo?.religion || "Religion"}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.religion || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.place_of_birth
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="place_of_birth"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.place_of_birth
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Place of birth
                  </label>
                  {isEditing ? (
                    <input
                      id="place_of_birth"
                      type="text"
                      name="place_of_birth"
                      value={studentInfo.place_of_birth || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.place_of_birth
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.studentInfo?.place_of_birth || "Place of birth"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.place_of_birth || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.date_of_birth
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="date_of_birth"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.date_of_birth ? styles.errorLabel : ""
                    }`}
                  >
                    Date of birth
                  </label>
                  {isEditing ? (
                    <input
                      id="date_of_birth"
                      type="date"
                      name="date_of_birth"
                      value={formatDateForInput(studentInfo.date_of_birth)}
                      onChange={handleStudentInfoChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formatDateForDisplay(studentInfo.date_of_birth)}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.gender ? styles.errorFieldWrapper : ""
                  }`}
                >
                  <label
                    htmlFor="gender"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.gender ? styles.errorLabel : ""
                    }`}
                  >
                    Gender
                  </label>
                  {isEditing ? (
                    <div className={styles.selectWrapper}>
                      <Select
                        id="gender"
                        name="gender"
                        options={genderOptions}
                        value={
                          studentInfo.gender
                            ? {
                                value: studentInfo.gender,
                                label: studentInfo.gender,
                              }
                            : null
                        }
                        onChange={(opt) =>
                          handleStudentInfoSelectChange("gender", opt)
                        }
                        placeholder={
                          errors.studentInfo?.gender || "Select gender"
                        }
                        isClearable
                        classNamePrefix={
                          errors.studentInfo?.gender
                            ? "react-select-error"
                            : "react-select"
                        }
                      />
                    </div>
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.gender || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.family_rank
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="family_rank"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.family_rank ? styles.errorLabel : ""
                    }`}
                  >
                    Rank in the family
                  </label>
                  {isEditing ? (
                    <input
                      id="family_rank"
                      type="number"
                      name="family_rank"
                      value={studentInfo.family_rank || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.family_rank ? styles.errorInput : ""
                      }`}
                      placeholder={errors.studentInfo?.family_rank || "Rank"}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.family_rank || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.email ? styles.errorFieldWrapper : ""
                  }`}
                >
                  <label
                    htmlFor="email"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.email ? styles.errorLabel : ""
                    }`}
                  >
                    Email address
                  </label>
                  {isEditing ? (
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={studentInfo.email || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.email ? styles.errorInput : ""
                      }`}
                      placeholder={errors.studentInfo?.email || "Email Address"}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.email || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.previous_school
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="previous_school"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.previous_school
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Previous School
                  </label>
                  {isEditing ? (
                    <input
                      id="previous_school"
                      type="text"
                      name="previous_school"
                      value={studentInfo.previous_school || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.previous_school
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.studentInfo?.previous_school || "Previous School"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.previous_school || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.phone_number
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="phone_number"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.phone_number ? styles.errorLabel : ""
                    }`}
                  >
                    Phone number
                  </label>
                  {isEditing ? (
                    <input
                      id="phone_number"
                      type="tel"
                      name="phone_number"
                      value={studentInfo.phone_number || ""}
                      onChange={handleStudentInfoChange}
                      className={`${styles.formInput} ${
                        errors.studentInfo?.phone_number
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.studentInfo?.phone_number || "Phone Number"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.phone_number || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.studentInfo?.academic_status
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="academic_status"
                    className={`${styles.fieldLabel} ${
                      errors.studentInfo?.academic_status
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Academic status
                  </label>
                  {isEditing ? (
                    <div className={styles.academicStatusWrapper}>
                      <div className={styles.selectWrapper}>
                        <Select
                          id="academic_status"
                          name="academic_status"
                          options={academicStatusOptions}
                          value={
                            studentInfo.academic_status
                              ? {
                                  value: studentInfo.academic_status,
                                  label: studentInfo.academic_status,
                                }
                              : null
                          }
                          onChange={(opt) =>
                            handleStudentInfoSelectChange(
                              "academic_status",
                              opt
                            )
                          }
                          placeholder={
                            errors.studentInfo?.academic_status ||
                            "Select status"
                          }
                          isClearable
                          classNamePrefix={
                            errors.studentInfo?.academic_status
                              ? "react-select-error"
                              : "react-select"
                          }
                        />
                      </div>
                      {studentInfo.academic_status === "OTHER" && (
                        <input
                          type="text"
                          name="academic_status_other"
                          value={studentInfo.academic_status_other || ""}
                          onChange={handleStudentInfoChange}
                          className={`${styles.formInput} ${styles.otherInput}`}
                          placeholder="Please specify"
                        />
                      )}
                    </div>
                  ) : (
                    <b className={styles.fieldValue}>
                      {studentInfo.academic_status_other ||
                        studentInfo.academic_status ||
                        "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.street ? styles.errorFieldWrapper : ""
                    }`}
                  >
                    <label
                      htmlFor="street"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.street ? styles.errorLabel : ""
                      }`}
                    >
                      Street
                    </label>
                    {isEditing ? (
                      <input
                        id="street"
                        type="text"
                        name="street"
                        value={studentInfo.street || ""}
                        onChange={handleStudentInfoChange}
                        className={`${styles.formInput} ${
                          errors.studentInfo?.street ? styles.errorInput : ""
                        }`}
                        placeholder={errors.studentInfo?.street || "Street"}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <label htmlFor="rt" className={styles.fieldLabel}>
                        RT
                      </label>
                      {isEditing ? (
                        <input
                          id="rt"
                          type="text"
                          name="rt"
                          value={studentInfo.rt || ""}
                          onChange={handleStudentInfoChange}
                          className={styles.formInput}
                          placeholder="RT"
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {studentInfo.rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label htmlFor="rw" className={styles.fieldLabel}>
                        RW
                      </label>
                      {isEditing ? (
                        <input
                          id="rw"
                          type="text"
                          name="rw"
                          value={studentInfo.rw || ""}
                          onChange={handleStudentInfoChange}
                          className={styles.formInput}
                          placeholder="RW"
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {studentInfo.rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.village
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="village"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.village ? styles.errorLabel : ""
                      }`}
                    >
                      Village
                    </label>
                    {isEditing ? (
                      <input
                        id="village"
                        type="text"
                        name="village"
                        value={studentInfo.village || ""}
                        onChange={handleStudentInfoChange}
                        className={`${styles.formInput} ${
                          errors.studentInfo?.village ? styles.errorInput : ""
                        }`}
                        placeholder={errors.studentInfo?.village || "Village"}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.village || "-"}
                      </b>
                    )}
                  </div>
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.district
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="district"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.district ? styles.errorLabel : ""
                      }`}
                    >
                      District
                    </label>
                    {isEditing ? (
                      <input
                        id="district"
                        type="text"
                        name="district"
                        value={studentInfo.district || ""}
                        onChange={handleStudentInfoChange}
                        className={`${styles.formInput} ${
                          errors.studentInfo?.district ? styles.errorInput : ""
                        }`}
                        placeholder={errors.studentInfo?.district || "District"}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.city_regency
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="city_regency"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.city_regency
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      City/Regency
                    </label>
                    {isEditing ? (
                      <input
                        id="city_regency"
                        type="text"
                        name="city_regency"
                        value={studentInfo.city_regency || ""}
                        onChange={handleStudentInfoChange}
                        className={`${styles.formInput} ${
                          errors.studentInfo?.city_regency
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.studentInfo?.city_regency || "City/Regency"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div
                    className={`${styles.field} ${
                      errors.studentInfo?.province
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="province"
                      className={`${styles.fieldLabel} ${
                        errors.studentInfo?.province ? styles.errorLabel : ""
                      }`}
                    >
                      Province
                    </label>
                    {isEditing ? (
                      <input
                        id="province"
                        type="text"
                        name="province"
                        value={studentInfo.province || ""}
                        onChange={handleStudentInfoChange}
                        className={`${styles.formInput} ${
                          errors.studentInfo?.province ? styles.errorInput : ""
                        }`}
                        placeholder={errors.studentInfo?.province || "Province"}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {studentInfo.province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="other"
                      value={studentInfo.other || ""}
                      onChange={handleStudentInfoChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <div
                      className={`${styles.formInput} ${styles.visualInput}`}
                    >
                      {studentInfo.other || "-"}
                    </div>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
            </div>
          </div>

          {/* PROGRAM */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>PROGRAM</b>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Section</div>
                {options?.sections.map((sec) => (
                  <RadioDisplay
                    key={sec.section_id}
                    label={sec.name}
                    isSelected={
                      String(formData.section_id) === String(sec.section_id)
                    }
                    isEditing={false} // <-- DIUBAH MENJADI STATIS
                    name="section_id"
                    value={sec.section_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Grade</div>
                  {/* HANYA MENAMPILKAN MODE VISUAL, TIDAK ADA MODE EDIT */}
                  <b className={styles.fieldValue}>
                    {getNameById("classes", formData.class_id)}
                  </b>
                </div>
                {/* Logika untuk menampilkan major tetap ada, tapi field-nya statis */}
                {showMajorField && (
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Major</div>
                    {/* HANYA MENAMPILKAN MODE VISUAL, TIDAK ADA MODE EDIT */}
                    <b className={styles.fieldValue}>
                      {getNameById("majors", formData.major_id)}
                    </b>
                  </div>
                )}
              </div>
              <div className={styles.optionsRow}>
                <div className={styles.optionLabel}>Program</div>
                {options?.programs.map((prog) => (
                  <RadioDisplay
                    key={prog.program_id}
                    label={prog.name}
                    isSelected={
                      String(formData.program_id) === String(prog.program_id)
                    }
                    isEditing={false} // <-- DIUBAH MENJADI STATIS
                    name="program_id"
                    value={prog.program_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* FACILITIES */}
          <div id="facilities" className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>FACILITIES</b>
            </div>
            <div className={styles.sectionContent}>
              <div className={styles.optionsRow}>
                <div
                  className={`${styles.optionLabel} ${
                    errors.facilities?.transportation_id
                      ? styles.errorLabel
                      : ""
                  }`}
                >
                  Transportation
                </div>
                {options?.transportations.map((t) => (
                  <RadioDisplay
                    key={t.transport_id}
                    label={t.type}
                    isSelected={
                      String(formData.transportation_id) ===
                      String(t.transport_id)
                    }
                    isEditing={isEditing}
                    name="transportation_id"
                    value={t.transport_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
              {errors.facilities?.transportation_id && (
                <div className={styles.inlineErrorMessageFullWidth}>
                  {errors.facilities.transportation_id}
                </div>
              )}

              {/* ===== BLOK BARU UNTUK PICKUP POINT & CUSTOM PICKUP POINT ===== */}
              {/* Tampilkan blok ini hanya jika transportasi dipilih & bukan 'Own car' */}
              {formData.transportation_id &&
                selectedTransportType.toLowerCase() !== "own car" && (
                  <>
                    {/* Dropdown Pickup Point */}
                    <div className={styles.optionsRow}>
                      <div className={styles.field} style={{ flexGrow: 2 }}>
                        <div className={styles.fieldLabel}>Pickup point</div>
                        {isEditing ? (
                          <select
                            name="pickup_point_id"
                            value={formData.pickup_point_id || ""}
                            onChange={handleChange}
                            className={styles.formInput}
                            // Nonaktifkan jika custom pickup point sedang diisi
                            disabled={!!formData.pickup_point_custom}
                          >
                            <option value="">Select pickup point</option>
                            {options?.pickup_points.map((opt) => (
                              <option
                                key={opt.pickup_point_id}
                                value={opt.pickup_point_id}
                              >
                                {opt.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <b className={styles.fieldValue}>
                            {getNameById(
                              "pickup_points",
                              formData.pickup_point_id
                            ) || "-"}
                          </b>
                        )}
                      </div>
                    </div>

                    {/* Custom Pickup Point */}
                    <div className={styles.optionsRow}>
                      <div className={styles.field} style={{ flexGrow: 2 }}>
                        <div className={styles.fieldLabel}>
                          Custom Pickup point
                        </div>
                        {isEditing ? (
                          <input
                            type="text"
                            name="pickup_point_custom"
                            value={formData.pickup_point_custom || ""}
                            onChange={handleChange}
                            className={styles.formInput}
                            // Nonaktifkan jika dropdown pickup point sudah dipilih
                            disabled={!!formData.pickup_point_id}
                            placeholder="Enter custom pickup location"
                          />
                        ) : (
                          <b className={styles.fieldValue}>
                            {formData.pickup_point_custom || "-"}
                          </b>
                        )}
                      </div>
                    </div>
                  </>
                )}

              <div className={styles.optionsRow}>
                <CheckboxDisplay
                  label="Transportation Policy"
                  isSelected={formData.transportation_policy === "Signed"}
                  isEditing={isEditing}
                  name="transportation_policy"
                  onChange={handleChange}
                />
                {errors.facilities?.transportation_policy && (
                  <div className={styles.inlineErrorMessage}>
                    {errors.facilities.transportation_policy}
                  </div>
                )}
              </div>

              <div className={styles.optionsRow}>
                <div
                  className={`${styles.optionLabel} ${
                    errors.facilities?.residence_id ? styles.errorLabel : ""
                  }`}
                >
                  Residence Hall
                </div>
                {filteredResidenceHalls.map((r) => (
                  <RadioDisplay
                    key={r.residence_id}
                    label={r.type}
                    isSelected={
                      String(formData.residence_id) === String(r.residence_id)
                    }
                    isEditing={isEditing}
                    name="residence_id"
                    value={r.residence_id}
                    onChange={handleRadioChange}
                  />
                ))}
              </div>
              {errors.facilities?.residence_id && (
                <div className={styles.inlineErrorMessageFullWidth}>
                  {errors.facilities.residence_id}
                </div>
              )}

              <div className={styles.optionsRow}>
                <CheckboxDisplay
                  label="Residence Hall Policy"
                  isSelected={formData.residence_hall_policy === "Signed"}
                  isEditing={isEditing}
                  name="residence_hall_policy"
                  onChange={handleChange}
                />
                {errors.facilities?.residence_hall_policy && (
                  <div className={styles.inlineErrorMessage}>
                    {errors.facilities.residence_hall_policy}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* PARENT / GUARDIAN INFORMATION */}
          <div id="parentGuardian" className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>PARENT / GUARDIAN INFORMATION</b>
            </div>
            <div className={styles.sectionContent}>
              <b>Father's Information</b>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.parentGuardian?.father_name
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="father_name"
                    className={`${styles.fieldLabel} ${
                      errors.parentGuardian?.father_name
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      id="father_name"
                      type="text"
                      name="father_name"
                      value={formData.father_name || ""}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.parentGuardian?.father_name
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.parentGuardian?.father_name
                          ? errors.parentGuardian.father_name
                          : "Father's Name"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_name || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="father_company" className={styles.fieldLabel}>
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      id="father_company"
                      type="text"
                      name="father_company"
                      value={formData.father_company || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Company Name"
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_company || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <label
                    htmlFor="father_occupation"
                    className={styles.fieldLabel}
                  >
                    Occupation/Position
                  </label>
                  {isEditing ? (
                    <input
                      id="father_occupation"
                      type="text"
                      name="father_occupation"
                      value={formData.father_occupation || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Occupation/Position"
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_occupation || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.parentGuardian?.father_phone
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="father_phone"
                    className={`${styles.fieldLabel} ${
                      errors.parentGuardian?.father_phone
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      id="father_phone"
                      type="tel"
                      name="father_phone"
                      value={formData.father_phone || ""}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.parentGuardian?.father_phone
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.parentGuardian?.father_phone
                          ? errors.parentGuardian.father_phone
                          : "Phone Number"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_phone || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.parentGuardian?.father_email
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="father_email"
                    className={`${styles.fieldLabel} ${
                      errors.parentGuardian?.father_email
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      id="father_email"
                      type="email"
                      name="father_email"
                      value={formData.father_email || ""}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.parentGuardian?.father_email
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.parentGuardian?.father_email
                          ? errors.parentGuardian.father_email
                          : "Email"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.father_email || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.father_address_street
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="father_address_street"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.father_address_street
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      Street
                    </label>
                    {isEditing ? (
                      <input
                        id="father_address_street"
                        type="text"
                        name="father_address_street"
                        value={formData.father_address_street || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.father_address_street
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.father_address_street
                            ? errors.parentGuardian.father_address_street
                            : "Street"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <label
                        htmlFor="father_address_rt"
                        className={styles.fieldLabel}
                      >
                        RT
                      </label>
                      {isEditing ? (
                        <input
                          id="father_address_rt"
                          type="text"
                          name="father_address_rt"
                          value={formData.father_address_rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="RT"
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.father_address_rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label
                        htmlFor="father_address_rw"
                        className={styles.fieldLabel}
                      >
                        RW
                      </label>
                      {isEditing ? (
                        <input
                          id="father_address_rw"
                          type="text"
                          name="father_address_rw"
                          value={formData.father_address_rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="RW"
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.father_address_rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.father_address_village
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="father_address_village"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.father_address_village
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      Village
                    </label>
                    {isEditing ? (
                      <input
                        id="father_address_village"
                        type="text"
                        name="father_address_village"
                        value={formData.father_address_village || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.father_address_village
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.father_address_village
                            ? errors.parentGuardian.father_address_village
                            : "Village"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_village || "-"}
                      </b>
                    )}
                  </div>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.father_address_district
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="father_address_district"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.father_address_district
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      District
                    </label>
                    {isEditing ? (
                      <input
                        id="father_address_district"
                        type="text"
                        name="father_address_district"
                        value={formData.father_address_district || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.father_address_district
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.father_address_district
                            ? errors.parentGuardian.father_address_district
                            : "District"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.father_address_city_regency
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="father_address_city_regency"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.father_address_city_regency
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      City/Regency
                    </label>
                    {isEditing ? (
                      <input
                        id="father_address_city_regency"
                        type="text"
                        name="father_address_city_regency"
                        value={formData.father_address_city_regency || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.father_address_city_regency
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.father_address_city_regency
                            ? errors.parentGuardian.father_address_city_regency
                            : "City/Regency"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.father_address_province
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="father_address_province"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.father_address_province
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      Province
                    </label>
                    {isEditing ? (
                      <input
                        id="father_address_province"
                        type="text"
                        name="father_address_province"
                        value={formData.father_address_province || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.father_address_province
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.father_address_province
                            ? errors.parentGuardian.father_address_province
                            : "Province"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.father_address_province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="father_address_other"
                      value={formData.father_address_other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Other address details"
                    />
                  ) : (
                    <div
                      className={`${styles.formInput} ${styles.visualInput}`}
                    >
                      {formData.father_address_other || "-"}
                    </div>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
              <b>Mother's Information</b>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.parentGuardian?.mother_name
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="mother_name"
                    className={`${styles.fieldLabel} ${
                      errors.parentGuardian?.mother_name
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Name
                  </label>
                  {isEditing ? (
                    <input
                      id="mother_name"
                      type="text"
                      name="mother_name"
                      value={formData.mother_name || ""}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.parentGuardian?.mother_name
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.parentGuardian?.mother_name
                          ? errors.parentGuardian.mother_name
                          : "Mother's Name"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_name || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <label htmlFor="mother_company" className={styles.fieldLabel}>
                    Company Name
                  </label>
                  {isEditing ? (
                    <input
                      id="mother_company"
                      type="text"
                      name="mother_company"
                      value={formData.mother_company || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Company Name"
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_company || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <label
                    htmlFor="mother_occupation"
                    className={styles.fieldLabel}
                  >
                    Occupation/Position
                  </label>
                  {isEditing ? (
                    <input
                      id="mother_occupation"
                      type="text"
                      name="mother_occupation"
                      value={formData.mother_occupation || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Occupation/Position"
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_occupation || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div
                  className={`${styles.field} ${
                    errors.parentGuardian?.mother_phone
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="mother_phone"
                    className={`${styles.fieldLabel} ${
                      errors.parentGuardian?.mother_phone
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      id="mother_phone"
                      type="tel"
                      name="mother_phone"
                      value={formData.mother_phone || ""}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.parentGuardian?.mother_phone
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.parentGuardian?.mother_phone
                          ? errors.parentGuardian.mother_phone
                          : "Phone Number"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_phone || "-"}
                    </b>
                  )}
                </div>
                <div
                  className={`${styles.field} ${
                    errors.parentGuardian?.mother_email
                      ? styles.errorFieldWrapper
                      : ""
                  }`}
                >
                  <label
                    htmlFor="mother_email"
                    className={`${styles.fieldLabel} ${
                      errors.parentGuardian?.mother_email
                        ? styles.errorLabel
                        : ""
                    }`}
                  >
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      id="mother_email"
                      type="email"
                      name="mother_email"
                      value={formData.mother_email || ""}
                      onChange={handleChange}
                      className={`${styles.formInput} ${
                        errors.parentGuardian?.mother_email
                          ? styles.errorInput
                          : ""
                      }`}
                      placeholder={
                        errors.parentGuardian?.mother_email
                          ? errors.parentGuardian.mother_email
                          : "Email"
                      }
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.mother_email || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.mother_address_street
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="mother_address_street"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.mother_address_street
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      Street
                    </label>
                    {isEditing ? (
                      <input
                        id="mother_address_street"
                        type="text"
                        name="mother_address_street"
                        value={formData.mother_address_street || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.mother_address_street
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.mother_address_street
                            ? errors.parentGuardian.mother_address_street
                            : "Street"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <label
                        htmlFor="mother_address_rt"
                        className={styles.fieldLabel}
                      >
                        RT
                      </label>
                      {isEditing ? (
                        <input
                          id="mother_address_rt"
                          type="text"
                          name="mother_address_rt"
                          value={formData.mother_address_rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="RT"
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.mother_address_rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <label
                        htmlFor="mother_address_rw"
                        className={styles.fieldLabel}
                      >
                        RW
                      </label>
                      {isEditing ? (
                        <input
                          id="mother_address_rw"
                          type="text"
                          name="mother_address_rw"
                          value={formData.mother_address_rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                          placeholder="RW"
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.mother_address_rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.mother_address_village
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="mother_address_village"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.mother_address_village
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      Village
                    </label>
                    {isEditing ? (
                      <input
                        id="mother_address_village"
                        type="text"
                        name="mother_address_village"
                        value={formData.mother_address_village || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.mother_address_village
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.mother_address_village
                            ? errors.parentGuardian.mother_address_village
                            : "Village"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_village || "-"}
                      </b>
                    )}
                  </div>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.mother_address_district
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="mother_address_district"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.mother_address_district
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      District
                    </label>
                    {isEditing ? (
                      <input
                        id="mother_address_district"
                        type="text"
                        name="mother_address_district"
                        value={formData.mother_address_district || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.mother_address_district
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.mother_address_district
                            ? errors.parentGuardian.mother_address_district
                            : "District"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.mother_address_city_regency
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="mother_address_city_regency"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.mother_address_city_regency
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      City/Regency
                    </label>
                    {isEditing ? (
                      <input
                        id="mother_address_city_regency"
                        type="text"
                        name="mother_address_city_regency"
                        value={formData.mother_address_city_regency || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.mother_address_city_regency
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.mother_address_city_regency
                            ? errors.parentGuardian.mother_address_city_regency
                            : "City/Regency"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div
                    className={`${styles.field} ${
                      errors.parentGuardian?.mother_address_province
                        ? styles.errorFieldWrapper
                        : ""
                    }`}
                  >
                    <label
                      htmlFor="mother_address_province"
                      className={`${styles.fieldLabel} ${
                        errors.parentGuardian?.mother_address_province
                          ? styles.errorLabel
                          : ""
                      }`}
                    >
                      Province
                    </label>
                    {isEditing ? (
                      <input
                        id="mother_address_province"
                        type="text"
                        name="mother_address_province"
                        value={formData.mother_address_province || ""}
                        onChange={handleChange}
                        className={`${styles.formInput} ${
                          errors.parentGuardian?.mother_address_province
                            ? styles.errorInput
                            : ""
                        }`}
                        placeholder={
                          errors.parentGuardian?.mother_address_province
                            ? errors.parentGuardian.mother_address_province
                            : "Province"
                        }
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.mother_address_province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="mother_address_other"
                      value={formData.mother_address_other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                      placeholder="Other address details"
                    />
                  ) : (
                    <div
                      className={`${styles.formInput} ${styles.visualInput}`}
                    >
                      {formData.mother_address_other || "-"}
                    </div>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
              <b>Authorized Guardian's Information</b>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Name</div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="guardian_name"
                      value={formData.guardian_name || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_name || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>
                    Relationship to student
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      name="relation_to_student"
                      value={formData.relation_to_student || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.relation_to_student || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone Number</div>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="guardian_phone"
                      value={formData.guardian_phone || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_phone || "-"}
                    </b>
                  )}
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Email</div>
                  {isEditing ? (
                    <input
                      type="email"
                      name="guardian_email"
                      value={formData.guardian_email || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <b className={styles.fieldValue}>
                      {formData.guardian_email || "-"}
                    </b>
                  )}
                </div>
              </div>
              <div className={styles.addressGroup}>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Street</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_street"
                        value={formData.guardian_address_street || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_street || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.rtRwGroup}>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RT</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="guardian_address_rt"
                          value={formData.guardian_address_rt || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.guardian_address_rt || "-"}
                        </b>
                      )}
                    </div>
                    <div className={styles.field}>
                      <div className={styles.fieldLabel}>RW</div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="guardian_address_rw"
                          value={formData.guardian_address_rw || ""}
                          onChange={handleChange}
                          className={styles.formInput}
                        />
                      ) : (
                        <b className={styles.fieldValue}>
                          {formData.guardian_address_rw || "-"}
                        </b>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Village</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_village"
                        value={formData.guardian_address_village || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_village || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>District</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_district"
                        value={formData.guardian_address_district || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_district || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>City/Regency</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_city_regency"
                        value={formData.guardian_address_city_regency || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_city_regency || "-"}
                      </b>
                    )}
                  </div>
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Province</div>
                    {isEditing ? (
                      <input
                        type="text"
                        name="guardian_address_province"
                        value={formData.guardian_address_province || ""}
                        onChange={handleChange}
                        className={styles.formInput}
                      />
                    ) : (
                      <b className={styles.fieldValue}>
                        {formData.guardian_address_province || "-"}
                      </b>
                    )}
                  </div>
                </div>
                <div className={styles.otherAddress}>
                  <span className={styles.fieldLabel}>Other: (</span>
                  {isEditing ? (
                    <input
                      type="text"
                      name="guardian_address_other"
                      value={formData.guardian_address_other || ""}
                      onChange={handleChange}
                      className={styles.formInput}
                    />
                  ) : (
                    <div
                      className={`${styles.formInput} ${styles.visualInput}`}
                    >
                      {formData.guardian_address_other || "-"}
                    </div>
                  )}
                  <span className={styles.fieldLabel}>)</span>
                </div>
              </div>
            </div>
          </div>

          {/* TERM OF PAYMENT */}
          <div className={styles.infoSection}>
            <div className={styles.sectionHeader}>
              <b>TERM OF PAYMENT</b>
            </div>
            <div className={styles.paymentContentWrapper}>
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>Tuition Fee</div>
                <div className={styles.paymentOptionGroup}>
                  {options?.tuition_fees?.map((option) => (
                    <RadioDisplay
                      key={option}
                      label={option}
                      isSelected={formData.tuition_fees === option}
                      isEditing={false} // <-- DIUBAH MENJADI STATIS
                      name="tuition_fees"
                      value={option}
                      onChange={handleRadioChange}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>Residence Hall</div>
                <div className={styles.paymentOptionGroup}>
                  {options?.residence_payment?.map((option) => (
                    <RadioDisplay
                      key={option}
                      label={option}
                      isSelected={formData.residence_payment === option}
                      isEditing={false} // <-- DIUBAH MENJADI STATIS
                      name="residence_payment"
                      value={option}
                      onChange={handleRadioChange}
                    />
                  ))}
                </div>
              </div>
              <div className={styles.paymentSection}>
                <div className={styles.paymentTitle}>
                  Financial Policy & Contract
                </div>
                <div className={styles.paymentOptionGroup}>
                  <CheckboxDisplay
                    label="Agree"
                    isSelected={formData.financial_policy_contract === "Signed"}
                    isEditing={false} // <-- DIUBAH MENJADI STATIS
                    name="financial_policy_contract"
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
            <div className={styles.discountSection}>
              <div className={styles.paymentTitle}>Discount</div>
              <div className={styles.row}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Discount</div>
                  {/* HANYA MENAMPILKAN MODE VISUAL, TIDAK ADA MODE EDIT */}
                  <b className={styles.fieldValue}>
                    {formData.discount_name || "-"}
                  </b>
                </div>

                {formData.discount_name && (
                  <div className={styles.field}>
                    <div className={styles.fieldLabel}>Notes</div>
                    {/* HANYA MENAMPILKAN MODE VISUAL, TIDAK ADA MODE EDIT */}
                    <b className={styles.fieldValue}>
                      {formData.discount_notes || "-"}
                    </b>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <ConfirmUpdatePopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)} // Fungsi untuk menutup popup (tombol cancel)
        onConfirm={handleConfirmUpdate} // Fungsi untuk konfirmasi update
        isUpdating={isUpdating}
      />

      <UpdatedNotification
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export default StudentProfile;
