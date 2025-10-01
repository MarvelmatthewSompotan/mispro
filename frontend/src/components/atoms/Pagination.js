import React, {useCallback, useMemo } from 'react';
import styles from '../styles/Pagination.module.css'; 
import Arrow from '../../assets/Vector.png';

// Props interface untuk komponen Pagination
const Pagination = ({  
    currentPage = 1, 
    totalPages = 1, 
    onPageChange = () => {} 
}) => {
    // ... (Logika hooks lainnya sama) ...

    const isFirstPage = useMemo(() => currentPage === 1, [currentPage]);
    // eslint-disable-next-line 
    const isLastPage = useMemo(() => currentPage === totalPages, [currentPage]);

    const goToPreviousPage = useCallback(() => {
        if (currentPage > 1) {
            onPageChange(currentPage - 1);
        }
    }, [currentPage, onPageChange]);

    const goToNextPage = useCallback(() => {
        if (currentPage < totalPages) {
            onPageChange(currentPage + 1);
        }
    }, [currentPage, totalPages, onPageChange]);

    const pageInfoText = `Page ${currentPage} out of ${totalPages}`;

    return (
        // Gunakan styles dari import CSS Module
        <div className={styles.paginationControlsMinimal}> 
            {/* Teks Informasi Halaman */}
            <div className={styles.pageIndicatorMinimal}>{pageInfoText}</div>

            {/* Kontainer Tombol Paginasi */}
            <div className={styles.paginationButtonGroup}>
                
                {/* Tombol Previous */}
                <button 
                    onClick={goToPreviousPage} 
                    disabled={isFirstPage}
                    className={styles.paginationButton} // Class khusus tombol jika perlu
                    title="Previous Page"
                >
                    <img src={Arrow} alt="Previous" width={20} height={20} />
                </button>
                
                {/* Wrapper untuk Angka Halaman Aktif */}
                <div className={styles.pageNumberWrapper}>
                    <span>{currentPage}</span>
                </div>
                
                {/* Tombol Next */}
                <button 
                    onClick={goToNextPage} 
                    disabled={isLastPage}
                    className={styles.paginationButton} // Class khusus tombol jika perlu
                    title="Next Page"
                >
                    <img src={Arrow} alt="Next" width={20} height={20} style={{ transform: 'rotate(180deg)' }} />
                </button>
            </div>
        </div>
    );
};


export default Pagination;