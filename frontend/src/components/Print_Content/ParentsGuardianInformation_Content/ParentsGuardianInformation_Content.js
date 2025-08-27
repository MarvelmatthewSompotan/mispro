import React from "react";
import styles from "../../styles/ParentsGuardianInformation_Content.module.css";

const ParentsGuardianInformationContent = ({ parentData }) => {
  const data = parentData || {};
  
  // Helper function untuk format address dengan rt/rw
  const getFullAddress = (addressData) => {
    const street = addressData.street || "";
    const rt = addressData.rt || "";
    const rw = addressData.rw || "";
    const village = addressData.village || "";
    const district = addressData.district || "";
    const city = addressData.city_regency || "";
    const province = addressData.province || "";
    const other = addressData.other || "";
    
    const addressParts = [street];
    
    // Tambahkan rt/rw jika ada
    if (rt && rw) {
      addressParts.push(`${rt}/${rw}`);
    } else if (rt) {
      addressParts.push(rt);
    } else if (rw) {
      addressParts.push(rw);
    }
    
    // Tambahkan bagian address lainnya
    [village, district, city, province].forEach(part => {
      if (part) addressParts.push(part);
    });
    
    const fullAddress = addressParts.join(", ");
    
    return other ? `${fullAddress} (${other})` : fullAddress;
  };

  // Helper function untuk nama lengkap
  const getFullName = (personData) => {
    const firstName = personData.first_name || "";
    const middleName = personData.middle_name || "";
    const lastName = personData.last_name || "";
    
    if (firstName && middleName && lastName) {
      return `${firstName} ${middleName} ${lastName}`;
    } else if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    }
    return "N/A";
  };

  // Helper function untuk extract address data dari parent data
  const extractAddressData = (prefix) => {
    return {
      street: data[`${prefix}_address_street`] || "",
      rt: data[`${prefix}_address_rt`] || "",
      rw: data[`${prefix}_address_rw`] || "",
      village: data[`${prefix}_address_village`] || "",
      district: data[`${prefix}_address_district`] || "",
      city_regency: data[`${prefix}_address_city_regency`] || "",
      province: data[`${prefix}_address_province`] || "",
      other: data[`${prefix}_address_other`] || "",
    };
  };

  return (
    <div className={styles.content}>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>Father's Information</div>
        </div>
        <div className={styles.first}>
          <div className={styles.left}>
            <div className={styles.name}>
              <div className={styles.johnDoe}>{`Name `}</div>
              <b className={styles.johnDoe}>{data.father_name || "N/A"}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Phone number</div>
              <b className={styles.johnDoe}>{data.father_phone || "N/A"}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Email</div>
              <b className={styles.johndoehebatgmailcom}>{data.father_email || "N/A"}</b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.txtFather}>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Company name</div>
                <b className={styles.ptMultiRakyat}>{data.father_company || "N/A"}</b>
              </div>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Occupation/Position</div>
                <b className={styles.fieldManager}>{data.father_occupation || "N/A"}</b>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.johnDoe}>Address</div>
              <b className={styles.johnDoe}>{getFullAddress(extractAddressData('father'))}</b>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>Mother's Information</div>
        </div>
        <div className={styles.first}>
          <div className={styles.left}>
            <div className={styles.name}>
              <div className={styles.johnDoe}>{`Name `}</div>
              <b className={styles.johnDoe}>{data.mother_name || "N/A"}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Phone number</div>
              <b className={styles.johnDoe}>{data.mother_phone || "N/A"}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Email</div>
              <b className={styles.johndoehebatgmailcom}>{data.mother_email || "N/A"}</b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.txtFather}>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Company name</div>
                <b className={styles.ptMultiRakyat}>{data.mother_company || "N/A"}</b>
              </div>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Occupation/Position</div>
                <b className={styles.fieldManager}>{data.mother_occupation || "N/A"}</b>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.johnDoe}>Address</div>
              <b className={styles.johnDoe}>{getFullAddress(extractAddressData('mother'))}</b>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>
            Authorized Guardian's Information
          </div>
        </div>
        <div className={styles.guardianInfo}>
          <div className={styles.left1}>
            <div className={styles.top1}>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>{`Name `}</div>
                <b className={styles.uncle}>{data.guardian_name || "N/A"}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>Relationship to student</div>
                <b className={styles.uncle}>{data.relation_to_student || "N/A"}</b>
              </div>
            </div>
            <div className={styles.top1}>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>Phone number</div>
                <b className={styles.uncle}>{data.guardian_phone || "N/A"}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>Email</div>
                <b className={styles.uncle}>{data.guardian_email || "N/A"}</b>
              </div>
            </div>
          </div>
          <div className={styles.right1}>
            <div className={styles.address3}>
              <div className={styles.johnDoe}>Address</div>
              <b className={styles.johnDoe}>{getFullAddress(extractAddressData('guardian'))}</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentsGuardianInformationContent;
