import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import styles from '../styles/Print.module.css';
import kop from '../../assets/LogoMIS_Print.png';
import footer from '../../assets/Footer.png';
import StudentsInformationContent from '../Print_Content/StudentsInformation_Content/StudentsInformation_Content';
import ProgramContent from '../Print_Content/Program_Content/Program_Content';
import FacilitiesContent from '../Print_Content/Facilities_Content/Facilities_Content';
import ParentsGuardianInformationContent from '../Print_Content/ParentsGuardianInformation_Content/ParentsGuardianInformation_Content';
import TermofPaymentContent from '../Print_Content/TermofPayment_Content/TermofPayment_Content';
import PledgeContent from '../Print_Content/Pledge_Content/Pledge_Content';
import SignatureContent from '../Print_Content/Signature_Content/Signature_Content';
import OtherDetailContent from '../Print_Content/OtherDetail_Content/OtherDetail_Content';
import {
  getRegistrationPreview,
  getRegistrationOptions,
} from '../../services/api';

function Print() {
  const location = useLocation();
  const { applicationId } = location.state || {};

  const printRef = useRef();
  const hasDownloadedRef = useRef(false);

  const [previewData, setPreviewData] = useState(null);
  const [sectionOptions, setSectionOptions] = useState([]);
  const [programOptions, setProgramOptions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fungsi untuk download PDF
  const downloadPDF = async (studentName) => {
    if (hasDownloadedRef.current || !printRef.current) return;
    
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${studentName}_Application_Form.pdf`);
      
      hasDownloadedRef.current = true;
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const [previewResp, optionsResp] = await Promise.all([
          getRegistrationPreview(applicationId),
          getRegistrationOptions(),
        ]);

        setPreviewData(previewResp.data);
        setSectionOptions(optionsResp.sections || []);
        setProgramOptions(optionsResp.programs || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (applicationId) {
      fetchAllData();
    } else {
      console.error('No applicationId provided in navigation state');
      setLoading(false);
    }
  }, [applicationId]);

  // Efek untuk memicu download setelah data dimuat
  useEffect(() => {
    if (!loading && previewData && previewData.student && !hasDownloadedRef.current) {
      const studentName = previewData.student.first_name + ' ' + previewData.student.last_name;
      downloadPDF(studentName.replace(/[\\?%*:|"<>]/g, '-'));
    }
  }, [loading, previewData]);


  if (loading) return <div>Loading preview...</div>;
  if (!applicationId) return <div>No application ID found</div>;
  if (!previewData) return <div>No preview data found</div>;

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return new Intl.DateTimeFormat('en-GB', options).format(date);
  };

  const getSemesterNumber = (semester) => {
    if (!semester) return '';
    return semester.includes('1') ? '1 (One)' : '2 (Two)';
  };

  return (
    <div ref={printRef} className={styles.printPageA4}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <img src={kop} alt='Header KOP' className={styles.headerKop} />
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
              {formatDate(previewData.student?.registration_date) || ''}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>Semester:</b>
            <b className={styles.applicationForm}>
              {getSemesterNumber(previewData.enrollment?.semester?.number) ||
                ''}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>School Year:</b>
            <b className={styles.applicationForm}>
              {previewData.enrollment?.school_year?.year || ''}
            </b>
          </div>
          <div className={styles.semesterParent}>
            <b className={styles.applicationForm}>Registration Number:</b>
            <b className={styles.applicationForm}>
              {previewData.registration_number}
            </b>
          </div>
          <div className={styles.registrationIdParent}>
            <b className={styles.applicationForm}>Registration ID: </b>
            <b className={styles.applicationForm}>
              {previewData.student?.registration_id || ''}
            </b>
          </div>
        </div>
      </div>
      <div className={styles.form}>
        <div className={styles.studentsInformation}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>STUDENT'S INFORMATION</b>
          </div>
          <StudentsInformationContent data={previewData.student} />
        </div>
        <div className={styles.program}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>PROGRAM</b>
          </div>
          <ProgramContent
            data={previewData.enrollment}
            sectionOptions={sectionOptions}
            programOptions={programOptions}
          />
        </div>
        <div className={styles.facilities}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>FACILITIES</b>
          </div>
          <FacilitiesContent data={previewData.enrollment} />
        </div>
        <div className={styles.parentsguardianInformation}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>
              PARENT / GUARDIAN INFORMATION
            </b>
          </div>
          <ParentsGuardianInformationContent
            father={previewData.father}
            mother={previewData.mother}
            guardian={previewData.guardian}
          />
        </div>
        <div className={styles.termOfPayment}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>TERM OF PAYMENT</b>
          </div>
          <TermofPaymentContent
            payment={previewData.payment}
            discount={previewData.discount}
          />
        </div>
        <div className={styles.pledge}>
          <div className={styles.header1}>
            <b className={styles.applicationForm}>PLEDGE</b>
          </div>
          <PledgeContent
            student={previewData.student}
            father={previewData.father}
            mother={previewData.mother}
          />
        </div>
        <div className={styles.signature}>
          <SignatureContent student={previewData.student} />
        </div>
        <div className={styles.otherDetail}>
          <OtherDetailContent />
        </div>
      </div>
      <div className={styles.footer}>
        <div className={styles.footerRow}>
          <img src={footer} alt='Footer' className={styles.footerImg} />
        </div>
      </div>
    </div>
  );
}

export default Print;