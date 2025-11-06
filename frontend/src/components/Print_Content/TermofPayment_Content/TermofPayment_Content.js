import React from "react";
import styles from "../../styles/TermofPayment_Content.module.css";

function TermofPaymentContent({ data, isDormitory }) {
  const option = ["Full Payment", "Installment"];

  const renderCheckbox = (isSigned) => {
    return isSigned ? (
      <div className={styles.checkBoxChild} />
    ) : (
      <div
        style={{
          position: "absolute",
          height: "108.33%",
          width: "108.33%",
          top: "-4.17%",
          right: "-4.17%",
          bottom: "-4.17%",
          left: "-4.17%",
          borderRadius: "4px",
          border: "3px solid #5f84fe",
          boxSizing: "border-box",
          backgroundColor: "white",
        }}
      />
    );
  };

  return (
    <div className={styles.content}>
      {/* Tuition Fee */}
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

      {/* Residence Hall → hidden jika bukan dormitory / tidak dipilih */}
      {isDormitory && data?.residence_payment && (
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
      )}

      {/* Discount (paksa kolom-3 via CSS) */}
      <div className={styles.discountSection}>
        <div className={styles.txtTuitionFee}>
          <div className={styles.contentTuitionFee}>Discount</div>
        </div>
        <div className={styles.discountText}>
          <span className={styles.discountName}>
            {data?.discount_name || "No discount"}
          </span>
          {data?.discount_notes && (
            <span className={styles.discountNotes}>
              ({data.discount_notes})
            </span>
          )}
        </div>
      </div>

      {/* Financial Policy & Contract (paksa kolom-4 via CSS) */}
      <div className={styles.financialPolicySection}>
        <div className={styles.financialPolicyLabel}>
          Financial Policy &amp; Contract
        </div>
        <div className={styles.financialPolicyContent}>
          <div className={styles.financialPolicyCheckbox}>
            {/* pakai komponen checkbox yang sama */}
            <div className={styles.checkBox} style={{ width: 24, height: 24 }}>
              {renderCheckbox(data?.financial_policy_contract === "Signed")}
            </div>
          </div>
          <div className={styles.financialPolicyText}>Signed</div>
        </div>
      </div>
    </div>
  );
}

export default TermofPaymentContent;
