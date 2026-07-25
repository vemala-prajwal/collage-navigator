import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './home/Footer';
import AmbientBackground from './AmbientBackground';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const handleLogout = () => logout(navigate);

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <AmbientBackground />
      <Navbar user={user} logout={handleLogout} />
      <main className={isHome ? 'relative pt-[4.5rem]' : 'relative mx-auto max-w-6xl px-4 pb-12 pt-[4.5rem] md:px-6'}>
        {children}
      </main>
      {isHome ? <Footer /> : null}
    </div>
  );
}
