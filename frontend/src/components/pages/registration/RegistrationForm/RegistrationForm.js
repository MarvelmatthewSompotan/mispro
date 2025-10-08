// eslint-disable-next-line
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Main from "../../../layout/Main";
import StudentStatusSection from "./StudentStatus/StudentStatusSection";
import StudentInformationSection from "./StudentInformation/StudentInformationSection";
import ProgramSection from "./Program/ProgramSection";
import FacilitiesSection from "./Facilities/FacilitiesSection";
import ParentGuardianSection from "./ParentGuardian/ParentGuardianSection";
import TermOfPaymentSection from "./TermOfPayment/TermOfPaymentSection";
import OtherDetailSection from "./OtherDetail/OtherDetailSection";
import FormButtonSection from "./FormButtonSection/FormButtonSection";
import styles from "./RegistrationForm.module.css";
import { getRegistrationOptions } from "../../../../services/api";
import { gsap } from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

gsap.registerPlugin(ScrollToPlugin);

const RegistrationForm = () => {
  const location = useLocation();
  // eslint-disable-next-line
  const [prefilledData, setPrefilledData] = useState({});
  const formData = location.state || {};
  const [formSections, setFormSections] = useState({
    studentStatus: {},
    studentInfo: {},
    program: {},
    facilities: {},
    parentGuardian: {},
    termOfPayment: {},
  });
  const [resetKey, setResetKey] = useState(0);
  const [setPrefillTrigger] = useState(0);
  const [sharedData, setSharedData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [validationState, setValidationState] = useState({});
  const [errors, setErrors] = useState({});
  const [forceError, setForceError] = useState({});

  const navigate = useNavigate();

  // Guard akses langsung: wajib datang dari PopUpForm
  useEffect(() => {
    const s = location.state || {};
    const isValid = s.fromPopup && s.draftId && s.schoolYear && s.semester;

    if (!isValid) {
      navigate("/registration", { replace: true });
    }
  }, [location.state, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);

    // Gunakan Intl.DateTimeFormat biar otomatis ke nama bulan lokal
    return new Intl.DateTimeFormat("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
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
        console.error("Failed to fetch registration options:", error);
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const sectionOrder = [
      "studentStatus",
      "studentInfo",
      "program",
      "facilities",
      "parentGuardian",
      "termOfPayment",
    ];

    const firstErrorSection = sectionOrder.find(
      (sectionName) =>
        errors[sectionName] && Object.keys(errors[sectionName]).length > 0
    );

    if (firstErrorSection) {
      const targetId =
        errors[firstErrorSection]._firstError || firstErrorSection;
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        // Menggunakan GSAP untuk animasi scroll
        gsap.to(window, {
          // Targetkan 'window' atau kontainer scroll Anda
          duration: 0.8, // Durasi animasi dalam detik (misal: 0.8 detik)
          scrollTo: {
            y: targetElement, // Scroll ke elemen target
            offsetY: 100, // Beri jarak dari atas layar sebesar 100px
          },
          ease: "power2.inOut", // Jenis animasi untuk efek lebih dinamis
        });
      }
    }
  }, [errors]);

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

  const handleStudentStatusDataChange = useCallback(
    (data) => {
      // Langsung teruskan data apa adanya dari komponen child.
      // Jangan berikan nilai default di sini.
      handleSectionDataChange("studentStatus", data);
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
    handleValidationChange("studentInfo", validationData); // eslint-disable-next-line
  }, []);

  const handleProgramDataChange = useCallback(
    (data) => {
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
    console.log("Received latest data for prefill:", latestData); // Debug log

    // Prefill semua form sections dengan data dari backend
    if (latestData) {
      // Prefill Student Information
      if (
        latestData.studentInfo &&
        Object.keys(latestData.studentInfo).length > 0
      ) {
        console.log("Prefilling studentInfo:", latestData.studentInfo);
        handleSectionDataChange("studentInfo", latestData.studentInfo);
      }

      // Prefill Program
      if (latestData.program && Object.keys(latestData.program).length > 0) {
        console.log("Prefilling program:", latestData.program);
        handleSectionDataChange("program", latestData.program);
      }

      // Prefill Facilities
      if (
        latestData.facilities &&
        Object.keys(latestData.facilities).length > 0
      ) {
        console.log("Prefilling facilities:", latestData.facilities);
        handleSectionDataChange("facilities", latestData.facilities);
      }

      // Prefill Parent Guardian
      if (
        latestData.parentGuardian &&
        Object.keys(latestData.parentGuardian).length > 0
      ) {
        console.log("Prefilling parentGuardian:", latestData.parentGuardian);
        handleSectionDataChange("parentGuardian", latestData.parentGuardian);
      }

      // Prefill Term of Payment
      if (
        latestData.termOfPayment &&
        Object.keys(latestData.termOfPayment).length > 0
      ) {
        console.log("Prefilling termOfPayment:", latestData.termOfPayment);
        handleSectionDataChange("termOfPayment", latestData.termOfPayment);
      }
    }

    // Signal children to apply prefill just once
    setPrefillTrigger((prev) => prev + 1);
  };

  const handleClearFormOnStatusChange = useCallback(() => {
    // Reset semua section form KECUALI studentStatus
    setFormSections((prev) => ({
      ...prev, // Pertahankan studentStatus yang akan diupdate oleh child nanti
      studentInfo: {},
      program: {},
      facilities: {},
      parentGuardian: {},
      termOfPayment: {},
    }));

    // Hapus juga prefilled data dan error yang mungkin ada
    setPrefilledData({});
    setErrors({});
    setForceError({});

    // Trigger re-render pada komponen anak dengan mengubah key
    setResetKey((prevKey) => prevKey + 1);
  }, []);

  // Handler untuk menerima status validasi dari child components
  const handleValidationChange = useCallback((sectionName, validationData) => {
    setValidationState((prev) => ({
      ...prev,
      [sectionName]: validationData,
    }));
  }, []);

  // Handler untuk mengatur error state (sekarang menerima seluruh objek errors)
  const handleSetErrors = useCallback((allNewErrors) => {
    setErrors(allNewErrors);
    setForceError(allNewErrors);
  }, []);

  const handleResetForm = () => {
    //kode reset yang sudah ada
    setFormSections({
      studentStatus: {},
      studentInfo: {},
      program: {},
      facilities: {},
      parentGuardian: {},
      termOfPayment: {},
    });

    setPrefilledData({});
    setValidationState({});
    setErrors({});
    setForceError({});

    // TAMBAHKAN BARIS INI UNTUK MENGUBAH KEY
    setResetKey((prevKey) => prevKey + 1);

    window.scrollTo(0, 0);
  };

  // Function to get display values for school year and semester
  const getDisplayValues = useCallback(() => {
    if (!sharedData || !formData.schoolYear || !formData.semester) {
      return { schoolYearDisplay: "", semesterDisplay: "" };
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
          <div
            style={{
              textAlign: "center",
              padding: "50px",
              fontSize: "18px",
              fontWeight: "medium",
            }}
          >
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

        <div id="studentStatus">
          <StudentStatusSection
            onSelectOldStudent={handleSelectOldStudent}
            onDataChange={handleStudentStatusDataChange}
            sharedData={sharedData}
            errors={errors.studentStatus || {}}
            forceError={forceError.studentStatus || {}}
            onClearForm={handleClearFormOnStatusChange}
          />
        </div>
        <div id="studentInfo">
          <StudentInformationSection
            prefill={formSections.studentInfo || {}}
            onValidationChange={handleStudentInfoValidationChange}
            onDataChange={handleStudentInfoDataChange}
            errors={errors.studentInfo || {}}
            forceError={forceError.studentInfo || {}}
            sharedData={sharedData}
          />
        </div>
        <div id="program">
          <ProgramSection
            key={resetKey}
            prefill={formSections.program || {}}
            onDataChange={handleProgramDataChange}
            sharedData={sharedData}
            errors={errors.program || {}}
            forceError={forceError.program || {}}
          />
        </div>
        <div id="facilities">
          <FacilitiesSection
            key={resetKey}
            prefill={formSections.facilities || {}}
            onDataChange={handleFacilitiesDataChange}
            sharedData={sharedData}
            errors={errors.facilities || {}}
            forceError={forceError.facilities || {}}
          />
        </div>
        <div id="parentGuardian">
          <ParentGuardianSection
            formData={formSections.parentGuardian || {}}
            onDataChange={handleParentGuardianDataChange}
            errors={errors.parentGuardian || {}}
            forceError={forceError.parentGuardian || {}}
          />
        </div>
        <div id="termOfPayment">
          <TermOfPaymentSection
            key={resetKey}
            prefill={formSections.termOfPayment || {}}
            onDataChange={handleTermOfPaymentDataChange}
            sharedData={sharedData}
            errors={errors.termOfPayment || {}}
            forceError={forceError.termOfPayment || {}}
          />
        </div>
        <OtherDetailSection />
        <FormButtonSection
          validationState={validationState}
          onSetErrors={handleSetErrors}
          draftId={draftId}
          allFormData={formSections}
          onReset={handleResetForm}
          location={location}
          sharedData={sharedData}
        />
      </div>
    </Main>
  );
};

export default RegistrationForm;
