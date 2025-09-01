import React from 'react';
import styles from '../../styles/ParentsGuardianInformation_Content.module.css';

const ParentsGuardianInformationContent = ({ father, mother, guardian }) => {
  return (
    <div className={styles.content}>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>Father's Information</div>
        </div>
        <div className={styles.first}>
          <div className={styles.left}>
            <div className={styles.name}>
              <div className={styles.johnDoe}>{`Name `}</div>
              <b className={styles.johnDoe}>{father.name}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Phone number</div>
              <b className={styles.johnDoe}>{father.phone}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Email</div>
              <b className={styles.johndoehebatgmailcom}>{father.email}</b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.txtFather}>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Company name</div>
                <b className={styles.ptMultiRakyat}>{father.company ?? '-'}</b>
              </div>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Occupation/Position</div>
                <b className={styles.fieldManager}>{father.occupation}</b>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.johnDoe}>Address</div>
              <b className={styles.johnDoe}>{father.address.street}</b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.johnDoe}>{father.address.rt ?? '-'}</b>
                <b className={styles.b3}>/</b>
                <b className={styles.johnDoe}>{father.address.rw ?? '-'}</b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{father.address.village}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{father.address.district}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{father.address.city_regency}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{father.address.province}</b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.b3}>(</b>
                <b className={styles.johnDoe}>{father.address.other}</b>
                <b className={styles.b3}>)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>Mother's Information</div>
        </div>
        <div className={styles.first}>
          <div className={styles.left}>
            <div className={styles.name}>
              <div className={styles.johnDoe}>{`Name `}</div>
              <b className={styles.johnDoe}>{mother.name}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Phone number</div>
              <b className={styles.johnDoe}>{mother.phone}</b>
            </div>
            <div className={styles.name}>
              <div className={styles.johnDoe}>Email</div>
              <b className={styles.johndoehebatgmailcom}>{mother.email}</b>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.txtFather}>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Company name</div>
                <b className={styles.ptMultiRakyat}>{mother.company ?? '-'}</b>
              </div>
              <div className={styles.compName}>
                <div className={styles.johnDoe}>Occupation/Position</div>
                <b className={styles.fieldManager}>
                  {mother.occupation ?? '-'}
                </b>
              </div>
            </div>
            <div className={styles.bottom}>
              <div className={styles.johnDoe}>Address</div>
              <b className={styles.johnDoe}>{mother.address.street}</b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.johnDoe}>{mother.address.rt ?? '-'}</b>
                <b className={styles.b3}>/</b>
                <b className={styles.johnDoe}>{mother.address.rw ?? '-'}</b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{mother.address.village}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{mother.address.district}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{mother.address.city_regency}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{mother.address.province}</b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.b3}>(</b>
                <b className={styles.johnDoe}>{mother.address.other}</b>
                <b className={styles.b3}>)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.father}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>
            Authorized Guardian's Information
          </div>
        </div>
        <div className={styles.guardianInfo}>
          <div className={styles.left1}>
            <div className={styles.top1}>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>{`Name `}</div>
                <b className={styles.uncle}>{guardian.name}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>Relationship to student</div>
                <b className={styles.uncle}>{guardian.relation_to_student}</b>
              </div>
            </div>
            <div className={styles.top1}>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>Phone number</div>
                <b className={styles.uncle}>{guardian.phone}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.johnDoe}>Email</div>
                <b className={styles.uncle}>{guardian.email}</b>
              </div>
            </div>
          </div>
          <div className={styles.right1}>
            <div className={styles.address3}>
              <div className={styles.johnDoe}>Address</div>
              <b className={styles.johnDoe}>{guardian.address.street}</b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.johnDoe}>{guardian.address.rt ?? '-'}</b>
                <b className={styles.b3}>/</b>
                <b className={styles.johnDoe}>{guardian.address.rw ?? '-'}</b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{guardian.address.village}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{guardian.address.district}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{guardian.address.city_regency}</b>
              <b className={styles.b1}>,</b>
              <b className={styles.johnDoe}>{guardian.address.province}</b>
              <b className={styles.b1}>,</b>
              <div className={styles.parent}>
                <b className={styles.b3}>(</b>
                <b className={styles.johnDoe}>{guardian.address.other}</b>
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
