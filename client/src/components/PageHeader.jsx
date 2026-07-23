import PropTypes from 'prop-types';

export default function PageHeader({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`relative mb-12 overflow-hidden rounded-2xl border border-border/40 bg-surface-secondary/30 p-8 backdrop-blur-sm sm:p-10 ${className}`}>
      <div className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-accent/8 blur-3xl" aria-hidden="true" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="eyebrow mb-5">{eyebrow}</p> : null}
          <h1 className="font-display text-display-md font-extrabold leading-tight text-foreground">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-xl text-base leading-relaxed text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {children ? <div className="relative w-full shrink-0 lg:max-w-md">{children}</div> : null}
      </div>
    </section>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};
