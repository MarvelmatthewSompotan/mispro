import React from 'react';
import styles from './TableRow.module.css';
import upenIcon from '../../../assets/edit_pen.png';
import utrashAltIcon from '../../../assets/trash_icon.png';

const TableRow = ({ userId, username, email, role, className }) => {
    // Fungsi untuk mensimulasikan klik aksi
    const handleEdit = () => console.log(`Mengedit User ID: ${userId}`);
    const handleDelete = () => console.log(`Menghapus User ID: ${userId}`);

    // Kolom Aksi (berisi tombol Edit dan Delete)
    const actionIcons = (
        <div className={styles.actionContainer}>
            {/* Tombol Edit (Ikon Pensil) */}
            <button className={styles.actionButton} onClick={handleEdit} aria-label="Edit User">
                 {/* Mengganti Inline SVG dengan tag <img> */}
                <img src={upenIcon} alt="Edit" className={styles.icon + ' ' + styles.editIcon} />
            </button>
            
            {/* Tombol Hapus (Ikon Tempat Sampah) */}
            <button className={styles.actionButton} onClick={handleDelete} aria-label="Delete User">
                {/* Mengganti Inline SVG dengan tag <img> */}
                <img src={utrashAltIcon} alt="Delete" className={styles.icon + ' ' + styles.deleteIcon} />
            </button>
        </div>
    );

    return (
        // Menerapkan className dari parent (yang idealnya berisi styles.tableLayout dari Users.module.css)
        <div className={`${styles.tableRow} ${className}`}>
            {/* 1. User ID (150px) */}
            <div className={styles.tableCell} title={userId}>{userId}</div>
            
            {/* 2. Username (2fr) */}
            <div className={styles.tableCell} title={username}>{username}</div>
            
            {/* 3. User Email (3fr) */}
            <div className={styles.tableCell} title={email}>{email}</div>
            
            {/* 4. Role (150px) */}
            <div className={styles.tableCell} title={role}>{role}</div>
            
            {/* 5. Actions (120px) */}
            <div className={styles.actionCell}>{actionIcons}</div>
        </div>
    );
};

export default TableRow;
