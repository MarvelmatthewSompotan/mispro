import React from 'react';
import styles from '../../styles/ParentsGuardianInformation_Content.module.css';

const ParentsGuardianInformationContent = ({ father, mother, guardian }) => {
  const formatValue = (val) =>
    val === null || val === undefined || val === '' ? '-' : val;

  return (
    <div className={styles.content}>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.heading}>Father's Information</div>
        </div>
        <div className={styles.first}>
          <div className={styles.left}>
            <div className={styles.name}>
              <div className={styles.field}>{`Name `}</div>
              <b className={styles.field}>{formatValue(father.name)}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.field}>Phone number</div>
              <b className={styles.field}>{formatValue(father.phone)}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.field}>Email</div>
              <b className={styles.gmail}>
                {formatValue(father.email)}
              </b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.txtFather}>
              <div className={styles.compName}>
                <div className={styles.field}>Company name</div>
                <b className={styles.nameCompany}>
                  {formatValue(father.company)}
                </b>
              </div>
              <div className={styles.compName}>
                <div className={styles.field}>Occupation/Position</div>
                <b className={styles.position}>
                  {formatValue(father.occupation)}
                </b>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.field}>Address</div>
              <b className={styles.field}>
                {formatValue(father.address.street)}
              </b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.field}>
                  {formatValue(father.address.rt)}
                </b>
                <b className={styles.b3}>/</b>
                <b className={styles.field}>
                  {formatValue(father.address.rw)}
                </b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(father.address.village)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(father.address.district)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(father.address.city_regency)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(father.address.province)}
              </b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.b3}>(</b>
                <b className={styles.field}>
                  {formatValue(father.address.other)}
                </b>
                <b className={styles.b3}>)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.heading}>Mother's Information</div>
        </div>
        <div className={styles.first}>
          <div className={styles.left}>
            <div className={styles.name}>
              <div className={styles.field}>{`Name `}</div>
              <b className={styles.field}>{formatValue(mother.name)}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.field}>Phone number</div>
              <b className={styles.field}>{formatValue(mother.phone)}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.field}>Email</div>
              <b className={styles.gmail}>
                {formatValue(mother.email)}
              </b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.txtFather}>
              <div className={styles.compName}>
                <div className={styles.field}>Company name</div>
                <b className={styles.nameCompany}>
                  {formatValue(mother.company)}
                </b>
              </div>
              <div className={styles.compName}>
                <div className={styles.field}>Occupation/Position</div>
                <b className={styles.position}>
                  {formatValue(mother.occupation)}
                </b>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.field}>Address</div>
              <b className={styles.field}>
                {formatValue(mother.address.street)}
              </b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.field}>
                  {formatValue(mother.address.rt)}
                </b>
                <b className={styles.b3}>/</b>
                <b className={styles.field}>
                  {formatValue(mother.address.rw)}
                </b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(mother.address.village)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(mother.address.district)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(mother.address.city_regency)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(mother.address.province)}
              </b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.b3}>(</b>
                <b className={styles.field}>
                  {formatValue(mother.address.other)}
                </b>
                <b className={styles.b3}>)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.heading}>
            Authorized Guardian's Information
          </div>
        </div>
        <div className={styles.guardianInfo}>
          <div className={styles.left1}>
            <div className={styles.top1}>
              <div className={styles.relation}>
                <div className={styles.field}>{`Name `}</div>
                <b className={styles.guardianField}>{formatValue(guardian.name)}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.field}>Relationship to student</div>
                <b className={styles.guardianField}>
                  {formatValue(guardian.relation_to_student)}
                </b>
              </div>
            </div>
            <div className={styles.top1}>
              <div className={styles.relation}>
                <div className={styles.field}>Phone number</div>
                <b className={styles.guardianField}>{formatValue(guardian.phone)}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.field}>Email</div>
                <b className={styles.guardianField}>{formatValue(guardian.email)}</b>
              </div>
            </div>
          </div>
          <div className={styles.right1}>
            <div className={styles.address3}>
              <div className={styles.field}>Address</div>
              <b className={styles.field}>
                {formatValue(guardian.address.street)}
              </b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.field}>
                  {formatValue(guardian.address.rt)}
                </b>
                <b className={styles.b3}>/</b>
                <b className={styles.field}>
                  {formatValue(guardian.address.rw)}
                </b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(guardian.address.village)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(guardian.address.district)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(guardian.address.city_regency)}
              </b>
              <b className={styles.b1}>,</b>
              <b className={styles.field}>
                {formatValue(guardian.address.province)}
              </b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.b3}>(</b>
                <b className={styles.field}>
                  {formatValue(guardian.address.other)}
                </b>
                <b className={styles.b3}>)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentsGuardianInformationContent;
