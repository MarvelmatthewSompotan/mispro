import React from 'react';
import styles from './StudentsInformation_Content.module.css';

function StudentsInformationContent() {
  return (
    <div className={styles.content}>
      <div className={styles.sec1}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>{`Full name `}</div>
              <b className={styles.jhoanne}>JHOANNE</b>
              <b className={styles.jhoanne}>-</b>
              <b className={styles.jhoanne}>JENNIE ABIGAIL EUPHORIA</b>
              <b className={styles.jhoanne}>-</b>
              <b className={styles.jhoanne}>DOE</b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.nickname}>
              <div className={styles.jhoanne}>Nickname</div>
              <b className={styles.annie}>ANNIE</b>
            </div>
            <div className={styles.gender}>
              <div className={styles.jhoanne}>Gender</div>
              <b className={styles.jhoanne}>FEMALE</b>
            </div>
            <div className={styles.age}>
              <div className={styles.jhoanne}>Age</div>
              <b className={styles.b2}>16</b>
            </div>
            <div className={styles.rankInFamily}>
              <div className={styles.jhoanne}>Rank in the family</div>
              <b className={styles.b2}>1</b>
            </div>
          </div>
        </div>
        <div className={styles.top}>
          <div className={styles.citizenship}>
            <div className={styles.jhoanne}>Citizenship</div>
            <b className={styles.annie}>INDONESIA</b>
          </div>
          <div className={styles.citizenship}>
            <div className={styles.jhoanne}>Religion</div>
            <b className={styles.annie}>CHRISTIAN PROTESTANT</b>
          </div>
          <div className={styles.citizenship}>
            <div className={styles.jhoanne}>Place of birth</div>
            <b className={styles.annie}>MANADO</b>
          </div>
          <div className={styles.dob}>
            <div className={styles.jhoanne}>Date of birth</div>
            <b className={styles.annie}>12 MARCH 2012</b>
          </div>
        </div>
      </div>
      <div className={styles.sec2}>
        <div className={styles.top1}>
          <div className={styles.fullName}>
            <div className={styles.jhoanne}>Email address</div>
            <b className={styles.annie}>JHOANNE@GMAIL.COM</b>
          </div>
          <div className={styles.fullName}>
            <div className={styles.jhoanne}>Previous School</div>
            <b className={styles.annie}>SMPN 1 BITUNG</b>
          </div>
        </div>
        <div className={styles.top1}>
          <div className={styles.fullName}>
            <div className={styles.jhoanne}>Phone number</div>
            <b className={styles.annie}>089281560956</b>
          </div>
          <div className={styles.fullName}>
            <div className={styles.jhoanne}>Academic status</div>
            <b className={styles.annie}>REGULAR</b>
          </div>
          <div className={styles.fullName}>
            <div className={styles.jhoanne}>Student status</div>
            <b className={styles.annie}>TRANSFEREE</b>
          </div>
          <div className={styles.fullName}>
            <div className={styles.jhoanne}>Student ID</div>
            <b className={styles.annie}>S25420001</b>
          </div>
        </div>
      </div>
      <div className={styles.sec3}>
        <div className={styles.address}>
          <div className={styles.jhoanne}>Address</div>
          <b className={styles.jhoanne}>JL. SARUNDAJANG 01</b>
          <b className={styles.jhoanne}>,</b>
          <div className={styles.parent}>
            <b className={styles.jhoanne}>001</b>
            <b className={styles.b7}>/</b>
            <b className={styles.jhoanne}>002</b>
          </div>
          <b className={styles.jhoanne}>,</b>
          <b className={styles.jhoanne}>GIRIAN</b>
          <b className={styles.jhoanne}>,</b>
          <b className={styles.jhoanne}>RANOWULU</b>
          <b className={styles.jhoanne}>,</b>
          <b className={styles.jhoanne}>BITUNG</b>
          <b className={styles.jhoanne}>,</b>
          <b className={styles.jhoanne}>NORTH SULAWESI</b>
          <b className={styles.jhoanne}>,</b>
          <div className={styles.parent}>
            <b className={styles.jhoanne}>(</b>
            <b className={styles.jhoanne}>DAHLIA APARTEMENT UNIT 5023</b>
            <b className={styles.jhoanne}>)</b>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentsInformationContent; 