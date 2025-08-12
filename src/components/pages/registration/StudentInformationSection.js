import React, { useState } from "react";
import styles from "./StudentInformationSection.module.css";
import Select from "react-select";
import { differenceInYears, addYears, differenceInMonths } from "date-fns";

const StudentInformationSection = ({
  onValidationChange,
  setErrors,
  forceError,
  options = {},
}) => {
  // Use options from API or fallback to default values
  const genderOptions = options.gender || ["MALE", "FEMALE"];
  const citizenshipOptions = ["Indonesia", "Non Indonesia"]; // Not in API, keep default
  const religionOptions = ["Christian", "Islam", "Hindu", "Buddha", "Other"]; // Not in API, keep default
  const academicStatusOptions = options.academic_status || [
    "REGULAR",
    "SIT-IN",
    "OTHER",
  ];
  const [firstName, setFirstName] = useState("");
  const [firstNameError, setFirstNameError] = useState(false);
  const [citizenshipError, setCitizenshipError] = useState(false);
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [nisn, setNisn] = useState("");
  const [nkk, setNkk] = useState("");
  const [kitas, setKitas] = useState("");
  const [foreignCountry, setForeignCountry] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [rank, setRank] = useState("");
  const [citizenship, setCitizenship] = useState("");
  const [religion, setReligion] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [previousSchool, setPreviousSchool] = useState("");
  const [phone, setPhone] = useState("");
  const [academicStatus, setAcademicStatus] = useState("");
  const [academicStatusCustom, setAcademicStatusCustom] = useState("");
  const [street, setStreet] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [otherAddress, setOtherAddress] = useState("");

  // Hitung umur otomatis dari dateOfBirth
  React.useEffect(() => {
    if (dateOfBirth) {
      try {
        const dob = new Date(dateOfBirth);
        const now = new Date();

        // Pastikan tanggal valid
        if (isNaN(dob.getTime())) {
          setAge("");
          return;
        }

        // Pastikan tanggal tidak di masa depan
        if (dob > now) {
          setAge("");
          return;
        }

        // Hitung umur dalam tahun dan bulan
        const years = differenceInYears(now, dob);
        const afterYears = addYears(dob, years);
        const months = differenceInMonths(now, afterYears);

        // Pastikan hasil valid
        if (years < 0 || months < 0) {
          setAge("");
          return;
        }

        setAge(`${years} Tahun, ${months} Bulan`);
      } catch (error) {
        console.error("Error calculating age:", error);
        setAge("");
      }
    } else {
      setAge("");
    }
  }, [dateOfBirth]);

  // Kirim status validasi ke parent component
  React.useEffect(() => {
    if (onValidationChange) {
      onValidationChange({
        firstName: !firstNameError && firstName.trim() !== "",
        citizenship: !citizenshipError && citizenship !== "",
        // Tambahkan field lain sesuai kebutuhan
      });
    }
  }, [
    firstNameError,
    firstName,
    citizenshipError,
    citizenship,
    // Remove onValidationChange from dependencies to prevent infinite loop
  ]);

  // Terima error state dari parent component
  React.useEffect(() => {
    if (setErrors && setErrors.firstName !== undefined) {
      setFirstNameError(setErrors.firstName);
    } else {
      setFirstNameError(false);
    }

    if (setErrors && setErrors.citizenship !== undefined) {
      setCitizenshipError(setErrors.citizenship);
    } else {
      setCitizenshipError(false);
    }
  }, [setErrors]);

  // Terima forceError prop untuk testing
  React.useEffect(() => {
    if (forceError && forceError.firstName) {
      setFirstNameError(true);
    }
  }, [forceError]);

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT'S INFORMATION</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.infoSection}>
          <div className={styles.row}>
            <div
              className={`${styles.nameField} ${
                firstNameError ? styles.errorFieldWrapper : ""
              }`}
            >
              {firstNameError ? (
                <div
                  className={styles.errorContainer}
                  onClick={() => setFirstNameError(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setFirstNameError(false);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.errorLabel}>First name</div>
                  <div className={styles.errorMessage}>
                    THIS FIELD NEEDS TO BE FILLED
                  </div>
                </div>
              ) : (
                <>
                  <label className={styles.label} htmlFor="firstName">
                    First name
                  </label>
                  <input
                    id="firstName"
                    className={`${styles.label} ${firstName ? "hasValue" : ""}`}
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (firstNameError && e.target.value.trim()) {
                        setFirstNameError(false);
                      }
                    }}
                    onFocus={() => {
                      if (firstNameError) {
                        setFirstNameError(false);
                      }
                    }}
                    placeholder="First name"
                  />
                </>
              )}
            </div>
            <div className={styles.nameField}>
              <label className={styles.label} htmlFor="middleName">
                Middle name
              </label>
              <input
                id="middleName"
                className={`${styles.label} ${middleName ? "hasValue" : ""}`}
                type="text"
                value={middleName}
                onChange={(e) => setMiddleName(e.target.value)}
                placeholder="Middle name"
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="lastName">
                Last name
              </label>
              <input
                id="lastName"
                className={`${styles.label} ${lastName ? "hasValue" : ""}`}
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="nickname">
                Nickname
              </label>
              <input
                id="nickname"
                className={`${styles.valueHighlight} ${
                  nickname ? "hasValue" : ""
                }`}
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname"
              />
            </div>
          </div>
          <div className={styles.row}>
            <div
              className={`${styles.citizenshipField} ${
                citizenshipError ? styles.errorFieldWrapper : ""
              }`}
            >
              {citizenshipError ? (
                <div
                  className={styles.errorContainer}
                  onClick={() => setCitizenshipError(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      setCitizenshipError(false);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  style={{ cursor: "pointer" }}
                >
                  <div className={styles.errorLabel}>Citizenship</div>
                  <div className={styles.errorMessage}>
                    THIS FIELD NEEDS TO BE FILLED
                  </div>
                </div>
              ) : (
                <>
                  <label className={styles.label} htmlFor="citizenship">
                    Citizenship
                  </label>
                  <Select
                    id="citizenship"
                    options={citizenshipOptions.map((opt) => ({
                      value: opt,
                      label: opt,
                    }))}
                    placeholder="Select citizenship"
                    value={
                      citizenship
                        ? { value: citizenship, label: citizenship }
                        : null
                    }
                    onChange={(opt) => {
                      setCitizenship(opt ? opt.value : "");
                      if (citizenshipError && opt) {
                        setCitizenshipError(false);
                      }
                    }}
                    onFocus={() => {
                      if (citizenshipError) {
                        setCitizenshipError(false);
                      }
                    }}
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontWeight: citizenship ? "bold" : "400",
                        color: citizenship ? "#000" : "rgba(128,128,128,0.6)",
                        border: "none",
                        boxShadow: "none",
                        borderRadius: 0,
                        borderBottom: "none",
                        background: "transparent",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontWeight: citizenship ? "bold" : "400",
                        color: citizenship ? "#000" : "rgba(128,128,128,0.6)",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "rgba(128,128,128,0.6)",
                      }),
                    }}
                  />
                </>
              )}
            </div>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor="religion">
                Religion
              </label>
              <Select
                id="religion"
                options={religionOptions.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                placeholder="Select religion"
                value={religion ? { value: religion, label: religion } : null}
                onChange={(opt) => setReligion(opt ? opt.value : "")}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    fontWeight: religion ? "bold" : "400",
                    color: religion ? "#000" : "rgba(128,128,128,0.6)",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: 0,
                    borderBottom: "none",
                    background: "transparent",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontWeight: religion ? "bold" : "400",
                    color: religion ? "#000" : "rgba(128,128,128,0.6)",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "rgba(128,128,128,0.6)",
                  }),
                }}
              />
            </div>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor="placeOfBirth">
                Place of birth
              </label>
              <input
                id="placeOfBirth"
                className={`${styles.valueHighlight} ${
                  placeOfBirth ? "hasValue" : ""
                }`}
                type="text"
                value={placeOfBirth}
                onChange={(e) => setPlaceOfBirth(e.target.value)}
                placeholder="Place of birth"
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="dateOfBirth">
                Date of birth
              </label>
              <div className={styles.dateInputWrapper}>
                <input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setDateOfBirth(selectedDate);
                  }}
                  className={`${styles.dateInput} ${
                    dateOfBirth ? "hasValue" : ""
                  }`}
                  max={new Date().toISOString().split("T")[0]}
                />
                <div className={styles.calendarIcon}>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 20 19.5 22 16 22H8C4.5 22 3 20 3 17V8.5C3 5.5 4.5 3.5 8 3.5H16C19.5 3.5 21 5.5 21 8.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
          {citizenship === "Non Indonesia" && (
            <div className={styles.row}>
              <div className={styles.nicknameField}>
                <label className={styles.label} htmlFor="foreignCountry">
                  Country of origin
                </label>
                <input
                  id="foreignCountry"
                  className={`${styles.valueHighlight} ${
                    foreignCountry ? "hasValue" : ""
                  }`}
                  type="text"
                  value={foreignCountry}
                  onChange={(e) => setForeignCountry(e.target.value)}
                  placeholder="Country of Origin"
                />
              </div>
            </div>
          )}
          <div className={styles.row}>
            {citizenship === "Non Indonesia" && (
              <div className={styles.nicknameField}>
                <label className={styles.label} htmlFor="kitas">
                  KITAS
                </label>
                <input
                  id="kitas"
                  className={`${styles.valueHighlight} ${
                    kitas ? "hasValue" : ""
                  }`}
                  type="text"
                  value={kitas}
                  onChange={(e) => setKitas(e.target.value)}
                  placeholder="KITAS"
                />
              </div>
            )}
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="nisn">
                Nomor Induk Siswa Nasional (NISN)
              </label>
              <input
                id="nisn"
                className={`${styles.label} ${nisn ? "hasValue" : ""}`}
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="NISN"
              />
            </div>
            {citizenship === "Indonesia" && (
              <div className={styles.nicknameField}>
                <label className={styles.label} htmlFor="nkk">
                  Nomor Induk Kependudukan (NIK)
                </label>
                <input
                  id="nkk"
                  className={`${styles.label} ${nkk ? "hasValue" : ""}`}
                  type="text"
                  value={nkk}
                  onChange={(e) => setNkk(e.target.value)}
                  placeholder="NIK"
                />
              </div>
            )}
          </div>
          <div className={styles.row}>
            <div className={styles.genderField}>
              <label className={styles.label} htmlFor="gender">
                Gender
              </label>
              <Select
                id="gender"
                options={genderOptions.map((opt) => ({
                  value: opt,
                  label: opt,
                }))}
                placeholder="Select gender"
                value={gender ? { value: gender, label: gender } : null}
                onChange={(opt) => setGender(opt ? opt.value : "")}
                isClearable
                styles={{
                  control: (base) => ({
                    ...base,
                    fontWeight: gender ? "bold" : "400",
                    color: gender ? "#000" : "rgba(128,128,128,0.6)",
                    border: "none",
                    boxShadow: "none",
                    borderRadius: 0,
                    borderBottom: "none",
                    background: "transparent",
                  }),
                  singleValue: (base) => ({
                    ...base,
                    fontWeight: gender ? "bold" : "400",
                    color: gender ? "#000" : "rgba(128,128,128,0.6)",
                  }),
                  placeholder: (base) => ({
                    ...base,
                    color: "rgba(128,128,128,0.6)",
                  }),
                }}
              />
            </div>
            <div className={`${styles.genderField} ${styles.rankField}`}>
              <label className={styles.label} htmlFor="rank">
                Rank in the family
              </label>
              <input
                id="rank"
                className={`${styles.valueSmall} ${rank ? "hasValue" : ""}`}
                type="number"
                value={rank}
                onChange={(e) => {
                  const value = e.target.value;
                  const numValue = parseInt(value);

                  // Hanya terima angka 1 ke atas
                  if (value === "" || (numValue >= 1 && numValue <= 99)) {
                    setRank(value);
                  }
                }}
                placeholder="1"
                min="1"
                max="99"
              />
            </div>
            <div className={`${styles.genderField} ${styles.ageField}`}>
              <label className={styles.label} htmlFor="age">
                Age
              </label>
              <div
                className={`${styles.valueSmall} ${age ? "hasValue" : ""}`}
                id="age"
              >
                {age || <>&nbsp;</>}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.infoSection}>
          <div className={styles.topRow}>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="email">
                Email address
              </label>
              <input
                id="email"
                className={`${styles.valueHighlight} ${
                  email ? "hasValue" : ""
                }`}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                style={{ borderBottom: "none", boxShadow: "none" }}
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="previousSchool">
                Previous school
              </label>
              <input
                id="previousSchool"
                className={`${styles.valueHighlight} ${
                  previousSchool ? "hasValue" : ""
                }`}
                type="text"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                placeholder="Previous School"
              />
            </div>
          </div>
          <div className={styles.topRow}>
            <div className={`${styles.citizenshipField} ${styles.noBorder}`}>
              <label className={styles.label} htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                className={`${styles.valueHighlight} ${
                  phone ? "hasValue" : ""
                }`}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className={`${styles.academicStatusField} ${styles.noBorder}`}>
              <label className={styles.label} htmlFor="academicStatus">
                Academic status
              </label>
              <div className={styles.academicStatusOptions}>
                <div className={styles.academicStatusOption}>
                  <Select
                    id="academicStatus"
                    options={academicStatusOptions
                      .filter((opt) => opt !== "Other")
                      .map((opt) => ({
                        value: opt,
                        label: opt,
                      }))}
                    placeholder="Select status"
                    value={
                      academicStatus && academicStatus !== "Other"
                        ? { value: academicStatus, label: academicStatus }
                        : null
                    }
                    onChange={(opt) => {
                      setAcademicStatus(opt ? opt.value : "");
                      setAcademicStatusCustom("");
                    }}
                    isClearable
                    styles={{
                      control: (base) => ({
                        ...base,
                        fontWeight:
                          academicStatus && academicStatus !== "Other"
                            ? "bold"
                            : "400",
                        color:
                          academicStatus && academicStatus !== "Other"
                            ? "#000"
                            : "rgba(128,128,128,0.6)",
                        border: "none",
                        boxShadow: "none",
                        borderRadius: 0,
                        borderBottom: "none",
                        background: "transparent",
                      }),
                      singleValue: (base) => ({
                        ...base,
                        fontWeight:
                          academicStatus && academicStatus !== "Other"
                            ? "bold"
                            : "400",
                        color:
                          academicStatus && academicStatus !== "Other"
                            ? "#000"
                            : "rgba(128,128,128,0.6)",
                      }),
                      placeholder: (base) => ({
                        ...base,
                        color: "rgba(128,128,128,0.6)",
                      }),
                    }}
                  />
                </div>
                <div className={styles.academicStatusOption}>
                  <label className={styles.otherLabel}>
                    <input
                      type="radio"
                      name="academicStatusType"
                      value="other"
                      checked={academicStatus === "Other"}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setAcademicStatus("Other");
                        }
                      }}
                      className={styles.hiddenRadio}
                    />
                    <span className={styles.otherText}>Other</span>
                    {academicStatus === "Other" && (
                      <input
                        className={styles.otherInput}
                        type="text"
                        value={academicStatusCustom}
                        onChange={(e) =>
                          setAcademicStatusCustom(e.target.value)
                        }
                        placeholder="Enter academic status"
                      />
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.infoSection}>
          <div className={styles.addressSection}>
            <div className={styles.addressRow}>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor="street">
                  Street
                </label>
                <input
                  id="street"
                  className={`${styles.valueHighlight} ${
                    street ? "hasValue" : ""
                  }`}
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street"
                />
              </div>
              <div className={styles.rtrwGroup}>
                <div className={styles.rtField}>
                  <label className={styles.label} htmlFor="rt">
                    RT
                  </label>
                  <input
                    id="rt"
                    className={`${styles.label} ${rt ? "hasValue" : ""}`}
                    type="text"
                    value={rt}
                    onChange={(e) => setRt(e.target.value)}
                    placeholder="RT"
                  />
                </div>
                <div className={styles.rtField}>
                  <label className={styles.label} htmlFor="rw">
                    RW
                  </label>
                  <input
                    id="rw"
                    className={`${styles.label} ${rw ? "hasValue" : ""}`}
                    type="text"
                    value={rw}
                    onChange={(e) => setRw(e.target.value)}
                    placeholder="RW"
                  />
                </div>
              </div>
            </div>
            <div className={styles.addressRow}>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor="village">
                  Village
                </label>
                <input
                  id="village"
                  className={`${styles.valueHighlight} ${
                    village ? "hasValue" : ""
                  }`}
                  type="text"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Village"
                />
              </div>
              <div className={styles.districtField}>
                <label className={styles.label} htmlFor="district">
                  District
                </label>
                <input
                  id="district"
                  className={`${styles.valueHighlight} ${
                    district ? "hasValue" : ""
                  }`}
                  type="text"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  placeholder="District"
                />
              </div>
            </div>
            <div className={styles.addressRow}>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor="city">
                  City/Regency
                </label>
                <input
                  id="city"
                  className={`${styles.valueHighlight} ${
                    city ? "hasValue" : ""
                  }`}
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="City/Regency"
                />
              </div>
              <div className={styles.genderField}>
                <label className={styles.label} htmlFor="province">
                  Province
                </label>
                <input
                  id="province"
                  className={`${styles.valueHighlight} ${
                    province ? "hasValue" : ""
                  }`}
                  type="text"
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  placeholder="Province"
                />
              </div>
            </div>
            <div className={styles.otherAddressWrapper}>
              <div className={styles.districtField}>
                <label className={styles.valueHighlight} htmlFor="otherAddress">
                  Other
                </label>
                <div className={styles.otherAddressParent}>
                  <span className={styles.bracket}>(</span>
                  <input
                    id="otherAddress"
                    className={`${styles.apartementUnit} ${
                      otherAddress ? "hasValue" : ""
                    }`}
                    type="text"
                    value={otherAddress}
                    onChange={(e) => setOtherAddress(e.target.value)}
                    placeholder="Other address"
                  />
                  <span className={styles.bracket}>)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentInformationSection;
