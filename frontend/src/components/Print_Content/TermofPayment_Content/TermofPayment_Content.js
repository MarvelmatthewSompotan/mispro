import React from 'react';
import styles from '../../styles/TermofPayment_Content.module.css';

function TermofPaymentContent() {
  return (
    <div className={styles.content}>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.residenceHall}>Tuition Fee</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.full}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              <div className={styles.radioBtnItem} />
            </div>
            <div className={styles.fullPayment}>Full payment</div>
          </div>
          <div className={styles.full}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
            </div>
            <div className={styles.fullPayment}>Installment</div>
          </div>
        </div>
      </div>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.residenceHall}>Residence Hall</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.full}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
              <div className={styles.radioBtnItem} />
            </div>
            <div className={styles.fullPayment}>Full payment</div>
          </div>
          <div className={styles.full}>
            <div className={styles.radioBtn}>
              <div className={styles.radioBtnChild} />
            </div>
            <div className={styles.fullPayment}>Installment</div>
          </div>
        </div>
      </div>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div
            className={styles.residenceHall}
          >{`Financial Policy & Contract`}</div>
        </div>
        <div className={styles.bottom2}>
          <div className={styles.full}>
            <div className={styles.checkBox}>
              <div className={styles.checkBoxChild} />
            </div>
            <div className={styles.fullPayment}>Agree</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermofPaymentContent;
