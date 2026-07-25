import { createContext, useContext, useMemo, useState } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const login = (userData) => {
    setUser(userData ?? { name: 'Campus User' });
  };

  const logout = (navigate) => {
    setUser(null);
    if (typeof navigate === 'function') {
      navigate('/login');
    }
  };

  const value = useMemo(
    () => ({ user, login, logout }),
    [user]
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
