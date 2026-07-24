import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from './Navbar';
import Footer from './home/Footer';
import AmbientBackground from './AmbientBackground';
import PageTransition from './PageTransition';
import ScrollToTop from './ScrollToTop';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === '/';
  const handleLogout = () => logout(navigate);

  return (
    <div className="relative min-h-screen bg-background text-foreground transition-colors duration-300">
      <AmbientBackground />
      <ScrollToTop />
      <Navbar user={user} logout={handleLogout} />
      <main
        className={
          isHome
            ? 'relative pt-[4.5rem]'
            : 'relative mx-auto max-w-7xl px-5 pb-16 pt-[4.5rem] sm:px-8 lg:px-12'
        }
      >
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
    </div>
  );
}
