import React, { useState } from "react";
import styles from "./StudentInformationSection.module.css";

const genderOptions = ["Male", "Female"];
const citizenshipOptions = ["Indonesia", "Other"];
const religionOptions = [
  "Christian Protestant",
  "Christian Catholic",
  "Islam",
  "Hindu",
  "Buddha",
  "Other",
];
const academicStatusOptions = ["Regular", "Other"];

const StudentInformationSection = () => {
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [lastName, setLastName] = useState("");
  const [nickname, setNickname] = useState("");
  const [nisn, setNisn] = useState("");
  const [nkk, setNkk] = useState("");
  const [kitas, setKitas] = useState("");
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
  const [street, setStreet] = useState("");
  const [rt, setRt] = useState("");
  const [rw, setRw] = useState("");
  const [village, setVillage] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [otherAddress, setOtherAddress] = useState("");

  return (
    <div className={styles.container}>
      <div className={styles.sectionHeader}>
        <span className={styles.headerTitle}>STUDENT’S INFORMATION</span>
      </div>
      <div className={styles.contentWrapper}>
        <div className={styles.infoSection}>
          <div className={styles.row}>
            <div className={styles.nameField}>
              <label className={styles.label} htmlFor="firstName">
                First name
              </label>
              <input
                id="firstName"
                className={styles.label}
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>
            <div className={styles.nameField}>
              <label className={styles.label} htmlFor="middleName">
                Middle name
              </label>
              <input
                id="middleName"
                className={styles.label}
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
                className={styles.label}
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
                className={styles.valueHighlight}
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Nickname"
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="nisn">
                Nomor induk siswa nasional
              </label>
              <input
                id="nisn"
                className={styles.label}
                type="text"
                value={nisn}
                onChange={(e) => setNisn(e.target.value)}
                placeholder="NISN"
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="nkk">
                Nomor induk keluarga
              </label>
              <input
                id="nkk"
                className={styles.label}
                type="text"
                value={nkk}
                onChange={(e) => setNkk(e.target.value)}
                placeholder="NIK"
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="kitas">
                KITAS
              </label>
              <input
                id="kitas"
                className={styles.valueHighlight}
                type="text"
                value={kitas}
                onChange={(e) => setKitas(e.target.value)}
                placeholder="KITAS"
              />
            </div>
          </div>
          <div className={styles.row}>
            <div className={styles.genderField}>
              <label className={styles.label} htmlFor="gender">
                Gender
              </label>
              <select
                id="gender"
                className={styles.label}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              >
                <option value="">Select gender</option>
                {genderOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.genderField}>
              <label className={styles.label} htmlFor="age">
                Age
              </label>
              <input
                id="age"
                className={styles.valueSmall}
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div className={styles.genderField}>
              <label className={styles.label} htmlFor="rank">
                Rank in the family
              </label>
              <input
                id="rank"
                className={styles.valueSmall}
                type="number"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
          </div>
          <div className={styles.bottomRow}>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor="citizenship">
                Citizenship
              </label>
              <select
                id="citizenship"
                className={styles.valueHighlight}
                value={citizenship}
                onChange={(e) => setCitizenship(e.target.value)}
              >
                <option value="">Select citizenship</option>
                {citizenshipOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor="religion">
                Religion
              </label>
              <select
                id="religion"
                className={styles.valueHighlight}
                value={religion}
                onChange={(e) => setReligion(e.target.value)}
              >
                <option value="">Select religion</option>
                {religionOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor="placeOfBirth">
                Place of birth
              </label>
              <input
                id="placeOfBirth"
                className={styles.valueHighlight}
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
              <input
                id="dateOfBirth"
                className={styles.valueRegular}
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
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
                className={styles.valueHighlight}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
              />
            </div>
            <div className={styles.nicknameField}>
              <label className={styles.label} htmlFor="previousSchool">
                Previous School
              </label>
              <input
                id="previousSchool"
                className={styles.valueHighlight}
                type="text"
                value={previousSchool}
                onChange={(e) => setPreviousSchool(e.target.value)}
                placeholder="Previous School"
              />
            </div>
          </div>
          <div className={styles.topRow}>
            <div className={styles.citizenshipField}>
              <label className={styles.label} htmlFor="phone">
                Phone number
              </label>
              <input
                id="phone"
                className={styles.valueHighlight}
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number"
              />
            </div>
            <div className={styles.academicStatusField}>
              <label className={styles.label} htmlFor="academicStatus">
                Academic status
              </label>
              <select
                id="academicStatus"
                className={styles.valueRegular}
                value={academicStatus}
                onChange={(e) => setAcademicStatus(e.target.value)}
              >
                <option value="">Select status</option>
                {academicStatusOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
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
                  className={styles.valueHighlight}
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
                    className={styles.label}
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
                    className={styles.label}
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
                  className={styles.valueHighlight}
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
                  className={styles.valueHighlight}
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
                  className={styles.valueHighlight}
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
                  className={styles.valueHighlight}
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
                    className={styles.apartementUnit}
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
