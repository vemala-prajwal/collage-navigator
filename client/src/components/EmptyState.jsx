import PropTypes from 'prop-types';

export default function EmptyState({ icon: Icon, title, description, action, className = '' }) {
  return (
    <div className={`card-surface premium-card empty-state text-center ${className}`}>
      <div className="card-header justify-center">
        <div className="card-header__main">
          {Icon ? (
            <span className="card-header__icon" aria-hidden="true">
              <Icon size={16} strokeWidth={1.8} />
            </span>
          ) : null}
          <h3 className="card-title">{title}</h3>
        </div>
      </div>
      <div className="card-body items-center">
        {description ? <p className="max-w-sm text-sm leading-relaxed text-foreground-muted">{description}</p> : null}
        {action ? <div>{action}</div> : null}
      </div>
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};
