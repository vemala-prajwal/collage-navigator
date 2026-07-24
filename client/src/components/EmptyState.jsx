import PropTypes from 'prop-types';

export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="premium-card flex flex-col items-center px-8 py-16 text-center">
      {Icon ? (
        <div className="icon-well mb-6">
          <Icon size={24} className="text-foreground-muted" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="font-display text-xl font-bold text-foreground">{title}</h3>
      {description ? (
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-foreground-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.elementType,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.node,
};
