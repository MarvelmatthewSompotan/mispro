import React from "react";
import "../../css/Sidebar.css";

const menu = [
  { icon: "🏠", label: "Home" },
  { icon: "👨‍🎓", label: "Student List" },
  { icon: "👩‍🏫", label: "Teacher List" },
  { icon: "🏫", label: "Homeroom List" },
  { icon: "📝", label: "Registration" },
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
