import React, { useState } from "react";
import styles from "./IdCardFront.module.css";
import Logo from "../../Atoms/Logo/Logo";
import headerBg from "../../../assets/headerBg.png";
import userPlaceholder from "../../../assets/user.svg";
import qrPlaceholder from "../../../assets/qr.svg";
import waveRed from "../../../assets/waveRed.png";
import waveBlue from "../../../assets/waveBlue.png";
import waveYellow from "../../../assets/WaveYellow.png";

const IdCardFront = ({
  data,
  variant = "ecp",
  editable = false,
  scale = 1,
}) => {
  const {
    first_name,
    middle_name,
    last_name,
    photo_url,
    student_id,
    section_name,
  } = data || {};

  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e) => {
    if (!editable) return;
    e.preventDefault();
    setIsDragging(true);
    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !editable) return;

    const deltaX = (e.clientX - startPos.x) / scale;
    const deltaY = (e.clientY - startPos.y) / scale;

    setPosition((prev) => ({
      x: prev.x + deltaX,
      y: prev.y + deltaY,
    }));

    setStartPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

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
  const hasLastName = last_name && last_name.trim() !== "" && last_name !== "-";

  return (
    <div
      className={`${styles.idCardBase} ${currentConfig.styleClass}`}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <img className={styles.headerBg} alt="" src={headerBg} />
      <div className={styles.photoContainer}>
        <img
          className={editable ? styles.photoDraggable : styles.photoStatic}
          alt="Student"
          src={photo_url}
          draggable={false}
          onError={(e) => {
            e.target.src = userPlaceholder;
          }}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
          onMouseDown={handleMouseDown}
        />
      </div>
      <div className={styles.bottomWrapper}>
        <img className={styles.waveBg} alt="" src={currentConfig.wave} />
        <div className={styles.contentOverlay}>
          <div className={styles.infoGroup}>
            <div className={styles.nameGroup}>
              {hasLastName ? (
                <>
                  <div className={styles.lastName}>{last_name},</div>
                  <div
                    className={styles.firstName}
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                  >
                    {first_name} {middle_name}
                  </div>
                </>
              ) : (
                <>
                  <div
                    className={styles.lastName}
                    style={{
                      whiteSpace: "normal",
                      wordWrap: "break-word",
                      lineHeight: "1.1",
                    }}
                  >
                    {first_name}
                  </div>
                  <div className={styles.firstName}>{middle_name}</div>
                </>
              )}
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
