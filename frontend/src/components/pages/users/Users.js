import React, { useCallback, useState, useEffect, useRef } from 'react';
import styles from './Users.module.css';
import Button from '../../atoms/Button';
import ColumnHeader from '../../atoms/columnHeader/ColumnHeader';
import searchIcon from '../../../assets/Search-icon.png';
import upenIcon from '../../../assets/edit_pen.png';
import utrashAltIcon from '../../../assets/trash_icon.png';
import PopUpForm from '../../molecules/PopUp/PopUpRegis/PopUpForm';
import { getUsers, deleteUser, postUser, updateUser } from '../../../services/api';
import ResetFilterButton from '../../atoms/resetFilterButton/ResetFilterButton';

const REFRESH_INTERVAL = 5000;

const formatRole = (role) => {
  if (!role) return '';
  return role
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Roles list diambil dari informasi yang Anda kirimkan (useAuth snippet).
 * Jika nanti ingin ambil dari API dynamic, kita bisa ganti ke fetch options.
 */
const ROLE_OPTIONS = [
  { id: 'admin', name: 'Admin' },
  { id: 'registrar', name: 'Registrar' },
  { id: 'head_registrar', name: 'Head Registrar' },
  { id: 'teacher', name: 'Teacher' },
];

const Users = () => {
  // UI state
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [sorts, setSorts] = useState([]);

  // data state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // eslint-disable-next-line
  const [page, setPage] = useState(1);

  const fetchControllerRef = useRef(null);

  // popup / CRUD state
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState(null);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('');
  const [showPopup, setShowPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  const showTemporaryPopup = (message, type) => {
    setPopupType(type);
    setPopupMessage(message);
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000);
  };

  /**
   * fetchUsers mengirim semua parameter: page, per_page, search, filters, sort_by, sort_dir
   * sehingga backend menerima role[]=... dan sort_by/sort_dir sesuai ekspektasi.
   */
  const fetchUsers = useCallback(
    async ({ isBackgroundRefresh = false } = {}) => {
      if (!isBackgroundRefresh) setLoading(true);
      setError('');

      const controller = new AbortController();
      const signal = controller.signal;
      fetchControllerRef.current?.abort();
      fetchControllerRef.current = controller;

      try {
        const params = {
          page,
          per_page: 25,
          search: search || undefined,
          username: filters.username || undefined,
          full_name: filters.full_name || undefined,
          email: filters.email || undefined,
          user_id: filters.user_id || undefined,
          role: Array.isArray(filters.role) ? filters.role : filters.role ? [filters.role] : undefined,
          sort_by: sorts[0]?.field || undefined,
          sort_dir: sorts[0]?.order || undefined,
        };

        const res = await getUsers(params, { signal });

        if (res?.success) {
          setUsers(res.data.data || []);
        } else {
          setError('Failed to load users');
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error(err);
        setError('Error fetching user data');
      } finally {
        if (!isBackgroundRefresh) setLoading(false);
      }
    },
    [page, search, filters, sorts]
  );

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchUsers]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchUsers({ isBackgroundRefresh: true });
    }, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchUsers]);

  const handleSortChange = (fieldKey) => {
    setSorts((prev) => {
      const current = prev[0]?.field === fieldKey ? prev[0] : null;
      let next;
      if (!current) next = { field: fieldKey, order: 'asc' };
      else if (current.order === 'asc') next = { field: fieldKey, order: 'desc' };
      else next = null;
      return next ? [next] : [];
    });
  };
  const getSortOrder = (fieldKey) => sorts.find((s) => s.field === fieldKey)?.order;

  const handleFilterChange = (filterKey, selectedValue) => {
    setFilters((prevFilters) => {
      const newFilters = { ...prevFilters };
      const isArray = Array.isArray(selectedValue);

      if (isArray && selectedValue.length > 0) {
        newFilters[filterKey] = selectedValue;
      } else if (!isArray && selectedValue) {
        newFilters[filterKey] = selectedValue;
      } else {
        delete newFilters[filterKey];
      }

      return newFilters;
    });
  };

  const handleResetFilters = () => {
    setSearch('');
    setFilters({});
    setSorts([]);
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteUser) return;
    setDeletingUserId(confirmDeleteUser.user_id);

    try {
      await deleteUser(confirmDeleteUser.user_id);
      showTemporaryPopup(
        `User "${confirmDeleteUser.username}" has been deleted.`,
        'success'
      );
      await fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      showTemporaryPopup('Failed to delete user. Please try again.', 'error');
    } finally {
      setDeletingUserId(null);
      setConfirmDeleteUser(null);
    }
  };

  const handleAddUser = async (userData, resetForm) => {
    if (
      !userData.username ||
      !userData.full_name ||
      !userData.email ||
      !userData.password ||
      !userData.role
    ) {
      showTemporaryPopup('All fields are required.', 'error');
      return;
    }

    try {
      const response = await postUser(userData);
      const username = response.data?.username || userData.username;
      showTemporaryPopup(
        `User "${username}" has been added successfully.`,
        'success'
      );
      await fetchUsers();

      if (typeof resetForm === 'function') resetForm();
      setShowUserPopup(false);
    } catch (error) {
      console.error('Failed to add user:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to add user. Please try again.';
      showTemporaryPopup(errorMessage, 'error');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    if (!userData.username || !userData.full_name || !userData.email || !userData.role) {
      showTemporaryPopup('Username, Full Name, Email, and Role are required.', 'error');
      return;
    }

    try {
      const response = await updateUser(userId, userData);
      const username = response.data?.username || userData.username;
      
      showTemporaryPopup(
        `User "${username}" has been updated successfully.`,
        'success'
      );
      
      await fetchUsers();
      setEditingUser(null);

    } catch (error) {
      console.error('Failed to update user:', error);
      const errorMessage =
        error.response?.data?.message || 'Failed to update user. Please try again.';
      showTemporaryPopup(errorMessage, 'error');
    }
  };

  return (
    <div className={styles.usersContainer}>
      <h2 className={styles.pageTitle}>Users</h2>
      <div className={styles.usersHeaderContent}>
        <div className={styles.searchAndFilterContainer}>
          <div className={styles.searchBar}>
            <input
              type='text'
              placeholder='Find username, name, or user ID'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={styles.searchInput}
            />
            <img
              src={searchIcon}
              alt='search icon'
              className={styles.searchIconImg}
            />
          </div>
          <ResetFilterButton onClick={handleResetFilters} />
        </div>

        <div className={styles.button2Parent}>
          <Button variant='solid' onClick={() => setShowUserPopup(true)}>
            New User
          </Button>

          {showUserPopup && (
            <PopUpForm
              type='user'
              onClose={() => setShowUserPopup(false)}
              onCreate={(data, resetForm) => handleAddUser(data, resetForm)}
            />
          )}

          {editingUser && (
            <PopUpForm
              type='user'
              onClose={() => setEditingUser(null)}
              onCreate={(data) => handleUpdateUser(editingUser.user_id, data)}
              isEditMode={true} 
              initialData={editingUser} 
            />
          )}

        </div>
      </div>

      <div className={styles.tableContainer}>
        <div className={styles.tableHeader}>
          <ColumnHeader
            title='User ID'
            hasSort={true}
            fieldKey='user_id'
            sortOrder={getSortOrder('user_id')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='search'
            filterKey='user_id'
            onFilterChange={handleFilterChange}
            currentFilterValue={filters.user_id}
          />
          <ColumnHeader
            title='Username'
            hasSort={true}
            fieldKey='username'
            sortOrder={getSortOrder('username')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='search'
            filterKey='username'
            onFilterChange={handleFilterChange}
            currentFilterValue={filters.username}
          />
          <ColumnHeader
            title='Name'
            hasSort={true}
            fieldKey='full_name'
            sortOrder={getSortOrder('full_name')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='search'
            filterKey='full_name'
            onFilterChange={handleFilterChange}
            currentFilterValue={filters.full_name}
          />
          <ColumnHeader
            title='User Email'
            hasSort={true}
            fieldKey='email'
            sortOrder={getSortOrder('email')}
            onSort={handleSortChange}
            hasFilter={true}
            filterType='search'
            filterKey='email'
            onFilterChange={handleFilterChange}
            currentFilterValue={filters.email}
          />
          <ColumnHeader
            title='Role'
            fieldKey='role'
            hasSort={true}
            sortOrder={getSortOrder('role')}
            onSort={handleSortChange}
            hasFilter={true}
            filterKey='role'
            onFilterChange={handleFilterChange}
            filterOptions={ROLE_OPTIONS}
            valueKey='id'
            labelKey='name'
            currentFilterValue={filters.role}
          />
          <ColumnHeader title='Actions' hasSort={false} hasFilter={false} />
        </div>

        <div className={styles.tableBody}>
          {loading ? (
            <div className={styles.messageCell}>Loading...</div> 
          ) : error ? (
            <div className={styles.messageCell}>{error}</div>
          ) : users.length === 0 ? (
            <div className={styles.messageCell}>No users found</div>
          ) : (
            users.map((user) => (
              <div key={user.user_id} className={styles.tableRow}>
                <div className={styles.tableCell} title={user.user_id}>
                  {user.user_id}
                </div>
                <div className={styles.tableCell} title={user.username}>
                  {user.username}
                </div>
                <div className={styles.tableCell} title={user.full_name}>
                  {user.full_name || '-'}
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
                      onClick={() => setEditingUser(user)}
                      aria-label='Edit User'
                    >
                      <img
                        src={upenIcon}
                        alt='Edit'
                        className={`${styles.icon} ${styles.editIcon}`}
                      />
                    </button>

                    <button
                      className={styles.actionButton}
                      onClick={() => setConfirmDeleteUser(user)}
                      disabled={deletingUserId === user.user_id}
                      aria-label='Delete User'
                    >
                      <img
                        src={utrashAltIcon}
                        alt='Delete'
                        className={`${styles.icon} ${styles.deleteIcon}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

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
                variant='solid'
                onClick={handleConfirmDelete}
                disabled={deletingUserId === confirmDeleteUser.user_id}
              >
                {deletingUserId === confirmDeleteUser.user_id
                  ? 'Deleting...'
                  : 'Yes, Delete'}
              </Button>
              <Button
                variant='outline'
                onClick={() => setConfirmDeleteUser(null)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {showPopup && (
        <div
          className={`${styles.popup} ${
            popupType === 'success' ? styles.success : styles.error
          }`}
        >
          {popupMessage}
        </div>
      )}
    </div>
  );
};

export default Users;