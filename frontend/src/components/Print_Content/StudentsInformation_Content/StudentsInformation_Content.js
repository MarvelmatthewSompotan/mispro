import React from 'react';
import styles from '../../styles/StudentsInformation_Content.module.css';

const StudentsInformationContent = ({ data }) => {
  if (!data) return null;

  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>{`Full name `}</div>
          <b className={styles.jhoanne}>{data.first_name}</b>
          <b className={styles.jhoanne}>-</b>
          <b className={styles.jhoanne}>{data.middle_name}</b>
          <b className={styles.jhoanne}>-</b>
          <b className={styles.jhoanne}>{data.last_name}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student ID</div>
          <b className={styles.regular}>{data.student_id}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Academic status</div>
          <b className={styles.regular}>
            {data.academic_status === 'OTHER'
              ? data.academic_status_other
              : data.academic_status}
          </b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student status</div>
          <b className={styles.regular}>{data.student_status}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Previous School</div>
          <b className={styles.regular}>{data.previous_school}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Email address</div>
          <b className={styles.regular}>{data.email}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Phone number</div>
          <b className={styles.regular}>{data.phone_number}</b>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Citizenship</div>
              <b className={styles.regular}>{data.citizenship}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Religion</div>
              <b className={styles.regular}>{data.religion}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Place of birth</div>
              <b className={styles.regular}>{data.place_of_birth}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Date of birth</div>
              <b className={styles.regular}>{data.date_of_birth}</b>
            </div>
          </div>
          <div className={styles.right1}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Nickname</div>
              <b className={styles.regular}>{data.nickname}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Gender</div>
              <b className={styles.jhoanne}>{data.gender}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Age</div>
              <b className={styles.b3}>{data.age}</b>
            </div>
            <div className={styles.rankInFamily}>
              <div className={styles.jhoanne}>Rank in the family</div>
              <b className={styles.b3}>{data.family_rank}</b>
            </div>
          </div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.address}>
            <div className={styles.jhoanne}>Address</div>
            <b className={styles.jhoanne}>{data.street}</b>
            <b className={styles.jhoanne}>,</b>
            <div className={styles.parent}>
              <b className={styles.jhoanne}>{data.rt}</b>
              <b className={styles.b7}>/</b>
              <b className={styles.jhoanne}>{data.rw}</b>
            </div>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{data.village}</b>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{data.district}</b>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{data.city_regency}</b>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{data.province}</b>
            <b className={styles.jhoanne}>,</b>
            <div className={styles.parent}>
              <b className={styles.jhoanne}>(</b>
              <b className={styles.jhoanne}>{data.other}</b>
              <b className={styles.jhoanne}>)</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsInformationContent;
