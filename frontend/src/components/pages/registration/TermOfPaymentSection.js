import React, { useState, useEffect, useRef } from "react";
import styles from "./TermOfPaymentSection.module.css";
import checkBoxIcon from "../../../assets/CheckBox.png";
import { getRegistrationOptions } from "../../../services/api";
import Select from "react-select"; // Impor react-select

const TermOfPaymentSection = ({
  onDataChange,
  sharedData,
  prefill,
  errors,
  forceError,
}) => {
  const [tuitionFees, setTuitionFees] = useState("");
  const [residencePayment, setResidencePayment] = useState("");
  const [financialPolicy, setFinancialPolicy] = useState(false);
  const [discountName, setDiscountName] = useState("");
  const [discountNotes, setDiscountNotes] = useState("");

  const [tuitionFeesOption, setTuitionFeesOption] = useState([]);
  const [residencePaymentOption, setResidencePaymentOption] = useState([]);
  const [discountTypeOptions, setDiscountTypeOptions] = useState([]);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (sharedData) {
      setTuitionFeesOption(sharedData.tuition_fees || []);
      setResidencePaymentOption(sharedData.residence_payment || []);
      setDiscountTypeOptions(sharedData.discount_types || []);
    } else {
      getRegistrationOptions()
        .then((data) => {
          setTuitionFeesOption(data.tuition_fees || []);
          setResidencePaymentOption(data.residence_payment || []);
          setDiscountTypeOptions(data.discount_types || []);
        })
        .catch((err) => {
          console.error("Failed to fetch payment options:", err);
        });
    }
  }, [sharedData]);

  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0 && !hasInitialized.current) {
      if (prefill.tuition_fees) setTuitionFees(prefill.tuition_fees);
      if (prefill.residence_payment)
        setResidencePayment(prefill.residence_payment);
      if (prefill.financial_policy_contract) {
        setFinancialPolicy(prefill.financial_policy_contract === "Signed");
      }
      if (prefill.discount_name) setDiscountName(prefill.discount_name);
      if (prefill.discount_notes) setDiscountNotes(prefill.discount_notes);
      hasInitialized.current = true;
    }
  }, [prefill]);

  useEffect(() => {
    if (hasInitialized.current) {
      onDataChange({
        tuition_fees: tuitionFees,
        residence_payment: residencePayment,
        financial_policy_contract: financialPolicy ? "Signed" : "Not Signed",
        discount_name: discountName,
        discount_notes: discountNotes,
      });
    }
  }, [
    tuitionFees,
    residencePayment,
    financialPolicy,
    discountName,
    discountNotes,
    onDataChange,
  ]);

  const handleTuitionFeesChange = (value) => {
    setTuitionFees((current) => (current === value ? "" : value));
  };

  const handleResidencePaymentChange = (value) => {
    setResidencePayment((current) => (current === value ? "" : value));
  };

  const handleFinancialPolicyChange = (e) => {
    setFinancialPolicy(e.target.checked);
  };

  const handleDiscountChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setDiscountName(value);
    if (!value) {
      setDiscountNotes(""); // Otomatis kosongkan notes jika diskon dihapus
    }
  };

  const handleDiscountNotesChange = (e) => {
    setDiscountNotes(e.target.value);
  };

  const customSelectStyles = {
    control: (baseStyles) => ({
      ...baseStyles,
      border: "1px solid #ccc", // Di sini kita beri border agar terlihat
      boxShadow: "none",
      "&:hover": {
        borderColor: "#888",
      },
    }),
    placeholder: (baseStyles) => ({
      ...baseStyles,
      fontFamily: "Poppins, Arial, sans-serif",
      fontWeight: 400, // <-- 400 adalah font regular (tidak bold)
      color: "rgba(128, 128, 128, 0.6)",
    }),
    singleValue: (baseStyles) => ({
      ...baseStyles,
      fontFamily: "Poppins, Arial, sans-serif",
      fontWeight: "normal", // Teks yang sudah dipilih dibuat normal
      color: "#000",
    }),
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>TERM OF PAYMENT</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.paymentSection}>
          <div
            className={`${styles.sectionTitle} ${
              (errors?.tuition_fees || forceError?.tuition_fees) && !tuitionFees
                ? styles.termOfPaymentErrorWrapper
                : ""
            }`}
          >
            <div
              className={`${styles.sectionTitleText} ${
                (errors?.tuition_fees || forceError?.tuition_fees) &&
                !tuitionFees
                  ? styles.termOfPaymentErrorLabel
                  : ""
              }`}
            >
              Tuition Fees
            </div>
          </div>
          <div className={styles.optionGroup}>
            {tuitionFeesOption.map((option) => (
              <div key={option} className={styles.optionItem}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="tuitionFees"
                    value={option}
                    checked={tuitionFees === option}
                    onChange={() => handleTuitionFeesChange(option)}
                    className={styles.hiddenRadio}
                  />
                  <div className={styles.radioButton}>
                    <div className={styles.radioButtonCircle} />
                    {tuitionFees === option && (
                      <div className={styles.radioButtonSelected} />
                    )}
                  </div>
                  <div className={styles.label}>{option}</div>
                </label>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.paymentSection}>
          <div
            className={`${styles.sectionTitle} ${
              (errors?.residence_payment || forceError?.residence_payment) &&
              !residencePayment
                ? styles.termOfPaymentErrorWrapper
                : ""
            }`}
          >
            <div
              className={`${styles.sectionTitleText} ${
                (errors?.residence_payment || forceError?.residence_payment) &&
                !residencePayment
                  ? styles.termOfPaymentErrorLabel
                  : ""
              }`}
            >
              Residence Hall
            </div>
          </div>
          <div className={styles.optionGroup}>
            {residencePaymentOption.map((option) => (
              <div key={option} className={styles.optionItem}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="residencePayment"
                    value={option}
                    checked={residencePayment === option}
                    onChange={() => handleResidencePaymentChange(option)}
                    className={styles.hiddenRadio}
                  />
                  <div className={styles.radioButton}>
                    <div className={styles.radioButtonCircle} />
                    {residencePayment === option && (
                      <div className={styles.radioButtonSelected} />
                    )}
                  </div>
                  <div className={styles.label}>{option}</div>
                </label>
              </div>
            ))}
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
                  onChange={handleFinancialPolicyChange}
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
        <div className={styles.discountInputWrapper}>
          <div className={styles.discountSelectWrapper}>
            <Select
              placeholder="Select discount type"
              isClearable
              options={discountTypeOptions.map((d) => ({
                value: d.name,
                label: d.name,
              }))}
              
              value={
                discountName
                  ? { value: discountName, label: discountName }
                  : null
              }
              onChange={handleDiscountChange}
              classNamePrefix="react-select"
            />
          </div>
          {discountName && (
            <div className={styles.notesWrapper}>
              <span className={styles.notesLabel}>Notes:</span>
              <input
                className={styles.notesInput}
                type="text"
                value={discountNotes}
                onChange={handleDiscountNotesChange}
                placeholder="Enter discount notes"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermOfPaymentSection;
