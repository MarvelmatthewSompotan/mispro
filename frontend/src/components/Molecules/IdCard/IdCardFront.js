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
  const { firstName, lastName, photoUrl, studentId, sectionName } = data;

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
        alt="Student"
        src={photoUrl || userPlaceholder}
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
              <div className={styles.lastName}>{lastName},</div>
              <div className={styles.firstName}>{firstName}</div>
            </div>
            <div className={styles.studentId}>ID: {studentId}</div>
          </div>

          {/* Footer: Section & Logo & QR */}
          <div className={styles.footerGroup}>
            <div className={styles.schoolInfo}>
              <div className={styles.sectionName}>{sectionName}</div>
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
