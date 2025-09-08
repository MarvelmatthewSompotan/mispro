import React from 'react';
import styles from '../../styles/Pledge_Content.module.css';

function PledgeContent({ student, father, mother }) {
  const fullName = () => {
    if (student.middle_name && student.last_name) {
      return `${student.first_name} ${student.middle_name} ${student.last_name}`;
    } else if (student.middle_name) {
      return `${student.first_name} ${student.middle_name}`;
    } else if (student.last_name) {
      return `${student.first_name} ${student.last_name}`;
    } else {
      return `${student.first_name}`;
    }
  };
  return (
    <div className={styles.content}>
      <div className={styles.weParentJohnContainer}>
        <p className={styles.weParentJohnJaneDoeA}>
          <span className={styles.weParent}>{`We, (parent) `}</span>
          <b className={styles.weParent}>{father.name}</b>
          <span className={styles.weParent}>{` – `}</span>
          <b className={styles.weParent}>{mother.name}</b>
          <span className={styles.weParent}>{` `}</span>
          <span className={styles.weParent}>{` and (student) `}</span>
          <b className={styles.weParent}>{fullName()}</b>
          <span>{` do hereby declare that we will comply and abide with the stipulations therein, knowing that these are set to protect our interests as a parent and student and to help the student grow and develop into a mature person who will be better prepared for the challenging mission in the future. After we will have read it, we declare that we will accept the policies, rules, and regulations of the school. In witness whereof, we hereunder affix our signatures willingly and voluntarily apply at `}</span>
          <b className={styles.weParent}>Manado Independent School</b>
          <span className={styles.weParent}>.</span>
        </p>
      </div>
    </div>
  );
}

export default PledgeContent;
