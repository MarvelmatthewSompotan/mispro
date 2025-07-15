import React from 'react';
import kop from '../../assets/KOP.png';
import styles from './Print.module.css';

const Print = () => {
  return (
    <div style={{ padding: 32 }}>
      <img src={kop} alt="Header KOP" className={styles.headerKop} />
      <div className={styles.title}>
        APPLICATION FORM
      </div>
      <div className={styles.infoBar}>
        <span>Date: <span>12 September 2025</span></span>
        <span>Semester: <span>1 (One)</span></span>
        <span>School Year: <span>2025/2026</span></span>
        <span>Registration Number: <span>7466</span></span>
        <span>Registration ID: <span>001/RF NO-HS/XI-25</span></span>
      </div>
      <h1>Print Page</h1>
      <p>This is the Print page content.</p>
    </div>
  );
};

export default Print; 