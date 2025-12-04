import React from 'react';
import styles from './ProgramContent.module.css';
import RadioButton from '../../../Atoms/RadioButton/RadioButton';

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
            <RadioButton
              name="section"
              value={section.section_id}
              checked={data?.section_id === section.section_id}
              onChange={() => {}}
              readOnly={true}
            />
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
            <RadioButton
              name="program"
              value={program.program_id}
              checked={data?.program_id === program.program_id}
              onChange={() => {}}
              readOnly={true}
            />
            <div className={styles.option}>{program.name}</div>
          </div>
        ))}

        {data?.program_other && (
          <div className={styles.answer}>
            <RadioButton
              name="program"
              value="other"
              checked={!data?.program_id}
              onChange={() => {}}
              readOnly={true}
            />
            <div className={styles.option}>{data.program_other}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProgramContent;

