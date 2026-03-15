import React from "react";
import styles from "./ParentGuardianSection.module.css";

// Reusable text input field matching StudentInformationSection & Figma
const StandardField = ({
  id,
  label,
  required = false,
  value,
  onChange,
  placeholder,
  type = 'text',
  error = false,
  errorMessage,
  wrapperClass = '',
  inputClass = '',
  onFocus,
  inputProps = {},
  maxLength,
}) => (
  <div
    className={`${wrapperClass} ${
      error ? styles.errorFieldWrapper : ''
    }`}
  >
    <div className={styles.labelRow}>
      <span className={`${styles.label} ${error ? styles.errorLabel : ''}`}>{label}</span>
      {required && <span className={styles.requiredMark}>*</span>}
    </div>
    
    {errorMessage !== undefined ? (
      <div className={styles.inputWithError}>
        <input
          id={id}
          type={type}
          className={`${styles.label} ${inputClass} ${value ? 'hasValue' : ''} ${
            error ? styles.errorInput : ''
          }`}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          placeholder={placeholder}
          maxLength={maxLength}
          {...inputProps}
        />
        {error && errorMessage && (
          <div className={styles.inlineErrorMessage}>
            {errorMessage}
          </div>
        )}
      </div>
    ) : (
      <input
        id={id}
        type={type}
        className={`${styles.label} ${inputClass} ${value ? 'hasValue' : ''} ${
          error ? styles.errorInput : ''
        }`}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        placeholder={placeholder}
        maxLength={maxLength}
        {...inputProps}
      />
    )}
  </div>
);

