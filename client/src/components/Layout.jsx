import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <header className="border-b border-border bg-surface/95 backdrop-blur-sm transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6">
          <Link to="/" className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Campus Navigator
          </Link>
          <nav className="flex items-center gap-3 text-sm sm:gap-4">
            <Link
              to="/"
              className="rounded px-3 py-2 text-foreground/70 transition hover:bg-background-secondary hover:text-foreground"
            >
              Home
            </Link>
            <Link
              to="/canteen"
              className="rounded px-3 py-2 text-foreground/70 transition hover:bg-background-secondary hover:text-foreground"
            >
              Canteen
            </Link>
            <button
              onClick={toggleTheme}
              className="rounded border border-border bg-surface-secondary px-3 py-2 text-foreground transition hover:bg-accent/10"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button onClick={() => logout(navigate)} className="rounded bg-accent px-3 py-2 text-white transition hover:bg-accent-strong">
                Logout
              </button>
            ) : (
              <Link to="/login" className="rounded bg-accent px-3 py-2 text-white transition hover:bg-accent-strong">
                Login
              </Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
