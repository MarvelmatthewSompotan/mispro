import React, { useState } from "react";
import "../css/RegistrationTable.css";

const dummyData = [
  {
    createdAt: "30 September 2025",
    registrationId: "ENG004ENG004ENG004ENG004",
    section: "HS",
    name: {
      firstName: "JHOANNE",
      middleName: "JENNIE ABIGAIL EUPHORIA",
      surname: "DOE",
    },
  },
];

const RegistrationTable = ({ onNewForm }) => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    ECP: false,
    ES: false,
    MS: false,
    HS: false,
    year: "2025/2026",
    semester: "Semester 1",
  });

  // Filter logic dummy
  const filteredData = dummyData.filter((item) => {
    const name =
      `${item.name.firstName} ${item.name.middleName} ${item.name.surname}`.toLowerCase();
    const regId = item.registrationId.toLowerCase();
    const searchMatch =
      name.includes(search.toLowerCase()) ||
      regId.includes(search.toLowerCase());
    // Section filter
    const sectionActive = Object.entries(filters)
      .filter(([key, val]) => ["ECP", "ES", "MS", "HS"].includes(key) && val)
      .map(([key]) => key);
    const sectionMatch =
      sectionActive.length === 0 || sectionActive.includes(item.section);
    return searchMatch && sectionMatch;
  });

  return (
    <div className="registration-table-container">
      <div className="registration-table-header">
        <input
          className="registration-table-search"
          type="text"
          placeholder="Find name or registration id"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="registration-table-newform" onClick={onNewForm}>
          New Form
        </button>
      </div>
      <div className="registration-table-filters">
        <div className="registration-table-filters-label">Filters</div>
        <div className="registration-table-filters-checkboxes">
          {[
            { label: "ECP", key: "ECP" },
            { label: "ES", key: "ES" },
            { label: "MS", key: "MS" },
            { label: "HS", key: "HS" },
          ].map((f) => (
            <label key={f.key} className="registration-table-checkbox">
              <input
                type="checkbox"
                checked={filters[f.key]}
                onChange={() =>
                  setFilters((prev) => ({ ...prev, [f.key]: !prev[f.key] }))
                }
              />
              <span className="custom-checkbox-box"></span>
              <span>{f.label}</span>
            </label>
          ))}
          <select
            className="registration-table-select"
            value={filters.year}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, year: e.target.value }))
            }
          >
            <option value="2025/2026">School Year 2025/2026</option>
            <option value="2024/2025">School Year 2024/2025</option>
          </select>
          <select
            className="registration-table-select"
            value={filters.semester}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, semester: e.target.value }))
            }
          >
            <option value="Semester 1">Semester 1</option>
            <option value="Semester 2">Semester 2</option>
          </select>
          <a href="#" className="registration-table-seeall">
            See All Forms
          </a>
        </div>
      </div>
      <div className="registration-table-results">
        <span className="registration-table-results-label">
          Showing {filteredData.length} out of {dummyData.length} results
        </span>
      </div>
      <table className="registration-table">
        <thead>
          <tr>
            <th>Created at</th>
            <th>Registration ID</th>
            <th>Section</th>
            <th>Name</th>
          </tr>
        </thead>
        <tbody>
          {filteredData.length === 0 ? (
            <tr>
              <td colSpan={4} style={{ textAlign: "center", color: "#aaa" }}>
                No data found
              </td>
            </tr>
          ) : (
            filteredData.map((item, idx) => (
              <tr key={idx}>
                <td>{item.createdAt}</td>
                <td>{item.registrationId}</td>
                <td>{item.section}</td>
                <td>
                  <b>{item.name.firstName}</b> <b>{item.name.middleName}</b>{" "}
                  <b>{item.name.surname}</b>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RegistrationTable;
