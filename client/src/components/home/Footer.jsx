import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import RealLogo from '../RealLogo';

const FOOTER_LINKS = [
  { label: 'Home',       to: '/' },
  { label: 'Map Search', to: '/map-search' },
  { label: 'Canteen',    to: '/canteen' },
  { label: 'Login',      to: '/login' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer relative overflow-hidden border-t border-border/30 py-16">
      {/* Top gradient line */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{
           background: 'rgb(var(--ui-accent))',
        }}
        aria-hidden="true"
      />

      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-64 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 100%, rgb(var(--color-accent)/0.3) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="section-container relative">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          {/* Brand */}
          <div>
            <Link to="/" className="group flex items-center gap-2.5 font-display text-xl font-bold">
              <span
                className="brand-mark flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgb(109_40_217/0.35)] transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'rgb(var(--ui-accent))' }}
              >
                <RealLogo slug="googlemaps" color="ffffff" size={18} alt="Google Maps logo" />
              </span>
              <span className="text-gradient">Campus Navigator</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-foreground-muted">
              Navigate smarter. Eat faster. Speak up.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-foreground-muted transition-all duration-300 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col gap-2 border-t border-border/30 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-1.5 text-xs text-foreground-muted/60">
            <Sparkles size={12} />
            © {year} Campus Navigator. All rights reserved.
          </p>
          <p className="text-xs text-foreground-muted/60">Built for students, by students.</p>
        </div>
      </div>
    </footer>
  );
}
