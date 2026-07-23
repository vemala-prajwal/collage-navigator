import PropTypes from 'prop-types';

export default function PageHeader({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`glass-panel mb-8 rounded-3xl p-8 sm:p-10 ${className}`}>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="eyebrow mb-3">{eyebrow}</p> : null}
          <h1 className="font-display text-display-lg font-extrabold text-foreground">{title}</h1>
          {description ? (
            <p className="mt-4 text-base leading-7 text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {children ? <div className="w-full shrink-0 lg:max-w-md">{children}</div> : null}
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
