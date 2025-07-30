import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCSRFToken } from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [csrfToken, setCsrfToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        const token = await fetchCSRFToken();
        if (token) {
          setCsrfToken(token);
        }
      } catch (err) {
        console.error('Failed to initialize auth:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const refreshToken = async () => {
    try {
      const token = await fetchCSRFToken();
      if (token) {
        setCsrfToken(token);
        setError(null);
      }
    } catch (err) {
      console.error('Failed to refresh token:', err);
      setError(err.message);
    }
  };

  const value = {
    csrfToken,
    isLoading,
    error,
    refreshToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 