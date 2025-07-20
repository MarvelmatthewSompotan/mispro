import React, { useState } from "react";
import styles from "./TermOfPaymentSection.module.css";
import checkBoxIcon from "../../../assets/CheckBox.png";

const TermOfPaymentSection = () => {
  // State untuk payment options
  const [tuitionFee, setTuitionFee] = useState("fullPayment");
  const [residenceHall, setResidenceHall] = useState("fullPayment");
  const [financialPolicy, setFinancialPolicy] = useState(false);
  const [discount, setDiscount] = useState("waiver");

  // State untuk dropdown waiver
  const [waiverType, setWaiverType] = useState("");
  // State untuk input field other
  const [otherDiscount, setOtherDiscount] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>TERM OF PAYMENT</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.paymentSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Tuition Fee</div>
          </div>
          <div className={styles.optionGroup}>
            <div className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tuitionFee"
                  value="fullPayment"
                  checked={tuitionFee === "fullPayment"}
                  onChange={(e) => setTuitionFee(e.target.value)}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {tuitionFee === "fullPayment" && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>Full payment</div>
              </label>
            </div>
            <div className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="tuitionFee"
                  value="installment"
                  checked={tuitionFee === "installment"}
                  onChange={(e) => setTuitionFee(e.target.value)}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {tuitionFee === "installment" && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>Installment</div>
              </label>
            </div>
          </div>
        </div>
        <div className={styles.paymentSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Residence Hall</div>
          </div>
          <div className={styles.optionGroup}>
            <div className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="residenceHall"
                  value="fullPayment"
                  checked={residenceHall === "fullPayment"}
                  onChange={(e) => setResidenceHall(e.target.value)}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {residenceHall === "fullPayment" && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>Full payment</div>
              </label>
            </div>
            <div className={styles.optionItem}>
              <label className={styles.radioLabel}>
                <input
                  type="radio"
                  name="residenceHall"
                  value="installment"
                  checked={residenceHall === "installment"}
                  onChange={(e) => setResidenceHall(e.target.value)}
                  className={styles.hiddenRadio}
                />
                <div className={styles.radioButton}>
                  <div className={styles.radioButtonCircle} />
                  {residenceHall === "installment" && (
                    <div className={styles.radioButtonSelected} />
                  )}
                </div>
                <div className={styles.label}>Installment</div>
              </label>
            </div>
          </div>
        </div>
        <div className={styles.paymentSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>
              Financial Policy & Contract
            </div>
          </div>
          <div className={styles.optionGroup}>
            <div className={styles.optionItem}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={financialPolicy}
                  onChange={(e) => setFinancialPolicy(e.target.checked)}
                  className={styles.hiddenCheckbox}
                />
                <div className={styles.checkBox}>
                  <div className={styles.checkBoxSquare} />
                  {financialPolicy && (
                    <img
                      className={styles.checkBoxIcon}
                      alt=""
                      src={checkBoxIcon}
                    />
                  )}
                </div>
                <div className={styles.label}>Agree</div>
              </label>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.discountSection}>
        <div className={styles.sectionTitle}>
          <div className={styles.sectionTitleText}>Discount</div>
        </div>
        <div className={styles.optionGroup}>
          <div className={styles.optionItem}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="discount"
                value="waiver"
                checked={discount === "waiver"}
                onChange={(e) => setDiscount(e.target.value)}
                className={styles.hiddenRadio}
              />
              <div className={styles.radioButton}>
                <div className={styles.radioButtonCircle} />
                {discount === "waiver" && (
                  <div className={styles.radioButtonSelected} />
                )}
              </div>
              <select
                className={styles.dropdownSelect}
                value={waiverType}
                onChange={(e) => setWaiverType(e.target.value)}
              >
                <option value="">Select waiver type</option>
                <option value="Academic Excellence">Academic Excellence</option>
                <option value="Sibling Discount">Sibling Discount</option>
                <option value="Staff Child">Staff Child</option>
                <option value="Early Bird">Early Bird</option>
                <option value="Loyalty Program">Loyalty Program</option>
              </select>
            </label>
          </div>
          <div className={`${styles.optionItem} ${styles.othersOption}`}>
            <label className={styles.radioLabel}>
              <input
                type="radio"
                name="discount"
                value="special"
                checked={discount === "special"}
                onChange={(e) => setDiscount(e.target.value)}
                className={styles.hiddenRadio}
              />
              <div className={styles.radioButton}>
                <div className={styles.radioButtonCircle} />
                {discount === "special" && (
                  <div className={styles.radioButtonSelected} />
                )}
              </div>
              <span className={styles.label}>Other</span>
              {discount === "special" && (
                <input
                  className={styles.valueRegular}
                  type="text"
                  value={otherDiscount}
                  onChange={(e) => setOtherDiscount(e.target.value)}
                  placeholder="Enter discount type"
                  style={{ marginLeft: 12 }}
                />
              )}
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermOfPaymentSection;
