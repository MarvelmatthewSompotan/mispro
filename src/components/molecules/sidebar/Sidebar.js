import React from "react";
import { Link, useLocation } from "react-router-dom";
import homeIcon from "../../../assets/image/Home.png";
import studentIcon from "../../../assets/image/StudentList.png";
import teacherIcon from "../../../assets/image/TeacherList.png";
import homeroomIcon from "../../../assets/image/HomeroomList.png";
import registrationIcon from "../../../assets/image/Registration.png";
import "../../css/Sidebar.css";

const menu = [
  {
    icon: <img src={homeIcon} alt="Home" style={{ width: 24, height: 24 }} />,
    label: "Home",
    path: "/home",
  },
  {
    icon: (
      <img
        src={studentIcon}
        alt="Student List"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Student List",
    path: "/students",
  },
  {
    icon: (
      <img
        src={teacherIcon}
        alt="Teacher List"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Teacher List",
    path: "/teachers",
  },
  {
    icon: (
      <img
        src={homeroomIcon}
        alt="Homeroom List"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Homeroom List",
    path: "/homerooms",
  },
  {
    icon: (
      <img
        src={registrationIcon}
        alt="Registration"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Registration",
    path: "/registration",
  },
];

const Sidebar = ({ open, onClose }) => {
  const location = useLocation();
  return (
    <aside className={`sidebar${open ? " sidebar-open" : ""}`}>
      {/* Tombol close hanya muncul di mobile */}
      <button
        className="sidebar-close-btn"
        onClick={onClose}
        aria-label="Close sidebar"
      >
        &times;
      </button>
      <nav className="sidebar-menu">
        {menu.map((item) => (
          <Link
            to={item.path}
            key={item.label}
            className={`sidebar-menu-item${
              location.pathname === item.path ? " active" : ""
            }`}
          >
            <span className="sidebar-menu-icon">{item.icon}</span>
            <span className="sidebar-menu-label">{item.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
