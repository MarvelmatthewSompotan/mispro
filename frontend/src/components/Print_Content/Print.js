import React, { useRef, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import styles from "./Print.module.css";
import kop from "../../assets/LogoMIS_Print.png";
import footer from "../../assets/Footer_A4.svg";
import footerF4Logos from "../../assets/Footer_F4.svg";
import switchIcon from "../../assets/switch_icon.svg";
import StudentsInformationContent from "./StudentsInformation_Content/StudentsInformation_Content";
import ProgramContent from "./Program_Content/Program_Content";
import FacilitiesContent from "./Facilities_Content/Facilities_Content";
import ParentsGuardianInformationContent from "./ParentsGuardianInformation_Content/ParentsGuardianInformation_Content";
import TermofPaymentContent from "./TermofPayment_Content/TermofPayment_Content";
import PledgeContent from "./Pledge_Content/Pledge_Content";
import SignatureContent from "./Signature_Content/Signature_Content";
import OtherDetailContent from "./OtherDetail_Content/OtherDetail_Content";
import {
  getRegistrationPreview,
  getRegistrationOptions,
} from "../../services/api";
import Button from "../../components/atoms/Button";

function Print() {
  const location = useLocation();
  const navigate = useNavigate();
  const { applicationId, version } = location.state || {};
  const printRef = useRef();
  const [previewData, setPreviewData] = useState(null);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [pickupPointOptions, setPickupPointOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [majorOptions, setMajorOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isFromSubmission, setIsFromSubmission] = useState(false);
  const [pageSize, setPageSize] = useState("A4");

  useEffect(() => {
    const isFromFormSubmission = location.state?.fromSubmission || false;
    setIsFromSubmission(isFromFormSubmission);
  }, [location.state]);

  useEffect(() => {
    if (!isFromSubmission) return;

    const handleBackNavigation = () => {
      navigate("/registration", { replace: true });
    };

    window.addEventListener("popstate", handleBackNavigation);

    return () => {
      window.removeEventListener("popstate", handleBackNavigation);
    };
  }, [navigate, isFromSubmission]);

  useEffect(() => {
    if (!location.state?.fromSubmission && !location.state?.applicationId) {
      navigate("/registration", { replace: true });
    }
  }, [location.state, navigate]);

  const downloadPDF = async () => {
    if (!printRef.current || !previewData?.student_id) return;

    setIsPrinting(true);
    try {
      const element = printRef.current;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        ignoreElements: (el) => el.classList.contains("no-print"),
      });

      const imgData = canvas.toDataURL("image/jpeg", 0.85);

      const isA4 = pageSize === "A4";
      const pdfWidth = 210;
      const pdfHeight = isA4 ? 297 : 330;

      const pdf = new jsPDF("p", "mm", [pdfWidth, pdfHeight]);

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;
      const canvasRatio = canvasHeight / canvasWidth;
      const pdfRatio = pdfHeight / pdfWidth;

      let imgWidthOnPdf, imgHeightOnPdf;

      if (canvasRatio > pdfRatio) {
        imgHeightOnPdf = pdfHeight;
        imgWidthOnPdf = canvasWidth * (pdfHeight / canvasHeight);
      } else {
        imgWidthOnPdf = pdfWidth;
        imgHeightOnPdf = canvasHeight * (pdfWidth / canvasHeight);
      }

      const x = (pdfWidth - imgWidthOnPdf) / 2;
      const y = 0;

      pdf.addImage(
        imgData,
        "JPEG",
        x,
        y,
        imgWidthOnPdf,
        imgHeightOnPdf,
        undefined,
        "FAST"
      );

      const studentName =
        `${previewData.request_data.first_name} ${previewData.request_data.last_name}`.replace(
          /[\\?%*:|"<>]/g,
          "-"
        );

      pdf.save(`${studentName}_Application_Form (${pageSize}).pdf`);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setIsPrinting(false);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [previewResp, optionsResp] = await Promise.all([
          getRegistrationPreview(applicationId, version),
          getRegistrationOptions(),
        ]);

        setPreviewData(previewResp.data);
        setSectionOptions(optionsResp.sections || []);
        setProgramOptions(optionsResp.programs || []);
        setPickupPointOptions(optionsResp.pickup_points || []);
        setClassOptions(optionsResp.classes || []);
        setMajorOptions(optionsResp.majors || []);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchAllData();
    } else {
      console.error("No applicationId provided in navigation state");
      setLoading(false);
    }
  }, [applicationId, version]);

  if (loading)
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <div>Loading preview...</div>
      </div>
    );

  if (!applicationId)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        No application ID found
      </div>
    );

  if (!previewData)
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontSize: "18px",
          fontWeight: "bold",
        }}
      >
        No preview data found
      </div>
    );
  // eslint-disable-next-line
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Intl.DateTimeFormat("en-GB", options).format(date);
  };

  const getSemesterNumber = (semester) => {
    if (!semester) return "";
    return semester.includes("1") ? "1 (One)" : "2 (Two)";
  };

  const handlePageSizeToggle = () => {
    setPageSize((prevSize) => (prevSize === "A4" ? "F4" : "A4"));
  };

  return (
    <div className={styles.printWrapper}>
      <div className={`no-print ${styles.printActionsBar}`}>
        <h3>Page Format {pageSize}</h3>
        <img
          src={switchIcon}
          alt="Switch View"
          className={styles.switchIcon}
          title="Switch View"
          onClick={handlePageSizeToggle}
        />
        <Button onClick={() => navigate("/registration")} variant="outline">
          Back to Registration
        </Button>
        <Button onClick={downloadPDF} disabled={isPrinting} variant="solid">
          {isPrinting ? "Generating PDF..." : "Export as PDF"}
        </Button>
      </div>

      {/* Konten PDF */}
      <div
        ref={printRef}
        className={
          pageSize === "A4" ? styles.printPageA4 : styles.printPageF4
        }
      >
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
            <div className={styles.semesterParent}>
              <b className={styles.applicationForm}>Semester:</b>
              <b className={styles.applicationForm}>
                {getSemesterNumber(previewData.semester ?? "")}
              </b>
            </div>
            <div className={styles.semesterChild}>
              <b className={styles.applicationForm}>School Year:</b>
              <b className={styles.applicationForm}>
                {previewData.school_year ?? ""}
              </b>
            </div>
            <div className={styles.semesterChild}>
              <b className={styles.applicationForm}>Registration Number:</b>
              <b className={styles.applicationForm}>
                {previewData.registration_number ?? ""}
              </b>
            </div>
            <div className={styles.registrationIdParent}>
              <b className={styles.applicationForm}>Registration ID: </b>
              <b className={styles.applicationForm}>
                {previewData.registration_id ?? ""}
              </b>
            </div>
          </div>
        </div>
        <div className={styles.form}>
          <div className={styles.studentsInformation}>
            <div className={styles.header1}>
              <b className={styles.applicationForm}>STUDENT'S INFORMATION</b>
            </div>
            <StudentsInformationContent data={previewData} />
          </div>
          <div className={styles.program}>
            <div className={styles.header1}>
              <b className={styles.applicationForm}>PROGRAM</b>
            </div>
            <ProgramContent
              data={previewData.request_data}
              sectionOptions={sectionOptions}
              programOptions={programOptions}
              classOptions={classOptions}
              majorOptions={majorOptions}
            />
          </div>
          <div className={styles.facilities}>
            <div className={styles.header1}>
              <b className={styles.applicationForm}>FACILITIES</b>
            </div>
            <FacilitiesContent
              data={previewData.request_data}
              pickupPointOptions={pickupPointOptions}
            />
          </div>
          <div className={styles.parentsguardianInformation}>
            <div className={styles.header1}>
              <b className={styles.applicationForm}>
                PARENT / GUARDIAN INFORMATION
              </b>
            </div>
            <ParentsGuardianInformationContent
              data={previewData.request_data}
            />
          </div>
          <div className={styles.termOfPayment}>
            <div className={styles.header1}>
              <b className={styles.applicationForm}>TERM OF PAYMENT</b>
            </div>
            <TermofPaymentContent data={previewData.request_data} />
          </div>
          <div className={styles.pledge}>
            <div className={styles.header1}>
              <b className={styles.applicationForm}>PLEDGE</b>
            </div>
            <PledgeContent data={previewData.request_data} />
          </div>
          <div className={styles.signature}>
            <SignatureContent data={previewData} />
          </div>
          <div className={styles.otherDetail}>
            <OtherDetailContent />
          </div>
        </div>

        <div
          className={
            pageSize === "A4" ? styles.footerA4 : styles.footerF4
          }
        >
          <div className={styles.footerRow}>
            <img
              src={pageSize === "A4" ? footer : footerF4Logos}
              alt="Footer"
              className={
                pageSize === "A4" ? styles.footerImgA4 : styles.footerImgF4
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Print;