import React, { useState, useEffect, useCallback } from "react";
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
import { getRegistrationOptions } from "../../services/api";

const RegistrationForm = () => {
  const location = useLocation();
  const formData = location.state || {};
  const [prefilledData, setPrefilledData] = useState({});
  const [formSections, setFormSections] = useState({
    studentStatus: {},
    studentInfo: {},
    program: {},
    facilities: {},
    parentGuardian: {},
    termOfPayment: {},
  });

  // Add shared data state to avoid multiple API calls
  const [sharedData, setSharedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all registration options once at the top level
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getRegistrationOptions();
        setSharedData(data);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to fetch registration options:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSectionDataChange = useCallback((sectionName, data) => {
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      console.error(`Data untuk ${sectionName} harus berupa objek`, data);
      return;
    }

    setFormSections((prev) => {
      const currentSection = prev[sectionName] || {};
      const newSection = { ...currentSection, ...data };
      if (JSON.stringify(currentSection) === JSON.stringify(newSection)) {
        return prev;
      }

      return {
        ...prev,
        [sectionName]: newSection,
      };
    });
  }, []);

  // Buat semua callback functions di level atas
  const handleStudentStatusDataChange = useCallback(
    (data) => {
      // Pastikan data lengkap sebelum dikirim
      const completeData = {
        student_status: data.student_status || "New",
        input_name: data.input_name || "",
      };

      handleSectionDataChange("studentStatus", completeData);
    },
    [handleSectionDataChange]
  );

  const handleStudentInfoDataChange = useCallback(
    (data) => {
      handleSectionDataChange("studentInfo", data);
    },
    [handleSectionDataChange]
  );

  const handleStudentInfoValidationChange = useCallback((validationData) => {
    handleValidationChange("studentInfo", validationData);
  }, []);

  const handleProgramDataChange = useCallback(
    (data) => {
      console.log("Program data change:", data);
      handleSectionDataChange("program", data);
    },
    [handleSectionDataChange]
  );

  const handleFacilitiesDataChange = useCallback(
    (data) => {
      handleSectionDataChange("facilities", data);
    },
    [handleSectionDataChange]
  );

  const handleParentGuardianDataChange = useCallback(
    (data) => {
      handleSectionDataChange("parentGuardian", data);
    },
    [handleSectionDataChange]
  );

  const handleTermOfPaymentDataChange = useCallback(
    (data) => {
      handleSectionDataChange("termOfPayment", data);
    },
    [handleSectionDataChange]
  );

  const handleSelectOldStudent = (latestData) => {
    // Prefill semua form sections dengan data dari backend
    if (latestData) {
      // Support both camelCase and snake_case keys
      const studentInfoData = latestData.studentInfo || latestData.student_info;
      if (studentInfoData) {
        handleSectionDataChange("studentInfo", studentInfoData);
      }

      const programData = latestData.program || latestData.program_info;
      if (programData) {
        handleSectionDataChange("program", programData);
      }

      const facilitiesData =
        latestData.facilities || latestData.facilities_info;
      if (facilitiesData) {
        handleSectionDataChange("facilities", facilitiesData);
      }

      const parentGuardianData =
        latestData.parentGuardian || latestData.parent_guardian;
      if (parentGuardianData) {
        handleSectionDataChange("parentGuardian", parentGuardianData);
      }

      const termOfPaymentData =
        latestData.termOfPayment || latestData.term_of_payment;
      if (termOfPaymentData) {
        handleSectionDataChange("termOfPayment", termOfPaymentData);
      }
    }

    setPrefilledData((prev) => ({ ...prev, ...latestData }));
  };

  // State untuk validasi
  const [validationState, setValidationState] = useState({});
  const [errors, setErrors] = useState({});
  const [forceError, setForceError] = useState({});

  // Handler untuk menerima status validasi dari child components
  const handleValidationChange = useCallback((sectionName, validationData) => {
    setValidationState((prev) => ({
      ...prev,
      [sectionName]: validationData,
    }));
  }, []);

  // Handler untuk mengatur error state
  const handleSetErrors = useCallback((sectionName, errorData) => {
    setErrors((prev) => ({
      ...prev,
      [sectionName]: errorData,
    }));

    // ✅ Set forceError dengan pengecekan yang sama
    setForceError((prev) => ({
      ...prev,
      [sectionName]: errorData,
    }));
  }, []);

  const handleResetForm = () => {
    setPrefilledData({});
    setValidationState({});
    setErrors({});
    setForceError({});
  };

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Main>
        <div className={styles.formContainer}>
          <div style={{ textAlign: "center", padding: "50px" }}>
            <p>Loading registration form...</p>
          </div>
        </div>
      </Main>
    );
  }

  // Extract draft ID from formData
  const draftId = formData.draftId;

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
            {draftId && (
              <p>
                <strong>Draft ID:</strong> {draftId}
              </p>
            )}
          </div>
        )}

        <StudentStatusSection
          onSelectOldStudent={handleSelectOldStudent}
          onDataChange={handleStudentStatusDataChange}
          sharedData={sharedData}
        />
        <StudentInformationSection
          prefill={
            prefilledData.student_info || prefilledData.studentInfo || {}
          }
          onValidationChange={handleStudentInfoValidationChange}
          onDataChange={handleStudentInfoDataChange}
          errors={errors.studentInfo || {}}
          forceError={forceError.studentInfo || {}}
          sharedData={sharedData}
        />
        <ProgramSection
          prefill={prefilledData.program || prefilledData.program_info || {}}
          onDataChange={handleProgramDataChange}
          sharedData={sharedData}
        />
        <FacilitiesSection
          prefill={
            prefilledData.facilities || prefilledData.facilities_info || {}
          }
          onDataChange={handleFacilitiesDataChange}
          sharedData={sharedData}
        />
        <ParentGuardianSection
          prefill={
            prefilledData.parentGuardian || prefilledData.parent_guardian || {}
          }
          onDataChange={handleParentGuardianDataChange}
          // ParentGuardianSection tidak memerlukan sharedData
        />
        <TermOfPaymentSection
          prefill={
            prefilledData.termOfPayment || prefilledData.term_of_payment || {}
          }
          onDataChange={handleTermOfPaymentDataChange}
          sharedData={sharedData}
        />
        <OtherDetailSection />
        <FormButtonSection
          validationState={validationState}
          onSetErrors={handleSetErrors}
          draftId={draftId}
          allFormData={formSections}
          onReset={handleResetForm}
        />
      </div>
    </Main>
  );
};

export default RegistrationForm;
