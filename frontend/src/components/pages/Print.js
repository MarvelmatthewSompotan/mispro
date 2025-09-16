import React, { useRef, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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

  // 🔹 State baru untuk loading tombol Print
  const [isPrinting, setIsPrinting] = useState(false);

  // Fungsi untuk download PDF manual
  const downloadPDF = async () => {
    if (!printRef.current || !previewData?.student_id) return;

    setIsPrinting(true); // mulai loading
    try {
      const element = printRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        ignoreElements: (el) => el.classList.contains('no-print'),
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

      const studentName =
        `${previewData.request_data.first_name} ${previewData.request_data.last_name}`.replace(
          /[\\?%*:|"<>]/g,
          '-'
        );

      pdf.save(`${studentName}_Application_Form.pdf`);
    } catch (error) {
      console.error('Failed to generate PDF:', error);
    } finally {
      setIsPrinting(false); // selesai loading
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
  }, [applicationId, version]);

  if (loading)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          fontWeight: 'medium',
        }}
      >
        Loading preview...
      </div>
    );

  if (!applicationId)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        No application ID found
      </div>
    );

  if (!previewData)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          fontSize: '18px',
          fontWeight: 'bold',
        }}
      >
        No preview data found
      </div>
    );
  // eslint-disable-next-line
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
    <div className={styles.printWrapper}>
      {/* 🔹 Tombol kontrol */}
      <div
        className='no-print'
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          width: '100%',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '10px',
          padding: '20px 20px',
          background: '#fff',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          zIndex: 9999,
        }}
      >
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '6px 12px',
            background: '#fff',
            color: '#7b7bfa',
            border: '2px solid #7b7bfa',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '600',
          }}
        >
          Back to Home
        </button>
        <button
          onClick={downloadPDF}
          disabled={isPrinting}
          style={{
            marginRight: '40px',
            padding: '6px 12px',
            background: isPrinting ? '#aaa' : '#7b7bfa',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            cursor: isPrinting ? 'not-allowed' : 'pointer',
            fontFamily: "'Poppins', sans-serif",
            fontWeight: '600',
          }}
        >
          {isPrinting ? 'Generating PDF...' : 'Print'}
        </button>
      </div>

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
            <div className={styles.semesterParent}>
              <b className={styles.applicationForm}>Semester:</b>
              <b className={styles.applicationForm}>
                {getSemesterNumber(previewData.semester ?? '')}
              </b>
            </div>
            <div className={styles.semesterChild}>
              <b className={styles.applicationForm}>School Year:</b>
              <b className={styles.applicationForm}>
                {previewData.school_year ?? ''}
              </b>
            </div>
            <div className={styles.semesterChild}>
              <b className={styles.applicationForm}>Registration Number:</b>
              <b className={styles.applicationForm}>
                {previewData.registration_number ?? ''}
              </b>
            </div>
            <div className={styles.registrationIdParent}>
              <b className={styles.applicationForm}>Registration ID: </b>
              <b className={styles.applicationForm}>
                {previewData.registration_id ?? ''}
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
        <div className={styles.footer}>
          <div className={styles.footerRow}>
            <img src={footer} alt='Footer' className={styles.footerImg} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Print;
