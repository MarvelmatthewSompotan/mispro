import React, { useState } from "react";
import StatCard from "../../molecules/StatCard";
import WelcomeBanner from "../../molecules/WelcomeBanner";
import styles from "../home/Home.module.css";
import ColumnHeader from "../../atoms/columnHeader/ColumnHeader";
// import TableRow from '../../molecules/TableRow/TableRow'; // <-- Dihapus

// Impor ikon yang sebelumnya ada di TableRow.js
// Sesuaikan path ini jika perlu
import upenIcon from "../../../assets/edit_pen.png";
import utrashAltIcon from "../../../assets/trash_icon.png";

const MOCK_USERS = [
  {
    id: "01928345938498375",
    username: "thisisjustanordinaryusername",
    email: "K1",
    role: "Elementary School",
  },
  {
    id: "23478092347",
    username: "thisisjustanordinaryusername",
    email: "12",
    role: "User",
  },
  // Menambahkan contoh data lain untuk demonstrasi
  {
    id: "5561289047",
    username: "john_doe_tester",
    email: "N",
    role: "User",
  },
];

// Data untuk kartu yang bisa diganti
const newStudentData = [
  {
    value: "432",
    label: "New students (Today)",
    footerText: "Increased 20% from yesterday",
  },
  {
    value: "3980",
    label: "New students (Last Year)",
    footerText: "Increased 15% from last year",
  },
];

const returnStudentData = [
  {
    value: "432",
    label: "Return students (Today)",
    footerText: "Increased 20% from yesterday",
  },
  {
    value: "4150",
    label: "Return students (Last Year)",
    footerText: "Increased 18% from last year",
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
        <WelcomeBanner name="Admin" />
        <div className={styles.statCardGrid}>
          {/* Kartu 1: Sekarang dibungkus seperti yang lain */}
          <div className={styles.cardWithDotsWrapper}>
            <StatCard
              value="150"
              label="Total registration"
              variant="gradient"
              footerText="Increased 20% from last year"
              style={{ flex: "none" }} // <-- Tambahkan style ini
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
              style={{ flex: "none" }} // <-- Tambahkan style ini
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
              style={{ flex: "none" }} // <-- Style ini sudah ada
            />
            <div className={styles.paginationDots}>
              <span
                className={`${styles.dot} ${
                  newStudentSlide === 0 ? styles.active : ""
                }`}
              ></span>
              <span
                className={`${styles.dot} ${
                  newStudentSlide === 1 ? styles.active : ""
                }`}
              ></span>
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
              style={{ flex: "none" }} // <-- Style ini sudah ada
            />
            <div className={styles.paginationDots}>
              <span
                className={`${styles.dot} ${
                  returnStudentSlide === 0 ? styles.active : ""
                }`}
              ></span>
              <span
                className={`${styles.dot} ${
                  returnStudentSlide === 1 ? styles.active : ""
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
            <ColumnHeader title="Student ID" />

            {/* 2. Username */}
            <ColumnHeader title="Student Name" />

            {/* 3. User Email */}
            <ColumnHeader title="Grade" />

            {/* 4. Role */}
            <ColumnHeader title="Section" />

            {/* 5. Actions: Sort/Filter dinonaktifkan */}
            <ColumnHeader title="School Year" />
          </div>

          {/* Ubah menjadi grid */}
          <div className={styles.tableBody}>
            {/* JSX dari TableRow sekarang ada di sini */}
            {MOCK_USERS.map((user) => {
              // Logika dari TableRow.js dipindahkan ke sini
              const handleEdit = () =>
                console.log(`Mengedit User ID: ${user.id}`);
              const handleDelete = () =>
                console.log(`Menghapus User ID: ${user.id}`);

              // JSX untuk ikon aksi dari TableRow.js
              const actionIcons = (
                <div className={styles.actionContainer}>
                  <button
                    className={styles.actionButton}
                    onClick={handleEdit}
                    aria-label="Edit User"
                  >
                    <img
                      src={upenIcon}
                      alt="Edit"
                      className={styles.icon + " " + styles.editIcon}
                    />
                  </button>
                  <button
                    className={styles.actionButton}
                    onClick={handleDelete}
                    aria-label="Delete User"
                  >
                    <img
                      src={utrashAltIcon}
                      alt="Delete"
                      className={styles.icon + " " + styles.deleteIcon}
                    />
                  </button>
                </div>
              );

              // JSX dari return statement TableRow.js
              // Meskipun header di Home.js berbeda (Grade, Section),
              // kode asli Anda me-render MOCK_USERS (id, username, email, role)
              // dan TableRow.js me-render 4 properti itu + 1 kolom aksi.
              // Saya mempertahankan perilaku itu agar "tidak mengubah struktur".
              return (
                <div key={user.id} className={styles.tableRow}>
                  {/* 1. User ID */}
                  <div className={styles.tableCell} title={user.id}>
                    {user.id}
                  </div>
                  {/* 2. Username */}
                  <div className={styles.tableCell} title={user.username}>
                    {user.username}
                  </div>
                  {/* 3. User Email */}
                  <div className={styles.tableCell} title={user.email}>
                    {user.email}
                  </div>
                  {/* 4. Role */}
                  <div className={styles.tableCell} title={user.role}>
                    {user.role}
                  </div>
                  {/* 5. Actions */}
                  <div className={styles.actionCell}>{actionIcons}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
