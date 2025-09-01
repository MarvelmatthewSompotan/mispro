import React from 'react';
import styles from '../../styles/Program_Content.module.css';

function ProgramContent({ data, sectionOptions, programOptions }) {
  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Section</div>
        </div>

        {sectionOptions.map((section) => (
          <div key={section.section_id} className={styles.ecp}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.section?.name === section.name && (
                <div className={styles.radioBtnChild1} />
              )}
            </div>
            <div className={styles.elementarySchool}>{section.name}</div>
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

      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Program</div>
        </div>

        {programOptions.map((program) => (
          <div key={program.program_id} className={styles.ecp}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.program?.name === program.name && (
                <div className={styles.radioBtnChild1} />
              )}
            </div>
            <div className={styles.elementarySchool}>{program.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgramContent;
