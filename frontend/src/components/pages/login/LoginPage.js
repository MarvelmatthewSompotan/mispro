import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '../../../services/api';
import Button from '../../atoms/Button';
// Import assets
import logoMis from '../../../assets/logo-mis-f.png';
import bgLogin from '../../../assets/bg_login.jpg';
// Elips untuk mode Login
import ellipseTop from '../../../assets/elipse1_login.svg';
import ellipseBottom from '../../../assets/elipse2_login.svg';
// Elips untuk mode Reset
import ellipseTopReset from '../../../assets/elipse3_reset.svg';
import ellipseBottomReset from '../../../assets/elipse4_reset.svg';

// --- TAMBAHKAN IMPORT IKON MATA DI SINI ---
// (Ganti nama file ini sesuai dengan file aset Anda)
import eyeClosedIcon from '../../../assets/hide.svg';
import eyeOpenIcon from '../../../assets/open.svg';
// ------------------------------------------

// Import CSS baru
import styles from './LoginPage.module.css';

const LoginPage = () => {
  // --- Logika dari LoginForm.js lama ---
  const [form, setForm] = useState({
    identifier: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [isResetMode, setIsResetMode] = useState(false);

  // --- TAMBAHKAN STATE INI ---
  const [showPassword, setShowPassword] = useState(false);
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
    setError('');

    try {
      await login(form.identifier, form.password);
      const userData = await getMe();
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your Email/Password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    console.log('Form reset disubmit dengan:', form);
    alert('Fungsi reset password belum diimplementasikan.');
    setIsLoading(false);
  };

  useEffect(() => {
    console.log('LoginPage mounted - URL:', window.location.pathname);
  }, []);

  const toggleMode = (e, mode) => {
    e.preventDefault();
    setIsResetMode((prev) => !prev);
    setError('');
    setForm({ identifier: '', password: '' });
    setShowPassword(false); // <-- TAMBAHKAN INI: Reset ikon mata
  };

  // --- TAMBAHKAN FUNGSI INI ---
  const toggleShowPassword = () => {
    setShowPassword((prev) => !prev);
  };
  // ---------------------------

  return (
    <div
      className={`${styles['login-page-new']} ${
        isResetMode ? styles['reset-mode'] : ''
      }`}
    >
      {/* Container Kiri (Form) */}
      <div
        className={styles['login-left-new']}
        key={isResetMode ? 'reset-left' : 'login-left'}
      >
        <div className={styles['login-card-wrapper']}>
          {/* ... (kode elips tidak berubah) ... */}
          <img
            src={ellipseTop}
            alt='Decorative ellipse 1'
            className={styles['login-blob-top']}
          />
          <img
            src={ellipseBottom}
            alt='Decorative ellipse 2'
            className={styles['login-blob-bottom']}
          />
          <img
            src={ellipseTopReset}
            alt='Decorative ellipse 3'
            className={styles['login-blob-top-reset']}
          />
          <img
            src={ellipseBottomReset}
            alt='Decorative ellipse 4'
            className={styles['login-blob-bottom-reset']}
          />
          {/* ------------------------------------------- */}

          <div className={styles['login-card']}>
            <img
              src={logoMis}
              alt='Logo MIS'
              className={styles['login-logo']}
            />

            <form
              onSubmit={isResetMode ? handleResetSubmit : handleSubmit}
              className={styles['login-form-new']}
            >
              <h2 className={styles['login-title-new']}>
                {isResetMode ? 'Reset your login' : 'Login to your account'}
              </h2>

              {error && (
                <p className={styles['login-error-message']}>{error}</p>
              )}

              {/* Field Username or Email */}
              <div className={styles['input-group']}>
                <input
                  type='text'
                  id='identifier'
                  name='identifier'
                  placeholder='Username or Email'
                  value={form.identifier}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
              </div>

              {/* --- MODIFIKASI FIELD PASSWORD --- */}
              <div className={styles['input-group']}>
                <input
                  type={showPassword ? 'text' : 'password'} // <-- UBAH INI
                  id='password'
                  name='password'
                  placeholder='Password'
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                />
                {/* --- TAMBAHKAN IKON INI --- */}
                <img
                  src={showPassword ? eyeOpenIcon : eyeClosedIcon}
                  alt='Toggle password visibility'
                  className={styles['password-toggle-icon']}
                  onClick={toggleShowPassword}
                />
                {/* ------------------------- */}
              </div>
              {/* --------------------------------- */}
              <a
                href='#'
                className={styles['reset-login-link']}
                onClick={(e) => toggleMode(e, isResetMode ? 'login' : 'reset')}
              >
                {isResetMode ? 'Login' : 'Reset login'}
              </a>

              <div className={styles['button-container']}>
                <Button type='submit' variant='solid' disabled={isLoading}>
                  {isLoading
                    ? 'Processing...'
                    : isResetMode
                    ? 'Reset'
                    : 'Login'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Container Kanan (Gambar) */}
      <div className={styles['login-right-new']}>
        <img
          src={bgLogin}
          alt='Students'
          className={styles['login-illustration-new']}
        />
        <div className={styles['login-image-overlay']}></div>
      </div>
    </div>
  );
};

export default LoginPage;
