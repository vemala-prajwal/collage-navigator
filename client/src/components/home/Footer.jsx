import { Link } from 'react-router-dom';

const FOOTER_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Map Search', to: '/map-search' },
  { label: 'Canteen', to: '/canteen' },
  { label: 'Login', to: '/login' },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/30 py-14">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/30 to-transparent" aria-hidden="true" />
      <div className="section-container">
        <div className="flex flex-col gap-10 md:flex-row md:items-center md:justify-between">
          <div>
            <Link to="/" className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-foreground">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-accent/15 transition-colors group-hover:bg-accent/25">
                <span className="h-1.5 w-1.5 rounded-sm bg-accent" />
              </span>
              Campus Navigator
            </Link>
            <p className="mt-3 text-sm text-foreground-muted">Navigate smarter. Eat faster. Speak up.</p>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.to}
                className="text-sm font-medium text-foreground-muted transition-colors duration-300 hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border/30 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-foreground-muted/60">© {year} Campus Navigator. All rights reserved.</p>
          <p className="text-xs text-foreground-muted/60">Built for students, by students.</p>
        </div>
      </div>
    </footer>
  );
}
