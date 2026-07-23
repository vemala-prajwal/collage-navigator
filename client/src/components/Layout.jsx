import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const handleLogout = () => logout(navigate);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar user={user} logout={handleLogout} theme={theme} toggleTheme={toggleTheme} />
      <main className="mx-auto max-w-6xl px-4 py-8 pt-[5.5rem]">{children}</main>
    </div>
  );
}
