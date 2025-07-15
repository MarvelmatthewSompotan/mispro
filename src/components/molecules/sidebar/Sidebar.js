import React from "react";
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
  },
];

const Sidebar = () => (
  <aside className="sidebar">
    <nav className="sidebar-menu">
      {menu.map((item, idx) => (
        <div
          className={`sidebar-menu-item${idx === 0 ? " active" : ""}`}
          key={item.label}
        >
          <span className="sidebar-menu-icon">{item.icon}</span>
          <span className="sidebar-menu-label">{item.label}</span>
        </div>
      ))}
    </nav>
  </aside>
);

export default Sidebar;
