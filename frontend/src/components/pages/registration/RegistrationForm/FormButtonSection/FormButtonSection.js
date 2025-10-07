import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import PopUpConfirm from "../PopUp/PopUpConfirm";
import styles from "./FormButtonSection.module.css";
import DuplicateStudentPopup from "../PopUp/DuplicateStudentPopup";
import Button from "../../../../atoms/Button";

const FormButtonSection = ({
  validationState,
  onSetErrors,
  draftId,
  allFormData,
  onReset,
  location,
  sharedData,
}) => {
  const navigate = useNavigate();
  // eslint-disable-next-line
  const locationState = useLocation();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showDuplicatePopup, setShowDuplicatePopup] = useState(false);

  const handleReset = () => {
    if (onReset) onReset();
  };

  const handleSubmit = () => {
    console.log("Data saat Submit:", JSON.stringify(allFormData, null, 2));

    // Debug: log semua data untuk memeriksa
    console.log("All Form Data:", allFormData);
    console.log("Validation State:", validationState);

    const errors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validasi Student Status Section
    if (
      !allFormData.studentStatus ||
      !allFormData.studentStatus.student_status
    ) {
      errors.studentStatus = { student_status: true };
    }

    // Validasi Student Information Section
    const studentInfo = allFormData.studentInfo || {};

    if (!studentInfo.first_name) {
      errors.studentInfo = { ...errors.studentInfo, first_name: true };
    }
    if (!studentInfo.nickname) {
      errors.studentInfo = { ...errors.studentInfo, nickname: true };
    }

    let isNisnRequired = true; // Asumsikan NISN selalu wajib secara default

    // Ambil data section dan class dari form
    const sectionId = allFormData.program?.section_id;
    const classId = allFormData.program?.class_id;

    if (sharedData && sectionId && classId) {
      const selectedSection = sharedData.sections?.find(
        (s) => s.section_id === sectionId
      );
      const selectedClass = sharedData.classes?.find(
        (c) => c.class_id === classId
      );

      if (selectedSection) {
        // Kondisi 1: Jika section adalah 'ECP', NISN tidak wajib
        if (selectedSection.name === "ECP") {
          isNisnRequired = false;
        }
        // Kondisi 2: Jika section adalah 'Elementary School' DAN grade adalah '1' atau '2', NISN tidak wajib
        else if (
          selectedSection.name === "Elementary School" &&
          selectedClass &&
          ["1", "2"].includes(selectedClass.grade)
        ) {
          isNisnRequired = false;
        }
      }
    }

    // Lakukan validasi HANYA jika isNisnRequired adalah true
    const nisnAsString = String(studentInfo.nisn || "").trim();
    if (
      isNisnRequired &&
      (!nisnAsString ||
        nisnAsString.length !== 10 ||
        !/^\d+$/.test(nisnAsString))
    ) {
      errors.studentInfo = { ...errors.studentInfo, nisn: true };
    } else if (
      !isNisnRequired &&
      nisnAsString &&
      (nisnAsString.length !== 10 || !/^\d+$/.test(nisnAsString))
    ) {
      // Jika tidak wajib tapi diisi, formatnya harus tetap benar
      errors.studentInfo = { ...errors.studentInfo, nisn: true };
    }

    // Validasi NIK hanya jika citizenship = "Indonesia"
    const nikAsString = String(studentInfo.nik || "").trim();
    if (studentInfo.citizenship === "Indonesia") {
      if (
        !nikAsString ||
        nikAsString.length !== 16 ||
        !/^\d+$/.test(nikAsString)
      ) {
        errors.studentInfo = { ...errors.studentInfo, nik: true };
      }
    }

    // Validasi KITAS hanya jika citizenship = "Non Indonesia" (country tidak required)
    const kitasAsString = String(studentInfo.kitas || "").trim();
    if (studentInfo.citizenship === "Non Indonesia") {
      if (
        !kitasAsString ||
        kitasAsString.length < 11 ||
        kitasAsString.length > 16
      ) {
        errors.studentInfo = { ...errors.studentInfo, kitas: true };
      }
    }

    // Field lain yang selalu required
    if (!studentInfo.gender) {
      errors.studentInfo = { ...errors.studentInfo, gender: true };
    }
    if (!studentInfo.family_rank) {
      errors.studentInfo = { ...errors.studentInfo, family_rank: true };
    }
    if (
      studentInfo.citizenship === undefined ||
      studentInfo.citizenship === null
    ) {
      errors.studentInfo = { ...errors.studentInfo, citizenship: true };
    }
    if (!studentInfo.religion) {
      errors.studentInfo = { ...errors.studentInfo, religion: true };
    }
    if (!studentInfo.place_of_birth) {
      errors.studentInfo = { ...errors.studentInfo, place_of_birth: true };
    }
    if (!studentInfo.date_of_birth) {
      errors.studentInfo = { ...errors.studentInfo, date_of_birth: true };
    }
    if (!studentInfo.email || !emailRegex.test(studentInfo.email)) {
      errors.studentInfo = { ...errors.studentInfo, email: true };
    }
    if (!studentInfo.phone_number) {
      errors.studentInfo = { ...errors.studentInfo, phone_number: true };
    }

    // Tambahkan kembali validasi academic status (required)
    if (!studentInfo.academic_status) {
      errors.studentInfo = { ...errors.studentInfo, academic_status: true };
    }

    if (!studentInfo.street) {
      errors.studentInfo = { ...errors.studentInfo, street: true };
    }
    if (!studentInfo.village) {
      errors.studentInfo = { ...errors.studentInfo, village: true };
    }
    if (!studentInfo.district) {
      errors.studentInfo = { ...errors.studentInfo, district: true };
    }
    if (!studentInfo.city_regency) {
      errors.studentInfo = { ...errors.studentInfo, city_regency: true };
    }
    if (!studentInfo.province) {
      errors.studentInfo = { ...errors.studentInfo, province: true };
    }

    // Validasi Program Section
    if (!allFormData.program || !allFormData.program.section_id) {
      errors.program = { ...errors.program, section_id: true };
    }

    if (!allFormData.program) {
      errors.program = { ...errors.program, program_id: true };
    } else {
      if (
        !allFormData.program.program_id &&
        !allFormData.program.program_other
      ) {
        // dua-duanya kosong → invalid
        errors.program = { ...errors.program, program_id: true };
      }

      if (
        allFormData.program.program_id === null &&
        !allFormData.program.program_other
      ) {
        errors.program = { ...errors.program, program_other: true };
      }
    }

    // Validasi Grade (class_id)
    if (!allFormData.program || !allFormData.program.class_id) {
      errors.program = { ...errors.program, class_id: true };
    }

    const needsMajor =
      allFormData.program &&
      [12, 13, 14, 15].includes(allFormData.program.class_id);
    if (needsMajor && !allFormData.program.major_id) {
      errors.program = { ...errors.program, major_id: true };
    }
    // Validasi Facilities Section
    if (!allFormData.facilities || !allFormData.facilities.residence_id) {
      errors.facilities = { ...errors.facilities, residence_id: true };
    }
    if (
      allFormData.facilities?.transportation_id &&
      allFormData.facilities.transportation_policy !== "Signed"
    ) {
      errors.facilities = { ...errors.facilities, transportation_policy: true };
    }
    if (
      !allFormData.facilities ||
      allFormData.facilities.residence_hall_policy !== "Signed"
    ) {
      errors.facilities = { ...errors.facilities, residence_hall_policy: true };
    }

    // Validasi Pickup Point jika School Bus dipilih
    if (
      sharedData &&
      allFormData.facilities &&
      allFormData.facilities.transportation_id
    ) {
      // Cari tipe transportasi yang dipilih dari sharedData
      const selectedTransportation = sharedData.transportations?.find(
        (t) => t.transport_id === allFormData.facilities.transportation_id
      );

      // Cek jika tipenya adalah "School bus" (gunakan toLowerCase untuk jaga-jaga)
      if (
        selectedTransportation &&
        selectedTransportation.type.toLowerCase().includes("school bus")
      ) {
        // Cek apakah pickup point (dropdown) atau custom pickup point (input) sudah diisi
        const pickupPointFilled = allFormData.facilities.pickup_point_id;
        const customPickupPointFilled =
          allFormData.facilities.pickup_point_custom &&
          allFormData.facilities.pickup_point_custom.trim() !== "";

        // Jika keduanya kosong, maka buat error
        if (!pickupPointFilled && !customPickupPointFilled) {
          errors.facilities = { ...errors.facilities, pickup_point_id: true };
        }
      }
    }

    // Validasi Parent Guardian Section
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_name
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, father_name: true };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_phone
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, father_phone: true };
    }

    const fatherEmail = allFormData.parentGuardian?.father_email;
    if (!fatherEmail || !emailRegex.test(fatherEmail)) {
      // Baris ini akan error jika email kosong ATAU formatnya salah
      errors.parentGuardian = { ...errors.parentGuardian, father_email: true };
    }

    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_street
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_street: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_village
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_village: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_district
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_district: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_city_regency
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_city_regency: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.father_address_province
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        father_address_province: true,
      };
    }

    // Validasi Mother fields
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_name
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, mother_name: true };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_name
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, mother_name: true };
    }

    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_phone
    ) {
      errors.parentGuardian = { ...errors.parentGuardian, mother_phone: true };
    }

    const motherEmail = allFormData.parentGuardian?.mother_email;
    if (!motherEmail || !emailRegex.test(motherEmail)) {
      // Baris ini akan error jika email kosong ATAU formatnya salah
      errors.parentGuardian = { ...errors.parentGuardian, mother_email: true };
    }

    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_street
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_street: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_village
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_village: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_district
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_district: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_city_regency
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_city_regency: true,
      };
    }
    if (
      !allFormData.parentGuardian ||
      !allFormData.parentGuardian.mother_address_province
    ) {
      errors.parentGuardian = {
        ...errors.parentGuardian,
        mother_address_province: true,
      };
    }

    // Validasi Term of Payment Section
    if (!allFormData.termOfPayment || !allFormData.termOfPayment.tuition_fees) {
      errors.termOfPayment = { ...errors.termOfPayment, tuition_fees: true };
    }
    if (
      !allFormData.termOfPayment ||
      !allFormData.termOfPayment.residence_payment
    ) {
      errors.termOfPayment = {
        ...errors.termOfPayment,
        residence_payment: true,
      };
    }

    // Debug: log errors
    console.log("Validation Errors:", errors);

    // Cek jika ada error
    const hasErrors = Object.values(errors).some(
      (sectionErrors) => sectionErrors && Object.keys(sectionErrors).length > 0
    );

    if (hasErrors) {
      if (onSetErrors) {
        // Langsung kirim seluruh objek errors dalam satu kali panggilan
        onSetErrors(errors);
      }
      return;
    }

    // Jika tidak ada error, tampilkan popup konfirmasi
    setShowConfirmation(true);
  };

  const handleCancelConfirmation = () => {
    setShowConfirmation(false);
  };

  const handleConfirmSubmit = () => {
    // Popup ditutup, data akan diproses di PopUpConfirm
    setShowConfirmation(false);
  };

  // BARU: Buat fungsi handler yang akan dipanggil jika backend menemukan duplikat
  const handleDuplicateFound = () => {
    // 1. Tutup popup konfirmasi yang sedang aktif
    setShowConfirmation(false);
    // 2. Tampilkan popup peringatan duplikat
    setShowDuplicatePopup(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.noteSection}>
        <div className={styles.noteLabel}>Note: </div>
        <div className={styles.noteText}>
          <span className={styles.noteContent}>
            Please make sure all the data above are accurate before pressing{" "}
          </span>
          <b>Done</b>
        </div>
        <div className={styles.noteText}>
          <span className={styles.noteContent}>
            Please keep in mind that this action cannot be{" "}
          </span>
          <b>undone</b>
          <span className={styles.noteContent}>.</span>
        </div>
      </div>
      <div className={styles.buttonSection}>
        <Button
          className={styles.resetButton}
          onClick={handleReset}
          variant="outline"
          type="button"
        >
          Reset
        </Button>
        <Button
          className={styles.submitButton}
          onClick={handleSubmit}
          variant="solid"
          type="button"
        >
          Submit
        </Button>
      </div>

      {showConfirmation && (
        <PopUpConfirm
          onCancel={handleCancelConfirmation}
          onConfirm={handleConfirmSubmit}
          draftId={draftId}
          allFormData={allFormData}
          locationState={location}
          navigate={navigate}
          onDuplicateFound={handleDuplicateFound}
        />
      )}
      {/* BARU: Tambahkan render kondisional untuk popup peringatan duplikat */}
      {showDuplicatePopup && (
        <DuplicateStudentPopup onClose={() => setShowDuplicatePopup(false)} />
      )}
    </div>
  );
};

export default FormButtonSection;
