import { FunctionComponent } from 'react';
import styles from '../../styles/StudentsInformation_Content.module.css';

const CONTENT = () => {
  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>{`Full name `}</div>
          <b className={styles.jhoanne}>JHOANNE</b>
          <b className={styles.jhoanne}>-</b>
          <b className={styles.jhoanne}>JENNIE ABIGAIL EUPHORIA</b>
          <b className={styles.jhoanne}>-</b>
          <b className={styles.jhoanne}>DOE</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student ID</div>
          <b className={styles.regular}>S25420001</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>NIK</div>
          <b className={styles.regular}>9999999999</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>KITAS</div>
          <b className={styles.regular}>9999999999</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Academic status</div>
          <b className={styles.regular}>REGULAR</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student status</div>
          <b className={styles.regular}>TRANSFEREE</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Previous School</div>
          <b className={styles.regular}>SMPN 1 BITUNG</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Email address</div>
          <b className={styles.regular}>JHOANNE@GMAIL.COM</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Phone number</div>
          <b className={styles.regular}>089281560956</b>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Citizenship</div>
              <b className={styles.regular}>INDONESIA</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Religion</div>
              <b className={styles.regular}>CHRISTIAN PROTESTANT</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Place of birth</div>
              <b className={styles.regular}>MANADO</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Date of birth</div>
              <b className={styles.regular}>12 MARCH 2012</b>
            </div>
          </div>
          <div className={styles.right1}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Nickname</div>
              <b className={styles.regular}>ANNIE</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Gender</div>
              <b className={styles.jhoanne}>FEMALE</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Age</div>
              <b className={styles.b5}>16</b>
            </div>
            <div className={styles.rankInFamily}>
              <div className={styles.jhoanne}>Rank in the family</div>
              <b className={styles.b5}>1</b>
            </div>
          </div>
        </div>
        <div className={styles.top}>
          <div className={styles.address}>
            <div className={styles.jhoanne}>Address</div>
            <b className={styles.jhoanne}>JL. SARUNDAJANG 01</b>
            <b className={styles.jhoanne}>,</b>
            <div className={styles.parent}>
              <b className={styles.jhoanne}>001</b>
              <b className={styles.b9}>/</b>
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
    </div>
  );
};

export default CONTENT; 