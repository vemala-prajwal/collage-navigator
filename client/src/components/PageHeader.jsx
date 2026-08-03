import PropTypes from 'prop-types';

export default function PageHeader({ eyebrow, title, description, children, icon: Icon, status, className = '' }) {
  return (
    <section className={`card-surface page-header relative mb-10 ${className}`}>
      <span className="page-header__serial" aria-hidden="true">CN / FIELD 01</span>
      <div className="page-header__layout relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <div className="card-header page-header__header">
            <div className="card-header__main">
              {Icon ? (
                <span className="card-header__icon" aria-hidden="true">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
              ) : null}
              <div>
                {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
                <h1 className="font-display text-display-md font-extrabold leading-tight text-foreground">{title}</h1>
              </div>
            </div>
            {status ? <div className="card-header__status">{status}</div> : null}
          </div>
          {description ? (
            <p className="max-w-xl text-[0.95rem] leading-relaxed text-foreground-muted">{description}</p>
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
  icon: PropTypes.elementType,
  status: PropTypes.node,
  className: PropTypes.string,
};
