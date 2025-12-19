import React from "react";
import styles from "./IdCardFront.module.css";
// Import component Logo
import Logo from "../../Atoms/Logo/Logo";

// Import Assets (Header & Wave)
import headerBg from "../../../assets/headerBg.png";
import userPlaceholder from "../../../assets/user.svg";
import qrPlaceholder from "../../../assets/qr.svg";

// Assets Varian Wave
import waveRed from "../../../assets/waveRed.png";
import waveBlue from "../../../assets/waveBlue.png";
import waveYellow from "../../../assets/WaveYellow.png";

const IdCardFront = ({ data, variant = "ecp" }) => {
  // PERUBAHAN: Mengambil data dengan key snake_case sesuai response API
  const { first_name, last_name, photo_url, student_id, section_name } =
    data || {};

  // Mapping konfigurasi: Wave Image & Logo Variant
  const config = {
    ecp: {
      wave: waveRed,
      logoVariant: "blue", // Logo Putih
      styleClass: styles.variantEcp,
    },
    ms: {
      wave: waveBlue,
      logoVariant: "blue", // Logo Putih
      styleClass: styles.variantMs,
    },
    hs: {
      wave: waveYellow,
      logoVariant: "blue", // Logo Biru (Asli)
      styleClass: styles.variantHs,
    },
  };

  const currentConfig = config[variant] || config.ecp;

  return (
    <div className={`${styles.idCardBase} ${currentConfig.styleClass}`}>
      {/* Background Header */}
      <img className={styles.headerBg} alt="" src={headerBg} />

      {/* Foto Student */}
      <img
        className={styles.photoBase}
        alt=""
        src={photo_url}
        onError={(e) => {
          e.target.src = userPlaceholder;
        }}
      />
  
      {/* Konten Bawah */}
      <div className={styles.bottomWrapper}>
        <img className={styles.waveBg} alt="" src={currentConfig.wave} />

        <div className={styles.contentOverlay}>
          {/* Nama & ID */}
          <div className={styles.infoGroup}>
            <div className={styles.nameGroup}>
              {/* PERUBAHAN: Gunakan variable snake_case */}
              <div className={styles.lastName}>{last_name},</div>
              <div className={styles.firstName}>{first_name}</div>
            </div>
            <div className={styles.studentId}>ID: {student_id}</div>
          </div>

          {/* Footer: Section & Logo & QR */}
          <div className={styles.footerGroup}>
            <div className={styles.schoolInfo}>
              <div className={styles.sectionName}>{section_name}</div>
              {/* Panggil Component Logo */}
              <Logo
                variant={currentConfig.logoVariant}
                isCard={true}
                className={styles.logoMis}
              />
            </div>
            <img className={styles.qrCode} alt="QR" src={qrPlaceholder} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default IdCardFront;
