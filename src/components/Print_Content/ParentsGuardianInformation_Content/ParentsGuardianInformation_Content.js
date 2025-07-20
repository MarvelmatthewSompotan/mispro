import React from 'react';
import styles from '../../styles/ParentsGuardianInformation_Content.module.css';

function ParentsGuardianInformationContent() {
  return (
    <div className={styles.content}>
      <div className={styles.parent}>
        <div className={styles.father}>
          <div className={styles.txtFather}>
            <div className={styles.fathersInformation}>Father's Information</div>
          </div>
          <div className={styles.fatherInfo}>
            <div className={styles.first}>
              <div className={styles.name}>
                <div className={styles.companyName}>{`Name `}</div>
                <b className={styles.johnDoe}>JOHN DOE</b>
              </div>
            </div>
            <div className={styles.second}>
              <div className={styles.name}>
                <div className={styles.companyName}>Company name</div>
                <b className={styles.johnDoe}>PT. MULTI RAKYAT</b>
              </div>
              <div className={styles.name}>
                <div className={styles.companyName}>Occupation/Position</div>
                <b className={styles.fieldManager}>FIELD MANAGER</b>
              </div>
            </div>
            <div className={styles.second}>
              <div className={styles.name}>
                <div className={styles.companyName}>Phone number</div>
                <b className={styles.johnDoe}>089281560955</b>
              </div>
              <div className={styles.name}>
                <div className={styles.companyName}>Email</div>
                <b className={styles.johndoehebatgmailcom}>{`JOHNDOEHEBAT@GMAIL.COM `}</b>
              </div>
            </div>
            <div className={styles.fourth}>
              <div className={styles.address}>
                <div className={styles.companyName}>Address</div>
                <b className={styles.companyName}>JL. SARUNDAJANG 01</b>
                <b className={styles.b1}>,</b>
                <div className={styles.group}>
                  <b className={styles.companyName}>001</b>
                  <b className={styles.b3}>/</b>
                  <b className={styles.companyName}>002</b>
                </div>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>GIRIAN</b>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>RANOWULU</b>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>BITUNG</b>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>NORTH SULAWESI</b>
                <b className={styles.b1}>,</b>
                <div className={styles.group}>
                  <b className={styles.b3}>(</b>
                  <b className={styles.companyName}>DAHLIA APARTEMENT UNIT 5023</b>
                  <b className={styles.b3}>)</b>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.father1}>
          <div className={styles.txtFather}>
            <div className={styles.fathersInformation}>Mother's Information</div>
          </div>
          <div className={styles.fatherInfo}>
            <div className={styles.first}>
              <div className={styles.name}>
                <div className={styles.companyName}>{`Name `}</div>
                <b className={styles.johnDoe}>JANE DOE</b>
              </div>
            </div>
            <div className={styles.second}>
              <div className={styles.name}>
                <div className={styles.companyName}>Company name</div>
                <b className={styles.johnDoe}>PT. MULTI RAKYAT</b>
              </div>
              <div className={styles.name}>
                <div className={styles.companyName}>Occupation/Position</div>
                <b className={styles.fieldManager}>FIELD MANAGER</b>
              </div>
            </div>
            <div className={styles.second}>
              <div className={styles.name}>
                <div className={styles.companyName}>Phone number</div>
                <b className={styles.johnDoe}>089281560955</b>
              </div>
              <div className={styles.name}>
                <div className={styles.companyName}>Email</div>
                <b className={styles.johndoehebatgmailcom}>{`JOHNDOEHEBAT@GMAIL.COM `}</b>
              </div>
            </div>
            <div className={styles.fourth}>
              <div className={styles.address}>
                <div className={styles.companyName}>Address</div>
                <b className={styles.companyName}>JL. SARUNDAJANG 01</b>
                <b className={styles.b1}>,</b>
                <div className={styles.group}>
                  <b className={styles.companyName}>001</b>
                  <b className={styles.b3}>/</b>
                  <b className={styles.companyName}>002</b>
                </div>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>GIRIAN</b>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>RANOWULU</b>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>BITUNG</b>
                <b className={styles.b1}>,</b>
                <b className={styles.companyName}>NORTH SULAWESI</b>
                <b className={styles.b1}>,</b>
                <div className={styles.group}>
                  <b className={styles.b3}>(</b>
                  <b className={styles.companyName}>DAHLIA APARTEMENT UNIT 5023</b>
                  <b className={styles.b3}>)</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.guardian}>
        <div className={styles.txtFather}>
          <div className={styles.fathersInformation}>Authorized Guardian's Information</div>
        </div>
        <div className={styles.parent}>
          <div className={styles.left}>
            <div className={styles.first}>
              <div className={styles.relation}>
                <div className={styles.companyName}>{`Name `}</div>
                <b className={styles.uncle}>{`JOHN DOE `}</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.companyName}>Relationship to student</div>
                <b className={styles.uncle}>UNCLE</b>
              </div>
            </div>
            <div className={styles.first}>
              <div className={styles.relation}>
                <div className={styles.companyName}>Phone number</div>
                <b className={styles.uncle}>082176543890</b>
              </div>
              <div className={styles.relation}>
                <div className={styles.companyName}>Email</div>
                <b className={styles.uncle}>JOHNDOE@GMAIL.COM</b>
              </div>
            </div>
          </div>
          <div className={styles.right}>
            <div className={styles.address4}>
              <div className={styles.companyName}>Address</div>
              <b className={styles.companyName}>JL. SARUNDAJANG 01</b>
              <b className={styles.b1}>,</b>
              <div className={styles.group}>
                <b className={styles.companyName}>001</b>
                <b className={styles.b3}>/</b>
                <b className={styles.companyName}>002</b>
              </div>
              <b className={styles.b1}>,</b>
              <b className={styles.companyName}>GIRIAN</b>
              <b className={styles.b1}>,</b>
              <b className={styles.companyName}>RANOWULU</b>
              <b className={styles.b1}>,</b>
              <b className={styles.companyName}>BITUNG</b>
              <b className={styles.b1}>,</b>
              <b className={styles.companyName}>NORTH SULAWESI</b>
              <b className={styles.b1}>,</b>
              <div className={styles.group}>
                <b className={styles.b3}>(</b>
                <b className={styles.companyName}>DAHLIA APARTEMENT UNIT 5023</b>
                <b className={styles.b3}>)</b>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ParentsGuardianInformationContent; 