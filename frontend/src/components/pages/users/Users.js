import React, { useCallback, useState } from "react";
import styles from "./Users.module.css";
import Button from "../../atoms/Button";
import ColumnHeader from "../../atoms/columnHeader/ColumnHeader";
import searchIcon from "../../../assets/Search-icon.png";
import upenIcon from "../../../assets/edit_pen.png";
import utrashAltIcon from "../../../assets/trash_icon.png";

const MOCK_USERS = [
  {
    id: "019283459",
    username: "thisisjustanordinaryusername",
    email: "thisisjustanordinary@gmail.com",
    role: "Admin",
  },
  {
    id: "23478092347",
    username: "thisisjustanordinaryusername",
    email: "thisisjustanordinary@gmail.com",
    role: "User",
  },
  {
    id: "5561289047",
    username: "john_doe_tester",
    email: "john.doe@example.com",
    role: "User",
  },
];

const Users = () => {
  const [search, setSearch] = useState("");

  const onButton2ContainerClick = useCallback(() => {
    console.log("Tombol New User diklik!");
  }, []);

  return (
    <div className={styles.usersContainer}>
      {/* Header Title */}
      <h2 className={styles.pageTitle}>Users</h2>
      <div className={styles.usersHeaderContent}>
        {/* Search Bar */}
        <div className={styles.searchBar}>
          <input
            type="text"
            placeholder="Find username or user ID"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <img src={searchIcon} alt="Search" className={styles.searchIconImg} />
        </div>
        {/* Tombol New User */}
        <div className={styles.button2Parent}>
          <Button variant="solid" onClick={onButton2ContainerClick}>
            New User
          </Button>
        </div>
      </div>

      {/* Table Structure */}
      <div className={styles.tableContainer}>
        {/* Table Header Row */}
        <div className={styles.tableHeader}>
          {/* 1. User ID: Sort/Filter dinonaktifkan */}
          <ColumnHeader title="User ID" hasFilter={false} hasSort={false} />

          {/* 2. Username */}
          <ColumnHeader title="Username" hasFilter={false} hasSort={true} />

          {/* 3. User Email */}
          <ColumnHeader title="User Email" hasFilter={false} hasSort={true} />

          {/* 4. Role */}
          <ColumnHeader title="Role" hasFilter={true} hasSort={true} />

          {/* 5. Actions: Sort/Filter dinonaktifkan */}
          <ColumnHeader title="Actions" hasSort={false} hasFilter={false} />
        </div>

        {/* Table Data Rows */}
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
  );
};

export default Users;
