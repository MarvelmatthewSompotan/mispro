import React, { useCallback, useState } from 'react';
import styles from './Users.module.css';
import Button from '../../atoms/Button'; 
import ColumnHeader from '../../atoms/columnHeader/ColumnHeader'; 
import TableRow from '../../molecules/TableRow/TableRow'; 
import searchIcon from '../../../assets/Search-icon.png'; 

const MOCK_USERS = [
    { id: '019283459', username: 'thisisjustanordinaryusername', email: 'thisisjustanordinary@gmail.com', role: 'Admin' },
    { id: '23478092347', username: 'thisisjustanordinaryusername', email: 'thisisjustanordinary@gmail.com', role: 'User' },
    // Menambahkan contoh data lain untuk demonstrasi
    { id: '5561289047', username: 'john_doe_tester', email: 'john.doe@example.com', role: 'User' },
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
                    <Button 
                        variant="solid" 
                        onClick={onButton2ContainerClick}
                    >
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
                    <ColumnHeader title="Actions" hasSort={false} hasFilter={false}/> 
                </div>

                {/* Table Data Rows */}
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
    );
};

export default Users;
