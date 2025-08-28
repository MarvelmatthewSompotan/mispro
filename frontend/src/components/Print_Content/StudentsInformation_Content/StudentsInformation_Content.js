import React, { useMemo } from "react";
import styles from "../../styles/StudentsInformation_Content.module.css";

const StudentsInformationContent = ({ studentData }) => {
  // Default values jika tidak ada data
  const data = studentData || {};
  
  // ✅ PERBAIKAN: Gunakan useMemo untuk mencegah re-render
  const fullName = useMemo(() => {
    const firstName = data.first_name || "";
    const middleName = data.middle_name || "";
    const lastName = data.last_name || "";
    
    if (firstName && middleName && lastName) {
      return `${firstName} - ${middleName} - ${lastName}`;
    } else if (firstName && lastName) {
      return `${firstName} - ${lastName}`;
    } else if (firstName) {
      return firstName;
    }
    return "N/A";
  }, [data.first_name, data.middle_name, data.last_name]);

  const fullAddress = useMemo(() => {
    const street = data.street || "";
    const rt = data.rt || "";
    const rw = data.rw || "";
    const village = data.village || "";
    const district = data.district || "";
    const city = data.city_regency || "";
    const province = data.province || "";
    const other = data.other || "";
    
    const addressParts = [street];
    
    if (rt && rw) {
      addressParts.push(`${rt}/${rw}`);
    } else if (rt) {
      addressParts.push(rt);
    } else if (rw) {
      addressParts.push(rw);
    }
    
    [village, district, city, province].forEach(part => {
      if (part) addressParts.push(part);
    });
    
    const fullAddress = addressParts.join(", ");
    return other ? `${fullAddress} (${other})` : fullAddress;
  }, [data.street, data.rt, data.rw, data.village, data.district, data.city_regency, data.province, data.other]);

  const studentStatus = useMemo(() => {
    const status = data.student_status || "";
    if (status.toLowerCase() === "old") {
      return "OLD";
    } else if (status.toLowerCase() === "new") {
      return "NEW";
    }
    return status.toUpperCase() || "N/A";
  }, [data.student_status]);

  // ✅ PERBAIKAN: Hapus console.log yang berlebihan
  // console.log("StudentsInformationContent - Received data:", data);
  // console.log("Name parts:", { firstName, middleName, lastName });
  // console.log("Student status raw:", status);

  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>{`Full name `}</div>
          <b className={styles.jhoanne}>{fullName}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student ID</div>
          <b className={styles.regular}>{data.nisn || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Academic status</div>
          <b className={styles.regular}>{data.academic_status || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student status</div>
          <b className={styles.regular}>{studentStatus}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Previous School</div>
          <b className={styles.regular}>{data.previous_school || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Email address</div>
          <b className={styles.regular}>{data.email || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Phone number</div>
          <b className={styles.regular}>{data.phone_number || "N/A"}</b>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Citizenship</div>
              <b className={styles.regular}>{data.citizenship || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Religion</div>
              <b className={styles.regular}>{data.religion || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Place of birth</div>
              <b className={styles.regular}>{data.place_of_birth || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Date of birth</div>
              <b className={styles.regular}>{data.date_of_birth || "N/A"}</b>
            </div>
          </div>
          <div className={styles.right1}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Nickname</div>
              <b className={styles.regular}>{data.nickname || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Gender</div>
              <b className={styles.jhoanne}>{data.gender || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Age</div>
              <b className={styles.b3}>{data.age || "N/A"}</b>
            </div>
            <div className={styles.rankInFamily}>
              <div className={styles.jhoanne}>Rank in the family</div>
              <b className={styles.b3}>{data.family_rank || "N/A"}</b>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.address}>
            <div className={styles.jhoanne}>Address</div>
            <b className={styles.jhoanne}>{fullAddress}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsInformationContent;
