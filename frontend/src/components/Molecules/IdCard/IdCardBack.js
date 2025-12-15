import React from "react";
import styles from "./IdCardBack.module.css";
// Import Component Logo
import Logo from "../../Atoms/Logo/Logo";

const IdCardBack = ({ data, variant = "ecp" }) => {
  const { nisn, placeOfBirth, dateOfBirth, schoolYear } = data;

  // Logika Warna Background & Logo Variant
  let variantClass = styles.bgEcp;
  let logoVariant = "white"; // Default Logo Putih

  if (variant === "ms") {
    variantClass = styles.bgMs;
    logoVariant = "white"; // Logo Putih
  } else if (variant === "hs") {
    variantClass = styles.bgHs;
    logoVariant = "blue"; // Logo Biru
  }

  // Format Tanggal
  const dobFormatted = dateOfBirth
    ? new Date(dateOfBirth).toLocaleDateString("en-GB")
    : "-";

  // Hitung Valid Until
  const entryYear = schoolYear
    ? parseInt(schoolYear.split("-")[0])
    : new Date().getFullYear();
  const validYear = entryYear + 3;

  return (
    <div className={`${styles.idCardBackBase} ${variantClass}`}>
      <div className={styles.contentWrapper}>
        {/* Header Info Sekolah */}
        <div className={styles.headerInfo}>
          {/* Panggil Component Logo */}
          <Logo
            variant={logoVariant}
            isCard={true}
            className={styles.logoSmall}
          />
          <div className={styles.addressText}>
            Jl. Walanda Maramis, Kolongan, North Minahasa 95371, North Sulawesi,
            Indonesia.
            <br />
            Telp: +62 (431) 892-252, 893-300; Fax +62 (431) 892-678
            <br />
            Email: Info@mis-mdo.sch.id
          </div>
        </div>

        {/* Data Siswa */}
        <div className={styles.studentDataGroup}>
          <div className={styles.dataRow}>
            <span className={styles.nisnLabel}>NISN:</span>
            <span className={styles.value}>{nisn || "-"}</span>
          </div>
          <div className={styles.dataRow}>
            <span className={styles.label}>Place, DOB:</span>
            <span className={styles.value}>
              {placeOfBirth ? placeOfBirth.toUpperCase() : "MANADO"},{" "}
              {dobFormatted}
            </span>
          </div>
        </div>

        <div className={styles.datesGroup}>
          <div>
            <span className={styles.label}>
              School Year Entry:
              <br />
            </span>
            <span className={styles.value}>{schoolYear || "-"}</span>
          </div>
          <div>
            <span className={styles.label}>
              Valid Until:
              <br />
            </span>
            <span className={styles.value}>20/06/{validYear}</span>
          </div>
        </div>

        {/* Rules */}
        <div className={styles.rulesGroup}>
          <div className={styles.rulesTitle}>Usage of this ID card:</div>
          <ol className={styles.rulesList}>
            <li>
              Non-transferable. Possesion of this card by other than rightful
              owner is prohibited.
            </li>
            <li>Do not use this ID Card as means of Payment.</li>
            <li>Use this card to enter/leave the campus.</li>
            <li>
              Report loss or finding of this ID Card immediately to the
              register’s office.
            </li>
          </ol>
        </div>

        <div className={styles.disclaimer}>
          This ID Card is valid while the above printed name is still registered
          as bonafide student of Manado Independent School (MIS)
        </div>
      </div>
    </div>
  );
};

export default IdCardBack;
