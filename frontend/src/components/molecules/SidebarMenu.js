// src/components/molecules/SidebarMenu.js

import React, { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import Icon from "../atoms/Icon";
import useAuth from "../../hooks/useAuth"; // <-- DITAMBAHKAN
import homeIcon from "../../assets/Home-icon.png";
import studentIcon from "../../assets/StudentList-icon.png";
import logbookIcon from "../../assets/logbook.png";
import teacherIcon from "../../assets/TeacherList-icon.png";
import homeroomIcon from "../../assets/HomeroomList-icon.png";
import registrationIcon from "../../assets/Registration-icon.png";
import usersIcon from "../../assets/user.png";
import gateAttendanceIcon from "../../assets/GateAttendence_icon.svg";
import "../styles/SidebarMenu.css";

// Nama variabel diubah agar lebih jelas
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

// Terima prop 'isOpen' dari komponen Main.js
const SidebarMenu = ({ isOpen }) => {
  const { isAdmin } = useAuth();
  const asideRef = useRef(null);
  const [isIconOnly, setIsIconOnly] = useState(false);

  // <-- DITAMBAHKAN: Logika untuk memfilter menu -->
  const filteredMenus = allMenus.filter((menu) => {
    // Jika menu adalah '/users', periksa apakah pengguna adalah admin
    if (menu.to === "/users") {
      return isAdmin();
    }
    // Jika bukan menu '/users', tampilkan seperti biasa
    return true;
  });
  // <-- BATAS PENAMBAHAN -->

  useEffect(() => {
    // Pakai ResizeObserver + window resize utk memutuskan kapan "icon-only".
    const decideCompact = () => {
      const vw = Math.max(
        document.documentElement.clientWidth,
        window.innerWidth || 0
      );
      // 1) Mode icon-only jika layar sangat sempit
      const compact = vw < 560;
      setIsIconOnly(compact);
      if (compact) document.body.classList.add("sidebar-compact");
      else document.body.classList.remove("sidebar-compact");

      // 2) Lebar dinamis agar sidebar SELALU bisa muncul:
      //    min 56px (ikon saja), max 280px, dan tak mepet ke tepi (beri buffer 16px)
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
