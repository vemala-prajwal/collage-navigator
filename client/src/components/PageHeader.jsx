import PropTypes from 'prop-types';

export default function PageHeader({ eyebrow, title, description, children, className = '' }) {
  return (
    <section className={`page-header relative mb-10 p-7 sm:p-9 ${className}`}>
      <div className="page-header__grid" aria-hidden="true" />
      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          {eyebrow ? <p className="eyebrow mb-4">{eyebrow}</p> : null}
          <h1 className="font-display text-display-md font-extrabold leading-tight text-foreground">{title}</h1>
          {description ? (
            <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {children ? <div className="relative w-full shrink-0 lg:max-w-sm">{children}</div> : null}
      </div>
    </section>
  );
}

PageHeader.propTypes = {
  eyebrow: PropTypes.string,
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  children: PropTypes.node,
  className: PropTypes.string,
};
