import React, { useState } from 'react';
import StatCard from '../../molecules/StatCard';
import WelcomeBanner from '../../molecules/WelcomeBanner';
import styles from '../home/Home.module.css';
import ColumnHeader from '../../atoms/columnHeader/ColumnHeader';
import TableRow from '../../molecules/TableRow/TableRow';

const MOCK_USERS = [
  {
    id: '019283459',
    username: 'thisisjustanordinaryusername',
    email: 'thisisjustanordinary@gmail.com',
    role: 'Admin',
  },
  {
    id: '23478092347',
    username: 'thisisjustanordinaryusername',
    email: 'thisisjustanordinary@gmail.com',
    role: 'User',
  },
  // Menambahkan contoh data lain untuk demonstrasi
  {
    id: '5561289047',
    username: 'john_doe_tester',
    email: 'john.doe@example.com',
    role: 'User',
  },
];

// Data untuk kartu yang bisa diganti
const newStudentData = [
  {
    value: '432',
    label: 'New students (Today)',
    footerText: 'Increased 20% from yesterday',
  },
  {
    value: '3980',
    label: 'New students (Last Year)',
    footerText: 'Increased 15% from last year',
  },
];

const returnStudentData = [
  {
    value: '432',
    label: 'Return students (Today)',
    footerText: 'Increased 20% from yesterday',
  },
  {
    value: '4150',
    label: 'Return students (Last Year)',
    footerText: 'Increased 18% from last year',
  },
];

const Home = () => {
  const [newStudentSlide, setNewStudentSlide] = useState(0);
  const [returnStudentSlide, setReturnStudentSlide] = useState(0);

  const handleNewStudentClick = () => {
    setNewStudentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  const handleReturnStudentClick = () => {
    setReturnStudentSlide((prev) => (prev === 0 ? 1 : 0));
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.topContentWrapper}>
        <WelcomeBanner name='Admin' />
        <div className={styles.statCardGrid}>
          {/* Kartu 1: Sekarang dibungkus seperti yang lain */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value='150'
              label='Total registration'
              variant='gradient'
              footerText='Increased 20% from last year'
              style={{ flex: 'none' }} // <-- Tambahkan style ini
            />
            {/* Placeholder agar sejajar */}
            <div className={styles.dotsPlaceholder} />
          </div>

          {/* Kartu 2: Sekarang dibungkus seperti yang lain */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value='432'
              label='Total registration (Today)'
              variant='red'
              footerText='Increased 20% from yesterday'
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
              variant='blue'
              footerText={newStudentData[newStudentSlide].footerText}
              onClick={handleNewStudentClick}
              style={{ flex: 'none' }} // <-- Style ini sudah ada
            />
            <div className={styles.paginationDots}>
              <span
                className={`${styles.dot} ${
                  newStudentSlide === 0 ? styles.active : ''
                }`}
              ></span>
              <span
                className={`${styles.dot} ${
                  newStudentSlide === 1 ? styles.active : ''
                }`}
              ></span>
            </div>
          </div>

          {/* Kartu 4: Varian "yellow" (Interaktif) */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value={returnStudentData[returnStudentSlide].value}
              label={returnStudentData[returnStudentSlide].label}
              variant='yellow'
              footerText={returnStudentData[returnStudentSlide].footerText}
              onClick={handleReturnStudentClick}
              style={{ flex: 'none' }} // <-- Style ini sudah ada
            />
            <div className={styles.paginationDots}>
              <span
                className={`${styles.dot} ${
                  returnStudentSlide === 0 ? styles.active : ''
                }`}
              ></span>
              <span
                className={`${styles.dot} ${
                  returnStudentSlide === 1 ? styles.active : ''
                }`}
              ></span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.mainContentArea}>
        <h3>Latest Registration</h3>
        {/* Table Structure */}
        <div className={styles.tableContainer}>
          {/* Table Header Row */}
          <div className={styles.tableHeader}>
            {/* 1. User ID: Sort/Filter dinonaktifkan */}
            <ColumnHeader title='Student ID' />

            {/* 2. Username */}
            <ColumnHeader title='Student Name' />

            {/* 3. User Email */}
            <ColumnHeader title='Grade' />

            {/* 4. Role */}
            <ColumnHeader title='Section' />

            {/* 5. Actions: Sort/Filter dinonaktifkan */}
            <ColumnHeader title='School Year' />
          </div>

          {/* Ubah menjadi grid */}
          <div className={styles.tableBody}>
            {MOCK_USERS.map((user) => (
              <TableRow
                key={user.id}
                userId={user.id}
                username={user.username}
                email={user.email}
                role={user.role}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
