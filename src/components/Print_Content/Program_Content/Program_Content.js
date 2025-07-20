import React from 'react';
import styles from '../../styles/Program_Content.module.css';

function ProgramContent() {
  return (
    <div className={styles.content}>
      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Section</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
          </div>
          <div className={styles.elementarySchool}>ECP</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
          </div>
          <div className={styles.elementarySchool}>Elementary school</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
          </div>
          <div className={styles.elementarySchool}>Middle School</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.radioBtn}>
            <div className={styles.radioBtnChild} />
            <div className={styles.radioBtnChild1} />
          </div>
          <div className={styles.elementarySchool}>High School</div>
        </div>
        <div className={styles.grade}>
          <div className={styles.elementarySchool}>Grade</div>
          <b className={styles.elementarySchool}>11</b>
        </div>
        <div className={styles.major}>
          <div className={styles.elementarySchool}>Major</div>
          <b className={styles.science}>SCIENCE</b>
        </div>
      </div>
      <div className={styles.top}>
        <div className={styles.txtSection}>
          <div className={styles.section}>Program</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.elementarySchool}>UAN</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.elementarySchool}>A Beka</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.elementarySchool}>Oxford</div>
        </div>
        <div className={styles.ecp}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.elementarySchool}>Cambridge</div>
        </div>
        <div className={styles.other}>
          <div className={styles.checkBox}>
            <div className={styles.checkBoxChild} />
          </div>
          <div className={styles.elementarySchool}>Others:</div>
        </div>
      </div>
    </div>
  );
}

export default ProgramContent; 