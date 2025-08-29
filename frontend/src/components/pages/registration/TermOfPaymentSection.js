import React, { useState, useEffect, useRef } from 'react';
import styles from './TermOfPaymentSection.module.css';
import checkBoxIcon from '../../../assets/CheckBox.png';
import { getRegistrationOptions } from '../../../services/api';

const TermOfPaymentSection = ({ onDataChange, sharedData, prefill }) => {
  // State untuk payment options
  const [tuitionFees, setTuitionFees] = useState('');
  const [residencePayment, setResidencePayment] = useState('');
  const [financialPolicy, setFinancialPolicy] = useState(false);
  const [discountName, setDiscountName] = useState('');
  const [discountNotes, setDiscountNotes] = useState('');

  // State untuk dropdown options dari backend
  const [tuitionFeesOption, setTuitionFeesOption] = useState([]);
  const [residencePaymentOption, setResidencePaymentOption] = useState([]);
  const [discountTypeOptions, setDiscountTypeOptions] = useState([]);

  // Tambahkan ref untuk tracking apakah ini adalah prefill pertama kali
  const isInitialPrefill = useRef(true);
  const hasInitialized = useRef(false);

  // Use shared data if available, otherwise fetch separately
  useEffect(() => {
    if (sharedData) {
      setTuitionFeesOption(sharedData.tuition_fees || []);
      setResidencePaymentOption(sharedData.residence_payment || []);
      setDiscountTypeOptions(sharedData.discount_types || []);
    } else {
      // Fallback to individual API call if shared data not available
      getRegistrationOptions()
        .then((data) => {
          setTuitionFeesOption(data.tuition_fees || []);
          setResidencePaymentOption(data.residence_payment || []);
          setDiscountTypeOptions(data.discount_types || []);
        })
        .catch((err) => {
          console.error('Failed to fetch payment options:', err);
        });
    }
  }, [sharedData]);

  // Prefill hanya sekali saat component pertama kali mount atau saat prefill berubah signifikan
  useEffect(() => {
    if (prefill && Object.keys(prefill).length > 0) {
      // Jika ini prefill pertama kali atau prefill berubah signifikan
      if (isInitialPrefill.current || !hasInitialized.current) {
        console.log('Initial prefilling TermOfPaymentSection with:', prefill);

        if (prefill.tuition_fees) setTuitionFees(prefill.tuition_fees);
        if (prefill.residence_payment)
          setResidencePayment(prefill.residence_payment);
        if (prefill.financial_policy_contract) {
          setFinancialPolicy(prefill.financial_policy_contract === 'Signed');
        }
        if (prefill.discount_name) setDiscountName(prefill.discount_name);
        if (prefill.discount_notes) setDiscountNotes(prefill.discount_notes);

        hasInitialized.current = true;
        isInitialPrefill.current = false;
      }
    } else if (Object.keys(prefill).length === 0 && hasInitialized.current) {
      // Jika prefill menjadi empty object (reset form), reset semua field
      console.log('Resetting TermOfPaymentSection form');
      setTuitionFees('');
      setResidencePayment('');
      setFinancialPolicy(false);
      setDiscountName('');
      setDiscountNotes('');

      hasInitialized.current = false;
    }
  }, [prefill]);

  const handleTuitionFeesChange = (value) => {
    // Jika user mengklik option yang sudah dipilih, batalkan pilihan
    if (tuitionFees === value) {
      setTuitionFees('');

      onDataChange({
        tuition_fees: '',
        // ... other fields
      });
    } else {
      // Jika user memilih option baru
      setTuitionFees(value);

      onDataChange({
        tuition_fees: value,
        // ... other fields
      });
    }
  };

  const handleResidencePaymentChange = (value) => {
    // Jika user mengklik option yang sudah dipilih, batalkan pilihan
    if (residencePayment === value) {
      setResidencePayment('');

      onDataChange({
        residence_payment: '',
        // ... other fields
      });
    } else {
      // Jika user memilih option baru
      setResidencePayment(value);

      onDataChange({
        residence_payment: value,
        // ... other fields
      });
    }
  };

  const handleFinancialPolicyChange = (e) => {
    const value = e.target.checked;
    setFinancialPolicy(value);
    onDataChange({
      financial_policy_contract: value ? 'Signed' : 'Not Signed',
    });
  };

  const handleDiscountNameChange = (value) => {
    // Jika user mengklik option yang sudah dipilih, batalkan pilihan
    if (discountName === value) {
      setDiscountName('');

      onDataChange({
        discount_name: '',
        // ... other fields
      });
    } else {
      // Jika user memilih option baru
      setDiscountName(value);

      onDataChange({
        discount_name: value,
        // ... other fields
      });
    }
  };

  const handleDiscountNotesChange = (e) => {
    const value = e.target.value;
    setDiscountNotes(value);
    onDataChange({ discount_notes: value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>TERM OF PAYMENT</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.paymentSection}>
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Tuition Fees</div>
          </div>
          <div className={styles.optionGroup}>
            {tuitionFeesOption.map((option) => (
              <div key={option} className={styles.optionItem}>
                <label className={styles.radioLabel}>
                  <input
                    type='radio'
                    name='tuitionFees'
                    value={option}
                    checked={tuitionFees === option}
                    onChange={(e) => handleTuitionFeesChange(e.target.value)}
                    onClick={() => handleTuitionFeesChange(option)}
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
          <div className={styles.sectionTitle}>
            <div className={styles.sectionTitleText}>Residence Hall</div>
          </div>
          <div className={styles.optionGroup}>
            {residencePaymentOption.map((option) => (
              <div key={option} className={styles.optionItem}>
                <label className={styles.radioLabel}>
                  <input
                    type='radio'
                    name='residencePayment'
                    value={option}
                    checked={residencePayment === option}
                    onChange={(e) =>
                      handleResidencePaymentChange(e.target.value)
                    }
                    onClick={() => handleResidencePaymentChange(option)}
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
                  type='checkbox'
                  checked={financialPolicy}
                  onChange={handleFinancialPolicyChange}
                  className={styles.hiddenCheckbox}
                />
                <div className={styles.checkBox}>
                  <div className={styles.checkBoxSquare} />
                  {financialPolicy && (
                    <img
                      className={styles.checkBoxIcon}
                      alt=''
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
              <div className={styles.label}>Discount Type</div>
              <select
                className={`${styles.dropdownSelect} ${
                  discountName ? styles.hasValue : ''
                }`}
                value={discountName}
                onChange={(e) => handleDiscountNameChange(e.target.value)}
              >
                <option value=''>Select discount type</option>
                {discountTypeOptions.map((discount) => (
                  <option key={discount.discount_type_id} value={discount.name}>
                    {discount.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {discountName && (
            <div className={`${styles.optionItem} ${styles.othersOption}`}>
              <label className={styles.radioLabel}>
                <span className={styles.label}>Notes</span>
                <input
                  className={styles.valueRegular}
                  type='text'
                  value={discountNotes}
                  onChange={handleDiscountNotesChange}
                  placeholder='Enter discount notes'
                  style={{ margin: 0, padding: 0 }}
                />
              </label>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TermOfPaymentSection;
