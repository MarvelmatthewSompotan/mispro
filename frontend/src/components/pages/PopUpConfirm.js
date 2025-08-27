import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../styles/PopUpConfirm.module.css";
import { submitRegistrationForm } from "../../services/api";

const PopUpConfirm = React.memo(
  ({ onCancel, onConfirm, draftId, allFormData, locationState, navigate }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleConfirm = async () => {
      try {
        setIsSubmitting(true);

        const transformedData = transformFormData(allFormData);

        console.log("=== SUBMIT DEBUG INFO ===");
        console.log("Draft ID:", draftId);
        console.log("Data keys:", Object.keys(transformedData));
        console.log("All form data:", allFormData);
        console.log("========================");

        const response = await submitRegistrationForm(draftId, transformedData);

        console.log("=== RESPONSE DEBUG INFO ===");
        console.log("Response:", response);
        console.log("Response data:", response.data);
        console.log("========================");

        if (response.success) {
          const applicationId = response.data.application_id || response.data.student_id;
          
          console.log("=== APPLICATION ID DEBUG ===");
          console.log("Response data keys:", Object.keys(response.data));
          console.log("Application ID found:", applicationId);
          console.log("========================");
          
          // Redirect ke halaman Print dengan data yang diperlukan
          const printData = {
            ...locationState,
            applicationId: applicationId,
            formData: allFormData,
            submittedData: response.data,
            isPreview: true
          };
          
          console.log("=== PRINT DATA DEBUG INFO ===");
          console.log("Application ID:", applicationId);
          console.log("Print data being sent:", printData);
          console.log("========================");
          
          navigate('/print', { state: printData });
          onConfirm();
        } else {
          alert("Registration failed: " + (response.error || "Unknown error"));
        }
      } catch (error) {
        console.error("=== ERROR DEBUG INFO ===");
        console.error("Error message:", error.message);
        if (error.response) {
          console.error("HTTP Status:", error.response.status);
        }
        console.error("========================");

        if (error.data && error.data.errors) {
          const errorMessages = Object.values(error.data.errors)
            .flat()
            .join(", ");
          alert("Validation errors: " + errorMessages);
        } else if (error.data && error.data.message) {
          alert("Registration failed: " + error.data.message);
        } else {
          alert("Registration failed: " + error.message);
        }
      } finally {
        setIsSubmitting(false);
      }
    };

    // Fungsi untuk transform data dengan field mapping yang benar
    const transformFormData = (formData) => {
      console.log("Original form data:", formData);

      const studentStatus = formData.studentStatus?.student_status || "New";
      const inputName = formData.studentStatus?.input_name || "";

      if (studentStatus === "Old" && !inputName) {
        throw new Error("Student ID is required for Old student status");
      }

      const transformed = {
        student_status: studentStatus,
        input_name: inputName,

        // Student information
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

        // Student address
        street: formData.studentInfo?.street || "",
        rt: formData.studentInfo?.rt || null,
        rw: formData.studentInfo?.rw || null,
        village: formData.studentInfo?.village || "",
        district: formData.studentInfo?.district || "",
        city_regency: formData.studentInfo?.city_regency || "",
        province: formData.studentInfo?.province || "",
        other: formData.studentInfo?.other || null,

        // Program, class, major
        section_id: parseInt(formData.program?.section_id),
        program_id: parseInt(formData.program?.program_id),
        class_id: parseInt(formData.program?.class_id),
        major_id: parseInt(formData.program?.major_id) || 1,
        program_other: formData.program?.program_other || null,

        // Facilities
        transportation_id:
          parseInt(formData.facilities?.transportation_id) || null,
        pickup_point_id: formData.facilities?.pickup_point_id
          ? parseInt(formData.facilities.pickup_point_id)
          : null,
        pickup_point_custom: formData.facilities?.pickup_point_custom || null,
        transportation_policy:
          formData.facilities?.transportation_policy || "Not Signed",
        residence_id: parseInt(formData.facilities?.residence_id) || 3,
        residence_hall_policy:
          formData.facilities?.residence_hall_policy || "Not Signed",

        // Parent/Guardian (father)
        father_name: formData.parentGuardian?.father_name || null,
        father_company: formData.parentGuardian?.father_company || null,
        father_occupation: formData.parentGuardian?.father_occupation || null,
        father_phone: formData.parentGuardian?.father_phone || null,
        father_email: formData.parentGuardian?.father_email || null,
        father_address_street:
          formData.parentGuardian?.father_address_street || null,
        father_address_rt: formData.parentGuardian?.father_address_rt || 0,
        father_address_rw: formData.parentGuardian?.father_address_rw || 0,
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

        // Parent/Guardian (mother)
        mother_name: formData.parentGuardian?.mother_name || null,
        mother_company: formData.parentGuardian?.mother_company || null,
        mother_occupation: formData.parentGuardian?.mother_occupation || null,
        mother_phone: formData.parentGuardian?.mother_phone || null,
        mother_email: formData.parentGuardian?.mother_email || null,
        mother_address_street:
          formData.parentGuardian?.mother_address_street || null,
        mother_address_rt: formData.parentGuardian?.mother_address_rt || 0,
        mother_address_rw: formData.parentGuardian?.mother_address_rw || 0,
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

        // Guardian
        guardian_name: formData.parentGuardian?.guardian_name || null,
        relation_to_student:
          formData.parentGuardian?.relation_to_student || null,
        guardian_phone: formData.parentGuardian?.guardian_phone || null,
        guardian_email: formData.parentGuardian?.guardian_email || null,
        guardian_address_street:
          formData.parentGuardian?.guardian_address_street || null,
        guardian_address_rt: formData.parentGuardian?.guardian_address_rt || 0,
        guardian_address_rw: formData.parentGuardian?.guardian_address_rw || 0,
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

        // Payment
        payment_type: formData.termOfPayment?.payment_type || "Tuition Fee",
        payment_method:
          formData.termOfPayment?.payment_method || "Full Payment",
        financial_policy_contract:
          formData.termOfPayment?.financial_policy_contract || "Not Signed",

        // Discount
        discount_name: formData.termOfPayment?.discount_name || null,
        discount_notes: formData.termOfPayment?.discount_notes || null,
      };

      // HAPUS field yang tidak diperlukan backend
      delete transformed.schoolYear;
      delete transformed.semester;
      delete transformed.date;
      delete transformed.draftId;

      console.log("Transformed form data (cleaned):", transformed);
      return transformed;
    };

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