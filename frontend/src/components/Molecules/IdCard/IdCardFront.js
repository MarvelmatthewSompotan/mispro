// IdCardFront.js
import React, { useState, useRef } from "react"; // Tambah useRef & useState
import styles from "./IdCardFront.module.css";
import Logo from "../../Atoms/Logo/Logo";

import headerBg from "../../../assets/headerBg.png";
import userPlaceholder from "../../../assets/user.svg";
import qrPlaceholder from "../../../assets/qr.svg";

import waveRed from "../../../assets/waveRed.png";
import waveBlue from "../../../assets/waveBlue.png";
import waveYellow from "../../../assets/WaveYellow.png";

// Tambahkan props: editable (boolean) & scale (number)
const IdCardFront = ({
  data,
  variant = "ecp",
  editable = false,
  scale = 1,
}) => {
  const { first_name, last_name, photo_url, student_id, section_name } =
    data || {};

  // --- STATE UNTUK POSISI FOTO ---
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 }); // Posisi awal mouse

  // --- LOGIKA DRAGGING ---
  const handleMouseDown = (e) => {
    if (!editable) return;
    e.preventDefault(); // Mencegah default drag behavior browser
    setIsDragging(true);
    // Simpan posisi mouse awal
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !editable) return;

    // Hitung selisih gerakan mouse
    // PENTING: Bagi dengan scale agar gerakan mouse sinkron dengan gambar yang diperkecil/diperbesar
    const deltaX = (e.clientX - startPos.x) / scale;
    const deltaY = (e.clientY - startPos.y) / scale;

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    // Update startPos untuk frame selanjutnya
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // -------------------------

  const config = {
    ecp: {
      wave: waveRed,
      logoVariant: "blue",
      styleClass: styles.variantEcp,
    },
    ms: {
      wave: waveBlue,
      logoVariant: "blue",
      styleClass: styles.variantMs,
    },
    hs: {
      wave: waveYellow,
      logoVariant: "blue",
      styleClass: styles.variantHs,
    },
  };

  const currentConfig = config[variant] || config.ecp;

  return (
    <div
      className={`${styles.idCardBase} ${currentConfig.styleClass}`}
      // Event Mouse Up global di container kartu agar drag berhenti jika mouse lepas di luar foto
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
    >
      <img className={styles.headerBg} alt="" src={headerBg} />

      {/* --- AREA FOTO BARU --- */}
      <div className={styles.photoContainer}>
        <img
          className={editable ? styles.photoDraggable : styles.photoStatic}
          alt="Student"
          src={photo_url}
          draggable={false} // Disable native HTML5 drag
          onError={(e) => {
            e.target.src = userPlaceholder;
          }}
          // Pasang Style Posisi dinamis
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
            // Note: scale(1.2) opsional agar gambar lebih besar dari kotak, memudahkan geser
          }}
          // Event Handlers
          onMouseDown={handleMouseDown}
        />
      </div>
      {/* ---------------------- */}

      <div className={styles.bottomWrapper}>
        {/* ... (Sisa kode sama persis) ... */}
        <img className={styles.waveBg} alt="" src={currentConfig.wave} />

        <div className={styles.contentOverlay}>
          <div className={styles.infoGroup}>
            <div className={styles.nameGroup}>
              <div className={styles.lastName}>{last_name},</div>
              <div className={styles.firstName}>{first_name}</div>
            </div>
            <div className={styles.studentId}>ID: {student_id}</div>
          </div>

          <div className={styles.footerGroup}>
            <div className={styles.schoolInfo}>
              <div className={styles.sectionName}>{section_name}</div>
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
