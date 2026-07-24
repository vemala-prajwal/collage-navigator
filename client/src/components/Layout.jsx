import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link to="/" className="text-lg font-semibold tracking-wide">Campus Navigator</Link>
          <nav className="flex items-center gap-3 text-sm">
            <Link to="/" className="rounded px-3 py-2 hover:bg-slate-800">Home</Link>
            <Link to="/canteen" className="rounded px-3 py-2 hover:bg-slate-800">Canteen</Link>
            <button onClick={toggleTheme} className="rounded p-2 hover:bg-slate-800">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {user ? (
              <button onClick={() => logout(navigate)} className="rounded bg-emerald-600 px-3 py-2">Logout</button>
            ) : (
              <Link to="/login" className="rounded bg-sky-600 px-3 py-2">Login</Link>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
