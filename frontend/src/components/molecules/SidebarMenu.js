import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../atoms/Icon";
import homeIcon from "../../assets/Home-icon.png";
import studentIcon from "../../assets/StudentList-icon.png";
import teacherIcon from "../../assets/TeacherList-icon.png";
import homeroomIcon from "../../assets/HomeroomList-icon.png";
import registrationIcon from "../../assets/Registration-icon.png";
import "../styles/SidebarMenu.css";

const menus = [
  {
    icon: <Icon src={homeIcon} alt="Home" style={{ width: 24, height: 24 }} />,
    label: "Home",
    to: "/home",
  },
  {
    icon: (
      <Icon
        src={studentIcon}
        alt="Student List"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Student List",
    to: "/students",
  },
  {
    icon: (
      <Icon
        src={teacherIcon}
        alt="Teacher List"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Teacher List",
    to: "/teachers",
  },
  {
    icon: (
      <Icon
        src={homeroomIcon}
        alt="Homeroom List"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Homeroom List",
    to: "/homerooms",
  },
  {
    icon: (
      <Icon
        src={registrationIcon}
        alt="Registration"
        style={{ width: 24, height: 24 }}
      />
    ),
    label: "Registration",
    to: "/registration",
  },
];

const SidebarMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      {/* Hamburger button for mobile */}
      <button className="sidebar-menu-toggle" onClick={toggleMenu}>
        <span className="hamburger-icon"></span>
      </button>

      {/* Sidebar */}
      <aside className={`sidebar-menu ${isOpen ? "open" : ""}`}>
        <nav>
          <ul className="sidebar-menu-list">
            {menus.map((menu) => (
              <li key={menu.label}>
                <NavLink
                  to={menu.to}
                  className={({ isActive }) =>
                    "sidebar-menu-item" + (isActive ? " active" : "")
                  }
                  onClick={() => setIsOpen(false)} // Close menu on item click on mobile
                >
                  <span className="sidebar-menu-icon">{menu.icon}</span>
                  <span className="sidebar-menu-label">{menu.label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
};

export default SidebarMenu;
