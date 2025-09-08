import React, { useState } from "react";
import styles from "../styles/PopUpConfirm.module.css";
import { submitRegistrationForm } from "../../services/api";
import WrongSectionPopup from "./registration/WrongSectionPopup";

const PopUpConfirm = React.memo(
  ({
    onCancel,
    onConfirm,
    draftId,
    allFormData,
    navigate,
    onDuplicateFound,
  }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showWrongSectionPopup, setShowWrongSectionPopup] = useState(false);

    const handleConfirm = async () => {
      try {
        setIsSubmitting(true);
        const transformedData = transformFormData(allFormData);
        const response = await submitRegistrationForm(draftId, transformedData);

        if (response.success) {
          navigate("/print", {
            state: { applicationId: response.data.application_id },
          });
          onConfirm();
        } else {
          alert("Registration failed: " + (response.error || "Unknown error"));
        }
      } catch (error) {
        const errorMessage = error.response?.data?.error || "";
        const errorDetails = error.response?.data?.errors;
        const generalMessage = error.response?.data?.message;

        // Cek #1: Untuk error duplikat siswa
        if (errorMessage.includes("Student already exists")) {
          onDuplicateFound();
          // Di sini kita panggil onCancel karena DuplicateStudentPopup di-handle oleh parent
          onCancel();
          return;
        }

        // Cek #2: Untuk error salah section
        if (
          errorMessage.includes(
            "For different section, please register as New Student."
          )
        ) {
          setShowWrongSectionPopup(true);
          // onCancel(); // <-- BARIS INI DIHAPUS/DI-COMMENT
          return;
        }

        // Penanganan Error Umum (Generic)
        if (errorDetails) {
          const errorMessages = Object.values(errorDetails).flat().join(", ");
          alert("Validation errors: " + errorMessages);
        } else if (generalMessage) {
          alert("Registration failed: " + generalMessage);
        } else {
          alert(
            "Registration failed: " +
              (error.message || "An unknown error occurred.")
          );
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    const transformFormData = (formData) => {
      const studentStatus = formData.studentStatus?.student_status || "New";
      const inputName = formData.studentStatus?.input_name || "";

      if (studentStatus === "Old" && !inputName) {
        throw new Error("Student ID is required for Old student status");
      }

      const transformed = {
        student_status: studentStatus,
        input_name: inputName,
        first_name: formData.studentInfo?.first_name || "",
        middle_name: formData.studentInfo?.middle_name || "",
        last_name: formData.studentInfo?.last_name || "",
        nickname: formData.studentInfo?.nickname || "",
        citizenship: formData.studentInfo?.citizenship || "Indonesia",
        country:
          formData.studentInfo?.citizenship === "Non Indonesia"
            ? formData.studentInfo?.country || ""
            : null,
        religion: formData.studentInfo?.religion || "",
        place_of_birth: formData.studentInfo?.place_of_birth || "",
        date_of_birth: formData.studentInfo?.date_of_birth || "",
        email: formData.studentInfo?.email || "",
        phone_number: formData.studentInfo?.phone_number || "",
        previous_school: formData.studentInfo?.previous_school || "",
        academic_status: formData.studentInfo?.academic_status || "OTHER",
        academic_status_other:
          formData.studentInfo?.academic_status === "OTHER"
            ? formData.studentInfo?.academic_status_other || ""
            : null,
        gender: formData.studentInfo?.gender || "",
        family_rank: formData.studentInfo?.family_rank || "",
        age: formData.studentInfo?.age || "",
        nisn: formData.studentInfo?.nisn || "",
        nik: formData.studentInfo?.nik || null,
        kitas: formData.studentInfo?.kitas || null,
        street: formData.studentInfo?.street || "",
        rt: formData.studentInfo?.rt || "-",
        rw: formData.studentInfo?.rw || "-",
        village: formData.studentInfo?.village || "",
        district: formData.studentInfo?.district || "",
        city_regency: formData.studentInfo?.city_regency || "",
        province: formData.studentInfo?.province || "",
        other: formData.studentInfo?.other || null,
        section_id: parseInt(formData.program?.section_id, 10),
        program_id: parseInt(formData.program?.program_id, 10),
        class_id: parseInt(formData.program?.class_id, 10),
        major_id: parseInt(formData.program?.major_id, 10) || 1,
        program_other: formData.program?.program_other || null,
        transportation_id:
          parseInt(formData.facilities?.transportation_id, 10) || null,
        pickup_point_id: formData.facilities?.pickup_point_id
          ? parseInt(formData.facilities.pickup_point_id, 10)
          : null,
        pickup_point_custom: formData.facilities?.pickup_point_custom || null,
        transportation_policy:
          formData.facilities?.transportation_policy || "Not Signed",
        residence_id: parseInt(formData.facilities?.residence_id, 10) || 3,
        residence_hall_policy:
          formData.facilities?.residence_hall_policy || "Not Signed",
        father_name: formData.parentGuardian?.father_name || null,
        father_company: formData.parentGuardian?.father_company || null,
        father_occupation: formData.parentGuardian?.father_occupation || null,
        father_phone: formData.parentGuardian?.father_phone || null,
        father_email: formData.parentGuardian?.father_email || null,
        father_address_street:
          formData.parentGuardian?.father_address_street || null,
        father_address_rt: formData.parentGuardian?.father_address_rt || "-",
        father_address_rw: formData.parentGuardian?.father_address_rw || "-",
        father_address_village:
          formData.parentGuardian?.father_address_village || null,
        father_address_district:
          formData.parentGuardian?.father_address_district || null,
        father_address_city_regency:
          formData.parentGuardian?.father_address_city_regency || null,
        father_address_province:
          formData.parentGuardian?.father_address_province || null,
        father_address_other:
          formData.parentGuardian?.father_address_other || null,
        father_company_addresses:
          formData.parentGuardian?.father_company_addresses || null,
        mother_name: formData.parentGuardian?.mother_name || null,
        mother_company: formData.parentGuardian?.mother_company || null,
        mother_occupation: formData.parentGuardian?.mother_occupation || null,
        mother_phone: formData.parentGuardian?.mother_phone || null,
        mother_email: formData.parentGuardian?.mother_email || null,
        mother_address_street:
          formData.parentGuardian?.mother_address_street || null,
        mother_address_rt: formData.parentGuardian?.mother_address_rt || "-",
        mother_address_rw: formData.parentGuardian?.mother_address_rw || "-",
        mother_address_village:
          formData.parentGuardian?.mother_address_village || null,
        mother_address_district:
          formData.parentGuardian?.mother_address_district || null,
        mother_address_city_regency:
          formData.parentGuardian?.mother_address_city_regency || null,
        mother_address_province:
          formData.parentGuardian?.mother_address_province || null,
        mother_address_other:
          formData.parentGuardian?.mother_address_other || null,
        mother_company_addresses:
          formData.parentGuardian?.mother_company_addresses || null,
        guardian_name: formData.parentGuardian?.guardian_name || null,
        relation_to_student:
          formData.parentGuardian?.relation_to_student || null,
        guardian_phone: formData.parentGuardian?.guardian_phone || null,
        guardian_email: formData.parentGuardian?.guardian_email || null,
        guardian_address_street:
          formData.parentGuardian?.guardian_address_street || null,
        guardian_address_rt:
          formData.parentGuardian?.guardian_address_rt || "-",
        guardian_address_rw:
          formData.parentGuardian?.guardian_address_rw || "-",
        guardian_address_village:
          formData.parentGuardian?.guardian_address_village || null,
        guardian_address_district:
          formData.parentGuardian?.guardian_address_district || null,
        guardian_address_city_regency:
          formData.parentGuardian?.guardian_address_city_regency || null,
        guardian_address_province:
          formData.parentGuardian?.guardian_address_province || null,
        guardian_address_other:
          formData.parentGuardian?.guardian_address_other || null,
        tuition_fees: formData.termOfPayment?.tuition_fees || "",
        residence_payment: formData.termOfPayment?.residence_payment || "",
        financial_policy_contract:
          formData.termOfPayment?.financial_policy_contract || "Not Signed",
        discount_name: formData.termOfPayment?.discount_name || null,
        discount_notes: formData.termOfPayment?.discount_notes || null,
      };
      return transformed;
    };

    return (
      <>
        {showWrongSectionPopup && (
          <WrongSectionPopup onClose={() => onCancel()} />
        )}
        <div
          className={styles.overlay}
          // Sembunyikan popup konfirmasi jika popup error muncul
          style={{ visibility: showWrongSectionPopup ? "hidden" : "visible" }}
        >
          <div className={styles.popUpConfirm}>
            <div className={styles.confirmStudentInformation}>
              Confirm Student Information
            </div>
            <div className={styles.pleaseDoubleCheckThatContainer}>
              <p className={styles.pleaseDoubleCheckThat}>
                Please double-check that all the information you've entered is
                correct.
              </p>
              <p className={styles.pleaseDoubleCheckThat}>&nbsp;</p>
              <p className={styles.pleaseDoubleCheckThat}>
                Once submitted, changes may not be possible.
              </p>
            </div>
            <div className={styles.areYouSure}>
              Are you sure you want to continue?
            </div>
            <div className={styles.bAddSubjectParent}>
              <button
                className={styles.bAddSubject1}
                onClick={onCancel}
                type="button"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                className={styles.bAddSubject}
                onClick={handleConfirm}
                type="button"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Yes, I'm sure"}
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default PopUpConfirm;
