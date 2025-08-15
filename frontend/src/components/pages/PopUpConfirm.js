import React, { useState, useCallback, useMemo } from "react";
import styles from "../styles/PopUpConfirm.module.css";
import { submitRegistrationForm } from "../../services/api";

const PopUpConfirm = React.memo(
  ({ onCancel, onConfirm, draftId, allFormData, locationState, navigate }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Memoize the transform function to prevent infinite loops
    const transformFormData = useCallback((formData) => {
      console.log("Original form data:", formData);

      // Transform data sesuai dengan yang diharapkan backend
      const transformed = {
        // Student status - Perbaiki input_name logic
        student_status: formData.studentStatus?.student_status || "New",
        input_name:
          formData.studentStatus?.student_status === "Old"
            ? formData.studentStatus?.input_name || ""
            : "", // Ubah dari null ke empty string untuk konsistensi

        // Student information
        first_name: formData.studentInfo?.first_name || "",
        middle_name: formData.studentInfo?.middle_name || "",
        last_name: formData.studentInfo?.last_name || "",
        nickname: formData.studentInfo?.nickname || "",
        citizenship: formData.studentInfo?.citizenship || "Indonesia",
        country:
          formData.studentInfo?.citizenship === "Non Indonesia"
            ? formData.studentInfo?.country || ""
            : "",
        religion: formData.studentInfo?.religion || "",
        place_of_birth: formData.studentInfo?.place_of_birth || "",
        date_of_birth: formData.studentInfo?.date_of_birth || "",
        email: formData.studentInfo?.email || "",
        phone_number: formData.studentInfo?.phone_number || "",
        previous_school: formData.studentInfo?.previous_school || "",
        academic_status: formData.studentInfo?.academic_status || "REGULAR",
        academic_status_other:
          formData.studentInfo?.academic_status === "OTHER"
            ? formData.studentInfo?.academic_status_other || ""
            : "",
        gender: formData.studentInfo?.gender || "MALE",
        family_rank: formData.studentInfo?.family_rank || "",
        nisn: formData.studentInfo?.nisn || "",
        nik: formData.studentInfo?.nik || null,
        kitas: formData.studentInfo?.kitas || "",

        // Student address - Pastikan semua field terisi
        street: formData.studentInfo?.street || "",
        rt: formData.studentInfo?.rt || "",
        rw: formData.studentInfo?.rw || "",
        village: formData.studentInfo?.village || "",
        district: formData.studentInfo?.district || "",
        city_regency: formData.studentInfo?.city_regency || "", // Pastikan tidak null
        province: formData.studentInfo?.province || "",
        other: formData.studentInfo?.other || "",

        // Program, class, major - Pastikan semua integer
        section_id: parseInt(formData.program?.section_id) || 1,
        program_id: parseInt(formData.program?.program_id) || 1,
        class_id: parseInt(formData.program?.class_id) || 1,
        major_id: parseInt(formData.program?.major_id) || 1,
        program_other: formData.program?.program_other || "",

        // Facilities - Pastikan semua integer
        transportation_id:
          parseInt(formData.facilities?.transportation_id) || 1,
        pickup_point_id: formData.facilities?.pickup_point_id
          ? parseInt(formData.facilities.pickup_point_id)
          : null,
        pickup_point_custom: formData.facilities?.pickup_point_custom || "",
        transportation_policy:
          formData.facilities?.transportation_policy || "Not Signed",
        residence_id: parseInt(formData.facilities?.residence_id) || 1,
        residence_hall_policy:
          formData.facilities?.residence_hall_policy || "Not Signed",

        // Parent/Guardian (father)
        father_name: formData.parentGuardian?.father_name || "",
        father_company: formData.parentGuardian?.father_company || "",
        father_occupation: formData.parentGuardian?.father_occupation || "",
        father_phone: formData.parentGuardian?.father_phone || "",
        father_email: formData.parentGuardian?.father_email || "",
        father_address_street:
          formData.parentGuardian?.father_address_street || "",
        father_address_rt: formData.parentGuardian?.father_address_rt || "",
        father_address_rw: formData.parentGuardian?.father_address_rw || "",
        father_address_village:
          formData.parentGuardian?.father_address_village || "",
        father_address_district:
          formData.parentGuardian?.father_address_district || "",
        father_address_city_regency:
          formData.parentGuardian?.father_address_city_regency || "",
        father_address_province:
          formData.parentGuardian?.father_address_province || "",
        father_address_other:
          formData.parentGuardian?.father_address_other || "",
        father_company_addresses:
          formData.parentGuardian?.father_company_addresses || "",

        // Parent/Guardian (mother) - Perbaiki email validation
        mother_name: formData.parentGuardian?.mother_name || "",
        mother_company: formData.parentGuardian?.mother_company || "",
        mother_occupation: formData.parentGuardian?.mother_occupation || "",
        mother_phone: formData.parentGuardian?.mother_phone || "",
        mother_email:
          formData.parentGuardian?.mother_email &&
          formData.parentGuardian?.mother_email.trim() !== ""
            ? formData.parentGuardian?.mother_email
            : null, // Set null jika kosong atau whitespace
        mother_address_street:
          formData.parentGuardian?.mother_address_street || "",
        mother_address_rt: formData.parentGuardian?.mother_address_rt || "",
        mother_address_rw: formData.parentGuardian?.mother_address_rw || "",
        mother_address_village:
          formData.parentGuardian?.mother_address_village || "",
        mother_address_district:
          formData.parentGuardian?.mother_address_district || "",
        mother_address_city_regency:
          formData.parentGuardian?.mother_address_city_regency || "",
        mother_address_province:
          formData.parentGuardian?.mother_address_province || "",
        mother_address_other:
          formData.parentGuardian?.mother_address_other || "",
        mother_company_addresses:
          formData.parentGuardian?.mother_company_addresses || "",

        // Guardian
        guardian_name: formData.parentGuardian?.guardian_name || "",
        relation_to_student: formData.parentGuardian?.relation_to_student || "",
        guardian_phone: formData.parentGuardian?.guardian_phone || "",
        guardian_email:
          formData.parentGuardian?.guardian_email &&
          formData.parentGuardian?.guardian_email.trim() !== ""
            ? formData.parentGuardian?.guardian_email
            : null, // Set null jika kosong atau whitespace
        guardian_address_street:
          formData.parentGuardian?.guardian_address_street || "",
        guardian_address_rt: formData.parentGuardian?.guardian_address_rt || "",
        guardian_address_rw: formData.parentGuardian?.guardian_address_rw || "",
        guardian_address_village:
          formData.parentGuardian?.guardian_address_village || "",
        guardian_address_district:
          formData.parentGuardian?.guardian_address_district || "",
        guardian_address_city_regency:
          formData.parentGuardian?.guardian_address_city_regency || "",
        guardian_address_province:
          formData.parentGuardian?.guardian_address_province || "",
        guardian_address_other:
          formData.parentGuardian?.guardian_address_other || "",

        // Payment
        payment_type: formData.termOfPayment?.payment_type || "Tuition Fee",
        payment_method:
          formData.termOfPayment?.payment_method || "Full Payment",
        financial_policy_contract:
          formData.termOfPayment?.financial_policy_contract || "Not Signed",

        // Discount
        discount_name: formData.termOfPayment?.discount_name || "",
        discount_notes: formData.termOfPayment?.discount_notes || "",
      };

      // HAPUS field yang tidak diperlukan backend
      delete transformed.schoolYear;
      delete transformed.semester;
      delete transformed.date;
      delete transformed.draftId;

      console.log("Transformed form data (cleaned):", transformed);
      return transformed;
    }, []);

    const handleConfirm = useCallback(async () => {
      try {
        setIsSubmitting(true);

        const transformedData = transformFormData(allFormData);

        // Debug: log data yang akan dikirim
        console.log("=== SUBMIT DEBUG INFO ===");
        console.log("Draft ID:", draftId);
        console.log("Data keys:", Object.keys(transformedData));
        console.log(
          "Student Info:",
          transformedData.first_name,
          transformedData.last_name
        );
        console.log("City Regency:", transformedData.city_regency);
        console.log("Province:", transformedData.province);
        console.log("Mother Email:", transformedData.mother_email);
        console.log("========================");

        const response = await submitRegistrationForm(draftId, transformedData);

        if (response.success) {
          alert("Registration successful!");
          onConfirm();
          navigate("/"); // Redirect ke home
        } else {
          alert("Registration failed: " + (response.error || "Unknown error"));
        }
      } catch (error) {
        console.error("=== ERROR DEBUG INFO ===");
        console.error("Error message:", error.message);
        if (error.response) {
          console.error("HTTP Status:", error.response.status);
        }
        console.error("Full error object:", error);
        console.error("Error data:", error.data);
        console.error("========================");

        if (error.data && error.data.errors) {
          // Tampilkan semua validation errors
          const errorMessages = [];
          Object.entries(error.data.errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((msg) => {
                errorMessages.push(`${field}: ${msg}`);
              });
            } else {
              errorMessages.push(`${field}: ${messages}`);
            }
          });
          alert("Validation errors:\n" + errorMessages.join("\n"));
        } else if (error.data && error.data.error) {
          alert("Registration failed: " + error.data.error);
        } else {
          alert("Registration failed: " + error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    }, [draftId, allFormData, transformFormData, onConfirm, navigate]);

    return (
      <div className={styles.overlay}>
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
    );
  }
);

export default PopUpConfirm;
