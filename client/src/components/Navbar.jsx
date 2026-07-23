import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';

const MotionLink = motion(Link);

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Map', to: '/map-search' },
  { label: 'Canteen', to: '/canteen' },
  { label: 'Feedback', to: '/map-search', hint: 'Pick a location to review', activeMatch: false },
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

export default function Navbar({ user, logout }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const prevScrollY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);
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
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ease-premium ${
          scrolled ? 'glass-nav border-b border-border/40' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
          <Link to="/" className="group flex items-center gap-2.5 font-display text-base font-bold tracking-tight text-foreground">
            <span className="relative flex h-7 w-7 items-center justify-center rounded-lg bg-accent/15 transition-colors duration-300 group-hover:bg-accent/25">
              <span className="h-2 w-2 rounded-sm bg-accent shadow-[0_0_8px_rgb(var(--color-accent)/0.6)]" />
            </span>
            Campus Navigator
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => (
              <NavLink
                key={item.label}
                to={item.to}
                end={item.to === '/'}
                title={item.hint}
                isActive={item.activeMatch === false ? () => false : undefined}
                className="relative py-1 text-sm font-medium text-foreground-muted transition-colors duration-300 hover:text-foreground"
              >
                {({ isActive }) => (
                  <>
                    {item.label}
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-accent"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:inline-flex" />

            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <Button variant="primary" onClick={logout}>
                  Logout
                </Button>
              ) : (
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="inline-flex items-center justify-center rounded-xl border border-border bg-surface-secondary p-2 text-foreground transition-all duration-200 hover:bg-surface-elevated md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

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
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              key="mobile-menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[min(88vw,340px)] flex-col border-l border-border bg-surface px-6 py-6 shadow-elevated"
            >
              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="font-display text-lg font-bold text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  Campus Navigator
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-xl border border-border bg-surface-secondary p-2 text-foreground transition-colors hover:bg-surface-elevated"
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
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
                }}
              >
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <motion.li key={item.label} variants={itemVariants}>
                      <NavLink
                        to={item.to}
                        end={item.to === '/'}
                        isActive={item.activeMatch === false ? () => false : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `block rounded-xl px-4 py-3 text-base font-semibold transition-colors duration-200 ${
                            isActive
                              ? 'bg-accent-muted/30 text-accent'
                              : 'text-foreground-muted hover:bg-surface-secondary hover:text-foreground'
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
                className="mt-auto flex flex-col gap-3 pt-10"
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } },
                }}
              >
                <motion.div variants={itemVariants}>
                  <ThemeToggle showLabel className="w-full justify-center py-3" />
                </motion.div>
                {user ? (
                  <motion.div variants={itemVariants}>
                    <Button
                      className="w-full"
                      onClick={() => {
                        logout();
                        setMenuOpen(false);
                      }}
                    >
                      Logout
                    </Button>
                  </motion.div>
                ) : (
                  <MotionLink
                    variants={itemVariants}
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="inline-flex w-full"
                  >
                    <Button variant="secondary" className="w-full">
                      Login
                    </Button>
                  </MotionLink>
                )}
              </motion.div>
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>
    </>
  );
}
