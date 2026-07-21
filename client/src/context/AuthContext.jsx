import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    api.get('/auth/me').then((res) => setUser(res.data.user)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const login = async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    toast.success('Signed in successfully');
    return response.data;
  };

  const register = async (payload) => {
    const response = await api.post('/auth/register', payload);
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    toast.success('Account created');
    return response.data;
  };

  const logout = (navigate) => {
    localStorage.removeItem('token');
    setUser(null);
    toast.success('Signed out');
    navigate('/');
  };

  const value = useMemo(() => ({ user, loading, login, register, logout }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
