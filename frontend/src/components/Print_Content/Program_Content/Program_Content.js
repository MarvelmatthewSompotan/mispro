import React from 'react';
import styles from '../../styles/Program_Content.module.css';

function ProgramContent({
  data,
  sectionOptions,
  programOptions,
  classOptions,
  majorOptions,
}) {
  const getGradeName = () => {
    if (data?.class_id) {
      const found = classOptions.find((cls) => cls.class_id === data.class_id);
      return found ? found.grade : '';
    }
    return '';
  };

  const getMajorName = () => {
    if (data?.major_id) {
      // const targetId = String(data.major_id);
      // const found = majorOptions?.find((m) => m.major_id === targetId);
      const found = majorOptions?.find(
        (m) => m.major_id === parseInt(data.major_id, 10)
      );
      return found ? found.name : '';
    }
    return '';
  };

  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Section</div>
        </div>

        {sectionOptions.map((section) => (
          <div key={section.section_id} className={styles.answer}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.section_id === section.section_id && (
                <div className={styles.radioBtnChild1} />
              )}
            </div>
            <div className={styles.field}>{section.name}</div>
          </div>
        ))}

        <div className={styles.grade}>
          <div className={styles.field}>Grade</div>
          <b className={styles.option}>{getGradeName()}</b>
        </div>
        <div className={styles.major}>
          <div className={styles.option}>Major</div>
          <b className={styles.science}>{getMajorName()}</b>
        </div>
      </div>

      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Program</div>
        </div>

        {programOptions.map((program) => (
          <div key={program.program_id} className={styles.answer}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {data?.program_id === program.program_id && (
                <div className={styles.radioBtnChild1} />
              )}
            </div>
            <div className={styles.option}>{program.name}</div>
          </div>
        ))}

        {data?.program_other && (
          <div className={styles.answer}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              {!data?.program_id && <div className={styles.radioBtnChild1} />}
            </div>
            <div className={styles.option}>{data.program_other}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramContent;
