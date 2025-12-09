import React, { useState } from 'react';
import styles from './GateAttendance.module.css';
import searchIcon from "../../../assets/Search-icon.png";
import ResetFilterButton from "../../atoms/resetFilterButton/ResetFilterButton";
import gearIcon from "../../../assets/Circle-Gear_icon.svg";
import switchIcon from "../../../assets/switch_icon.svg";

const GateAttendance = () => {
  const [search, setSearch] = useState("");
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  
  const handleResetClick = () => {
    setSearch("");
  };

  const handleCheckInOutClick = () => {
    setIsCheckedIn(prev => !prev);
  };

  return (
    <div className={styles.gateAttendanceContainer}>
      {/* Wrapper untuk Header (Judul + Actions) dan Search */}
      <div className={styles.headerWrapper}>
        
        {/* Bagian Judul dan Tombol Kanan */}
        <div className={styles.titleSection}>
          <h1 className={styles.pageTitle}>Gate Attendance</h1>
          
          {/* Action Icons (Sekarang menggunakan Flex Column) */}
          <div className={styles.rightActions}>
            {/* Gear Icon diletakkan DI ATAS */}
            <div className={styles.settingIconContainer}>
              <img 
                src={gearIcon} 
                alt="Settings" 
                className={styles.settingIcon} 
              />
            </div>

            {/* Tombol Check-In diletakkan DI BAWAH Gear */}
            <div 
              className={styles.checkInOutButton} 
              onClick={handleCheckInOutClick}
            >
              <span className={styles.checkInText}>
                {isCheckedIn ? "Check-Out" : "Check-In"}
              </span>
              <img 
                src={switchIcon} 
                alt="Switch" 
                className={styles.syncIcon} 
              />
            </div>
          </div>
        </div>
        
        {/* Container Search dan Reset Filter */}
        <div className={styles.searchAndFilterContainer}>
          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Find name or student id"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <img src={searchIcon} alt="Search" className={styles.searchIcon} />
          </div>
          <ResetFilterButton
            onClick={handleResetClick}
          />
        </div>
      </div>
      
      {/* Konten halaman lainnya akan ditambahkan di sini */}
    </div>
  );
};

export default GateAttendance;