import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchCurrentUser, loginUser, registerUser } from '../services/authApi';

const AuthContext = createContext();
const TOKEN_KEY = 'campus_auth_token';
const USER_KEY = 'campus_auth_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (!savedToken) {
        setLoading(false);
        return;
      }

      setToken(savedToken);

      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch {
          localStorage.removeItem(USER_KEY);
        }
      }

      const currentUser = await fetchCurrentUser(savedToken);
      if (currentUser) {
        const normalizedUser = {
          id: currentUser._id || currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          campus: currentUser.campus,
          role: currentUser.role,
        };
        setUser(normalizedUser);
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      } else {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
        setToken(null);
        setUser(null);
      }

      setLoading(false);
    };

    restoreSession();
  }, []);

  const persistSession = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  };

  const register = async ({ name, email, password, campus, sanUsn }) => {
    const data = await registerUser({ name, email, password, campus, sanUsn });
    const nextUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      campus: data.user.campus,
      role: data.user.role,
      sanUsn: data.user.sanUsn || '',
    };
    persistSession(data.token, nextUser);
    return nextUser;
  };

  const login = async ({ email, password }) => {
    const data = await loginUser({ email, password });
    const nextUser = {
      id: data.user.id,
      name: data.user.name,
      email: data.user.email,
      campus: data.user.campus,
      role: data.user.role,
    };
    persistSession(data.token, nextUser);
    return nextUser;
  };

  const logout = (navigate) => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (typeof navigate === 'function') {
      navigate('/login');
    }
  };

  const value = useMemo(
    () => ({ user, token, loading, register, login, logout }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
