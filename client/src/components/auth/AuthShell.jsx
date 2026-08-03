import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { ArrowLeft, LogIn } from 'lucide-react';
import RealLogo from '../RealLogo';

export default function AuthShell({ eyebrow, title, description, children, footer }) {
  return (
    <div className="auth-page-shell relative mx-auto w-full py-10 sm:py-14">
      <div className="auth-form-column relative mx-auto w-full max-w-[30rem]">
        <div className="auth-identity mb-8">
          <Link to="/" className="group inline-flex items-center gap-3">
            <span
              className="brand-mark auth-mark flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl shadow-[0_5px_12px_rgb(var(--ui-accent)/0.18)] transition-transform duration-160 group-hover:-translate-y-0.5"
              style={{ background: 'rgb(var(--ui-accent))' }}
            >
              <RealLogo slug="googlemaps" color="ffffff" size={21} alt="Campus Navigator logo" />
            </span>
            <span className="text-gradient font-display text-lg font-bold tracking-tight">Campus Navigator</span>
          </Link>
          <span className="auth-identity__rule" aria-hidden="true" />
          <span className="auth-identity__context">Campus navigation / Account access</span>
        </div>

        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} strokeWidth={2} />
          Back to home
        </Link>

        <section className="card-surface auth-card">
          <div className="card-header auth-card__header">
            <div className="card-header__main">
              <span className="card-header__icon" aria-hidden="true">
                <LogIn size={16} strokeWidth={1.8} />
              </span>
              <div>
                <p className="eyebrow">{eyebrow}</p>
                <h1 className="card-title auth-card__title">{title}</h1>
              </div>
            </div>
          </div>
          <div className="card-body auth-card__body">
            <p className="text-sm leading-relaxed text-foreground-muted sm:text-[15px]">{description}</p>
            <div>{children}</div>
          </div>
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
