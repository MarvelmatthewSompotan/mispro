import React, { useMemo } from 'react';
import styles from '../../styles/TermofPayment_Content.module.css';

function TermofPaymentContent({ paymentData }) {
  const data = paymentData || {};
  
  console.log("TermofPaymentContent received data:", data);
  
  // ✅ PERBAIKAN: Logic yang sama dengan mapping value
  const getPaymentType = useMemo(() => {
    const paymentType = data.payment_type || "";
    if (paymentType.toLowerCase().includes("full")) return "full";
    if (paymentType.toLowerCase().includes("installment")) return "installment";
    return "";
  }, [data.payment_type]);

  const getResidenceHallPayment = useMemo(() => {
    const residencePayment = data.residence_hall_payment || "";
    if (residencePayment.toLowerCase().includes("full")) return "full";
    if (residencePayment.toLowerCase().includes("installment")) return "installment";
    return "";
  }, [data.residence_hall_payment]);

  const paymentType = getPaymentType;
  const residenceHallPayment = getResidenceHallPayment;

  console.log("Payment type:", paymentType);
  console.log("Residence hall payment:", residenceHallPayment);

  return (
    <div className={styles.content}>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.residenceHall}>Tuition Fee</div>
        </div>
        <div className={styles.bottom}>
          <div className={styles.full}>
            <div className={`${styles.radioBtn} ${paymentType === "full" ? styles.selected : ""}`}>
              <div className={styles.radioBtnChild} />
              {paymentType === "full" && <div className={styles.radioBtnItem} />}
            </div>
            <div className={styles.fullPayment}>Full payment</div>
          </div>
          <div className={styles.full}>
            <div className={`${styles.radioBtn} ${paymentType === "installment" ? styles.selected : ""}`}>
              <div className={styles.radioBtnChild} />
              {paymentType === "installment" && <div className={styles.radioBtnItem} />}
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
            <div className={`${styles.radioBtn} ${residenceHallPayment === "full" ? styles.selected : ""}`}>
              <div className={styles.radioBtnChild} />
              {residenceHallPayment === "full" && <div className={styles.radioBtnItem} />}
            </div>
            <div className={styles.fullPayment}>Full payment</div>
          </div>
          <div className={styles.full}>
            <div className={`${styles.radioBtn} ${residenceHallPayment === "installment" ? styles.selected : ""}`}>
              <div className={styles.radioBtnChild} />
              {residenceHallPayment === "installment" && <div className={styles.radioBtnItem} />}
            </div>
            <div className={styles.fullPayment}>Installment</div>
          </div>
        </div>
      </div>
      <div className={styles.tuitionFee}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.residenceHall}>{`Financial Policy & Contract`}</div>
        </div>
        <div className={styles.bottom2}>
          <div className={styles.full}>
            <div className={`${styles.checkBox} ${data.financial_policy_contract === "Signed" ? styles.selected : ""}`}>
              <div className={styles.checkBoxChild} />
              {data.financial_policy_contract === "Signed" && <div className={styles.checkBoxInner} />}
            </div>
            <div className={styles.fullPayment}>Agree</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TermofPaymentContent; 