import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../layout/Main";
import PopUpConfirm from "./PopUpConfirm";
import "../styles/RegistrationForm.css";

const RegistrationPage = ({ onBack }) => {
  const navigate = useNavigate();
  // State untuk semua input, radio, checkbox, dsb
  const [form, setForm] = useState({
    status: "",
    studentId: "",
    firstName: "",
    middleName: "",
    surname: "",
    nickname: "",
    gender: "",
    age: "",
    rank: "",
    citizenship: "",
    religion: "",
    placeOfBirth: "",
    dateOfBirth: "",
    email: "",
    previousSchool: "",
    phone: "",
    academicStatus: "",
    street: "",
    rt: "",
    rw: "",
    village: "",
    district: "",
    city: "",
    province: "",
    otherAddress: "",
    section: "",
    grade: "",
    major: "",
    program: "",
    facilities: {
      transportation: "",
      pickupPoint: "",
      transportationPolicy: false,
      residenceHall: "",
      residenceHallPolicy: false,
    },
    parent: {
      father: {
        name: "",
        company: "",
        occupation: "",
        phone: "",
        email: "",
        street: "",
        rt: "",
        rw: "",
        village: "",
        district: "",
        city: "",
        province: "",
        other: "",
      },
      mother: {
        name: "",
        company: "",
        occupation: "",
        phone: "",
        email: "",
        street: "",
        rt: "",
        rw: "",
        village: "",
        district: "",
        city: "",
        province: "",
        other: "",
      },
      guardian: {
        name: "",
        relationship: "",
        phone: "",
        email: "",
        street: "",
        rt: "",
        rw: "",
        village: "",
        district: "",
        city: "",
        province: "",
        other: "",
      },
    },
    tuitionFee: "",
    residenceFee: "",
    financialPolicy: false,
    discount: "",
    discountOther: "",
    officeStatus: "",
    incompleteDocs: "",
    note: "",
    discountWaiver: false,
    discountSpecial: false,
    discountType: "",
    waiverType: "",
    waiverTypeCustom: "",
    specialValue: "",
    discountChoice: "",
  });

  // Tambahkan state untuk data provinsi
  const [provinces, setProvinces] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);


  // Fetch data provinsi saat komponen mount
  useEffect(() => {
    fetch("https://alamat.thecloudalert.com/api/provinsi/get/")
      .then((response) => response.json())
      .then((data) => {
        setProvinces(data.result);
        console.log("Daftar provinsi dari API:", data.result);
      })
      .catch((error) => console.error("Error fetching provinces:", error));
  }, []);

  // Handler umum
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("parent.")) {
      const [, role, field] = name.split(".");
      setForm((prev) => ({
        ...prev,
        parent: {
          ...prev.parent,
          [role]: {
            ...prev.parent[role],
            [field]: value,
          },
        },
      }));
    } else if (name.startsWith("facilities.")) {
      const [, field] = name.split(".");
      setForm((prev) => ({
        ...prev,
        facilities: {
          ...prev.facilities,
          [field]: type === "checkbox" ? checked : value,
        },
      }));
    } else if (type === "checkbox" && name === "program") {
      setForm((prev) => {
        const arr = prev.program.includes(value)
          ? prev.program.filter((v) => v !== value)
          : [...prev.program, value];
        return { ...prev, program: arr };
      });
    } else if (type === "checkbox") {
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };



  // Handler submit
  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    setShowConfirm(false);
    navigate('/print');
  };

  const handleCancelConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <MainLayout>
      <div className="container-fluid">
        <div className="row">
          <div className="col-12 col-lg-24 col-xl-12 mx-auto">
            <form className="inputPageWrapper" onSubmit={handleSubmit}>
              {onBack && (
                <button
                  type="button"
                  className="registration-form-back"
                  onClick={onBack}
                  aria-label="Back"
                >
                  {/* Icon panah kiri, bisa pakai unicode atau svg */}
                  <span
                    style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}
                  >
                    &larr;
                  </span>
                </button>
              )}
              {/* Seluruh konten form dimulai di bawah tombol back */}
              <div className="inputPage">
                {/* STUDENT'S STATUS */}
                <div className="studentStatus">
                  <div className="header1">
                    <b className="registration">STUDENT’S STATUS</b>
                  </div>
                  <div className="content">
                    <div className="top">
                      <label className="custom-radio">
                        <input
                          type="radio"
                          name="status"
                          value="New"
                          checked={form.status === "New"}
                          onChange={handleChange}
                        />
                        <span className="radiomark"></span>
                        <span className="registration">New</span>
                      </label>
                      <label className="custom-radio">
                        <input
                          type="radio"
                          name="status"
                          value="Transferee"
                          checked={form.status === "Transferee"}
                          onChange={handleChange}
                        />
                        <span className="radiomark"></span>
                        <span className="registration">Transferee</span>
                      </label>
                      <label className="custom-radio">
                        <input
                          type="radio"
                          name="status"
                          value="Old"
                          checked={form.status === "Old"}
                          onChange={handleChange}
                        />
                        <span className="radiomark"></span>
                        <span className="registration">Old</span>
                      </label>
                      <div className="studentId">
                        <span className="registration">Student ID</span>
                        <input
                          type="text"
                          name="studentId"
                          className="registration-input"
                          placeholder="S25410001"
                          value={form.studentId}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="bottom">
                      <div className="elementarySchool">
                        <span className="registration">Note: </span>
                        <span className="bySelectingStudentsContainer">
                          By selecting student’s status <b>New</b> or{" "}
                          <b>Transferee</b> will automatically generate a new
                          registration number.
                        </span>
                        <span className="registration">
                          Please keep in mind that this action cannot be{" "}
                          <b>undone</b>.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STUDENT'S INFORMATION */}
                <div className="studentsInformation">
                  <div className="header2">
                    <b className="registration">STUDENT’S INFORMATION</b>
                  </div>
                  <div className="content1">
                    <div className="sec1">
                      <div className="middle">
                        <div className="fullName">
                          <label className="registration">First name</label>
                          <input
                            type="text"
                            name="firstName"
                            className="registration-input"
                            placeholder="JHOANNE"
                            value={form.firstName}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="fullName">
                          <label className="registration">Middle name</label>
                          <input
                            type="text"
                            name="middleName"
                            className="registration-input"
                            placeholder="JENNIE ABIGAIL EUPHORIA"
                            value={form.middleName}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="middle">
                        <div className="nickname">
                          <label className="registration">Surname</label>
                          <input
                            type="text"
                            name="surname"
                            className="registration-input"
                            placeholder="DOE"
                            value={form.surname}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="nickname">
                          <label className="registration">Nickname</label>
                          <input
                            type="text"
                            name="nickname"
                            className="registration-input"
                            placeholder="ANNIE"
                            value={form.nickname}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="middle">
                        <div className="gender">
                          <label className="registration">Gender</label>
                          <select
                            name="gender"
                            className={`registration-input${
                              !form.gender ? " is-placeholder" : ""
                            }`}
                            value={form.gender}
                            onChange={handleChange}
                          >
                            <option value="" disabled hidden>
                              FEMALE
                            </option>
                            <option value="FEMALE">FEMALE</option>
                            <option value="MALE">MALE</option>
                          </select>
                        </div>
                        <div className="gender">
                          <label className="registration">Age</label>
                          <input
                            type="number"
                            name="age"
                            className="registration-input"
                            placeholder="16"
                            value={form.age}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="gender">
                          <label className="registration">
                            Rank in the family
                          </label>
                          <input
                            type="number"
                            name="rank"
                            className="registration-input"
                            placeholder="1"
                            value={form.rank}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="bottom1">
                        <div className="citizenship">
                          <label className="registration">Citizenship</label>
                          <input
                            type="text"
                            name="citizenship"
                            className="registration-input"
                            placeholder="INDONESIA"
                            value={form.citizenship}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="citizenship">
                          <label className="registration">Religion</label>
                          <input
                            type="text"
                            name="religion"
                            className="registration-input"
                            placeholder="CHRISTIAN PROTESTANT"
                            value={form.religion}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="citizenship">
                          <label className="registration">Place of birth</label>
                          <input
                            type="text"
                            name="placeOfBirth"
                            className="registration-input"
                            placeholder="MANADO"
                            value={form.placeOfBirth}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="nickname">
                          <label className="registration">Date of birth</label>
                          <input
                            type="date"
                            name="dateOfBirth"
                            className={`registration-input${
                              !form.dateOfBirth ? " is-placeholder" : ""
                            }`}
                            placeholder="12 MARCH 2012"
                            value={form.dateOfBirth}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="sec1">
                      <div className="top2">
                        <div className="nickname">
                          <label className="registration">Email address</label>
                          <input
                            type="email"
                            name="email"
                            className="registration-input"
                            placeholder="JHOANNE@GMAIL.COM"
                            value={form.email}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="nickname">
                          <label className="registration">
                            Previous School
                          </label>
                          <input
                            type="text"
                            name="previousSchool"
                            className="registration-input"
                            placeholder="SMPN 1 BITUNG"
                            value={form.previousSchool}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="top2">
                        <div className="citizenship">
                          <label className="registration">Phone number</label>
                          <input
                            type="text"
                            name="phone"
                            className="registration-input"
                            placeholder="089281560956"
                            value={form.phone}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="acStatus">
                          <label className="registration">
                            Academic status
                          </label>
                          <select
                            name="academicStatus"
                            className={`registration-input${
                              !form.academicStatus ? " is-placeholder" : ""
                            }`}
                            value={form.academicStatus}
                            onChange={handleChange}
                          >
                            <option value="" disabled hidden>
                              REGULAR
                            </option>
                            <option value="REGULAR">REGULAR</option>
                            <option value="SPECIAL">SPECIAL</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="sec1">
                      <div className="address">
                        {/* Address section for desktop (md+) */}
                        <div className="address d-none d-md-block">
                          <div className="row g-2">
                            <div className="col-md-6">
                              <div className="mb-2">
                                <label className="registration">Street</label>
                                <input
                                  type="text"
                                  name="street"
                                  className="registration-input"
                                  placeholder="JL. SARUNDAJANG 01"
                                  value={form.street}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">Village</label>
                                <input
                                  type="text"
                                  name="village"
                                  className="registration-input"
                                  placeholder="GIRIAN"
                                  value={form.village}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <label className="registration">RT</label>
                                <input
                                  type="text"
                                  name="rt"
                                  className="registration-input"
                                  placeholder="001"
                                  value={form.rt}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">District</label>
                                <input
                                  type="text"
                                  name="district"
                                  className="registration-input"
                                  placeholder="RANOWULU"
                                  value={form.district}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="col-md-3">
                              <div className="mb-2">
                                <label className="registration">RW</label>
                                <input
                                  type="text"
                                  name="rw"
                                  className="registration-input"
                                  placeholder="002"
                                  value={form.rw}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">Province</label>
                                <select
                                  name="province"
                                  className="registration-input"
                                  value={form.province}
                                  onChange={handleChange}
                                >
                                  <option value="">Pilih Provinsi</option>
                                  {(Array.isArray(provinces)
                                    ? provinces
                                    : []
                                  ).map((prov) => (
                                    <option key={prov.id} value={prov.text}>
                                      {prov.text}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                          <div className="row g-2 mt-2">
                            <div className="col-md-6">
                              <label className="registration">
                                City/Regency
                              </label>
                              <input
                                type="text"
                                name="city"
                                className="registration-input"
                                placeholder="KOTAMOBAGU"
                                value={form.city}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="col-md-6">
                              <label className="registration">Other</label>
                              <input
                                type="text"
                                name="otherAddress"
                                className="registration-input"
                                placeholder="DAHLIA APARTEMENT UNIT 5023"
                                value={form.otherAddress}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                        </div>
                        {/* Address section for mobile/tablet (smaller screens) */}
                        <div className="address d-block d-md-none">
                          <div className="row g-2">
                            {/* LEFT COLUMN */}
                            <div className="col-12 col-sm-6">
                              <div className="mb-2">
                                <label className="registration">Street</label>
                                <input
                                  type="text"
                                  name="street"
                                  className="registration-input"
                                  placeholder="JL. SARUNDAJANG 01"
                                  value={form.street}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">Village</label>
                                <input
                                  type="text"
                                  name="village"
                                  className="registration-input"
                                  placeholder="GIRIAN"
                                  value={form.village}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">
                                  City/Regency
                                </label>
                                <input
                                  type="text"
                                  name="city"
                                  className="registration-input"
                                  placeholder="KOTAMOBAGU"
                                  value={form.city}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">Other</label>
                                <input
                                  type="text"
                                  name="otherAddress"
                                  className="registration-input"
                                  placeholder="DAHLIA APARTEMENT UNIT 5023"
                                  value={form.otherAddress}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            {/* RIGHT COLUMN */}
                            <div className="col-12 col-sm-6">
                              <div className="row g-2 mb-2">
                                <div className="col-6">
                                  <label className="registration">RT</label>
                                  <input
                                    type="text"
                                    name="rt"
                                    className="registration-input"
                                    placeholder="001"
                                    value={form.rt}
                                    onChange={handleChange}
                                  />
                                </div>
                                <div className="col-6">
                                  <label className="registration">RW</label>
                                  <input
                                    type="text"
                                    name="rw"
                                    className="registration-input"
                                    placeholder="002"
                                    value={form.rw}
                                    onChange={handleChange}
                                  />
                                </div>
                              </div>
                              <div className="mb-2">
                                <label className="registration">District</label>
                                <input
                                  type="text"
                                  name="district"
                                  className="registration-input"
                                  placeholder="RANOWULU"
                                  value={form.district}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="mb-2">
                                <label className="registration">Province</label>
                                <select
                                  name="province"
                                  className="registration-input"
                                  value={form.province}
                                  onChange={handleChange}
                                >
                                  <option value="">Pilih Provinsi</option>
                                  {(Array.isArray(provinces)
                                    ? provinces
                                    : []
                                  ).map((prov) => (
                                    <option key={prov.id} value={prov.text}>
                                      {prov.text}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* PROGRAM */}
                <div className="studentsInformation">
                  <div className="header2">
                    <b className="registration">PROGRAM</b>
                  </div>
                  <div className="termOfPayment">
                    <div className="row g-3 align-items-center">
                      {/* Section Row */}
                      <div className="col-12">
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                          <span className="registration font-poppins-semibold">
                            Section
                          </span>
                          <div className="d-flex flex-column flex-sm-row gap-3 flex-wrap">
                            <label className="custom-radio">
                              <input
                                type="radio"
                                name="section"
                                value="ECP"
                                checked={form.section === "ECP"}
                                onChange={handleChange}
                              />
                              <span className="radiomark"></span>
                              <span className="registration">ECP</span>
                            </label>
                            <label className="custom-radio">
                              <input
                                type="radio"
                                name="section"
                                value="Elementary school"
                                checked={form.section === "Elementary school"}
                                onChange={handleChange}
                              />
                              <span className="radiomark"></span>
                              <span className="registration">
                                Elementary school
                              </span>
                            </label>
                            <label className="custom-radio">
                              <input
                                type="radio"
                                name="section"
                                value="Middle School"
                                checked={form.section === "Middle School"}
                                onChange={handleChange}
                              />
                              <span className="radiomark"></span>
                              <span className="registration">
                                Middle School
                              </span>
                            </label>
                            <label className="custom-radio">
                              <input
                                type="radio"
                                name="section"
                                value="High School"
                                checked={form.section === "High School"}
                                onChange={handleChange}
                              />
                              <span className="radiomark"></span>
                              <span className="registration">High School</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Grade and Major Row */}
                      <div className="col-12">
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                          <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3">
                            <div className="d-flex align-items-center gap-2">
                              <span className="registration font-poppins-semibold">
                                Grade
                              </span>
                              <input
                                type="text"
                                name="grade"
                                className="registration-input"
                                placeholder="11"
                                value={form.grade}
                                onChange={handleChange}
                                style={{ minWidth: "60px", maxWidth: "100px" }}
                              />
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <span className="registration font-poppins-semibold">
                                Major
                              </span>
                              <input
                                type="text"
                                name="major"
                                className="registration-input"
                                placeholder="SCIENCE"
                                value={form.major}
                                onChange={handleChange}
                                style={{
                                  minWidth: "60px",
                                  maxWidth: "100px",
                                  border: "none",
                                  borderBottom: "2px solid #000",
                                  fontWeight: "bold",
                                  textTransform: "uppercase",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Program Row */}
                      <div className="col-12">
                        <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center gap-3">
                          <span className="registration font-poppins-semibold">
                            Program
                          </span>
                          <div className="d-flex flex-column flex-sm-row gap-3 flex-wrap">
                            {["UAN", "A Beka", "Oxford", "Cambridge"].map(
                              (option) => (
                                <label
                                  className="custom-radio program-radio"
                                  key={option}
                                >
                                  <input
                                    type="radio"
                                    name="program"
                                    value={option}
                                    checked={form.program === option}
                                    onChange={handleChange}
                                  />
                                  <span className="radiomark"></span>
                                  <span className="registration">{option}</span>
                                </label>
                              )
                            )}
                            <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                              <label className="custom-radio program-radio">
                                <input
                                  type="radio"
                                  name="program"
                                  value="Others"
                                  checked={form.program === "Others"}
                                  onChange={handleChange}
                                />
                                <span className="radiomark"></span>
                                <span className="registration">Others</span>
                              </label>
                              <input
                                type="text"
                                name="discountOther"
                                className="registration-input program-others-input"
                                placeholder="LOREM IPSUM"
                                value={form.discountOther}
                                onChange={handleChange}
                                style={{
                                  minWidth: "120px",
                                  border: "none",
                                  borderBottom: "2px solid #000",
                                  fontWeight: "bold",
                                  color:
                                    form.program === "Others"
                                      ? undefined
                                      : "#ccc",
                                  opacity: form.program === "Others" ? 1 : 0.5,
                                }}
                                disabled={form.program !== "Others"}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* FACILITIES */}
                <div className="studentsInformation">
                  <div className="header2">
                    <b className="registration">FACILITIES</b>
                  </div>
                  <div className="termOfPayment">
                    {/* Transportation Section */}
                    <div className="mb-4">
                      <div className="font-poppins-semibold mb-3">
                        <div className="transportation">Transportation</div>
                      </div>
                      <div className="d-flex flex-column flex-md-row gap-3 flex-wrap">
                        <label className="custom-radio d-flex align-items-center">
                          <input
                            type="radio"
                            name="facilities.transportation"
                            value="Own car"
                            checked={
                              form.facilities.transportation === "Own car"
                            }
                            onChange={handleChange}
                          />
                          <span className="radiomark"></span>
                          <span className="registration ms-2">Own car</span>
                        </label>
                        <label className="custom-radio d-flex align-items-center">
                          <input
                            type="radio"
                            name="facilities.transportation"
                            value="School bus"
                            checked={
                              form.facilities.transportation === "School bus"
                            }
                            onChange={handleChange}
                          />
                          <span className="radiomark"></span>
                          <span className="registration ms-2">School bus</span>
                        </label>
                        <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                          <span className="registration">Pickup point</span>
                          <input
                            type="text"
                            name="facilities.pickupPoint"
                            className="registration-input"
                            placeholder="GIRIAN"
                            value={form.facilities.pickupPoint}
                            onChange={handleChange}
                            style={{ minWidth: "120px", maxWidth: "200px" }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Transportation Policy */}
                    <div className="mb-4">
                      <label className="custom-checkbox d-flex align-items-center">
                        <input
                          type="checkbox"
                          name="facilities.transportationPolicy"
                          checked={form.facilities.transportationPolicy}
                          onChange={handleChange}
                        />
                        <span className="checkmark"></span>
                        <span className="registration ms-2">
                          Transportation policy
                        </span>
                      </label>
                    </div>

                    {/* Residence Hall Section */}
                    <div className="mb-4">
                      <div className="font-poppins-semibold mb-3">
                        <div className="residenceHall">Residence Hall</div>
                      </div>
                      <div className="d-flex flex-column flex-md-row gap-3 flex-wrap">
                        <label className="custom-radio d-flex align-items-center">
                          <input
                            type="radio"
                            name="facilities.residenceHall"
                            value="Non-Residence hall"
                            checked={
                              form.facilities.residenceHall ===
                              "Non-Residence hall"
                            }
                            onChange={handleChange}
                          />
                          <span className="radiomark"></span>
                          <span className="registration ms-2">
                            Non-Residence hall
                          </span>
                        </label>
                        <label className="custom-radio d-flex align-items-center">
                          <input
                            type="radio"
                            name="facilities.residenceHall"
                            value="Boy's dormitory"
                            checked={
                              form.facilities.residenceHall ===
                              "Boy's dormitory"
                            }
                            onChange={handleChange}
                          />
                          <span className="radiomark"></span>
                          <span className="registration ms-2">
                            Boys dormitory
                          </span>
                        </label>
                        <label className="custom-radio d-flex align-items-center">
                          <input
                            type="radio"
                            name="facilities.residenceHall"
                            value="Girl's dormitory"
                            checked={
                              form.facilities.residenceHall ===
                              "Girl's dormitory"
                            }
                            onChange={handleChange}
                          />
                          <span className="radiomark"></span>
                          <span className="registration ms-2">
                            Girls dormitory
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Residence Hall Policy */}
                    <div>
                      <label className="custom-checkbox d-flex align-items-center">
                        <input
                          type="checkbox"
                          name="facilities.residenceHallPolicy"
                          checked={form.facilities.residenceHallPolicy}
                          onChange={handleChange}
                        />
                        <span className="checkmark"></span>
                        <span className="registration ms-2">
                          Residence Hall policy
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* PARENT / GUARDIAN INFORMATION */}
                <div className="studentsInformation">
                  <div className="header2">
                    <b className="registration">
                      PARENT / GUARDIAN INFORMATION
                    </b>
                  </div>
                  <div className="content4">
                    <div className="parent1">
                      <div className="father">
                        <div className="txtFather">
                          <div className="transportation">
                            Father’s Information
                          </div>
                        </div>
                        <div className="fatherInfo">
                          <div className="fourth">
                            <div className="name">
                              <div className="registration">Name </div>
                              <input
                                type="text"
                                name="parent.father.name"
                                className="registration-input"
                                placeholder="JOHN DOE"
                                value={form.parent.father.name}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="first">
                            <div className="name">
                              <div className="registration">Company name</div>
                              <input
                                type="text"
                                name="parent.father.company"
                                className="registration-input"
                                placeholder="PT. MULTI RAKYAT"
                                value={form.parent.father.company}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="name">
                              <div className="registration">
                                Occupation / Position
                              </div>
                              <input
                                type="text"
                                name="parent.father.occupation"
                                className="registration-input"
                                placeholder="FIELD MANAGER"
                                value={form.parent.father.occupation}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="first">
                            <div className="name">
                              <div className="registration">Phone number</div>
                              <input
                                type="text"
                                name="parent.father.phone"
                                className="registration-input"
                                placeholder="089281560955"
                                value={form.parent.father.phone}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="name">
                              <div className="registration">Email</div>
                              <input
                                type="email"
                                name="parent.father.email"
                                className="registration-input"
                                placeholder="JOHNDOEHEBAT@GMAIL.COM"
                                value={form.parent.father.email}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div className="fourth1">
                            <div className="address">
                              {/* Father's Address section for desktop (md+) */}
                              <div className="address d-none d-md-block">
                                <div className="row g-2">
                                  <div className="col-md-6">
                                    <div className="mb-2">
                                      <label className="registration">
                                        Street
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.street"
                                        className="registration-input"
                                        placeholder="JL. SARUNDAJANG 01"
                                        value={form.parent.father.street}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Village
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.village"
                                        className="registration-input"
                                        placeholder="GIRIAN"
                                        value={form.parent.father.village}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="mb-2">
                                      <label className="registration">RT</label>
                                      <input
                                        type="text"
                                        name="parent.father.rt"
                                        className="registration-input"
                                        placeholder="001"
                                        value={form.parent.father.rt}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        District
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.district"
                                        className="registration-input"
                                        placeholder="RANOWULU"
                                        value={form.parent.father.district}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="mb-2">
                                      <label className="registration">RW</label>
                                      <input
                                        type="text"
                                        name="parent.father.rw"
                                        className="registration-input"
                                        placeholder="002"
                                        value={form.parent.father.rw}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Province
                                      </label>
                                      <select
                                        name="parent.father.province"
                                        className="registration-input"
                                        value={form.parent.father.province}
                                        onChange={handleChange}
                                      >
                                        <option value="">Pilih Provinsi</option>
                                        {(Array.isArray(provinces)
                                          ? provinces
                                          : []
                                        ).map((prov) => (
                                          <option
                                            key={prov.id}
                                            value={prov.text}
                                          >
                                            {prov.text}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="row g-2 mt-2">
                                  <div className="col-md-6">
                                    <label className="registration">
                                      City/Regency
                                    </label>
                                    <input
                                      type="text"
                                      name="parent.father.city"
                                      className="registration-input"
                                      placeholder="KOTAMOBAGU"
                                      value={form.parent.father.city}
                                      onChange={handleChange}
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="registration">
                                      Other
                                    </label>
                                    <input
                                      type="text"
                                      name="parent.father.other"
                                      className="registration-input"
                                      placeholder="DAHLIA APARTEMENT UNIT 5023"
                                      value={form.parent.father.other}
                                      onChange={handleChange}
                                    />
                                  </div>
                                </div>
                              </div>
                              {/* Father's Address section for mobile/tablet (smaller screens) */}
                              <div className="address d-block d-md-none">
                                <div className="row g-2">
                                  {/* LEFT COLUMN */}
                                  <div className="col-12 col-sm-6">
                                    <div className="mb-2">
                                      <label className="registration">
                                        Street
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.street"
                                        className="registration-input"
                                        placeholder="JL. SARUNDAJANG 01"
                                        value={form.parent.father.street}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Village
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.village"
                                        className="registration-input"
                                        placeholder="GIRIAN"
                                        value={form.parent.father.village}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        City/Regency
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.city"
                                        className="registration-input"
                                        placeholder="KOTAMOBAGU"
                                        value={form.parent.father.city}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Other
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.other"
                                        className="registration-input"
                                        placeholder="DAHLIA APARTEMENT UNIT 5023"
                                        value={form.parent.father.other}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                  {/* RIGHT COLUMN */}
                                  <div className="col-12 col-sm-6">
                                    <div className="row g-2 mb-2">
                                      <div className="col-6">
                                        <label className="registration">
                                          RT
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.father.rt"
                                          className="registration-input"
                                          placeholder="001"
                                          value={form.parent.father.rt}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="col-6">
                                        <label className="registration">
                                          RW
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.father.rw"
                                          className="registration-input"
                                          placeholder="002"
                                          value={form.parent.father.rw}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        District
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.father.district"
                                        className="registration-input"
                                        placeholder="RANOWULU"
                                        value={form.parent.father.district}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Province
                                      </label>
                                      <select
                                        name="parent.father.province"
                                        className="registration-input"
                                        value={form.parent.father.province}
                                        onChange={handleChange}
                                      >
                                        <option value="">Pilih Provinsi</option>
                                        {(Array.isArray(provinces)
                                          ? provinces
                                          : []
                                        ).map((prov) => (
                                          <option
                                            key={prov.id}
                                            value={prov.text}
                                          >
                                            {prov.text}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="father">
                          <div className="txtFather">
                            <div className="transportation">
                              Mother’s Information
                            </div>
                          </div>
                          <div className="fatherInfo">
                            <div className="fourth">
                              <div className="name">
                                <div className="registration">Name </div>
                                <input
                                  type="text"
                                  name="parent.mother.name"
                                  className="registration-input"
                                  placeholder="JOHN DOE"
                                  value={form.parent.mother.name}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="first">
                              <div className="name">
                                <div className="registration">Company name</div>
                                <input
                                  type="text"
                                  name="parent.mother.company"
                                  className="registration-input"
                                  placeholder="PT. MULTI RAKYAT"
                                  value={form.parent.mother.company}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="name">
                                <div className="registration">
                                  Occupation / Position
                                </div>
                                <input
                                  type="text"
                                  name="parent.mother.occupation"
                                  className="registration-input"
                                  placeholder="FIELD MANAGER"
                                  value={form.parent.mother.occupation}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="first">
                              <div className="name">
                                <div className="registration">Phone number</div>
                                <input
                                  type="text"
                                  name="parent.mother.phone"
                                  className="registration-input"
                                  placeholder="089281560955"
                                  value={form.parent.mother.phone}
                                  onChange={handleChange}
                                />
                              </div>
                              <div className="name">
                                <div className="registration">Email</div>
                                <input
                                  type="email"
                                  name="parent.mother.email"
                                  className="registration-input"
                                  placeholder="JOHNDOEHEBAT@GMAIL.COM"
                                  value={form.parent.mother.email}
                                  onChange={handleChange}
                                />
                              </div>
                            </div>
                            <div className="fourth1">
                              <div className="address">
                                {/* Mother's Address section for desktop (md+) */}
                                <div className="address d-none d-md-block">
                                  <div className="row g-2">
                                    <div className="col-md-6">
                                      <div className="mb-2">
                                        <label className="registration">
                                          Street
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.street"
                                          className="registration-input"
                                          placeholder="JL. SARUNDAJANG 01"
                                          value={form.parent.mother.street}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          Village
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.village"
                                          className="registration-input"
                                          placeholder="GIRIAN"
                                          value={form.parent.mother.village}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="mb-2">
                                        <label className="registration">
                                          RT
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.rt"
                                          className="registration-input"
                                          placeholder="001"
                                          value={form.parent.mother.rt}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          District
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.district"
                                          className="registration-input"
                                          placeholder="RANOWULU"
                                          value={form.parent.mother.district}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    <div className="col-md-3">
                                      <div className="mb-2">
                                        <label className="registration">
                                          RW
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.rw"
                                          className="registration-input"
                                          placeholder="002"
                                          value={form.parent.mother.rw}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          Province
                                        </label>
                                        <select
                                          name="parent.mother.province"
                                          className="registration-input"
                                          value={form.parent.mother.province}
                                          onChange={handleChange}
                                        >
                                          <option value="">
                                            Pilih Provinsi
                                          </option>
                                          {(Array.isArray(provinces)
                                            ? provinces
                                            : []
                                          ).map((prov) => (
                                            <option
                                              key={prov.id}
                                              value={prov.text}
                                            >
                                              {prov.text}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="row g-2 mt-2">
                                    <div className="col-md-6">
                                      <label className="registration">
                                        City/Regency
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.mother.city"
                                        className="registration-input"
                                        placeholder="KOTAMOBAGU"
                                        value={form.parent.mother.city}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="col-md-6">
                                      <label className="registration">
                                        Other
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.mother.other"
                                        className="registration-input"
                                        placeholder="DAHLIA APARTEMENT UNIT 5023"
                                        value={form.parent.mother.other}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                </div>
                                {/* Mother's Address section for mobile/tablet (smaller screens) */}
                                <div className="address d-block d-md-none">
                                  <div className="row g-2">
                                    {/* LEFT COLUMN */}
                                    <div className="col-12 col-sm-6">
                                      <div className="mb-2">
                                        <label className="registration">
                                          Street
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.street"
                                          className="registration-input"
                                          placeholder="JL. SARUNDAJANG 01"
                                          value={form.parent.mother.street}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          Village
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.village"
                                          className="registration-input"
                                          placeholder="GIRIAN"
                                          value={form.parent.mother.village}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          City/Regency
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.city"
                                          className="registration-input"
                                          placeholder="KOTAMOBAGU"
                                          value={form.parent.mother.city}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          Other
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.other"
                                          className="registration-input"
                                          placeholder="DAHLIA APARTEMENT UNIT 5023"
                                          value={form.parent.mother.other}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    {/* RIGHT COLUMN */}
                                    <div className="col-12 col-sm-6">
                                      <div className="row g-2 mb-2">
                                        <div className="col-6">
                                          <label className="registration">
                                            RT
                                          </label>
                                          <input
                                            type="text"
                                            name="parent.mother.rt"
                                            className="registration-input"
                                            placeholder="001"
                                            value={form.parent.mother.rt}
                                            onChange={handleChange}
                                          />
                                        </div>
                                        <div className="col-6">
                                          <label className="registration">
                                            RW
                                          </label>
                                          <input
                                            type="text"
                                            name="parent.mother.rw"
                                            className="registration-input"
                                            placeholder="002"
                                            value={form.parent.mother.rw}
                                            onChange={handleChange}
                                          />
                                        </div>
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          District
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.mother.district"
                                          className="registration-input"
                                          placeholder="RANOWULU"
                                          value={form.parent.mother.district}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="mb-2">
                                        <label className="registration">
                                          Province
                                        </label>
                                        <select
                                          name="parent.mother.province"
                                          className="registration-input"
                                          value={form.parent.mother.province}
                                          onChange={handleChange}
                                        >
                                          <option value="">
                                            Pilih Provinsi
                                          </option>
                                          {(Array.isArray(provinces)
                                            ? provinces
                                            : []
                                          ).map((prov) => (
                                            <option
                                              key={prov.id}
                                              value={prov.text}
                                            >
                                              {prov.text}
                                            </option>
                                          ))}
                                        </select>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="father">
                        <div className="txtFather">
                          <div className="transportation">
                            Authorized Guardian’s Information
                          </div>
                        </div>
                        <div className="guardianInfo">
                          <div className="left1">
                            <div className="relation">
                              <div className="registration">Name </div>
                              <input
                                type="text"
                                name="parent.guardian.name"
                                className="registration-input"
                                placeholder="JOHN DOE"
                                value={form.parent.guardian.name}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="relation">
                              <div className="registration">
                                Relationship to student
                              </div>
                              <input
                                type="text"
                                name="parent.guardian.relationship"
                                className="registration-input"
                                placeholder="UNCLE"
                                value={form.parent.guardian.relationship}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="relation">
                              <div className="registration">Phone number</div>
                              <input
                                type="text"
                                name="parent.guardian.phone"
                                className="registration-input"
                                placeholder="082176543890"
                                value={form.parent.guardian.phone}
                                onChange={handleChange}
                              />
                            </div>
                            <div className="relation">
                              <div className="registration">Email</div>
                              <input
                                type="email"
                                name="parent.guardian.email"
                                className="registration-input"
                                placeholder="JOHNDOE@GMAIL.COM"
                                value={form.parent.guardian.email}
                                onChange={handleChange}
                              />
                            </div>
                          </div>
                          <div
                            className="fourth1"
                            style={{ marginTop: "50px" }}
                          >
                            <div className="address">
                              {/* Guardian's Address section for desktop (md+) */}
                              <div className="address d-none d-md-block">
                                <div className="row g-2">
                                  <div className="col-md-6">
                                    <div className="mb-2">
                                      <label className="registration">
                                        Street
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.street"
                                        className="registration-input"
                                        placeholder="JL. SARUNDAJANG 01"
                                        value={form.parent.guardian.street}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Village
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.village"
                                        className="registration-input"
                                        placeholder="GIRIAN"
                                        value={form.parent.guardian.village}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="mb-2">
                                      <label className="registration">RT</label>
                                      <input
                                        type="text"
                                        name="parent.guardian.rt"
                                        className="registration-input"
                                        placeholder="001"
                                        value={form.parent.guardian.rt}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        District
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.district"
                                        className="registration-input"
                                        placeholder="RANOWULU"
                                        value={form.parent.guardian.district}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                  <div className="col-md-3">
                                    <div className="mb-2">
                                      <label className="registration">RW</label>
                                      <input
                                        type="text"
                                        name="parent.guardian.rw"
                                        className="registration-input"
                                        placeholder="002"
                                        value={form.parent.guardian.rw}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Province
                                      </label>
                                      <select
                                        name="parent.guardian.province"
                                        className="registration-input"
                                        value={form.parent.guardian.province}
                                        onChange={handleChange}
                                      >
                                        <option value="">Pilih Provinsi</option>
                                        {(Array.isArray(provinces)
                                          ? provinces
                                          : []
                                        ).map((prov) => (
                                          <option
                                            key={prov.id}
                                            value={prov.text}
                                          >
                                            {prov.text}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                                <div className="row g-2 mt-2">
                                  <div className="col-md-6">
                                    <label className="registration">
                                      City/Regency
                                    </label>
                                    <input
                                      type="text"
                                      name="parent.guardian.city"
                                      className="registration-input"
                                      placeholder="KOTAMOBAGU"
                                      value={form.parent.guardian.city}
                                      onChange={handleChange}
                                    />
                                  </div>
                                  <div className="col-md-6">
                                    <label className="registration">
                                      Other
                                    </label>
                                    <input
                                      type="text"
                                      name="parent.guardian.other"
                                      className="registration-input"
                                      placeholder="DAHLIA APARTEMENT UNIT 5023"
                                      value={form.parent.guardian.other}
                                      onChange={handleChange}
                                    />
                                  </div>
                                </div>
                              </div>
                              {/* Guardian's Address section for mobile/tablet (smaller screens) */}
                              <div className="address d-block d-md-none">
                                <div className="row g-2">
                                  {/* LEFT COLUMN */}
                                  <div className="col-12 col-sm-6">
                                    <div className="mb-2">
                                      <label className="registration">
                                        Street
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.street"
                                        className="registration-input"
                                        placeholder="JL. SARUNDAJANG 01"
                                        value={form.parent.guardian.street}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Village
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.village"
                                        className="registration-input"
                                        placeholder="GIRIAN"
                                        value={form.parent.guardian.village}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        City/Regency
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.city"
                                        className="registration-input"
                                        placeholder="KOTAMOBAGU"
                                        value={form.parent.guardian.city}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Other
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.other"
                                        className="registration-input"
                                        placeholder="DAHLIA APARTEMENT UNIT 5023"
                                        value={form.parent.guardian.other}
                                        onChange={handleChange}
                                      />
                                    </div>
                                  </div>
                                  {/* RIGHT COLUMN */}
                                  <div className="col-12 col-sm-6">
                                    <div className="row g-2 mb-2">
                                      <div className="col-6">
                                        <label className="registration">
                                          RT
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.guardian.rt"
                                          className="registration-input"
                                          placeholder="001"
                                          value={form.parent.guardian.rt}
                                          onChange={handleChange}
                                        />
                                      </div>
                                      <div className="col-6">
                                        <label className="registration">
                                          RW
                                        </label>
                                        <input
                                          type="text"
                                          name="parent.guardian.rw"
                                          className="registration-input"
                                          placeholder="002"
                                          value={form.parent.guardian.rw}
                                          onChange={handleChange}
                                        />
                                      </div>
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        District
                                      </label>
                                      <input
                                        type="text"
                                        name="parent.guardian.district"
                                        className="registration-input"
                                        placeholder="RANOWULU"
                                        value={form.parent.guardian.district}
                                        onChange={handleChange}
                                      />
                                    </div>
                                    <div className="mb-2">
                                      <label className="registration">
                                        Province
                                      </label>
                                      <select
                                        name="parent.guardian.province"
                                        className="registration-input"
                                        value={form.parent.guardian.province}
                                        onChange={handleChange}
                                      >
                                        <option value="">Pilih Provinsi</option>
                                        {(Array.isArray(provinces)
                                          ? provinces
                                          : []
                                        ).map((prov) => (
                                          <option
                                            key={prov.id}
                                            value={prov.text}
                                          >
                                            {prov.text}
                                          </option>
                                        ))}
                                      </select>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* TERM OF PAYMENT */}
                <div className="termOfPayment">
                  <div className="header6">
                    <b className="registration">TERM OF PAYMENT</b>
                  </div>

                  {/* Main Payment Options */}
                  <div className="row g-4 mb-4">
                    {/* Tuition Fee */}
                    <div className="col-12 col-md-4">
                      <div className="payment-col h-100">
                        <div className="font-poppins-semibold mb-3">
                          Tuition Fee
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <label className="custom-radio d-flex align-items-center">
                            <input
                              type="radio"
                              name="tuitionFee"
                              value="Full payment"
                              checked={form.tuitionFee === "Full payment"}
                              onChange={handleChange}
                            />
                            <span className="radiomark"></span>
                            <span className="registration ms-2">
                              Full payment
                            </span>
                          </label>
                          <label className="custom-radio d-flex align-items-center">
                            <input
                              type="radio"
                              name="tuitionFee"
                              value="Installment"
                              checked={form.tuitionFee === "Installment"}
                              onChange={handleChange}
                            />
                            <span className="radiomark"></span>
                            <span className="registration ms-2">
                              Installment
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Residence Hall */}
                    <div className="col-12 col-md-4">
                      <div className="payment-col h-100">
                        <div className="font-poppins-semibold mb-3">
                          Residence Hall
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <label className="custom-radio d-flex align-items-center">
                            <input
                              type="radio"
                              name="residenceFee"
                              value="Full payment"
                              checked={form.residenceFee === "Full payment"}
                              onChange={handleChange}
                            />
                            <span className="radiomark"></span>
                            <span className="registration ms-2">
                              Full payment
                            </span>
                          </label>
                          <label className="custom-radio d-flex align-items-center">
                            <input
                              type="radio"
                              name="residenceFee"
                              value="Installment"
                              checked={form.residenceFee === "Installment"}
                              onChange={handleChange}
                            />
                            <span className="radiomark"></span>
                            <span className="registration ms-2">
                              Installment
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Financial Policy */}
                    <div className="col-12 col-md-4">
                      <div className="payment-col h-100">
                        <div className="font-poppins-semibold mb-3">
                          Financial Policy & Contract
                        </div>
                        <div className="d-flex flex-column gap-2">
                          <label className="custom-checkbox d-flex align-items-center">
                            <input
                              type="checkbox"
                              name="financialPolicy"
                              checked={form.financialPolicy}
                              onChange={handleChange}
                            />
                            <span className="checkmark"></span>
                            <span className="registration ms-2">Agree</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Discount Section - Full Width */}
                  <div className="row">
                    <div className="col-12">
                      <div className="discount-row">
                        <div className="font-poppins-semibold mb-3">
                          Discount
                        </div>
                        <div className="d-flex flex-column flex-md-row gap-3 align-items-start">
                          {/* Waiver Option */}
                          <div className="discount-option">
                            <label className="custom-radio fw-bold d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                              <div className="d-flex align-items-center">
                                <input
                                  type="radio"
                                  name="discountChoice"
                                  value="waiver"
                                  checked={form.discountChoice === "waiver"}
                                  onChange={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      discountChoice: "waiver",
                                    }))
                                  }
                                />
                                <span className="radiomark"></span>
                              </div>
                              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                                <select
                                  name="waiverType"
                                  className="registration-input"
                                  value={form.waiverType}
                                  onChange={handleChange}
                                  style={{
                                    minWidth: "120px",
                                    maxWidth: "200px",
                                    border: "none",
                                    borderBottom: "2px solid #000",
                                    fontWeight: "bold",
                                  }}
                                  disabled={form.discountChoice !== "waiver"}
                                >
                                  <option value="">Pilih Waiver</option>
                                  <option value="Waiver 1">Waiver 1</option>
                                  <option value="Waiver 2">Waiver 2</option>
                                  <option value="Dan Lain-lain">
                                    Dan Lain-lain
                                  </option>
                                </select>
                              </div>
                            </label>
                          </div>

                          {/* Special Option */}
                          <div className="discount-option">
                            <label className="custom-radio fw-bold d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                              <div className="d-flex align-items-center">
                                <input
                                  type="radio"
                                  name="discountChoice"
                                  value="special"
                                  checked={form.discountChoice === "special"}
                                  onChange={() =>
                                    setForm((prev) => ({
                                      ...prev,
                                      discountChoice: "special",
                                    }))
                                  }
                                />
                                <span className="radiomark"></span>
                              </div>
                              <div className="d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-2">
                                <span className="registration fw-bold">
                                  Other
                                </span>
                                <input
                                  type="text"
                                  name="specialValue"
                                  className="registration-input special-input fw-bold"
                                  value={form.specialValue}
                                  onChange={handleChange}
                                  placeholder="SPECIAL"
                                  style={{
                                    minWidth: "120px",
                                    maxWidth: "200px",
                                    border: "none",
                                    borderBottom: "2px solid #000",
                                    fontWeight: "bold",
                                    textTransform: "uppercase",
                                  }}
                                  disabled={form.discountChoice !== "special"}
                                />
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* DATA FOR OFFICE USE ONLY */}
                <div className="otherDetail">
                  <div className="officeUseNote">
                    <div className="header2">
                      <b className="registration">DATA FOR OFFICE USE ONLY</b>
                    </div>
                    <div className="content6">
                      <div className="row g-3">
                        {/* Student Requirement Status */}
                        <div className="col-12">
                          <div className="row g-3 align-items-center">
                            <div className="col-12 col-sm-5 col-md-4 col-lg-3">
                              <div className="txtFather">
                                <div className="transportation text-break">
                                  Student Requirement Status:
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-sm-7 col-md-8 col-lg-9">
                              <div className="status d-flex flex-column flex-sm-row align-items-start align-items-sm-center gap-3 flex-wrap">
                                <label className="custom-radio mb-2 mb-sm-0">
                                  <input
                                    type="radio"
                                    name="officeStatus"
                                    value="Complete"
                                    checked={form.officeStatus === "Complete"}
                                    onChange={handleChange}
                                  />
                                  <span className="radiomark"></span>
                                  <span className="complete1">
                                    Complete
                                  </span>{" "}
                                </label>
                                <label className="custom-radio mb-2 mb-sm-0">
                                  <input
                                    type="radio"
                                    name="officeStatus"
                                    value="Incomplete"
                                    checked={form.officeStatus === "Incomplete"}
                                    onChange={handleChange}
                                  />
                                  <span className="radiomark"></span>
                                  <span className="registration">
                                    Incomplete
                                  </span>
                                </label>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Incomplete Documents */}
                        <div className="col-12">
                          <div className="row g-3 align-items-start">
                            <div className="col-12 col-sm-5 col-md-4 col-lg-3">
                              <div className="note1">
                                <div className="txtIcDocs">
                                  <div className="registration text-break">
                                    Incomplete documents:
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="col-12 col-sm-7 col-md-8 col-lg-9">
                              <div className="incomplete-docs-input">
                                <textarea
                                  name="incompleteDocs"
                                  className="registration-input w-100"
                                  placeholder="List incomplete documents here..."
                                  value={form.incompleteDocs}
                                  onChange={handleChange}
                                  rows="3"
                                  style={{
                                    minHeight: "80px",
                                    resize: "vertical",
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="approvedBy" />
                </div>

                {/* Tombol Submit dan Reset */}
                <div className="button">
                  <div className="bottomSec4">
                    <div className="transportation">{`Note: `}</div>
                    <div className="registration">
                      <span className="pleaseMakeSure">{`Please make sure all the data above are accurate before pressing `}</span>
                      <b>Done</b>
                    </div>
                    <div className="pleaseKeepInContainer1">
                      <span className="pleaseMakeSure">{`Please keep in mind that this action cannot be `}</span>
                      <b>undone</b>
                      <span className="pleaseMakeSure">.</span>
                    </div>
                  </div>
                  <div className="bAddSubjectParent">
                    <button type="reset" className="bAddSubject">
                      Reset
                    </button>
                    <button type="submit" className="bAddSubject1">
                      Done
                    </button>
                  </div>
                </div>
              </div>
            </form>
            {showConfirm && (
              <PopUpConfirm
                onCancel={handleCancelConfirm}
                onConfirm={handleConfirm}
              />
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default RegistrationPage;
