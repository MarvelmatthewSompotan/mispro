import React, { useState } from 'react'; 
import StatCard from '../../molecules/StatCard';
import WelcomeBanner from '../../molecules/WelcomeBanner';
import styles from '../home/Home.module.css'

// Data untuk kartu yang bisa diganti
const newStudentData = [
  { value: "432", label: "New students (Today)", footerText: "Increased 20% from yesterday" },
  { value: "3980", label: "New students (Last Year)", footerText: "Increased 15% from last year" } 
];

const returnStudentData = [
  { value: "432", label: "Return students (Today)", footerText: "Increased 20% from yesterday" },
  { value: "4150", label: "Return students (Last Year)", footerText: "Increased 18% from last year" }
];


const Home = () => {
  const [newStudentSlide, setNewStudentSlide] = useState(0);
  const [returnStudentSlide, setReturnStudentSlide] = useState(0);

  const handleNewStudentClick = () => {
    setNewStudentSlide(prev => (prev === 0 ? 1 : 0));
  };

  const handleReturnStudentClick = () => {
    setReturnStudentSlide(prev => (prev === 0 ? 1 : 0));
  };

  return (
    <div className={styles.homeContainer} >
      <div className={styles.topContentWrapper}>
        <WelcomeBanner name="Admin" />
        <div className={styles.statCardGrid}>
          
          {/* Kartu 1: Sekarang dibungkus seperti yang lain */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard 
              value="150" 
              label="Total registration" 
              variant="gradient"
              footerText="Increased 20% from last year"
              style={{ flex: 'none' }} // <-- Tambahkan style ini
            />
            {/* Placeholder agar sejajar */}
            <div className={styles.dotsPlaceholder} />
          </div>
          
          {/* Kartu 2: Sekarang dibungkus seperti yang lain */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard 
              value="432" 
              label="Total registration (Today)" 
              variant="red"
              footerText="Increased 20% from yesterday"
              style={{ flex: 'none' }} // <-- Tambahkan style ini
            />
            {/* Placeholder agar sejajar */}
            <div className={styles.dotsPlaceholder} />
          </div>
          
          {/* Kartu 3: Varian "blue" (Interaktif) */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard 
              value={newStudentData[newStudentSlide].value} 
              label={newStudentData[newStudentSlide].label} 
              variant="blue"
              footerText={newStudentData[newStudentSlide].footerText}
              onClick={handleNewStudentClick}
              style={{ flex: 'none' }} // <-- Style ini sudah ada
            />
            <div className={styles.paginationDots}>
              <span className={`${styles.dot} ${newStudentSlide === 0 ? styles.active : ''}`}></span>
              <span className={`${styles.dot} ${newStudentSlide === 1 ? styles.active : ''}`}></span>
            </div>
          </div>
          
          {/* Kartu 4: Varian "yellow" (Interaktif) */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard 
              value={returnStudentData[returnStudentSlide].value} 
              label={returnStudentData[returnStudentSlide].label} 
              variant="yellow"
              footerText={returnStudentData[returnStudentSlide].footerText}
              onClick={handleReturnStudentClick}
              style={{ flex: 'none' }} // <-- Style ini sudah ada
            />
            <div className={styles.paginationDots}>
              <span className={`${styles.dot} ${returnStudentSlide === 0 ? styles.active : ''}`}></span>
              <span className={`${styles.dot} ${returnStudentSlide === 1 ? styles.active : ''}`}></span>
            </div>
          </div>

        </div>
      </div>
      
      <div className={styles.mainContentArea}>
        <h2>Dashboard Content</h2>
        <p>This is the main content area of the home page.</p>
      </div>
    </div>
  );
};

export default Home;