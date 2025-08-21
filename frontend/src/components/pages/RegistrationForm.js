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
  const [prefilledData, setPrefilledData] = useState({});
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

    console.log(`Updating ${sectionName}:`, data); // Debug log

    setFormSections((prev) => {
      const currentSection = prev[sectionName] || {};
      const newSection = { ...currentSection, ...data };
      
      console.log(`Previous ${sectionName}:`, currentSection); // Debug log
      console.log(`New ${sectionName}:`, newSection); // Debug log
      
      if (JSON.stringify(currentSection) === JSON.stringify(newSection)) {
        return prev;
      }

      const updated = {
        ...prev,
        [sectionName]: newSection,
      };
      
      console.log('Updated formSections:', updated); // Debug log
      return updated;
    });
  }, []);

  // Buat semua callback functions di level atas
  const handleStudentStatusDataChange = useCallback(
    (data) => {
      console.log('StudentStatusDataChange received:', data); // Debug log
      
      // Pastikan data lengkap sebelum dikirim
      const completeData = {
        student_status: data.student_status || 'New',
        input_name: data.input_name || '',
      };

      console.log('Complete studentStatus data:', completeData); // Debug log
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
    handleValidationChange('studentInfo', validationData);
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

    // IMPORTANT: Update studentStatus dengan input_name dari student yang dipilih
    // Kita perlu mendapatkan student_id dari data yang diterima
    if (latestData && latestData.studentInfo && latestData.studentInfo.student_id) {
      const studentId = latestData.studentInfo.student_id;
      console.log('Updating studentStatus with student_id:', studentId);
      
      handleSectionDataChange('studentStatus', {
        student_status: 'Old',
        input_name: studentId
      });
    }

    setPrefilledData((prev) => ({ ...prev, ...latestData }));
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
          <div style={{ textAlign: 'center', padding: '50px' }}>
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
          </div>
        )}

        <StudentStatusSection
          onSelectOldStudent={handleSelectOldStudent}
          onDataChange={handleStudentStatusDataChange}
          sharedData={sharedData}
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
        />
        <FacilitiesSection
          prefill={formSections.facilities || {}}
          onDataChange={handleFacilitiesDataChange}
          sharedData={sharedData}
        />
        <ParentGuardianSection
          prefill={formSections.parentGuardian || {}}
          onDataChange={handleParentGuardianDataChange}
          prefillTrigger={prefillTrigger}
          // ParentGuardianSection tidak memerlukan sharedData
        />
        <TermOfPaymentSection
          prefill={formSections.termOfPayment || {}}
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
