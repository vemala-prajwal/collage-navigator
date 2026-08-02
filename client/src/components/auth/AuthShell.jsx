import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, MessageSquareText, UtensilsCrossed } from 'lucide-react';
import RealLogo from '../RealLogo';
import HeroPreview from '../home/HeroPreview';

const VALUE_PROPS = [
  {
    icon: Compass,
    title: 'Live navigation',
    text: 'Directions between every block, building and canteen on campus.',
  },
  {
    icon: UtensilsCrossed,
    title: 'Canteen, in real time',
    text: 'See what is open and what is sold out before you walk over.',
  },
  {
    icon: MessageSquareText,
    title: 'Your feedback counts',
    text: 'Rate stalls and flag issues that affect your day-to-day.',
  },
];

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 py-10 lg:min-h-[calc(100dvh-8rem)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16 lg:py-14">
      {/* ── Brand panel (desktop only) ── */}
      <aside className="relative hidden lg:flex lg:flex-col">
        <div className="relative flex flex-1 flex-col overflow-hidden rounded-3xl border border-border/50 bg-surface/50 p-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_24px_70px_rgb(37_99_235/0.10)] backdrop-blur-xl">
          <div
            className="hero-preview-grid pointer-events-none absolute inset-0 opacity-40"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgb(var(--color-accent2)/0.16) 0%, transparent 70%)' }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full blur-3xl"
            style={{ background: 'radial-gradient(circle, rgb(var(--color-accent)/0.12) 0%, transparent 70%)' }}
            aria-hidden="true"
          />

          <div className="relative">
            <Link
              to="/"
              className="group inline-flex items-center gap-2.5 font-display text-base font-bold tracking-tight"
            >
              <span
                className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_20px_rgb(37_99_235/0.35)] transition-transform duration-300 group-hover:scale-110"
                style={{ background: 'var(--gradient-accent)' }}
              >
                <RealLogo slug="googlemaps" color="ffffff" size={18} alt="Campus Navigator logo" />
              </span>
              <span className="text-gradient">Campus Navigator</span>
            </Link>

            <h2 className="mt-10 font-display text-display-md font-extrabold leading-[1.12] tracking-tight text-foreground">
              Find your way <span className="italic text-gradient">around</span>
              <br /> campus — without the guesswork.
            </h2>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-foreground-muted">
              Live routes, canteen status and student feedback — together in one place.
            </p>

            <ul className="mt-8 space-y-5">
              {VALUE_PROPS.map(({ icon: Icon, title: propTitle, text }) => (
                <li key={propTitle} className="flex items-start gap-3.5">
                  <span className="icon-well mt-0.5 shrink-0 !p-2.5">
                    <Icon size={16} className="text-accent" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-foreground">{propTitle}</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-foreground-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Signature route preview */}
          <div className="relative mt-auto pt-10">
            <HeroPreview className="aspect-[16/10]" />
            <div className="mt-4 flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span
                  className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/60"
                  style={{ animationDuration: '2.4s' }}
                />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-success" />
              </span>
              <p className="text-xs font-medium text-foreground-muted">
                Live data — refreshed every few minutes.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Form column ── */}
      <div className="relative mx-auto w-full max-w-md lg:mx-0">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to home
        </Link>

        {/* Mobile brand */}
        <div className="mb-7 flex items-center gap-2.5 lg:hidden">
          <span
            className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.25)]"
            style={{ background: 'var(--gradient-accent)' }}
          >
            <RealLogo slug="googlemaps" color="ffffff" size={16} alt="Campus Navigator logo" />
          </span>
          <span className="text-gradient font-display text-base font-bold">Campus Navigator</span>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-border/50 bg-surface/70 p-7 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_20px_60px_rgb(15_10_40/0.06)] backdrop-blur-xl sm:p-10">
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgb(var(--color-accent)/0.5), rgb(var(--color-accent2)/0.4), transparent)',
            }}
            aria-hidden="true"
          />

          <p className="eyebrow">{eyebrow}</p>
          <h1 className="mt-4 font-display text-display-sm font-extrabold leading-tight text-foreground sm:text-display-md">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-foreground-muted sm:text-[15px]">
            {description}
          </p>

          <div className="mt-8">{children}</div>
        </section>

        {footer ? <div className="mt-6 text-center text-sm text-foreground-muted">{footer}</div> : null}
      </div>
    </div>
  );
}

AuthShell.propTypes = {
  eyebrow: PropTypes.string.isRequired,
  title: PropTypes.node.isRequired,
  description: PropTypes.node.isRequired,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
};
