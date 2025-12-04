// src/components/molecules/sidebarMenu/SidebarMenu.js

import React, { useRef } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../../Atoms/Icon/Icon";
import useAuth from "../../../hooks/useAuth";
import homeIcon from "../../../assets/Home-icon.png";
import studentIcon from "../../../assets/StudentList-icon.png";
import logbookIcon from "../../../assets/logbook.png";
import teacherIcon from "../../../assets/TeacherList-icon.png";
import homeroomIcon from "../../../assets/HomeroomList-icon.png";
import registrationIcon from "../../../assets/Registration-icon.png";
import usersIcon from "../../../assets/user.png";
import "./SidebarMenu.css";

const allMenus = [
  { to: "/Home", icon: homeIcon, label: "Home" },
  { to: "/students", icon: studentIcon, label: "Student List" },
  { to: "/Logbook", icon: logbookIcon, label: "Logbook" },
  { to: "/teachers", icon: teacherIcon, label: "Teacher List" },
  { to: "/Homerooms", icon: homeroomIcon, label: "Homeroom List" },
  { to: "/Registration", icon: registrationIcon, label: "Registration" },
  { to: "/Users", icon: usersIcon, label: "Users" },
];

const SidebarMenu = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const asideRef = useRef(null);

  const filteredMenus = allMenus.filter((menu) => {
    if (menu.to === "/Users") {
      return isAdmin();
    }
    return true;
  });

  // Fungsi: Jika layar kecil (< 1000px) dan menu diklik, tutup sidebar
  const handleMenuClick = () => {
    // Logika ini menutup sidebar otomatis setelah pilih menu di mode mobile
    if (window.innerWidth <= 1000 && onClose) {
      onClose();
    }
  };

  return (
    <aside ref={asideRef} className={`sidebar-menu ${isOpen ? "open" : ""}`}>
      <nav>
        <ul className="sidebar-menu-list">
          {filteredMenus.map((menu) => (
            <li key={menu.label}>
              <NavLink
                to={menu.to}
                onClick={handleMenuClick} // Event handler dipasang di sini
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
