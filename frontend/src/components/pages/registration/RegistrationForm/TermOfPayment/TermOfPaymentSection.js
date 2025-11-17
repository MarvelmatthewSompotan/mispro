import React, { useState, useEffect, useRef } from "react";
import styles from "./TermOfPaymentSection.module.css";
import checkBoxIcon from "../../../../../assets/CheckBox.png";
import { getRegistrationOptions } from "../../../../../services/api";
import Select from "react-select";

const TermOfPaymentSection = ({
  onDataChange,
  sharedData,
  prefill,
  errors,
  forceError,
  isDormitory = false,
}) => {
  const hydratedRef = useRef(false);
  const [tuitionFees, setTuitionFees] = useState("");
  const [residencePayment, setResidencePayment] = useState("");
  const [financialPolicy, setFinancialPolicy] = useState(false);
  const [discountName, setDiscountName] = useState("");
  const [discountNotes, setDiscountNotes] = useState("");
  const [vaMandiri, setVaMandiri] = useState("");
  const [vaBni, setVaBni] = useState("");
  const [vaBca, setVaBca] = useState("");
  const [vaBri, setVaBri] = useState("");

  const [tuitionFeesOption, setTuitionFeesOption] = useState([]);
  const [residencePaymentOption, setResidencePaymentOption] = useState([]);
  const [discountTypeOptions, setDiscountTypeOptions] = useState([]);

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
    // Hydrate sekali saja dari prefill agar input tidak di-reset saat user mengetik
    if (hydratedRef.current) return;
    if (prefill && Object.keys(prefill).length > 0) {
      setTuitionFees((v) => v || prefill.tuition_fees || "");
      setResidencePayment((v) => v || prefill.residence_payment || "");
      setFinancialPolicy((v) =>
        v ? v : prefill.financial_policy_contract === "Signed"
      );
      setDiscountName((v) => (v !== "" ? v : prefill.discount_name || ""));
      setDiscountNotes((v) => (v !== "" ? v : prefill.discount_notes || ""));
      setVaMandiri((v) => (v !== "" ? v : prefill.va_mandiri || ""));
      setVaBni((v) => (v !== "" ? v : prefill.va_bni || ""));
      setVaBca((v) => (v !== "" ? v : prefill.va_bca || ""));
      setVaBri((v) => (v !== "" ? v : prefill.va_bri || ""));
      hydratedRef.current = true;
    }
  }, [prefill]);

  useEffect(() => {
    onDataChange({
      tuition_fees: tuitionFees,
      residence_payment: residencePayment,
      financial_policy_contract: financialPolicy ? "Signed" : "Not Signed",
      discount_name: discountName,
      discount_notes: discountNotes,
      va_mandiri: vaMandiri,
      va_bni: vaBni,
      va_bca: vaBca,
      va_bri: vaBri,
    });
  }, [
    tuitionFees,
    residencePayment,
    financialPolicy,
    discountName,
    discountNotes,
    onDataChange,
    vaMandiri,
    vaBni,
    vaBca,
    vaBri,
  ]);

  useEffect(() => {
    if (!isDormitory && residencePayment) {
      setResidencePayment("");
    }
    // eslint-disable-next-line
  }, [isDormitory]);

  const handleTuitionFeesChange = (e, value) => {
    e.preventDefault(); 
    setTuitionFees((current) => (current === value ? "" : value));
  };

  const handleResidencePaymentChange = (e, value) => {
    e.preventDefault(); 
    setResidencePayment((current) => (current === value ? "" : value));
  };

  const handleFinancialPolicyChange = (e) => {
    setFinancialPolicy(e.target.checked);
  };

  const handleDiscountChange = (selectedOption) => {
    const value = selectedOption ? selectedOption.value : "";
    setDiscountName(value);
    if (!value) {
      setDiscountNotes("");
    }
  };

  const handleDiscountNotesChange = (e) => {
    setDiscountNotes(e.target.value);
  };

  const handleVaMandiriChange = (e) => setVaMandiri(e.target.value);
  const handleVaBniChange = (e) => setVaBni(e.target.value);
  const handleVaBcaChange = (e) => setVaBca(e.target.value);
  const handleVaBriChange = (e) => setVaBri(e.target.value);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>TERM OF PAYMENT</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.paymentSection}>
          <div className={styles.sectionTitle}>
            <div
              className={`${styles.sectionTitleText} ${
                errors?.tuition_fees && !tuitionFees
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
                <label
                  className={styles.radioLabel}
                  onClick={(e) => handleTuitionFeesChange(e, option)}
                >
                  <input
                    type="radio"
                    name="tuitionFees"
                    value={option}
                    checked={tuitionFees === option}
                    readOnly
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

        {isDormitory && (
          <div className={styles.paymentSection}>
            <div className={styles.sectionTitle}>
              <div
                className={`${styles.sectionTitleText} ${
                  isDormitory && errors?.residence_payment && !residencePayment
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
                  <label
                    className={styles.radioLabel}
                    onClick={(e) => handleResidencePaymentChange(e, option)}
                  >
                    <input
                      type="radio"
                      name="residencePayment"
                      value={option}
                      checked={residencePayment === option}
                      readOnly
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
        )}

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
                <div className={styles.label}>Signed</div>
              </label>
            </div>
          </div>
        </div>
        <div
          className={`${styles.discountSection} ${
            !isDormitory ? styles.discountInline : ""
          }`}
        >
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
        <div className={styles.virtualAccountContainer}>
          <div className={styles.virtualAccountItem}>
            <span className={styles.virtualAccountLabel}>
              Virtual Account Mandiri
            </span>
            <input
              type="text"
              className={styles.virtualAccountNumber}
              value={vaMandiri}
              onChange={handleVaMandiriChange}
              placeholder="Enter VA number"
            />
          </div>
          <div className={styles.virtualAccountItem}>
            <span className={styles.virtualAccountLabel}>
              Virtual Account BNI
            </span>
            <input
              type="text"
              className={styles.virtualAccountNumber}
              value={vaBni}
              onChange={handleVaBniChange}
              placeholder="Enter VA number"
            />
          </div>
          <div className={styles.virtualAccountItem}>
            <span className={styles.virtualAccountLabel}>
              Virtual Account BCA
            </span>
            <input
              type="text"
              className={styles.virtualAccountNumber}
              value={vaBca}
              onChange={handleVaBcaChange}
              placeholder="Enter VA number"
            />
          </div>
          <div className={styles.virtualAccountItem}>
            <span className={styles.virtualAccountLabel}>
              Virtual Account BRI
            </span>
            <input
              type="text"
              className={styles.virtualAccountNumber}
              value={vaBri}
              onChange={handleVaBriChange}
              placeholder="Enter VA number"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermOfPaymentSection;
