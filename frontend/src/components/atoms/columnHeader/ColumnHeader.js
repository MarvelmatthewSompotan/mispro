import React from 'react';
import styles from './ColumnHeader.module.css';
import SortButton from '../SortButton';
import FilterButton from '../FilterButton';

const ColumnHeader = ({ title, hasSort = true, hasFilter = false }) => {
    // Tentukan apakah setidaknya satu aksi harus ditampilkan
    const showActions = hasSort || hasFilter;
    
    return (
        // Mengubah struktur utama untuk menyesuaikan dengan layout vertikal
        <div className={styles.columnController}>
            {/* Bagian judul (atas) */}
            <div className={styles.columnName}>
                <div className={styles.loremIpsum}>{title}</div>
            </div>
            
            <div className={`${styles.action} ${!showActions ? styles.disabledAction : ''}`}>
                {hasSort && <SortButton />}
                {hasFilter && <FilterButton />}
            </div>
        </div>
    );
};

export default ColumnHeader;
