import React from "react";
import { useLocation } from "react-router-dom";
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
  const formData = location.state || {};

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
              {formatDate(formData.date)}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>Semester:</b>
            <b className={styles.applicationForm}>
              {getSemesterNumber(formData.semester)}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>School Year:</b>
            <b className={styles.applicationForm}>
              {formData.schoolYear || "2025/2026"}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>Registration Number:</b>
            <b className={styles.applicationForm}>7466</b>
          </div>
          <div className={styles.registrationIdParent}>
            <b className={styles.applicationForm}>Registration ID:</b>
            <b className={styles.applicationForm}>
              {formData.registrationId || "001/RF NO-HS/XI-25"}
            </b>
          </div>
        </div>
      </div>
      <div className={styles.form}>
        <div className={styles.studentsInformation}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>STUDENT'S INFORMATION</b>
          </div>
          <StudentsInformationContent />
        </div>
        <div className={styles.program}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>PROGRAM</b>
          </div>
          <ProgramContent />
        </div>
        <div className={styles.facilities}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>FACILITIES</b>
          </div>
          <FacilitiesContent />
        </div>
        <div className={styles.parentsguardianInformation}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>
              PARENT / GUARDIAN INFORMATION
            </b>
          </div>
          <ParentsGuardianInformationContent />
        </div>
        <div className={styles.termOfPayment}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>TERM OF PAYMENT</b>
          </div>
          <TermofPaymentContent />
        </div>
        <div className={styles.pledge}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>PLEDGE</b>
          </div>
          <PledgeContent />
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
