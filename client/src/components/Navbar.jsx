import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink } from 'react-router-dom';
import { AlertTriangle, House, Map, Menu, ShieldCheck, UtensilsCrossed, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import CampusLogoIcon from './CampusLogo';

const MotionLink = motion(Link);

const navItems = [
  { label: 'Home', to: '/', icon: House },
  { label: 'Map', to: '/map-search', icon: Map },
  { label: 'Canteen', to: '/canteen', icon: UtensilsCrossed },
  { label: 'Emergency', to: '/emergency-contacts', icon: AlertTriangle },
  { label: 'Admin', to: '/admin', icon: ShieldCheck },
];

const overlayVariants = {
  hidden:  { opacity: 0, pointerEvents: 'none' },
  visible: { opacity: 1, pointerEvents: 'auto' },
};

const menuVariants = {
  closed: { x: '100%' },
  open:   { x: 0 },
};

const itemVariants = {
  hidden:  { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export default function Navbar({ user, logout }) {
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [scrolled,  setScrolled]  = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const currentY = window.scrollY;
      setScrolled(currentY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'glass-nav'
            : 'border-b border-border/20 bg-background/35 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5 sm:px-8 lg:px-12">

          {/* ── Logo ── */}
          <Link
            to="/"
            aria-label="Campus Navigator home"
            className="group flex items-center gap-3 font-display text-lg font-bold tracking-tight"
          >
            <span
              className="brand-mark relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgb(109_40_217/0.35)] transition-transform duration-300 group-hover:scale-110"
              style={{ background: 'rgb(var(--ui-accent))' }}
            >
              <CampusLogoIcon />
            </span>
            <span className="text-gradient text-xl">Campus Navigator</span>
          </Link>

          {/* ── Desktop nav ── */}
          <nav className="hidden items-center gap-3 md:flex">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `nav-link relative inline-flex items-center gap-2 py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? 'bg-accent-muted/45 text-foreground'
                      : 'text-foreground-muted hover:bg-surface-secondary/70 hover:text-foreground'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} strokeWidth={1.8} aria-hidden="true" />
                    <span>{label}</span>
                    {isActive ? (
                      <motion.span
                        layoutId="nav-underline"
                        className="nav-active-pill"
                        transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      />
                    ) : null}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Actions ── */}
          <div className="flex items-center gap-3">
            <ThemeToggle className="hidden md:inline-flex" />

            <div className="hidden items-center gap-3 md:flex">
              {user ? (
                <Button variant="primary" onClick={logout}>Logout</Button>
              ) : (
                <Link to="/login">
                  <Button variant="secondary">Login</Button>
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-expanded={menuOpen}
              className="mobile-menu-trigger ui-button-secondary inline-flex items-center justify-center rounded-xl border border-border/60 bg-surface-secondary/60 p-2 text-foreground backdrop-blur-sm transition-all duration-200 hover:border-accent/40 hover:bg-surface-elevated/80 md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer ── */}
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
              className="fixed inset-0 z-40 bg-background/80 backdrop-blur-md"
              onClick={() => setMenuOpen(false)}
            />

            <motion.aside
              key="mobile-menu"
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              transition={{ type: 'spring', stiffness: 260, damping: 28 }}
              className="fixed right-0 top-0 z-50 flex h-full w-[min(88vw,340px)] flex-col border-l border-border/50 bg-surface/90 px-6 py-6 shadow-elevated backdrop-blur-2xl mobile-nav-drawer"
            >
              {/* gradient top accent bar */}
              <div className="absolute inset-x-0 top-0 h-0.5" style={{ background: 'rgb(var(--ui-accent))' }} />

              <div className="flex items-center justify-between">
                <Link
                  to="/"
                  className="flex items-center gap-2 font-display text-lg font-bold"
                  onClick={() => setMenuOpen(false)}
                >
                  <span
                    className="brand-mark flex h-8 w-8 items-center justify-center overflow-hidden rounded-lg shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
                    style={{ background: 'rgb(var(--ui-accent))' }}
                  >
                    <CampusLogoIcon />
                  </span>
                  <span className="text-gradient text-xl">Campus Nav</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setMenuOpen(false)}
                  className="mobile-menu-close ui-button-secondary rounded-xl border border-border/60 bg-surface-secondary p-2 text-foreground transition-colors hover:bg-surface-elevated"
                  aria-label="Close navigation menu"
                >
                  <X size={20} />
                </button>
              </div>

              <motion.nav
                initial="hidden"
                animate="visible"
                className="mt-10"
                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } } }}
              >
                <ul className="space-y-1.5">
                  {navItems.map(({ label, to, icon: Icon }) => (
                    <motion.li key={label} variants={itemVariants}>
                      <NavLink
                        to={to}
                        end={to === '/'}
                        onClick={() => setMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 rounded-xl px-4 py-3 text-base font-semibold transition-all duration-200 ${
                            isActive
                              ? 'bg-accent-muted text-accent'
                              : 'text-foreground-muted hover:bg-surface-secondary hover:text-foreground'
                          }`
                        }
                      >
                        <Icon size={17} strokeWidth={1.8} aria-hidden="true" />
                        <span>{label}</span>
                      </NavLink>
                    </motion.li>
                  ))}
                </ul>
              </motion.nav>

              <motion.div
                className="mt-auto flex flex-col gap-3 pt-10"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
              >
                <motion.div variants={itemVariants}>
                  <ThemeToggle showLabel className="w-full justify-center py-3" />
                </motion.div>
                {user ? (
                  <motion.div variants={itemVariants}>
                    <Button className="w-full" onClick={() => { logout(); setMenuOpen(false); }}>
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
                    <Button variant="secondary" className="w-full">Login</Button>
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
