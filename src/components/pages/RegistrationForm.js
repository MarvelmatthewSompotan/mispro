import React from "react";
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
        <StudentInformationSection />
        <ProgramSection />
        <FacilitiesSection />
        <ParentGuardianSection />
        <TermOfPaymentSection />
        <OtherDetailSection />
        <FormButtonSection />
      </div>
    </Main>
  );
};

export default RegistrationForm;
