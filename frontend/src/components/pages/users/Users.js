import React, { useCallback, useState } from 'react';
import styles from './Users.module.css';
import Button from '../../atoms/Button';
import searchIcon from '../../../assets/Search-icon.png';

const Users = () => {
    const [search, setSearch] = useState("");
    
    // Fungsi untuk klik pada tombol "New User"
    const onButton2ContainerClick = useCallback(() => {
        // Logika untuk membuat user baru akan ditempatkan di sini
        console.log("Tombol New User diklik!");
    }, []);
    
    return (
        <div className={styles.usersContainer}>
            {/* Header Title */}
            <h2 className={styles.pageTitle}>Users</h2>

            {/* Kontainer baru untuk Search Bar dan Button, agar sejajar */}
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
                    {/* searchIconImg diganti dengan div di sini untuk mempermudah positioning CSS sesuai gambar */}
                    <img src={searchIcon} alt="Search" className={styles.searchIconImg} />
                </div>

                {/* Kontainer untuk tombol */}
                <div className={styles.button2Parent}>
                    <Button 
                        variant="solid" 
                        onClick={onButton2ContainerClick}
                    >
                        New User
                    </Button>
                </div>

            </div>
            
        </div>
    );
};

export default Users;