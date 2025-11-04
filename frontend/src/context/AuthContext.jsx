import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    validateToken();
  }, []);

  const validateToken = async () => {
    try {
      const { data } = await api.get('/api/auth/validate-token');
      setUser({ id: data.userId, role: data.role });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password, role) => {
    const { data } = await api.post('/api/auth/signin', { email, password, role });
    setUser({ id: data.userId, role: data.role });
    return data;
  };

  const signup = async (name, email, password, role) => {
    const { data } = await api.post('/api/auth/signup', { name, email, password, role });
    setUser({ id: data.userId, role: data.role });
    return data;
  };

  const logout = async () => {
    await api.post('/api/auth/signout');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