const ParentGuardianSection = ({ formData, onDataChange, errors }) => {
  const [touchedFields, setTouchedFields] = React.useState({});

  React.useEffect(() => {
    setTouchedFields({});
  }, [errors]);

  const handleChange = (key) => (e) => {
    const { value } = e.target;
    onDataChange({ [key]: value });
    setTouchedFields((prev) => ({ ...prev, [key]: true }));
  };

  const hasError = (key) => errors?.[key] && !touchedFields[key];

  const handleFocus = (key) => () => {
    if (hasError(key)) {
      setTouchedFields((prev) => ({ ...prev, [key]: true }));
    }
  };

  const father = {
    name: formData.father_name,
    company: formData.father_company,
    occupation: formData.father_occupation,
    phone: formData.father_phone,
    email: formData.father_email,
    street: formData.father_address_street,
    rt: formData.father_address_rt,
    rw: formData.father_address_rw,
    village: formData.father_address_village,
    district: formData.father_address_district,
    city: formData.father_address_city_regency,
    province: formData.father_address_province,
    other: formData.father_address_other,
  };

  const mother = {
    name: formData.mother_name,
    company: formData.mother_company,
    occupation: formData.mother_occupation,
    phone: formData.mother_phone,
    email: formData.mother_email,
    street: formData.mother_address_street,
    rt: formData.mother_address_rt,
    rw: formData.mother_address_rw,
    village: formData.mother_address_village,
    district: formData.mother_address_district,
    city: formData.mother_address_city_regency,
    province: formData.mother_address_province,
    other: formData.mother_address_other,
  };

  const guardian = {
    name: formData.guardian_name,
    relationship: formData.relation_to_student,
    phone: formData.guardian_phone,
    email: formData.guardian_email,
    street: formData.guardian_address_street,
    rt: formData.guardian_address_rt,
    rw: formData.guardian_address_rw,
    village: formData.guardian_address_village,
    district: formData.guardian_address_district,
    city: formData.guardian_address_city_regency,
    province: formData.guardian_address_province,
    other: formData.guardian_address_other,
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerText}>PARENTS / GUARDIAN INFORMATION</span>
      </div>
      
      <div className={styles.contentWrapper}>
        <div className={styles.parentSection}>

          <div className={styles.parentInfoSection}>
            <div className={styles.subsectionHeader}>
              <span className={styles.subsectionTitle}>Father's Information</span>
            </div>
            
            <div className={styles.parentInfoContent}>
              <div className={styles.row}>
                <StandardField
                  id="father_name"
                  label="Name"
                  required
                  value={father.name}
                  error={hasError("father_name")}
                  placeholder="John Doe"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_name")}
                  onFocus={handleFocus("father_name")}
                />
              </div>
              
              <div className={styles.row}>
                <StandardField
                  id="father_company"
                  label="Company name"
                  value={father.company}
                  error={hasError("father_company")}
                  placeholder="PT. Multi Rakyat"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_company")}
                  onFocus={handleFocus("father_company")}
                />
                <StandardField
                  id="father_occupation"
                  label="Occupation/Position"
                  value={father.occupation}
                  error={hasError("father_occupation")}
                  placeholder="Field Manager"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_occupation")}
                  onFocus={handleFocus("father_occupation")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="father_email"
                  label="Email Address"
                  required
                  type="email"
                  value={father.email}
                  error={hasError("father_email")}
                  placeholder="Johndoehebat@gmail.com"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_email")}
                  onFocus={handleFocus("father_email")}
                />
                <StandardField
                  id="father_phone"
                  label="Phone Number"
                  required
                  type="tel"
                  maxLength="20"
                  value={father.phone}
                  error={hasError("father_phone")}
                  errorMessage={hasError("father_phone") ? "Invalid input" : undefined}
                  placeholder="089281560955"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_phone")}
                  onFocus={handleFocus("father_phone")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="father_address_street"
                  label="Street"
                  required
                  value={father.street}
                  error={hasError("father_address_street")}
                  placeholder="JL. Sarundajang 01"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_address_street")}
                  onFocus={handleFocus("father_address_street")}
                />
                <div className={styles.rtrwGroup}>
                  <StandardField
                    id="father_address_rt"
                    label="RT"
                    value={father.rt}
                    error={hasError("father_address_rt")}
                    placeholder="001"
                    wrapperClass={styles.rtField}
                    inputClass={styles.valueHighlight}
                    onChange={handleChange("father_address_rt")}
                    onFocus={handleFocus("father_address_rt")}
                  />
                  <StandardField
                    id="father_address_rw"
                    label="RW"
                    value={father.rw}
                    error={hasError("father_address_rw")}
                    placeholder="002"
                    wrapperClass={styles.rtField}
                    inputClass={styles.valueHighlight}
                    onChange={handleChange("father_address_rw")}
                    onFocus={handleFocus("father_address_rw")}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <StandardField
                  id="father_address_village"
                  label="Village"
                  required
                  value={father.village}
                  error={hasError("father_address_village")}
                  placeholder="Girian"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_address_village")}
                  onFocus={handleFocus("father_address_village")}
                />
                <StandardField
                  id="father_address_district"
                  label="District"
                  required
                  value={father.district}
                  error={hasError("father_address_district")}
                  placeholder="Danowudu"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_address_district")}
                  onFocus={handleFocus("father_address_district")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="father_address_city"
                  label="City/Regency"
                  required
                  value={father.city}
                  error={hasError("father_address_city_regency")}
                  placeholder="Kotamobagu"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_address_city_regency")}
                  onFocus={handleFocus("father_address_city_regency")}
                />
                <StandardField
                  id="father_address_province"
                  label="Province"
                  required
                  value={father.province}
                  error={hasError("father_address_province")}
                  placeholder="North Sulawesi"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("father_address_province")}
                  onFocus={handleFocus("father_address_province")}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.otherFieldWrapper}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>Other</span>
                  </div>
                  <div className={styles.otherAddressParent}>
                    <span className={styles.bracket}>(</span>
                    <input
                      id="father_address_other"
                      className={`${styles.label} ${styles.otherAddressInput} ${
                        father.other ? 'hasValue' : ''
                      } ${hasError("father_address_other") ? styles.errorInput : ''}`}
                      type="text"
                      value={father.other || ""}
                      onChange={handleChange("father_address_other")}
                      onFocus={handleFocus("father_address_other")}
                    />
                    <span className={styles.bracket}>)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.parentInfoSection}>
            <div className={styles.subsectionHeader}>
              <span className={styles.subsectionTitle}>Mother's Information</span>
            </div>
            
            <div className={styles.parentInfoContent}>
              <div className={styles.row}>
                <StandardField
                  id="mother_name"
                  label="Name"
                  required
                  value={mother.name}
                  error={hasError("mother_name")}
                  placeholder="Jane Doe"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_name")}
                  onFocus={handleFocus("mother_name")}
                />
              </div>
              
              <div className={styles.row}>
                <StandardField
                  id="mother_company"
                  label="Company name"
                  value={mother.company}
                  error={hasError("mother_company")}
                  placeholder="PT. Multi Rakyat"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_company")}
                  onFocus={handleFocus("mother_company")}
                />
                <StandardField
                  id="mother_occupation"
                  label="Occupation/Position"
                  value={mother.occupation}
                  error={hasError("mother_occupation")}
                  placeholder="Field Manager"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_occupation")}
                  onFocus={handleFocus("mother_occupation")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="mother_email"
                  label="Email Address"
                  required
                  type="email"
                  value={mother.email}
                  error={hasError("mother_email")}
                  placeholder="Janedoehebat@gmail.com"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_email")}
                  onFocus={handleFocus("mother_email")}
                />
                <StandardField
                  id="mother_phone"
                  label="Phone Number"
                  required
                  type="tel"
                  maxLength="20"
                  value={mother.phone}
                  error={hasError("mother_phone")}
                  errorMessage={hasError("mother_phone") ? "Invalid input" : undefined}
                  placeholder="089281560955"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_phone")}
                  onFocus={handleFocus("mother_phone")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="mother_address_street"
                  label="Street"
                  required
                  value={mother.street}
                  error={hasError("mother_address_street")}
                  placeholder="JL. Sarundajang 01"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_address_street")}
                  onFocus={handleFocus("mother_address_street")}
                />
                <div className={styles.rtrwGroup}>
                  <StandardField
                    id="mother_address_rt"
                    label="RT"
                    value={mother.rt}
                    error={hasError("mother_address_rt")}
                    placeholder="001"
                    wrapperClass={styles.rtField}
                    inputClass={styles.valueHighlight}
                    onChange={handleChange("mother_address_rt")}
                    onFocus={handleFocus("mother_address_rt")}
                  />
                  <StandardField
                    id="mother_address_rw"
                    label="RW"
                    value={mother.rw}
                    error={hasError("mother_address_rw")}
                    placeholder="002"
                    wrapperClass={styles.rtField}
                    inputClass={styles.valueHighlight}
                    onChange={handleChange("mother_address_rw")}
                    onFocus={handleFocus("mother_address_rw")}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <StandardField
                  id="mother_address_village"
                  label="Village"
                  required
                  value={mother.village}
                  error={hasError("mother_address_village")}
                  placeholder="Girian"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_address_village")}
                  onFocus={handleFocus("mother_address_village")}
                />
                <StandardField
                  id="mother_address_district"
                  label="District"
                  required
                  value={mother.district}
                  error={hasError("mother_address_district")}
                  placeholder="Danowudu"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_address_district")}
                  onFocus={handleFocus("mother_address_district")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="mother_address_city"
                  label="City/Regency"
                  required
                  value={mother.city}
                  error={hasError("mother_address_city_regency")}
                  placeholder="Kotamobagu"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_address_city_regency")}
                  onFocus={handleFocus("mother_address_city_regency")}
                />
                <StandardField
                  id="mother_address_province"
                  label="Province"
                  required
                  value={mother.province}
                  error={hasError("mother_address_province")}
                  placeholder="North Sulawesi"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("mother_address_province")}
                  onFocus={handleFocus("mother_address_province")}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.otherFieldWrapper}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>Other</span>
                  </div>
                  <div className={styles.otherAddressParent}>
                    <span className={styles.bracket}>(</span>
                    <input
                      id="mother_address_other"
                      className={`${styles.label} ${styles.otherAddressInput} ${
                        mother.other ? 'hasValue' : ''
                      } ${hasError("mother_address_other") ? styles.errorInput : ''}`}
                      type="text"
                      value={mother.other || ""}
                      onChange={handleChange("mother_address_other")}
                      onFocus={handleFocus("mother_address_other")}
                    />
                    <span className={styles.bracket}>)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.parentInfoSection}>
            <div className={styles.subsectionHeader}>
              <span className={styles.subsectionTitle}>Authorized Guardian's Information</span>
            </div>
            
            <div className={styles.parentInfoContent}>
              <div className={styles.row}>
                <StandardField
                  id="guardian_name"
                  label="Name"
                  value={guardian.name}
                  error={hasError("guardian_name")}
                  placeholder="John Doe"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_name")}
                  onFocus={handleFocus("guardian_name")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="guardian_relationship"
                  label="Relationship to student"
                  value={guardian.relationship}
                  error={hasError("relation_to_student")}
                  placeholder="Uncle"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("relation_to_student")}
                  onFocus={handleFocus("relation_to_student")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="guardian_email"
                  label="Email Address"
                  type="email"
                  value={guardian.email}
                  error={hasError("guardian_email")}
                  placeholder="Johndoe@gmail.com"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_email")}
                  onFocus={handleFocus("guardian_email")}
                />
                <StandardField
                  id="guardian_phone"
                  label="Phone Number"
                  type="tel"
                  maxLength="20"
                  value={guardian.phone}
                  error={hasError("guardian_phone")}
                  errorMessage={hasError("guardian_phone") ? "Invalid input" : undefined}
                  placeholder="082176543890"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_phone")}
                  onFocus={handleFocus("guardian_phone")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="guardian_address_street"
                  label="Street"
                  value={guardian.street}
                  error={hasError("guardian_address_street")}
                  placeholder="JL. Sarundajang 01"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_address_street")}
                  onFocus={handleFocus("guardian_address_street")}
                />
                <div className={styles.rtrwGroup}>
                  <StandardField
                    id="guardian_address_rt"
                    label="RT"
                    value={guardian.rt}
                    error={hasError("guardian_address_rt")}
                    placeholder="001"
                    wrapperClass={styles.rtField}
                    inputClass={styles.valueHighlight}
                    onChange={handleChange("guardian_address_rt")}
                    onFocus={handleFocus("guardian_address_rt")}
                  />
                  <StandardField
                    id="guardian_address_rw"
                    label="RW"
                    value={guardian.rw}
                    error={hasError("guardian_address_rw")}
                    placeholder="002"
                    wrapperClass={styles.rtField}
                    inputClass={styles.valueHighlight}
                    onChange={handleChange("guardian_address_rw")}
                    onFocus={handleFocus("guardian_address_rw")}
                  />
                </div>
              </div>

              <div className={styles.row}>
                <StandardField
                  id="guardian_address_village"
                  label="Village"
                  value={guardian.village}
                  error={hasError("guardian_address_village")}
                  placeholder="Girian"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_address_village")}
                  onFocus={handleFocus("guardian_address_village")}
                />
                <StandardField
                  id="guardian_address_district"
                  label="District"
                  value={guardian.district}
                  error={hasError("guardian_address_district")}
                  placeholder="Danowudu"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_address_district")}
                  onFocus={handleFocus("guardian_address_district")}
                />
              </div>

              <div className={styles.row}>
                <StandardField
                  id="guardian_address_city"
                  label="City/Regency"
                  value={guardian.city}
                  error={hasError("guardian_address_city_regency")}
                  placeholder="Kotamobagu"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_address_city_regency")}
                  onFocus={handleFocus("guardian_address_city_regency")}
                />
                <StandardField
                  id="guardian_address_province"
                  label="Province"
                  value={guardian.province}
                  error={hasError("guardian_address_province")}
                  placeholder="North Sulawesi"
                  wrapperClass={styles.standardField}
                  inputClass={styles.valueHighlight}
                  onChange={handleChange("guardian_address_province")}
                  onFocus={handleFocus("guardian_address_province")}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.otherFieldWrapper}>
                  <div className={styles.labelRow}>
                    <span className={styles.label}>Other</span>
                  </div>
                  <div className={styles.otherAddressParent}>
                    <span className={styles.bracket}>(</span>
                    <input
                      id="guardian_address_other"
                      className={`${styles.label} ${styles.otherAddressInput} ${
                        guardian.other ? 'hasValue' : ''
                      } ${hasError("guardian_address_other") ? styles.errorInput : ''}`}
                      type="text"
                      value={guardian.other || ""}
                      onChange={handleChange("guardian_address_other")}
                      onFocus={handleFocus("guardian_address_other")}
                    />
                    <span className={styles.bracket}>)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ParentGuardianSection;