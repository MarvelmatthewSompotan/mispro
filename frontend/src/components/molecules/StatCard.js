import React from 'react';
import iconPeopleSolid from '../../assets/icon_people_solid.svg';
import iconPeopleRed from '../../assets/icon_people_red.svg';
import iconPeopleBlue from '../../assets/icon_people_blue.svg';
import iconPeopleYellow from '../../assets/icon_people_yellow.svg';
import cardButtonSolid from '../../assets/card_button_solid.svg';
import cardButtonRed from '../../assets/card_button_red.svg';
import cardButtonBlue from '../../assets/card_button_blue.svg';
import cardButtonYellow from '../../assets/card_button_yellow.svg';
import '../styles/StatCard.css';

/**
 * Menampilkan StatCard.
 * Props:
 * - ... (props lainnya)
 * - onClick: (Opsional) Fungsi yang akan dipanggil saat kartu diklik.
 * - style: (Opsional) Objek style inline.
 */
// Tambahkan 'style' ke daftar props
const StatCard = ({ value, label, variant, footerText, onClick, style }) => {
  
  // ... (Logika penentuan kelas varian dan ikon tetap sama)
  let variantClass;
  if (variant === 'gradient') {
    variantClass = 'gradient';
  } else if (variant === 'red') {
    variantClass = 'red';
  } else if (variant === 'blue') {
    variantClass = 'blue';
  } else if (variant === 'yellow') {
    variantClass = 'yellow';
  } else {
    variantClass = 'white'; // Default
  }

  // Tentukan icon berdasarkan variant
  let headerIcon, valueIcon;
  if (variant === 'red') {
    headerIcon = cardButtonRed;
    valueIcon = iconPeopleRed;
  } else if (variant === 'blue') {
    headerIcon = cardButtonBlue;
    valueIcon = iconPeopleBlue;
  } else if (variant === 'yellow') {
    headerIcon = cardButtonYellow;
    valueIcon = iconPeopleYellow;
  } else {
    headerIcon = cardButtonSolid;
    valueIcon = iconPeopleSolid;
  }

  // Tambahkan 'clickable' class jika prop onClick ada
  const clickableClass = onClick ? 'clickable' : '';

  return (
    <div 
      className={`stat-card ${variantClass} ${clickableClass}`}
      onClick={onClick}
      style={style} // <-- TAMBAHKAN PROPERTI style DI SINI
    >
      <div className="card-main">
        <div className="card-header">
          <div className="card-label">{label}</div>
          <img src={headerIcon} alt="Card Button" className="card-icon-header" />
        </div>
        <div className="card-value-row">
          <div className="card-value">{value}</div>
          <img src={valueIcon} alt="People Icon" className="card-icon-value" />
        </div>
      </div>
      {/* Footer hanya akan tampil jika footerText diberikan */}
      {footerText && (
        <div className="card-footer">{footerText}</div>
      )}
    </div>
  );
};

export default StatCard;