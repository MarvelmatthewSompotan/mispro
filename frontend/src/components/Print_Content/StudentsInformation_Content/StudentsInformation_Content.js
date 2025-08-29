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
          <div className={styles.contentFullName}>{`Full name `}</div>
          <b className={styles.contentFullName}>{fullName}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Student ID</div>
          <b className={styles.regular}>{data.nisn || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>NIK</div>
          <b className={styles.regular}>{data.nik || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>NISN</div>
          <b className={styles.regular}>{data.nisn || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>KITAS</div>
          <b className={styles.regular}>{data.kitas || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Academic status</div>
          <b className={styles.regular}>{data.academic_status || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Student status</div>
          <b className={styles.regular}>{studentStatus}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Previous School</div>
          <b className={styles.regular}>{data.previous_school || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Email address</div>
          <b className={styles.regular}>{data.email || "N/A"}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Phone number</div>
          <b className={styles.regular}>{data.phone_number || "N/A"}</b>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Citizenship</div>
              <b className={styles.regular}>{data.citizenship || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Religion</div>
              <b className={styles.regular}>{data.religion || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Place of birth</div>
              <b className={styles.regular}>{data.place_of_birth || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Date of birth</div>
              <b className={styles.regular}>{data.date_of_birth || "N/A"}</b>
            </div>
          </div>
          <div className={styles.contentRight}>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Nickname</div>
              <b className={styles.regular}>{data.nickname || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Gender</div>
              <b className={styles.contentFullName}>{data.gender || "N/A"}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.contentFullName}>Age</div>
              <b className={styles.b7}>{data.age || "N/A"}</b>
            </div>
            <div className={styles.rankInFamily}>
              <div className={styles.contentFullName}>Rank in the family</div>
              <b className={styles.b7}>{data.family_rank || "N/A"}</b>
            </div>
          </div>
        </div>
        <div className={styles.top}>
          <div className={styles.address}>
            <div className={styles.contentFullName}>Address</div>
            <b className={styles.contentFullName}>{fullAddress}</b>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsInformationContent;
