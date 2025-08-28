import React from 'react';
import styles from '../../styles/Pledge_Content.module.css';

function PledgeContent({ pledgeData }) {
  const data = pledgeData || {};
  
  // Helper function untuk nama parent
  const getParentNames = () => {
    const fatherName = data.father?.first_name || "";
    const motherName = data.mother?.first_name || "";
    
    if (fatherName && motherName) {
      return `${fatherName} – ${motherName}`;
    } else if (fatherName) {
      return fatherName;
    } else if (motherName) {
      return motherName;
    }
    return "PARENT";
  };

  // Helper function untuk nama student
  const getStudentName = () => {
    const firstName = data.student?.first_name || "";
    const middleName = data.student?.middle_name || "";
    const lastName = data.student?.last_name || "";
    
    if (firstName && middleName && lastName) {
      return `${firstName} ${middleName} ${lastName}`;
    } else if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    } else if (firstName) {
      return firstName;
    }
    return "STUDENT";
  };

  const parentNames = getParentNames();
  const studentName = getStudentName();

  return (
    <div className={styles.content}>
      <div className={styles.weParentJohnContainer}>
        <p className={styles.weParentJohnJaneDoeA}>
          <span className={styles.weParent}>{`We, (parent) `}</span>
          <b className={styles.weParent}>{parentNames}</b>
          <span className={styles.weParent}>{` and (student) `}</span>
          <b className={styles.weParent}>{studentName}</b>
          <span>{` do hereby declare that we will comply and abide with the stipulations therein, knowing that these are set to protect our interests as a parent and student and to help the student grow and develop into a mature person who will be better prepared for the challenging mission in the future. After we will have read it, we declare that we will accept the policies, rules, and regulations of the school. In witness whereof, we hereunder affix our signatures willingly and voluntarily apply at `}</span>
          <b className={styles.weParent}>Manado Independent School</b>
          <span className={styles.weParent}>.</span>
        </p>
      </div>
    </div>
  );
}

export default PledgeContent; 