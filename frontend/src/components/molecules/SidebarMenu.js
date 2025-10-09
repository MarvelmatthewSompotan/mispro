// src/components/molecules/SidebarMenu.js

import React from "react";
import { NavLink } from "react-router-dom";
import Icon from "../atoms/Icon";
import homeIcon from "../../assets/Home-icon.png";
import studentIcon from "../../assets/StudentList-icon.png";
import logbookIcon from "../../assets/logbook.png";
import teacherIcon from "../../assets/TeacherList-icon.png";
import homeroomIcon from "../../assets/HomeroomList-icon.png";
import registrationIcon from "../../assets/Registration-icon.png";
import usersIcon from "../../assets/user.png";
import "../styles/SidebarMenu.css"; // Menggunakan file CSS yang sudah ada

const menus = [
  { to: "/home", icon: homeIcon, label: "Home" },
  { to: "/students", icon: studentIcon, label: "Student List" },
  { to: "/logbook", icon: logbookIcon, label: "Logbook" },
  { to: "/teachers", icon: teacherIcon, label: "Teacher List" },
  { to: "/homerooms", icon: homeroomIcon, label: "Homeroom List" },
  { to: "/registration", icon: registrationIcon, label: "Registration" },
  { to: "/users", icon: usersIcon, label: "Users" },
];

// Terima prop 'isOpen' dari komponen Main.js
const SidebarMenu = ({ isOpen }) => {
  return (
    // Terapkan class 'open' berdasarkan prop 'isOpen'
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
              >
                <span className="sidebar-menu-icon">
                  <Icon
                    src={menu.icon}
                    alt={menu.label}
                    style={{ width: 24, height: 24 }}
                  />
                </span>
                <span className="sidebar-menu-label">{menu.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default SidebarMenu;
