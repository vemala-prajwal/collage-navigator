import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-slate-900 transition-colors duration-300 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-wide text-slate-900 transition-colors dark:text-slate-100">Campus Navigator</Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link to="/" className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">Home</Link>
            <Link to="/canteen" className="rounded-full px-3 py-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">Canteen</Link>
            <button onClick={toggleTheme} className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button onClick={() => logout(navigate)} className="rounded-full bg-emerald-600 px-3 py-2 font-medium text-white shadow-sm transition hover:bg-emerald-500">Logout</button>
            ) : (
              <Link to="/login" className="rounded-full bg-sky-600 px-3 py-2 font-medium text-white shadow-sm transition hover:bg-sky-500">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
