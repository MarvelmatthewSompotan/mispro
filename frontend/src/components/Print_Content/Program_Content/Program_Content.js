import React from 'react';
import styles from '../../styles/Program_Content.module.css';

function ProgramContent({ data }) {
  const sectionOptions = [
    'ECP',
    'Elementary School',
    'Middle School',
    'High School',
  ];

  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Section</div>
        </div>

        {sectionOptions.map((section, index) => (
          <div key={index} className={styles.ecp}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.section?.name === section && (
                <div className={styles.radioBtnChild1} />
              )}
            </div>
            <div className={styles.elementarySchool}>{section}</div>
          </div>
        ))}

        <div className={styles.grade}>
          <div className={styles.elementarySchool}>Grade</div>
          <b className={styles.elementarySchool}>{data?.class}</b>
        </div>
        <div className={styles.major}>
          <div className={styles.elementarySchool}>Major</div>
          <b className={styles.science}>{data?.major?.name}</b>
        </div>
      </div>
    </div>
  );
}

export default ProgramContent;
