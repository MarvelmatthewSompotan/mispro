import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getRegistrationPreview } from "../../services/api";
import styles from "../styles/Print.module.css";
import kop from "../../assets/LogoMIS_Print.png";
import footer from "../../assets/Footer.png";
import StudentsInformationContent from "../Print_Content/StudentsInformation_Content/StudentsInformation_Content";
import ProgramContent from "../Print_Content/Program_Content/Program_Content";
import FacilitiesContent from "../Print_Content/Facilities_Content/Facilities_Content";
import ParentsGuardianInformationContent from "../Print_Content/ParentsGuardianInformation_Content/ParentsGuardianInformation_Content";
import TermofPaymentContent from "../Print_Content/TermofPayment_Content/TermofPayment_Content";
import PledgeContent from "../Print_Content/Pledge_Content/Pledge_Content";
import SignatureContent from "../Print_Content/Signature_Content/Signature_Content";
import OtherDetailContent from "../Print_Content/OtherDetail_Content/OtherDetail_Content";

function Print() {
  const location = useLocation();
  const navigate = useNavigate();
  const [previewData, setPreviewData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const formData = location.state || {};
  const applicationId = formData.applicationId;
  const isPreview = formData.isPreview;

  // ✅ PERBAIKAN: Gunakan useCallback untuk mencegah re-render
  useEffect(() => {
    const fetchPreviewData = async () => {
      if (!isPreview || !applicationId) {
        console.log(
          "Skipping preview fetch - isPreview:",
          isPreview,
          "applicationId:",
          applicationId
        );
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log("Fetching preview data for application ID:", applicationId);
        const data = await getRegistrationPreview(applicationId);

        // ✅ PERBAIKAN: Log response data untuk debug
        console.log("Preview API response:", data);

        if (data.success && data.data) {
          setPreviewData(data);
          console.log("Preview data fetched successfully:", data);
        } else {
          console.error("Preview API returned error:", data);
          setError(data.error || "Preview data not available");
        }
      } catch (err) {
        console.error("Failed to fetch preview data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreviewData();
  }, [isPreview, applicationId]);

  // ✅ PERBAIKAN: Hapus console.log yang berlebihan
  // console.log("Print component - Location state:", location.state);
  // console.log("Print component - Form data:", formData);
  // console.log("Print component - Application ID:", applicationId);
  // console.log("Print component - Is Preview:", isPreview);

  // Use preview data if available, otherwise fall back to form data
  const displayData = previewData || formData;

  // ✅ PERBAIKAN: Hapus console.log yang berlebihan
  // console.log("Print component - Display data:", displayData);
  // console.log("Print component - Preview data:", previewData);

  // Helper function untuk mendapatkan data yang benar
  const getStudentData = () => {
    // Jika ada preview data, gunakan struktur yang benar
    if (previewData?.data) {
      return {
        ...previewData.data.student,
        ...previewData.data.address,
        // Tambahkan field yang mungkin ada di student
        first_name: previewData.data.student?.first_name,
        middle_name: previewData.data.student?.middle_name,
        last_name: previewData.data.student?.last_name,
        nickname: previewData.data.student?.nickname,
        gender: previewData.data.student?.gender,
        age: previewData.data.student?.age,
        citizenship: previewData.data.student?.citizenship,
        religion: previewData.data.student?.religion,
        place_of_birth: previewData.data.student?.place_of_birth,
        date_of_birth: previewData.data.student?.date_of_birth,
        family_rank: previewData.data.student?.family_rank,
        academic_status: previewData.data.student?.academic_status,
        previous_school: previewData.data.student?.previous_school,
        email: previewData.data.student?.email,
        phone_number: previewData.data.student?.phone_number,
        nisn: previewData.data.student?.student_id,
        // Address fields
        street: previewData.data.address?.street,
        rt: previewData.data.address?.rt,
        rw: previewData.data.address?.rw,
        village: previewData.data.address?.village,
        district: previewData.data.address?.district,
        city_regency: previewData.data.address?.city_regency,
        province: previewData.data.address?.province,
        other: previewData.data.address?.other,
      };
    }

    // Fallback ke form data
    return (
      displayData.studentInfo ||
      displayData.formData?.studentInfo ||
      displayData
    );
  };

  // const getProgramData = () => {
  //   // Prioritaskan data dari form bila ada
  //   const formProgram =
  //     displayData && displayData.formData && displayData.formData.program
  //       ? displayData.formData.program
  //       : displayData?.program;

  //   if (previewData?.data?.enrollment) {
  //     const e = previewData.data.enrollment;

  //     // Mapping major_id ke nama
  //     const majorMap = {
  //       2: "SOCIAL",
  //       3: "SCIENCE",
  //     };

  //     // Ambil dari form jika ada, kalau tidak pakai preview
  //     const sectionId = formProgram?.section_id ?? e.section_id ?? null;
  //     const programId = formProgram?.program_id ?? e.program_id ?? null;
  //     const majorName =
  //       formProgram?.major ??
  //       e.major_name ??
  //       majorMap[formProgram?.major_id] ??
  //       majorMap[e.major_id] ??
  //       "";
  //     const majorId = formProgram?.major_id ?? e.major_id ?? null;
  //     const grade =
  //       formProgram?.grade ?? e.class ?? formProgram?.class_id ?? "";

  //     return {
  //       section_id: sectionId,
  //       section: e.section_name,
  //       grade,
  //       major_id: majorId,
  //       major: majorName, // label yang dipilih user
  //       major_name: majorName, // sama dengan major untuk konsistensi
  //       program_id: programId,
  //       program_other: formProgram?.program_other ?? e.program_other ?? "",
  //       // ...existing code...
  //       programs: [
  //         { id: 1, name: "UAN", selected: Number(programId) === 1 },
  //         { id: 2, name: "A Beka", selected: Number(programId) === 2 },
  //         { id: 3, name: "Oxford", selected: Number(programId) === 3 },
  //         { id: 4, name: "Cambridge", selected: Number(programId) === 4 },
  //         {
  //           id: 5,
  //           name: "Others",
  //           selected: Number(programId) === 5 || !!formProgram?.program_other,
  //         },
  //       ],
  //       // ...existing code...
  //     };
  //   }

  const getProgramData = () => {
    if (previewData?.data?.enrollment) {
      const enrollment = previewData.data.enrollment;
  
      return {
        section_id: enrollment.section?.id || null,
        section: enrollment.section?.name || "",
        grade: enrollment.class || "",
  
        major_id: enrollment.major?.id || null,
        major: enrollment.major?.name || "",
        major_name: enrollment.major?.name || "",
  
        program_id: enrollment.program?.id || null,
        program: enrollment.program?.name || "",
        program_other: enrollment.program_other || "",
  
        // Untuk keperluan pilihan (misalnya di preview table)
        programs: [
          { id: 1, name: "UAN", selected: enrollment.program?.id === 1 },
          { id: 2, name: "A Beka", selected: enrollment.program?.id === 2 },
          { id: 3, name: "Oxford", selected: enrollment.program?.id === 3 },
          { id: 4, name: "Cambridge", selected: enrollment.program?.id === 4 },
          {
            id: 5,
            name: "Others",
            selected:
              enrollment.program?.id === 5 || !!enrollment.program_other,
          },
        ],
      };
    }
  
    // fallback kalau preview belum ada
    const formProgram =
      displayData?.formData?.program || displayData?.program;
  
    if (formProgram) {
      return {
        section_id: formProgram.section_id ?? null,
        section: formProgram.section ?? "",
        grade: formProgram.grade ?? formProgram.class_id ?? "",
  
        major_id: formProgram.major_id ?? null,
        major: formProgram.major ?? "",
        major_name: formProgram.major ?? "",
  
        program_id: formProgram.program_id ?? null,
        program: formProgram.program ?? "",
        program_other: formProgram.program_other ?? "",
  
        programs: [
          { id: 1, name: "UAN", selected: formProgram.program_id === 1 },
          { id: 2, name: "A Beka", selected: formProgram.program_id === 2 },
          { id: 3, name: "Oxford", selected: formProgram.program_id === 3 },
          { id: 4, name: "Cambridge", selected: formProgram.program_id === 4 },
          {
            id: 5,
            name: "Others",
            selected:
              formProgram.program_id === 5 || !!formProgram.program_other,
          },
        ],
      };
    }
  
    return {};
  };

  const getFacilitiesData = () => {
    if (previewData?.data?.enrollment) {
      const enrollment = previewData.data.enrollment;

      // ✅ PERBAIKAN: Handle null values dengan aman
      return {
        // Transportation - mapping berdasarkan nama ke ID
        transportation_id:
          enrollment.transportation === "Own car"
            ? 1
            : enrollment.transportation === "School bus"
            ? 2
            : enrollment.transportation === "Boys dormitory"
            ? 3
            : null,
        transportation: enrollment.transportation || "Not Selected",
        transportation_policy:
          enrollment.policies?.transportation || "Not Signed",

        // Residence Hall - mapping berdasarkan nama ke ID
        residence_id:
          enrollment.residence === "Non-Residence hall"
            ? 1
            : enrollment.residence === "Boy's dormitory"
            ? 2
            : enrollment.residence === "Girl's dormitory"
            ? 3
            : 1,
        residence_hall: enrollment.residence || "Non-Residence hall",
        residence_hall_policy: enrollment.policies?.residence_hall || "Signed",

        // Pickup Point
        pickup_point_id: enrollment.pickup_point?.id || null,
        pickup_point: enrollment.pickup_point?.name || "",
        pickup_point_custom: enrollment.pickup_point?.custom || "",
      };
    }

    return displayData.facilities || displayData.formData?.facilities;
  };

  const getParentData = () => {
    if (previewData?.data) {
      return {
        // Father data
        father_name: previewData.data.father?.name,
        father_occupation: previewData.data.father?.occupation,
        father_company: previewData.data.father?.company,
        father_phone: previewData.data.father?.phone,
        father_email: previewData.data.father?.email,
        father_address_street: previewData.data.father?.address?.street,
        father_address_rt: previewData.data.father?.address?.rt,
        father_address_rw: previewData.data.father?.address?.rw,
        father_address_village: previewData.data.father?.address?.village,
        father_address_district: previewData.data.father?.address?.district,
        father_address_city_regency:
          previewData.data.father?.address?.city_regency,
        father_address_province: previewData.data.father?.address?.province,
        father_address_other: previewData.data.father?.address?.other,
        father_company_addresses: previewData.data.father?.company_address,

        // Mother data
        mother_name: previewData.data.mother?.name,
        mother_occupation: previewData.data.mother?.occupation,
        mother_company: previewData.data.mother?.company,
        mother_phone: previewData.data.mother?.phone,
        mother_email: previewData.data.mother?.email,
        mother_address_street: previewData.data.mother?.address?.street,
        mother_address_rt: previewData.data.mother?.address?.rt,
        mother_address_rw: previewData.data.mother?.address?.rw,
        mother_address_village: previewData.data.mother?.address?.village,
        mother_address_district: previewData.data.mother?.address?.district,
        mother_address_city_regency:
          previewData.data.mother?.address?.city_regency,
        mother_address_province: previewData.data.mother?.address?.province,
        mother_address_other: previewData.data.mother?.address?.other,
        mother_company_addresses: previewData.data.mother?.company_address,

        // Guardian data
        guardian_name: previewData.data.guardian?.name,
        relation_to_student: previewData.data.guardian?.relation_to_student,
        guardian_phone: previewData.data.guardian?.phone,
        guardian_email: previewData.data.guardian?.email,
        guardian_address_street: previewData.data.guardian?.address?.street,
        guardian_address_rt: previewData.data.guardian?.address?.rt,
        guardian_address_rw: previewData.data.guardian?.address?.rw,
        guardian_address_village: previewData.data.guardian?.address?.village,
        guardian_address_district: previewData.data.guardian?.address?.district,
        guardian_address_city_regency:
          previewData.data.guardian?.address?.city_regency,
        guardian_address_province: previewData.data.guardian?.address?.province,
        guardian_address_other: previewData.data.guardian?.address?.other,
      };
    }

    return displayData.parentGuardian || displayData.formData?.parentGuardian;
  };

  const getPaymentData = () => {
    if (previewData?.data?.payment) {
      const payment = previewData.data.payment;
      const discount = previewData.data.discount?.[0];

      // ✅ PERBAIKAN: Mapping yang sesuai dengan struktur data form
      return {
        payment_type: payment.type || "Tuition Fee",
        payment_method: payment.method || "Full Payment",
        financial_policy_contract: payment.financial_policy || "Signed",

        // Discount
        discount_name: discount?.type || "",
        discount_notes: discount?.notes || "",
      };
    }

    return displayData.termOfPayment || displayData.formData?.termOfPayment;
  };

  const getStudentStatusData = () => {
    if (previewData?.data?.student) {
      return {
        student_status: previewData.data.student.student_status,
        input_name: previewData.data.student.student_id,
      };
    }

    return displayData.studentStatus || displayData.formData?.studentStatus;
  };

  // Format date untuk display
  const formatDate = (dateString) => {
    if (!dateString) return "12 September 2025"; // Default date
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Extract semester number
  const getSemesterNumber = (semester) => {
    if (!semester) return "1 (One)";
    return semester.includes("1") ? "1 (One)" : "2 (Two)";
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.printPageA4}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Loading preview data...</p>
          <p>Application ID: {applicationId}</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className={styles.printPageA4}>
        <div style={{ textAlign: "center", padding: "50px" }}>
          <p>Error loading preview: {error}</p>
          <p>Application ID: {applicationId}</p>
          <button onClick={() => navigate(-1)}>Go Back</button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.printPageA4}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <img src={kop} alt="Header KOP" className={styles.headerKop} />
          <div className={styles.schoolInfo}>
            <div className={styles.schoolName}>
              <b>MANADO INDEPENDENT SCHOOL</b>
            </div>
            <div className={styles.schoolAddress}>
              Jl. Walanda Maramis, Kolongan, North Minahasa 95371, North
              Sulawesi, Indonesia.
            </div>
            <div className={styles.schoolAddress}>
              PO BOX 1627 Manado 95016. Telp: +62 (431) 892-252, 893-300; Fax
              +62 (431) 892-678
            </div>
            <div className={styles.schoolAddress}>
              Website: www.mis-mdo.sch.id; Email: info@mis-mdo.sch.id
            </div>
          </div>
        </div>
        <div className={styles.title}>
          <b className={styles.applicationForm}>APPLICATION FORM</b>
        </div>
        <div className={styles.formInfo}>
          <div className={styles.dateParent}>
            <b className={styles.applicationForm}>Date:</b>
            <b className={styles.applicationForm}>
              {formatDate(displayData.date)}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>Semester:</b>
            <b className={styles.applicationForm}>
              {getSemesterNumber(displayData.semester)}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>School Year:</b>
            <b className={styles.applicationForm}>
              {displayData.schoolYear || "2025/2026"}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>Registration Number:</b>
            <b className={styles.applicationForm}>
              {displayData.registration_number || "7466"}
            </b>
          </div>
          <div className={styles.registrationIdParent}>
            <b className={styles.applicationForm}>Registration ID:</b>
            <b className={styles.applicationForm}>
              {displayData.registration_id ||
                displayData.registrationId ||
                "001/RF NO-HS/XI-25"}
            </b>
          </div>
          {applicationId && (
            <div className={styles.applicationIdParent}>
              <b className={styles.applicationForm}>Application ID:</b>
              <b className={styles.applicationForm}>{applicationId}</b>
            </div>
          )}
        </div>
      </div>
      <div className={styles.form}>
        <div className={styles.studentsInformation}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>STUDENT'S INFORMATION</b>
          </div>
          <StudentsInformationContent
            studentData={{
              ...getStudentData(), // Ambil semua data student
              student_status: getStudentStatusData()?.student_status, // Override dengan status yang benar
              input_name: getStudentStatusData()?.input_name,
            }}
          />
        </div>
        <div className={styles.program}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>PROGRAM</b>
          </div>
          <ProgramContent programData={getProgramData()} />
        </div>
        <div className={styles.facilities}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>FACILITIES</b>
          </div>
          <FacilitiesContent facilitiesData={getFacilitiesData()} />
        </div>
        <div className={styles.parentsguardianInformation}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>
              PARENT / GUARDIAN INFORMATION
            </b>
          </div>
          <ParentsGuardianInformationContent parentData={getParentData()} />
        </div>
        <div className={styles.termOfPayment}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>TERM OF PAYMENT</b>
          </div>
          <TermofPaymentContent paymentData={getPaymentData()} />
        </div>
        <div className={styles.pledge}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>PLEDGE</b>
          </div>
          <PledgeContent
            pledgeData={{
              father: getParentData(),
              mother: getParentData(),
              student: getStudentData(),
            }}
          />
        </div>
        <div className={styles.signature}>
          <SignatureContent />
        </div>
        <div className={styles.otherDetail}>
          <OtherDetailContent />
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <img src={footer} alt="Footer" className={styles.footerImg} />
        </div>
      </div>
    </div>
  );
}
export default Print;
