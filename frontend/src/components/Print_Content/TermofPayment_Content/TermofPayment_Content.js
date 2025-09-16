import React from 'react';
import styles from '../../styles/TermofPayment_Content.module.css';

function TermofPaymentContent({ data }) {
  const option = ['Full Payment', 'Installment'];
  // helper checkbox biar tidak duplikat
  const renderCheckbox = (isSigned) => {
    return isSigned ? (
      <div className={styles.checkBoxChild} />
    ) : (
      <div
        style={{
          position: 'absolute',
          height: '108.33%',
          width: '108.33%',
          top: '-4.17%',
          right: '-4.17%',
          bottom: '-4.17%',
          left: '-4.17%',
          borderRadius: '4px',
          border: '3px solid #5f84fe',
          boxSizing: 'border-box',
          backgroundColor: 'white',
        }}
      />
    );
  };

  return (
    <div className={styles.content}>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.contentTuitionFee}>Tuition Fee</div>
        </div>
        <div className={styles.bottom}>
          {option.map((opt, index) => (
            <div key={index} className={styles.full}>
              <div className={styles.radioBtn}>
                <div className={styles.radioBtnChild} />
                {data?.tuition_fees === opt && (
                  <div className={styles.radioBtnItem} />
                )}
              </div>
              <div className={styles.fullPayment}>{opt}</div>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.contentTuitionFee}>Residence Hall</div>
        </div>
        <div className={styles.bottom}>
          {option.map((opt, index) => (
            <div key={index} className={styles.full}>
              <div className={styles.radioBtn}>
                <div className={styles.radioBtnChild} />
                {data?.residence_payment === opt && (
                  <div className={styles.radioBtnItem} />
                )}
              </div>
              <div className={styles.fullPayment}>{opt}</div>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.discountSection}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.contentTuitionFee}>Discount</div>
        </div>
        <div className={styles.discountContent}>
          {data.discount_name ? (
            <div className={styles.full}>
              <div className={styles.fullPayment}>{data.discount_name}</div>
              {/* {data.discount_notes && (
                <div className={styles.fullPayment}>
                  Notes: {data.discount_notes}
                </div>
              )} */}
            </div>
          ) : (
            <div className={styles.full}>
              <div className={styles.fullPayment}>No discount</div>
            </div>
          )}
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
              {renderCheckbox(data?.financial_policy_contract === 'Signed')}
            </div>
            <div className={styles.fullPayment}>Agree</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermofPaymentContent;
