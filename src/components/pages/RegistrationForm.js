import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
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
import ApiService from "../../services/api";

const RegistrationForm = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const formData = location.state || {};

  // State untuk validasi
  const [validationState, setValidationState] = useState({});
  const [errors, setErrors] = useState({});
  const [forceError, setForceError] = useState({});

  // State untuk registration options - ambil dari navigation state
  const [registrationOptions, setRegistrationOptions] = useState(
    formData.registrationOptions || {}
  );
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");

  // State untuk search student
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Jika registrationOptions tidak ada di navigation state, fetch dari API
  useEffect(() => {
    if (
      !formData.registrationOptions ||
      Object.keys(formData.registrationOptions).length === 0
    ) {
      const fetchOptions = async () => {
        try {
          setLoading(true);
          const response = await ApiService.getRegistrationOptions();
          if (response && response.school_years && response.semesters) {
            setRegistrationOptions(response);
          }
        } catch (error) {
          console.error("Error fetching registration options:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchOptions();
    }
  }, [formData.registrationOptions]);

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

  // Handler untuk search student
  const handleSearchStudent = async (searchTerm) => {
    if (!searchTerm || searchTerm.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const response = await ApiService.searchStudents(searchTerm);
      if (response.success) {
        setSearchResults(response.data);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching students:", error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  // Handler untuk memilih student
  const handleSelectStudent = async (studentId) => {
    try {
      const response = await ApiService.getLatestApplication(studentId);
      if (response.success) {
        // Populate form dengan data student yang dipilih
        console.log("Latest application data loaded for student:", studentId);
        console.log("Application data:", response.data);

        // Di sini kita bisa menambahkan logic untuk mengisi form
        // dengan data dari response.data jika diperlukan
      }
    } catch (error) {
      console.error("Error getting latest application:", error);
    }
  };

  // Handler untuk submit registration
  const handleSubmitRegistration = async (formData) => {
    if (!formData.draftId) {
      setSubmitError(
        "No draft ID found. Please create a new registration first."
      );
      return;
    }

    try {
      setSubmitLoading(true);
      setSubmitError("");

      const response = await ApiService.storeRegistration(
        formData.draftId,
        formData
      );

      if (response.success) {
        // Redirect ke halaman sukses atau preview
        navigate("/registration", {
          state: {
            success: true,
            message: "Registration submitted successfully!",
          },
        });
      } else {
        setSubmitError(response.message || "Failed to submit registration");
      }
    } catch (error) {
      setSubmitError("An error occurred while submitting registration");
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Main>
      <div className={styles.formContainer}>
        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            Loading registration options...
          </div>
        )}

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

        {submitError && (
          <div
            style={{
              color: "red",
              marginBottom: "10px",
              fontSize: "14px",
              textAlign: "center",
              padding: "10px",
              backgroundColor: "#ffe6e6",
              borderRadius: "4px",
            }}
          >
            {submitError}
          </div>
        )}

        <StudentStatusSection
          searchResults={searchResults}
          searchLoading={searchLoading}
          onSearchStudent={handleSearchStudent}
          onSelectStudent={handleSelectStudent}
          onValidationChange={(validationData) =>
            handleValidationChange("studentStatus", validationData)
          }
          setErrors={errors.studentStatus}
          forceError={forceError.studentStatus}
        />
        <StudentInformationSection
          options={registrationOptions}
          onValidationChange={(validationData) =>
            handleValidationChange("studentInfo", validationData)
          }
          setErrors={errors.studentInfo}
          forceError={forceError.studentInfo}
        />
        <ProgramSection options={registrationOptions} />
        <FacilitiesSection options={registrationOptions} />
        <ParentGuardianSection />
        <TermOfPaymentSection options={registrationOptions} />
        <OtherDetailSection />
        <FormButtonSection
          validationState={validationState}
          onSetErrors={handleSetErrors}
          onSubmitRegistration={handleSubmitRegistration}
          submitLoading={submitLoading}
        />
      </div>
    </Main>
  );
};

export default RegistrationForm;
