import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variantClasses = {
  default: 'ui-card--primary',
  glass: 'ui-card--quiet',
  elevated: 'ui-card--raised',
};

export default function Card({
  children,
  variant = 'default',
  hover = true,
  icon: Icon,
  title,
  status,
  className = '',
  ...props
}) {
  return (
    <motion.div
      whileTap={hover ? { scale: 0.975 } : undefined}
      transition={{ duration: 0.1, ease: [0.16, 1, 0.3, 1] }}
      className={`ui-card card-surface ${
        variantClasses[variant] || variantClasses.glass
      } ${hover ? 'card-interactive' : 'card-static'} ${className}`}
      {...props}
    >
      {title || Icon || status ? (
        <div className="card-header">
          <div className="card-header__main">
            {Icon ? (
              <span className="card-header__icon" aria-hidden="true">
                <Icon size={16} strokeWidth={1.8} />
              </span>
            ) : null}
            {title ? <h2 className="card-title">{title}</h2> : null}
          </div>
          {status ? <div className="card-header__status">{status}</div> : null}
        </div>
      ) : null}
      <div className="card-body">{children}</div>
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'glass', 'elevated']),
  hover: PropTypes.bool,
  icon: PropTypes.elementType,
  title: PropTypes.node,
  status: PropTypes.node,
  className: PropTypes.string,
};
