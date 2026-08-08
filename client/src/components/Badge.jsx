import PropTypes from 'prop-types';

const statusStyles = {
  available: {
    text: 'text-success',
    dot: 'bg-success',
  },
  limited: {
    text: 'text-warning',
    dot: 'bg-warning',
  },
  soldOut: {
    text: 'text-error',
    dot: 'bg-error',
  },
};

export default function Badge({ status = 'available', children, className = '', ...props }) {
  const styleClass = `status-badge--${status}`;

  return (
    <span className={`status-badge ${styleClass} inline-flex items-center gap-2 text-xs font-medium ${className}`} {...props}>
      <span className={`status-badge__dot h-2 w-2 shrink-0 rounded-full`} aria-hidden="true" />
      <span className="status-badge__label">{children}</span>
    </span>
  );
}

Badge.propTypes = {
  status: PropTypes.oneOf(['available', 'limited', 'soldOut']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
