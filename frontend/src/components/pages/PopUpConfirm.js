import React, { useState } from "react";
import styles from "../styles/PopUpConfirm.module.css";
import { submitRegistrationForm } from "../../services/api";

const PopUpConfirm = ({
  onCancel,
  onConfirm,
  draftId,
  allFormData,
  locationState,
  navigate,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirm = async () => {
    setIsSubmitting(true);

    try {
      // Transform data dari section-based ke flat object
      const transformedData = transformFormData(allFormData);

      // Validasi required fields
      const requiredFields = [
        "religion",
        "place_of_birth",
        "date_of_birth",
        "email",
        "phone_number",
        "previous_school",
        "academic_status",
        "gender",
        "family_rank",
        "nisn",
        "major_id",
        "payment_method",
        "financial_policy_contract",
      ];

      const missingFields = requiredFields.filter(
        (field) => !transformedData[field]
      );

      if (missingFields.length > 0) {
        alert(
          `Please fill in all required fields: ${missingFields.join(", ")}`
        );
        setIsSubmitting(false);
        return;
      }

      // Siapkan data untuk dikirim ke backend
      const formData = {
        ...locationState,
        ...transformedData,
        draftId,
        submittedAt: new Date().toISOString(),
      };

      console.log("Transformed form data:", formData);

      // Kirim data ke backend
      const response = await submitRegistrationForm(draftId, formData);

      console.log("Submit response:", response);

      setIsSubmitting(false);

      // Tutup popup
      onConfirm();

      // Redirect ke halaman print dengan data yang sudah disubmit
      navigate("/print", { state: formData });
    } catch (error) {
      console.error("Error submitting form:", error);
      setIsSubmitting(false);

      // Tampilkan error message yang lebih spesifik
      if (error.message.includes("422")) {
        alert("Please check all required fields and try again.");
      } else {
        alert("Failed to submit form. Please try again.");
      }
    }
  };

  // Fungsi untuk transform data dengan field mapping yang benar
  const transformFormData = (sectionData) => {
    const transformed = {};

    // Student Status
    if (sectionData.studentStatus) {
      if (sectionData.studentStatus.student_status) {
        transformed.student_status = sectionData.studentStatus.student_status;
      }
      if (sectionData.studentStatus.input_name) {
        transformed.input_name = sectionData.studentStatus.input_name;
      }
    }

    // Student Info - map semua field dengan nama yang benar
    if (sectionData.studentInfo) {
      const studentInfo = sectionData.studentInfo;

      // Basic info
      if (studentInfo.first_name)
        transformed.first_name = studentInfo.first_name;
      if (studentInfo.middle_name)
        transformed.middle_name = studentInfo.middle_name;
      if (studentInfo.last_name) transformed.last_name = studentInfo.last_name;
      if (studentInfo.nickname) transformed.nickname = studentInfo.nickname;
      if (studentInfo.citizenship)
        transformed.citizenship = studentInfo.citizenship;
      if (studentInfo.country) transformed.country = studentInfo.country;
      if (studentInfo.religion) transformed.religion = studentInfo.religion;
      if (studentInfo.place_of_birth)
        transformed.place_of_birth = studentInfo.place_of_birth;
      if (studentInfo.date_of_birth)
        transformed.date_of_birth = studentInfo.date_of_birth;
      if (studentInfo.email) transformed.email = studentInfo.email;
      if (studentInfo.phone_number)
        transformed.phone_number = studentInfo.phone_number;
      if (studentInfo.previous_school)
        transformed.previous_school = studentInfo.previous_school;
      if (studentInfo.academic_status)
        transformed.academic_status = studentInfo.academic_status;
      if (studentInfo.academic_status_other)
        transformed.academic_status_other = studentInfo.academic_status_other;
      if (studentInfo.gender) transformed.gender = studentInfo.gender;
      if (studentInfo.family_rank)
        transformed.family_rank = studentInfo.family_rank;
      if (studentInfo.nisn) transformed.nisn = studentInfo.nisn;
      if (studentInfo.nik) transformed.nik = studentInfo.nik;
      if (studentInfo.kitas) transformed.kitas = studentInfo.kitas;

      // Address
      if (studentInfo.street) transformed.street = studentInfo.street;
      if (studentInfo.rt) transformed.rt = studentInfo.rt;
      if (studentInfo.rw) transformed.rw = studentInfo.rw;
      if (studentInfo.village) transformed.village = studentInfo.village;
      if (studentInfo.district) transformed.district = studentInfo.district;
      if (studentInfo.city_regency)
        transformed.city_regency = studentInfo.city_regency;
      if (studentInfo.province) transformed.province = studentInfo.province;
      if (studentInfo.other) transformed.other = studentInfo.other;
    }

    // Program
    if (sectionData.program) {
      const program = sectionData.program;
      if (program.section_id) transformed.section_id = program.section_id;
      if (program.program_id) transformed.program_id = program.program_id;
      if (program.program_other)
        transformed.program_other = program.program_other;
      if (program.class_id) transformed.class_id = program.class_id;
      if (program.major_id) transformed.major_id = program.major_id;
    }

    // Facilities
    if (sectionData.facilities) {
      const facilities = sectionData.facilities;
      if (facilities.transportation_id)
        transformed.transportation_id = facilities.transportation_id;
      if (facilities.pickup_point_id)
        transformed.pickup_point_id = facilities.pickup_point_id;
      if (facilities.pickup_point_custom)
        transformed.pickup_point_custom = facilities.pickup_point_custom;
      if (facilities.transportation_policy)
        transformed.transportation_policy = facilities.transportation_policy;
      if (facilities.residence_id)
        transformed.residence_id = facilities.residence_id;
      if (facilities.residence_hall_policy)
        transformed.residence_hall_policy = facilities.residence_hall_policy;
    }

    // Parent Guardian - map semua field dengan nama yang benar
    if (sectionData.parentGuardian) {
      const parentGuardian = sectionData.parentGuardian;

      // Father fields
      if (parentGuardian.father_name)
        transformed.father_name = parentGuardian.father_name;
      if (parentGuardian.father_company)
        transformed.father_company = parentGuardian.father_company;
      if (parentGuardian.father_occupation)
        transformed.father_occupation = parentGuardian.father_occupation;
      if (parentGuardian.father_phone)
        transformed.father_phone = parentGuardian.father_phone;
      if (parentGuardian.father_email)
        transformed.father_email = parentGuardian.father_email;
      if (parentGuardian.father_address_street)
        transformed.father_address_street =
          parentGuardian.father_address_street;
      if (parentGuardian.father_address_rt)
        transformed.father_address_rt = parentGuardian.father_address_rt;
      if (parentGuardian.father_address_rw)
        transformed.father_address_rw = parentGuardian.father_address_rw;
      if (parentGuardian.father_address_village)
        transformed.father_address_village =
          parentGuardian.father_address_village;
      if (parentGuardian.father_address_district)
        transformed.father_address_district =
          parentGuardian.father_address_district;
      if (parentGuardian.father_address_city_regency)
        transformed.father_address_city_regency =
          parentGuardian.father_address_city_regency;
      if (parentGuardian.father_address_province)
        transformed.father_address_province =
          parentGuardian.father_address_province;
      if (parentGuardian.father_address_other)
        transformed.father_address_other = parentGuardian.father_address_other;

      // Mother fields
      if (parentGuardian.mother_name)
        transformed.mother_name = parentGuardian.mother_name;
      if (parentGuardian.mother_company)
        transformed.mother_company = parentGuardian.mother_company;
      if (parentGuardian.mother_occupation)
        transformed.mother_occupation = parentGuardian.mother_occupation;
      if (parentGuardian.mother_phone)
        transformed.mother_phone = parentGuardian.mother_phone;
      if (parentGuardian.mother_email)
        transformed.mother_email = parentGuardian.mother_email;
      if (parentGuardian.mother_address_street)
        transformed.mother_address_street =
          parentGuardian.mother_address_street;
      if (parentGuardian.mother_address_rt)
        transformed.mother_address_rt = parentGuardian.mother_address_rt;
      if (parentGuardian.mother_address_rw)
        transformed.mother_address_rw = parentGuardian.mother_address_rw;
      if (parentGuardian.mother_address_village)
        transformed.mother_address_village =
          parentGuardian.mother_address_village;
      if (parentGuardian.mother_address_district)
        transformed.mother_address_district =
          parentGuardian.mother_address_district;
      if (parentGuardian.mother_address_city_regency)
        transformed.mother_address_city_regency =
          parentGuardian.mother_address_city_regency;
      if (parentGuardian.mother_address_province)
        transformed.mother_address_province =
          parentGuardian.mother_address_province;
      if (parentGuardian.mother_address_other)
        transformed.mother_address_other = parentGuardian.mother_address_other;

      // Guardian fields
      if (parentGuardian.guardian_name)
        transformed.guardian_name = parentGuardian.guardian_name;
      if (parentGuardian.relation_to_student)
        transformed.relation_to_student = parentGuardian.relation_to_student;
      if (parentGuardian.guardian_phone)
        transformed.guardian_phone = parentGuardian.guardian_phone;
      if (parentGuardian.guardian_email)
        transformed.guardian_email = parentGuardian.guardian_email;
      if (parentGuardian.guardian_address_street)
        transformed.guardian_address_street =
          parentGuardian.guardian_address_street;
      if (parentGuardian.guardian_address_rt)
        transformed.guardian_address_rt = parentGuardian.guardian_address_rt;
      if (parentGuardian.guardian_address_rw)
        transformed.guardian_address_rw = parentGuardian.guardian_address_rw;
      if (parentGuardian.guardian_address_village)
        transformed.guardian_address_village =
          parentGuardian.guardian_address_village;
      if (parentGuardian.guardian_address_district)
        transformed.guardian_address_district =
          parentGuardian.guardian_address_district;
      if (parentGuardian.guardian_address_city_regency)
        transformed.guardian_address_city_regency =
          parentGuardian.guardian_address_city_regency;
      if (parentGuardian.guardian_address_province)
        transformed.guardian_address_province =
          parentGuardian.guardian_address_province;
      if (parentGuardian.guardian_address_other)
        transformed.guardian_address_other =
          parentGuardian.guardian_address_other;
    }

    // Term of Payment
    if (sectionData.termOfPayment) {
      const termOfPayment = sectionData.termOfPayment;
      if (termOfPayment.payment_type)
        transformed.payment_type = termOfPayment.payment_type;
      if (termOfPayment.payment_method)
        transformed.payment_method = termOfPayment.payment_method;
      if (termOfPayment.financial_policy_contract)
        transformed.financial_policy_contract =
          termOfPayment.financial_policy_contract;
      if (termOfPayment.discount_name)
        transformed.discount_name = termOfPayment.discount_name;
      if (termOfPayment.discount_notes)
        transformed.discount_notes = termOfPayment.discount_notes;
    }

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
};

export default PopUpConfirm;
