import React, { useCallback, useState, useEffect, useRef } from "react";
import styles from "./Users.module.css";
import Button from "../../atoms/Button";
import ColumnHeader from "../../atoms/columnHeader/ColumnHeader";
import searchIcon from "../../../assets/Search-icon.png";
import upenIcon from "../../../assets/edit_pen.png";
import utrashAltIcon from "../../../assets/trash_icon.png";
import PopUpForm from "../../molecules/PopUp/PopUpRegis/PopUpForm";
import { getUsers, deleteUser, postUser } from "../../../services/api";
import useAuth from "../../../hooks/useAuth";

const REFRESH_INTERVAL = 5000;

const formatRole = (role) => {
  if (!role) return "";
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const Users = () => {
  const { isAdmin } = useAuth();
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const fetchControllerRef = useRef(null);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupType, setPopupType] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const fetchUsers = useCallback(
    async (options = {}) => {
      const { isBackgroundRefresh = false } = options;
      if (!isBackgroundRefresh) setLoading(true);
      setError("");

      const controller = new AbortController();
      const signal = controller.signal;
      fetchControllerRef.current?.abort();
      fetchControllerRef.current = controller;

      try {
        const response = await getUsers({ page }, { signal });
        if (response?.success) {
          setUsers(response.data.data || []);
        } else {
          setError("Failed to load users");
        }
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error(err);
        setError("Error fetching user data");
      } finally {
        if (!isBackgroundRefresh) setLoading(false);
      }
    },
    [page]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      console.log("Auto refreshing user list (background)...");
      fetchUsers({ isBackgroundRefresh: true });
    }, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchUsers]);

  const filteredUsers = users.filter((user) =>
    [user.username, user.user_id]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // === Fungsi Delete dengan modal ===
  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;
    setDeletingUserId(confirmDeleteUser.user_id);

    try {
      await deleteUser(confirmDeleteUser.user_id);
      setPopupType("success");
      setPopupMessage(`User "${confirmDeleteUser.username}" has been deleted.`);
      setShowPopup(true);
      await fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setPopupType("error");
      setPopupMessage("Failed to delete user. Please try again.");
      setShowPopup(true);
    } finally {
      setDeletingUserId(null);
      setConfirmDeleteUser(null);
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

  const handleAddUser = async (userData, resetForm) => {
    if (
      !userData.username ||
      !userData.email ||
      !userData.password ||
      !userData.role
    ) {
      setPopupType("error");
      setPopupMessage("All fields are required.");
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 3000);
      return;
    }

    try {
      const response = await postUser(userData);
      const username = response.data?.username || userData.username;
      setPopupType("success");
      setPopupMessage(`User "${username}" has been added successfully.`);
      setShowPopup(true);
      await fetchUsers();

      if (typeof resetForm === "function") resetForm();
      setShowUserPopup(false);
    } catch (error) {
      console.error("Failed to add user:", error);
      setPopupType("error");
      setPopupMessage("Failed to add user. Please try again.");
      setShowPopup(true);
    } finally {
      setTimeout(() => setShowPopup(false), 3000);
    }
  };

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
          {isAdmin() && (
            <Button variant="solid" onClick={() => setShowUserPopup(true)}>
              New User
            </Button>
          )}
          {showUserPopup && (
            <PopUpForm
              type="user"
              onClose={() => setShowUserPopup(false)}
              onCreate={(data, resetForm) => handleAddUser(data, resetForm)}
            />
          )}
        </div>
      </div>

      {/* Loading/Error Handling */}
      {loading ? (
        <div className={styles.loadingText}>Loading users...</div>
      ) : error ? (
        <div className={styles.errorText}>{error}</div>
      ) : (
        <div className={styles.tableContainer}>
          {/* Table Header */}
          <div className={styles.tableHeader}>
            <ColumnHeader title="User ID" hasFilter={false} hasSort={false} />
            <ColumnHeader title="Username" hasFilter={false} hasSort={true} />
            <ColumnHeader title="User Email" hasFilter={false} hasSort={true} />
            <ColumnHeader title="Role" hasFilter={true} hasSort={true} />
            <ColumnHeader title="Actions" hasSort={false} hasFilter={false} />
          </div>

          {/* Table Body */}
          <div className={styles.tableBody}>
            {filteredUsers.length === 0 ? (
              <div className={styles.noData}>No users found</div>
            ) : (
              filteredUsers.map((user) => (
                <div key={user.user_id} className={styles.tableRow}>
                  <div className={styles.tableCell} title={user.user_id}>
                    {user.user_id}
                  </div>
                  <div className={styles.tableCell} title={user.username}>
                    {user.username}
                  </div>
                  <div className={styles.tableCell} title={user.email}>
                    {user.email}
                  </div>
                  <div
                    className={styles.tableCell}
                    title={formatRole(user.role)}
                  >
                    {formatRole(user.role)}
                  </div>
                  <div className={styles.actionCell}>
                    <div className={styles.actionContainer}>
                      <button
                        className={styles.actionButton}
                        onClick={() =>
                          console.log(`Mengedit User ID: ${user.user_id}`)
                        }
                        aria-label="Edit User"
                      >
                        <img
                          src={upenIcon}
                          alt="Edit"
                          className={`${styles.icon} ${styles.editIcon}`}
                        />
                      </button>
                      {isAdmin() && (
                        <button
                          className={styles.actionButton}
                          onClick={() => setConfirmDeleteUser(user)}
                          disabled={deletingUserId === user.user_id}
                          aria-label="Delete User"
                        >
                          <img
                            src={utrashAltIcon}
                            alt="Delete"
                            className={`${styles.icon} ${styles.deleteIcon}`}
                          />
                          {deletingUserId === user.user_id && (
                            <span className={styles.deletingText}>
                              Deleting...
                            </span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* === Modal Konfirmasi Delete === */}
      {confirmDeleteUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Confirm Deletion</h3>
            <p>
              Are you sure you want to delete user "
              <strong>{confirmDeleteUser.username}</strong>"?
            </p>
            <div className={styles.modalActions}>
              <Button
                variant="solid"
                onClick={handleConfirmDelete}
                disabled={deletingUserId === confirmDeleteUser.user_id}
              >
                {deletingUserId === confirmDeleteUser.user_id
                  ? "Deleting..."
                  : "Yes, Delete"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setConfirmDeleteUser(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* === Popup Notifikasi === */}
      {showPopup && (
        <div
          className={`${styles.popup} ${
            popupType === "success" ? styles.success : styles.error
          }`}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
};

export default Users;
