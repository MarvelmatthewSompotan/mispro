import React from "react";
import "./Button.css";

// SVG untuk ikon dropdown agar tidak perlu file gambar terpisah
const DropdownIcon = () => (
  <svg
    className="dropdown-icon"
    viewBox="0 0 25 25"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.14 9.55469L13.3 14.3947C12.91 14.7847 12.28 14.7847 11.89 14.3947L7.05 9.55469"
      stroke="currentColor" // 'currentColor' akan mengambil warna dari parent (teks)
      strokeWidth="1.5"
      strokeMiterlimit="10"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Button = ({
  children,
  onClick,
  style,
  className,
  variant = "outline", // Varian default tetap 'outline'
  disabled = false,
  fullWidth = false,
  showDropdownIcon = false, // Prop baru untuk ikon
  type = "button",
  ...rest
}) => {
  const composedClassName = [
    "atom-button",
    `button--${variant}`, // Logika ini akan menangani semua varian secara dinamis
    disabled ? "is-disabled" : "",
    fullWidth ? "is-full" : "",
    showDropdownIcon ? "has-dropdown-icon" : "", // Kelas baru untuk styling dropdown
    className || "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      className={composedClassName}
      style={style}
      onClick={onClick}
      disabled={disabled}
      type={type}
      {...rest}
    >
      {children}
      {showDropdownIcon && <DropdownIcon />}{" "}
      {/* Tampilkan ikon jika prop true */}
    </button>
  );
};

export default Button;
