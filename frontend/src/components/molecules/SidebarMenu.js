// src/components/molecules/SidebarMenu.js

import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../atoms/Icon";
import useAuth from "../../hooks/useAuth";
import homeIcon from "../../assets/Home_icon.svg";
import studentIcon from "../../assets/Student-List_icon.svg";
import logbookIcon from "../../assets/Logbook_icon.svg";
import teacherIcon from "../../assets/Teacher-List_icon.svg";
import homeroomIcon from "../../assets/Homeroom-List_icon.svg";
import registrationIcon from "../../assets/Registration_icon.svg";
import usersIcon from "../../assets/User_icon.svg";
import gateAttendanceIcon from "../../assets/GateAttendence_icon.svg";
import "../styles/SidebarMenu.css";

const allMenus = [
  { to: "/home", icon: homeIcon, label: "Home" },
  { to: "/students", icon: studentIcon, label: "Student List" },
  { to: "/gate-attendance", icon: gateAttendanceIcon, label: "Gate Attendance" },
  { to: "/logbook", icon: logbookIcon, label: "Logbook" },
  { to: "/teachers", icon: teacherIcon, label: "Teacher List" },
  { to: "/homerooms", icon: homeroomIcon, label: "Homeroom List" },
  { to: "/registration", icon: registrationIcon, label: "Registration" },
  { to: "/users", icon: usersIcon, label: "Users" },
];

const SidebarMenu = ({ isOpen }) => {
  const { isAdmin } = useAuth();
  const asideRef = useRef(null);
  const [isIconOnly, setIsIconOnly] = useState(false);

  const filteredMenus = allMenus.filter((menu) => {
    if (menu.to === "/users") {
      return isAdmin();
    }
    return true;
  });

  useEffect(() => {
    const decideCompact = () => {
      const vw = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      const compact = vw < 560;
      setIsIconOnly(compact);
      if (compact) document.body.classList.add("sidebar-compact");
      else document.body.classList.remove("sidebar-compact");

      const MIN = 56;
      const MAX = 280;
      const buffer = 16;
      const computed = Math.min(MAX, Math.max(MIN, vw - buffer));
      document.documentElement.style.setProperty(
        "--sidebar-current-width",
        `${computed}px`
      );
    };

    decideCompact();
    const ro = new ResizeObserver(decideCompact);
    if (asideRef.current) ro.observe(asideRef.current);
    window.addEventListener("resize", decideCompact);
    return () => {
      window.removeEventListener("resize", decideCompact);
      ro.disconnect();
    };
  }, []);

  return (
    <aside
      ref={asideRef}
      className={`sidebar-menu ${isOpen ? "open" : ""} ${
        isIconOnly ? "icon-only" : ""
      }`}
    >
      <nav>
        <ul className="sidebar-menu-list">
          {filteredMenus.map((menu) => (
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
