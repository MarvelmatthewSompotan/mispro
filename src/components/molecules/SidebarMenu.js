import React from 'react';
import { NavLink } from 'react-router-dom';
import Icon from '../atoms/Icon';
import logo from '../../assets/logo.png';
import logoMis from '../../assets/logo-mis-f.png';
import homeIcon from '../../assets/Home-icon.png';
import studentIcon from '../../assets/StudentList-icon.png';
import teacherIcon from '../../assets/TeacherList-icon.png';
import homeroomIcon from '../../assets/HomeroomList-icon.png';
import registrationIcon from '../../assets/Registration-icon.png';
import './SidebarMenu.css';

const menus = [
  { icon: <Icon src={homeIcon} alt="Home" style={{ width: 24, height: 24 }} />, label: 'Home', to: '/' },
  { icon: <Icon src={studentIcon} alt="Student List" style={{ width: 24, height: 24 }} />, label: 'Student List', to: '/students' },
  { icon: <Icon src={teacherIcon} alt="Teacher List" style={{ width: 24, height: 24 }} />, label: 'Teacher List', to: '/teachers' },
  { icon: <Icon src={homeroomIcon} alt="Homeroom List" style={{ width: 24, height: 24 }} />, label: 'Homeroom List', to: '/homerooms' },
  { icon: <Icon src={registrationIcon} alt="Registration" style={{ width: 24, height: 24 }} />, label: 'Registration', to: '/registration' },
];

const SidebarMenu = () => (
  <aside className="sidebar-menu">
    <div className="sidebar-menu-logo">
      <Icon src={logo} alt="Logo" style={{ width: 48, marginRight: 12 }} />
      <img src={logoMis} alt="Logo MIS" style={{ width: 200, height: 48, objectFit: 'contain' }} />
    </div>
    <nav>
      <ul className="sidebar-menu-list">
        {menus.map((menu) => (
          <li key={menu.label}>
            <NavLink
              to={menu.to}
              className={({ isActive }) =>
                'sidebar-menu-item' + (isActive ? ' active' : '')
              }
              end={menu.to === '/'}
            >
              <span className="sidebar-menu-icon">{menu.icon}</span>
              {menu.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  </aside>
);

export default SidebarMenu; 