import React from 'react';
import styles from '../../styles/StudentsInformation_Content.module.css';

const StudentsInformationContent = ({ data }) => {
  if (!data) return null;

  const formatValue = (val) =>
    val === null || val === undefined || val === '' ? '-' : val;

  return (
    <div className={styles.content}>
      <div className={styles.left}>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>{`Full name `}</div>
          <b className={styles.jhoanne}>{formatValue(data.first_name)}</b>
          <b className={styles.jhoanne}>-</b>
          <b className={styles.jhoanne}>{formatValue(data.middle_name)}</b>
          <b className={styles.jhoanne}>-</b>
          <b className={styles.jhoanne}>{formatValue(data.last_name)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Student ID</div>
          <b className={styles.regular}>{formatValue(data.student_id)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>NIK</div>
          <b className={styles.regular}>{formatValue(data.nik)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>NISN</div>
          <b className={styles.regular}>{formatValue(data.nisn)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>KITAS</div>
          <b className={styles.regular}>{formatValue(data.kitas)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.contentFullName}>Academic status</div>
          <b className={styles.regular}>
            {data.academic_status === 'OTHER'
              ? formatValue(data.academic_status_other)
              : formatValue(data.academic_status)}
          </b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Student status</div>
          <b className={styles.regular}>{formatValue(data.student_status)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Previous School</div>
          <b className={styles.regular}>{formatValue(data.previous_school)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Email address</div>
          <b className={styles.regular}>{formatValue(data.email)}</b>
        </div>
        <div className={styles.fullName}>
          <div className={styles.jhoanne}>Phone number</div>
          <b className={styles.regular}>{formatValue(data.phone_number)}</b>
        </div>
      </div>
      <div className={styles.right}>
        <div className={styles.top}>
          <div className={styles.left}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Citizenship</div>
              <b className={styles.regular}>{formatValue(data.citizenship)}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Religion</div>
              <b className={styles.regular}>{formatValue(data.religion)}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Place of birth</div>
              <b className={styles.regular}>
                {formatValue(data.place_of_birth)}
              </b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Date of birth</div>
              <b className={styles.regular}>
                {formatValue(data.date_of_birth)}
              </b>
            </div>
          </div>
          <div className={styles.contentRight}>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Nickname</div>
              <b className={styles.regular}>{formatValue(data.nickname)}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Gender</div>
              <b className={styles.jhoanne}>{formatValue(data.gender)}</b>
            </div>
            <div className={styles.fullName}>
              <div className={styles.jhoanne}>Age</div>
              <b className={styles.b3}>{formatValue(data.age)}</b>
            </div>
            <div className={styles.rankInFamily}>
              <div className={styles.jhoanne}>Rank in the family</div>
              <b className={styles.b3}>{formatValue(data.family_rank)}</b>
            </div>
          </div>
        </div>
        <div className={styles.top}>
          <div className={styles.address}>
            <div className={styles.jhoanne}>Address</div>
            <b className={styles.jhoanne}>{formatValue(data.street)}</b>
            <b className={styles.jhoanne}>,</b>
            <div className={styles.parent}>
              <b className={styles.jhoanne}>{formatValue(data.rt)}</b>
              <b className={styles.b7}>/</b>
              <b className={styles.jhoanne}>{formatValue(data.rw)}</b>
            </div>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{formatValue(data.village)}</b>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{formatValue(data.district)}</b>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{formatValue(data.city_regency)}</b>
            <b className={styles.jhoanne}>,</b>
            <b className={styles.jhoanne}>{formatValue(data.province)}</b>
            <b className={styles.jhoanne}>,</b>
            <div className={styles.parent}>
              <b className={styles.jhoanne}>(</b>
              <b className={styles.jhoanne}>{formatValue(data.other)}</b>
              <b className={styles.jhoanne}>)</b>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentsInformationContent;
