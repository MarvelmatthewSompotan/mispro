import React, { useState } from 'react';
import Input from '../../atoms/input/Input';
import Button from '../Button';
import Label from '../Label';
import '../../styles/LoginForm.css';
import { useNavigate } from 'react-router-dom';
import { login, getMe } from '../../../services/api';

const LoginForm = () => {
  const [form, setForm] = useState({
    email: '',
    password: '',
    staySignedIn: false,
  });

  // 1. Tambahkan state untuk loading pada saat submit
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(''); // State untuk pesan error

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true); // 2. Set loading menjadi true saat proses dimulai
    setError(''); // Bersihkan error sebelumnya

    try {
      await login(form.email, form.password);
      const userData = await getMe();
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your Email/Password.'); // Set pesan error
    } finally {
      setIsLoading(false); // 5. Set loading kembali ke false setelah selesai (sukses/gagal)
    }
  };

  return (
    <form className='login-form' onSubmit={handleSubmit}>
      <Label htmlFor='username' className='login-title'>
        Login to your account
      </Label>
      {/* Tampilkan pesan error jika ada */}
      {error && <p className='login-error-message'>{error}</p>}
      <Input
        type='email'
        placeholder='Email'
        name='email'
        value={form.email}
        onChange={handleChange}
        disabled={isLoading} // 3. Nonaktifkan input saat loading
      />
      <Input
        type='password'
        placeholder='Password'
        name='password'
        value={form.password}
        onChange={handleChange}
        disabled={isLoading} // 3. Nonaktifkan input saat loading
      />
      <Button type='submit' disabled={isLoading} variant='solid'>
        {/* 4. Ubah konten tombol saat loading */}
        {isLoading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
};

export default LoginForm;
