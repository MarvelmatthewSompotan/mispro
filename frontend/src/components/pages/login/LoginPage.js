import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { login, getMe } from "../../../services/api"; 
import Button from "../../atoms/Button"; 
// Import assets - sesuaikan path ini dengan struktur folder Anda
import logoMis from "../../../assets/logo-mis-f.png"; 
import bgLogin from "../../../assets/bg_login.jpg"; 
// Elips untuk mode Login
import ellipseTop from "../../../assets/elipse1_login.svg"; 
import ellipseBottom from "../../../assets/elipse2_login.svg"; 
// Elips untuk mode Reset (Asumsi nama file dari Anda)
import ellipseTopReset from "../../../assets/elipse3_reset.svg"; 
import ellipseBottomReset from "../../../assets/elipse4_reset.svg"; 

// Import CSS baru
import styles from "./LoginPage.module.css"; // <-- UBAH CARA IMPORT

const LoginPage = () => {
  // --- Logika dari LoginForm.js lama ---
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // --- TAMBAHKAN STATE INI ---
  const [isResetMode, setIsResetMode] = useState(false);
  // -------------------------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(form.email, form.password);
      const userData = await getMe();
      localStorage.setItem("user", JSON.stringify(userData));
      navigate("/home");
    } catch (error) {
      console.error("Login failed:", error);
      setError("Login failed. Please check your Email/Password.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    console.log("Form reset disubmit dengan:", form);
    alert("Fungsi reset password belum diimplementasikan.");
    setIsLoading(false);
  };

  useEffect(() => {
    console.log("LoginPage mounted - URL:", window.location.pathname);
  }, []);

  // --- UBAH INI ---
  // Fungsi untuk beralih mode
  const toggleMode = (e, mode) => {
    e.preventDefault();

    setIsResetMode((prev) => !prev);
    setError("");
    setForm({ email: "", password: "" });
  };
  // ----------------

  return (
    // --- UBAH CLASSNAME INI ---
    <div
      className={`${styles["login-page-new"]} ${
        isResetMode ? styles["reset-mode"] : ""
      }`}
    >
      {/* Container Kiri (Form) */}
      <div
        className={styles["login-left-new"]}
        key={isResetMode ? "reset-left" : "login-left"}
      >
        <div className={styles["login-card-wrapper"]}>
          {/* Elips Mode Login */}
          <img
            src={ellipseTop}
            alt="Decorative ellipse 1"
            className={styles["login-blob-top"]}
          />
          <img
            src={ellipseBottom}
            alt="Decorative ellipse 2"
            className={styles["login-blob-bottom"]}
          />

          {/* Elips Mode Reset */}
          <img
            src={ellipseTopReset}
            alt="Decorative ellipse 3"
            className={styles["login-blob-top-reset"]}
          />
          <img
            src={ellipseBottomReset}
            alt="Decorative ellipse 4"
            className={styles["login-blob-bottom-reset"]}
          />

          {/* ------------------------------------------- */}

          <div className={styles["login-card"]}>
            <img
              src={logoMis}
              alt="Logo MIS"
              className={styles["login-logo"]}
            />

            {/* --- UBAH ONSUBMIT --- */}
            <form
              onSubmit={isResetMode ? handleResetSubmit : handleSubmit}
              className={styles["login-form-new"]}
            >
              {/* --- UBAH JUDUL --- */}
              <h2 className={styles["login-title-new"]}>
                {isResetMode ? "Reset your login" : "Login to your account"}
              </h2>
              {/* -------------------- */}

              {error && (
                <p className={styles["login-error-message"]}>{error}</p>
              )}

              {/* Field Username or Email */}
              <div className={styles["input-group"]}>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="Username or Email" /* <-- UBAH PLACEHOLDER */
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* Field Password */}
              <div className={styles["input-group"]}>
                <input
                  type="password"
                  id="password"
                  name="password"
                  placeholder="Password" /* <-- UBAH PLACEHOLDER */
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              <a
                href="#"
                className={styles["reset-login-link"]}
                onClick={(e) => toggleMode(e, isResetMode ? "login" : "reset")}
              >
                {isResetMode ? "Login" : "Reset login"}
              </a>

              <div className={styles["button-container"]}>
                <Button type="submit" variant="solid" disabled={isLoading}>
                  {isLoading
                    ? "Processing..."
                    : isResetMode
                    ? "Reset"
                    : "Login"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Container Kanan (Gambar) */}
      <div className={styles["login-right-new"]}>
        <img
          src={bgLogin}
          alt="Students"
          className={styles["login-illustration-new"]}
        />
        <div className={styles["login-image-overlay"]}></div>{" "}
        {/* Div overlay dipindahkan ke sini */}
      </div>
    </div>
  );
};

export default LoginPage;
