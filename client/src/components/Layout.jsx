import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = () => logout(navigate);

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar user={user} logout={handleLogout} />
      <main className="mx-auto max-w-6xl px-4 pb-12 pt-[5.25rem] md:px-6">{children}</main>
    </div>
  );
}
