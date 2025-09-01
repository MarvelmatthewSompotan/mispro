import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Main from '../layout/Main';
import StudentStatusSection from './registration/StudentStatusSection';
import StudentInformationSection from './registration/StudentInformationSection';
import ProgramSection from './registration/ProgramSection';
import FacilitiesSection from './registration/FacilitiesSection';
import ParentGuardianSection from './registration/ParentGuardianSection';
import TermOfPaymentSection from './registration/TermOfPaymentSection';
import OtherDetailSection from './registration/OtherDetailSection';
import FormButtonSection from './registration/FormButtonSection';
import styles from './RegistrationForm.module.css';
import { getRegistrationOptions } from '../../services/api';

const RegistrationForm = () => {
  const location = useLocation();
  const formData = location.state || {};
  const [formSections, setFormSections] = useState({
    studentStatus: {},
    studentInfo: {},
    program: {},
    facilities: {},
    parentGuardian: {},
    termOfPayment: {},
  });
  const [prefillTrigger, setPrefillTrigger] = useState(0);

  // Add shared data state to avoid multiple API calls
  const [sharedData, setSharedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);

    // Gunakan Intl.DateTimeFormat biar otomatis ke nama bulan lokal
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  // Fetch all registration options once at the top level
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const data = await getRegistrationOptions();
        setSharedData(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch registration options:', error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSectionDataChange = useCallback((sectionName, data) => {
    if (typeof data !== 'object' || data === null || Array.isArray(data)) {
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
        student_status: data.student_status || 'New',
        input_name: data.input_name || '',
      };

      handleSectionDataChange('studentStatus', completeData);
    },
    [handleSectionDataChange]
  );

  const handleStudentInfoDataChange = useCallback(
    (data) => {
      handleSectionDataChange('studentInfo', data);
    },
    [handleSectionDataChange]
  );

  const handleStudentInfoValidationChange = useCallback((validationData) => {
    handleValidationChange('studentInfo', validationData);  // eslint-disable-next-line
  }, []); 

  const handleProgramDataChange = useCallback(
    (data) => {
      handleSectionDataChange('program', data);
    },
    [handleSectionDataChange]
  );

  const handleFacilitiesDataChange = useCallback(
    (data) => {
      handleSectionDataChange('facilities', data);
    },
    [handleSectionDataChange]
  );

  const handleParentGuardianDataChange = useCallback(
    (data) => {
      handleSectionDataChange('parentGuardian', data);
    },
    [handleSectionDataChange]
  );

  const handleTermOfPaymentDataChange = useCallback(
    (data) => {
      handleSectionDataChange('termOfPayment', data);
    },
    [handleSectionDataChange]
  );

  const handleSelectOldStudent = (latestData) => {
    console.log('Received latest data for prefill:', latestData); // Debug log

    // Prefill semua form sections dengan data dari backend
    if (latestData) {
      // Prefill Student Information
      if (
        latestData.studentInfo &&
        Object.keys(latestData.studentInfo).length > 0
      ) {
        console.log('Prefilling studentInfo:', latestData.studentInfo);
        handleSectionDataChange('studentInfo', latestData.studentInfo);
      }

      // Prefill Program
      if (latestData.program && Object.keys(latestData.program).length > 0) {
        console.log('Prefilling program:', latestData.program);
        handleSectionDataChange('program', latestData.program);
      }

      // Prefill Facilities
      if (
        latestData.facilities &&
        Object.keys(latestData.facilities).length > 0
      ) {
        console.log('Prefilling facilities:', latestData.facilities);
        handleSectionDataChange('facilities', latestData.facilities);
      }

      // Prefill Parent Guardian
      if (
        latestData.parentGuardian &&
        Object.keys(latestData.parentGuardian).length > 0
      ) {
        console.log('Prefilling parentGuardian:', latestData.parentGuardian);
        handleSectionDataChange('parentGuardian', latestData.parentGuardian);
      }

      // Prefill Term of Payment
      if (
        latestData.termOfPayment &&
        Object.keys(latestData.termOfPayment).length > 0
      ) {
        console.log('Prefilling termOfPayment:', latestData.termOfPayment);
        handleSectionDataChange('termOfPayment', latestData.termOfPayment);
      }
    }

    // Signal children to apply prefill just once
    setPrefillTrigger((prev) => prev + 1);
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

    setForceError((prev) => ({
      ...prev,
      [sectionName]: errorData,
    }));
  }, []);

  const handleResetForm = () => {
    setValidationState({});
    setErrors({});
    setForceError({});
  };

  // Function to get display values for school year and semester
  const getDisplayValues = useCallback(() => {
    if (!sharedData || !formData.schoolYear || !formData.semester) {
      return { schoolYearDisplay: '', semesterDisplay: '' };
    }

    const schoolYear = sharedData.school_years?.find(
      (sy) => sy.school_year_id.toString() === formData.schoolYear.toString()
    );

    const semester = sharedData.semesters?.find(
      (s) => s.semester_id.toString() === formData.semester.toString()
    );

    return {
      schoolYearDisplay: schoolYear?.year || formData.schoolYear,
      semesterDisplay: semester?.number || formData.semester,
    };
  }, [sharedData, formData.schoolYear, formData.semester]);

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <Main>
        <div className={styles.formContainer}>
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <p>Loading registration form...</p>
          </div>
        </div>
      </Main>
    );
  }

  // Extract draft ID from formData
  const draftId = formData.draftId;
  const { schoolYearDisplay, semesterDisplay } = getDisplayValues();

  return (
    <Main>
      <div className={styles.formContainer}>
        {/* Display form data if available */}
        {formData.schoolYear && (
          <div className={styles.formInfo}>
            <p>
              <strong>School Year:</strong> {schoolYearDisplay}
            </p>
            <p>
              <strong>Semester:</strong> {semesterDisplay}
            </p>
            <p>
              <strong>Date:</strong> {formatDate(formData.date)}
            </p>
          </div>
        )}

        <StudentStatusSection
          onSelectOldStudent={handleSelectOldStudent}
          onDataChange={handleStudentStatusDataChange}
          sharedData={sharedData}
          errors={errors.studentStatus || {}}
          forceError={forceError.studentStatus || {}}
        />
        <StudentInformationSection
          prefill={formSections.studentInfo || {}}
          onValidationChange={handleStudentInfoValidationChange}
          onDataChange={handleStudentInfoDataChange}
          errors={errors.studentInfo || {}}
          forceError={forceError.studentInfo || {}}
          sharedData={sharedData}
        />
        <ProgramSection
          prefill={formSections.program || {}}
          onDataChange={handleProgramDataChange}
          sharedData={sharedData}
          errors={errors.program || {}}
          forceError={forceError.program || {}}
        />
        <FacilitiesSection
          prefill={formSections.facilities || {}}
          onDataChange={handleFacilitiesDataChange}
          sharedData={sharedData}
          errors={errors.facilities || {}}
          forceError={forceError.facilities || {}}
        />
        <ParentGuardianSection
          prefill={formSections.parentGuardian || {}}
          onDataChange={handleParentGuardianDataChange}
          prefillTrigger={prefillTrigger}
          errors={errors.parentGuardian || {}}
          forceError={forceError.parentGuardian || {}}
          // ParentGuardianSection tidak memerlukan sharedData
        />
        <TermOfPaymentSection
          prefill={formSections.termOfPayment || {}}
          onDataChange={handleTermOfPaymentDataChange}
          sharedData={sharedData}
          errors={errors.termOfPayment || {}}
          forceError={forceError.termOfPayment || {}}
        />
        <OtherDetailSection />
        <FormButtonSection
          validationState={validationState}
          onSetErrors={handleSetErrors}
          draftId={draftId}
          allFormData={formSections}
          onReset={handleResetForm}
          location={location} // Add this line
        />
      </div>
    </Main>
  );
};

export default RegistrationForm;
