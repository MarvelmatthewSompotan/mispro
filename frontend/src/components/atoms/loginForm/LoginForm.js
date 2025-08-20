import React, { useState } from 'react';
import Input from '../../atoms/input/Input';
import Checkbox from '../../atoms/checkbox/Checkbox';
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

    try {
      await login(form.email, form.password);
      const userData = await getMe();
      localStorage.setItem('user', JSON.stringify(userData));
      navigate('/home');
    } catch (error) {
      console.error('Login failed:', error);
      alert('Login failed. Please check your Email/Password.');
    }
  };

  return (
    <form className='login-form' onSubmit={handleSubmit}>
      <Label htmlFor='username' className='login-title'>
        Login to your account
      </Label>
      <Input
        type='text'
        placeholder='Username or Email'
        name='email'
        value={form.email}
        onChange={handleChange}
      />
      <Input
        type='password'
        placeholder='Password'
        name='password'
        value={form.password}
        onChange={handleChange}
      />
      <div className='login-form-options'>
        <Checkbox
          checked={form.staySignedIn}
          onChange={handleChange}
          name='staySignedIn'
          label='Stay signed in'
        />
      </div>
      <Button type='submit'>Login</Button>
    </form>
  );
};

export default LoginForm;
