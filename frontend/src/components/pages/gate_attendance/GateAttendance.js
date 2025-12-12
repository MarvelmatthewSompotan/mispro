import React, { useState } from 'react';
import styles from './GateAttendance.module.css';
import searchIcon from "../../../assets/Search-icon.png";
import ResetFilterButton from "../../atoms/resetFilterButton/ResetFilterButton";
import gearIcon from "../../../assets/Circle-Gear_icon.svg";
import checkInIcon from "../../../assets/check-in_icon.svg";
import checkOutIcon from "../../../assets/check-out_icon.svg";

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
      
      <div className={styles.headerContainer}>
        
        <div className={styles.leftSection}>
          <h1 className={styles.pageTitle}>Gate Attendance</h1>
          
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
            <ResetFilterButton onClick={handleResetClick} />
          </div>
        </div>

        {/* Right Section: Settings & Toggle */}
        <div className={styles.rightSection}>
          <div className={styles.settingIconContainer}>
            <img 
              src={gearIcon} 
              alt="Settings" 
              className={styles.settingIcon} 
            />
          </div>

          <div className={styles.checkInOutContainer}>
            <img 
              src={isCheckedIn ? checkOutIcon : checkInIcon} 
              alt={isCheckedIn ? "Check Out" : "Check In"}
              className={styles.actionIcon} 
              onClick={handleCheckInOutClick}
            />
            
            <span className={styles.checkInText}>
              {isCheckedIn ? "Check-Out" : "Check-In"}
            </span>
          </div>
        </div>

      </div>
      
      {/* Konten halaman lainnya... */}
    </div>
  );
};

export default GateAttendance;