import React from 'react';
import styles from '../../styles/Signature_Content.module.css';

function SignatureContent() {
  return (
    <div className={styles.signature}>
      <div className={styles.studentNameAndSignature}>
        <div className={styles.txtDate}>
          <div className={styles.date}>Date:</div>
          <b className={styles.september2025}>12 September 2025</b>
        </div>
        <div className={styles.txtStudentNameAndSignature}>
          <div className={styles.studentName}>{`Student name & signature`}</div>
        </div>
      </div>
      <div className={styles.parentGuardianSignature}>
        <div className={styles.txtAcknowledgeBy}>
          <div className={styles.studentName}>Acknowledge by:</div>
        </div>
        <div className={styles.txtStudentNameAndSignature}>
          <div className={styles.studentName}>{`Parent / Guardian's name & signature`}</div>
        </div>
      </div>
    </div>
  );
}

export default SignatureContent; 