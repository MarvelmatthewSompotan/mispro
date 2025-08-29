import React from 'react';
import styles from '../../styles/OtherDetail_Content.module.css';

function OtherDetail_Content() {
  return (
    <div className={styles.otherDetail}>
      <div className={styles.officeUseNote}>
        <div className={styles.header}>
          <b className={styles.dataForOffice}>DATA FOR OFFICE USE ONLY</b>
        </div>
        <div className={styles.content}>
          <div className={styles.txtSrs}>
            <div className={styles.studentRequirementStatus}>
              Student Requirement Status:
            </div>
          </div>
          <div className={styles.status}>
            <div className={styles.complete}>
              <div className={styles.radioBtn}>
                <div className={styles.radioBtnChild} />
                <div className={styles.radioBtnItem} />
              </div>
              <div className={styles.complete1}>Complete</div>
            </div>
            <div className={styles.complete}>
              <div className={styles.radioBtn}>
                <div className={styles.radioBtnChild} />
              </div>
              <div className={styles.dataForOffice}>Incomplete</div>
            </div>
          </div>
          <div className={styles.note}>
            <div className={styles.txtIcDocs}>
              <div className={styles.dataForOffice}>Incomplete documents:</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.approvedBy}>
        <div className={styles.txtApprovedBy}>
          <div className={styles.approvedBy1}>Approved by:</div>
        </div>
        <div className={styles.principal}>
          <div className={styles.approvedBy1}>Principal:</div>
        </div>
        <div className={styles.principal}>
          <div className={styles.approvedBy1}>Business Manager:</div>
        </div>
        <div className={styles.principal}>
          <div className={styles.approvedBy1}>Register:</div>
        </div>
      </div>
    </div>
  );
}

export default OtherDetail_Content;
