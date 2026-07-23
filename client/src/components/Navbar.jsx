import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Map', to: '/map-search' },
  { label: 'Canteen', to: '/canteen' },
];

const overlayVariants = {
  hidden: { opacity: 0, pointerEvents: 'none' },
  visible: { opacity: 1, pointerEvents: 'auto' },
};

const menuVariants = {
  closed: { x: '100%' },
  open: { x: 0 },
};

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export default function Navbar({ user, logout, theme, toggleTheme }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 50);
      setHidden(currentY > prevScrollY.current && currentY > 120);
      if (currentY < prevScrollY.current || currentY < 80) {
        setHidden(false);
      }
      prevScrollY.current = currentY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{ y: hidden ? -110 : 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 transition-all duration-300 ${
          scrolled ? 'bg-slate-950/80 backdrop-blur-md shadow-soft' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="text-lg font-semibold tracking-wide text-white">
            Campus Navigator
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end className="relative text-sm text-slate-300 transition-colors duration-200 hover:text-white">
                {({ isActive }) => (
                  <span className="inline-flex items-center gap-2">
                    <span>{item.label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-primary-500"
                      />
                    ) : null}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="hidden rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 transition-all duration-200 hover:border-primary-500 hover:text-white md:inline-flex"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-500"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all duration-200 hover:border-primary-500"
                >
                  Login
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 transition-all duration-200 hover:bg-white/10 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.div
              key="mobile-backdrop"
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={overlayVariants}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              key="mobile-menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 z-50 h-full w-[min(88vw,340px)] bg-slate-950/98 px-6 py-6 shadow-soft"
            >
              <div className="flex items-center justify-between">
                <Link to="/" className="text-lg font-semibold tracking-wide text-white" onClick={() => setMenuOpen(false)}>
                  Campus Navigator
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-2xl border border-white/10 bg-white/5 p-2 text-slate-100 transition-all duration-200 hover:bg-white/10"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.nav
                initial="hidden"
                animate="visible"
                className="mt-10"
                variants={{
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.12 } },
                }}
              >
                <ul className="space-y-4">
                  {navItems.map((item) => (
                    <motion.li key={item.to} variants={itemVariants}>
                      <NavLink
                        to={item.to}
                        end
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-2xl px-4 py-3 text-base font-semibold transition-colors duration-200 ${
                            isActive ? 'bg-primary-600/15 text-white' : 'text-slate-300 hover:bg-white/5 hover:text-white'
                          }`
                        }
                      >
                        {item.label}
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <motion.div
                className="mt-10 flex flex-col gap-3"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.36 } },
                }}
              >
                <motion.button
                  variants={itemVariants}
                  type="button"
                  onClick={toggleTheme}
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                >
                  {theme === 'dark' ? 'Light mode' : 'Dark mode'}
                </motion.button>
                {user ? (
                  <motion.button
                    variants={itemVariants}
                    type="button"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                    className="rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-500"
                  >
                    Logout
                  </motion.button>
                ) : (
                  <motion(Link)
                    variants={itemVariants}
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-white/10"
                  >
                    Login
                  </motion(Link>
                )}
              </motion.div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
