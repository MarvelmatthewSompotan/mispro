import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Main from "../layout/Main";
import StudentStatusSection from "./registration/StudentStatusSection";
import StudentInformationSection from "./registration/StudentInformationSection";
import ProgramSection from "./registration/ProgramSection";
import FacilitiesSection from "./registration/FacilitiesSection";
import ParentGuardianSection from "./registration/ParentGuardianSection";
import TermOfPaymentSection from "./registration/TermOfPaymentSection";
import OtherDetailSection from "./registration/OtherDetailSection";
import FormButtonSection from "./registration/FormButtonSection";
import styles from "./RegistrationForm.module.css";

const RegistrationForm = () => {
  const location = useLocation();
  const formData = location.state || {};

  // State untuk validasi
  const [validationState, setValidationState] = useState({});
  const [errors, setErrors] = useState({});
  const [forceError, setForceError] = useState({});

  // Handler untuk menerima status validasi dari child components
  const handleValidationChange = (sectionName, validationData) => {
    setValidationState((prev) => ({
      ...prev,
      [sectionName]: validationData,
    }));
  };

  // Handler untuk mengatur error state
  const handleSetErrors = (sectionName, errorData) => {
    setErrors((prev) => ({
      ...prev,
      [sectionName]: errorData,
    }));

    // Set forceError untuk memastikan error state ditampilkan
    setForceError((prev) => ({
      ...prev,
      [sectionName]: errorData,
    }));
  };

  return (
    <Main>
      <div className={styles.formContainer}>
        {/* Display form data if available */}
        {formData.schoolYear && (
          <div className={styles.formInfo}>
            <p>
              <strong>School Year:</strong> {formData.schoolYear}
            </p>
            <p>
              <strong>Semester:</strong> {formData.semester}
            </p>
            <p>
              <strong>Date:</strong> {formData.date}
            </p>
          </div>
        )}

        <StudentStatusSection />
        <StudentInformationSection
          onValidationChange={(validationData) =>
            handleValidationChange("studentInfo", validationData)
          }
          setErrors={errors.studentInfo}
          forceError={forceError.studentInfo}
        />
        <ProgramSection />
        <FacilitiesSection />
        <ParentGuardianSection />
        <TermOfPaymentSection />
        <OtherDetailSection />
        <FormButtonSection
          validationState={validationState}
          onSetErrors={handleSetErrors}
        />
      </div>
    </Main>
  );
};

export default RegistrationForm;
