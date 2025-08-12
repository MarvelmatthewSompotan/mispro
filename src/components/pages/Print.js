import React, { useRef, useEffect } from 'react';
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

function Print() {
  const printRef = useRef();

  useEffect(() => {
    const downloadPDF = async () => {
      const element = printRef.current;

      // Ambil nama student dari preview
      let studentName = document.querySelector('#student-name')?.textContent || 'Student_Name';
      studentName = studentName.replace(/[\\?%*:|"<>]/g, '-'); // bersihkan karakter ilegal untuk nama file

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${studentName}_Application_Form.pdf`);
    };

    downloadPDF();
  }, []);

  return (
    <div ref={printRef} className={styles.printPageA4}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <img src={kop} alt="Header KOP" className={styles.headerKop} />
          <div className={styles.schoolInfo}>
            <div className={styles.schoolName}><b>MANADO INDEPENDENT SCHOOL</b></div>
            <div className={styles.schoolAddress}>Jl. Walanda Maramis, Kolongan, North Minahasa 95371, North Sulawesi, Indonesia.</div>
            <div className={styles.schoolAddress}>PO BOX 1627 Manado 95016. Telp: +62 (431) 892-252, 893-300; Fax +62 (431) 892-678</div>
            <div className={styles.schoolAddress}>Website: www.mis-mdo.sch.id; Email: info@mis-mdo.sch.id</div>
          </div>
        </div>
        <div className={styles.title}>
          <b className={styles.applicationForm}>APPLICATION FORM</b>
        </div>
        <div className={styles.formInfo}>
          <div className={styles.dateParent}>
            <b>Date:</b>
            <b>12 September 2025</b>
          </div>
          <div className={styles.semesterParent}>
            <b>Semester:</b>
            <b>1 (One)</b>
          </div>
          <div className={styles.semesterParent}>
            <b>School Year:</b>
            <b>2025/2026</b>
          </div>
          <div className={styles.semesterParent}>
            <b>Registration Number:</b>
            <b>7466</b>
          </div>
          <div className={styles.registrationIdParent}>
            <b>Registration ID:</b>
            <b>001/RF NO-HS/XI-25</b>
          </div>
        </div>
      </div>

      <div className={styles.form}>
        <div className={styles.studentsInformation}>
          <div className={styles.header1}>
            <b>STUDENT’S INFORMATION</b>
          </div>
          {/* Pastikan ada id student-name supaya bisa dibaca */}
          <div id="student-name" style={{ display: 'none' }}>John Doe</div>
          <StudentsInformationContent />
        </div>
        <div className={styles.program}>
          <div className={styles.header1}>
            <b>PROGRAM</b>
          </div>
          <ProgramContent />
        </div>
        <div className={styles.facilities}>
          <div className={styles.header1}>
            <b>FACILITIES</b>
          </div>
          <FacilitiesContent />
        </div>
        <div className={styles.parentsguardianInformation}>
          <div className={styles.header1}>
            <b>PARENT / GUARDIAN INFORMATION</b>
          </div>
          <ParentsGuardianInformationContent />
        </div>
        <div className={styles.termOfPayment}>
          <div className={styles.header1}>
            <b>TERM OF PAYMENT</b>
          </div>
          <TermofPaymentContent />
        </div>
        <div className={styles.pledge}>
          <div className={styles.header1}>
            <b>PLEDGE</b>
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
