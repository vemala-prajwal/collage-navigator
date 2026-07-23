import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variantClasses = {
  default: 'border-border bg-surface shadow-card',
  glass: 'border-border/70 bg-surface/85 shadow-card backdrop-blur-md',
  elevated: 'border-border bg-surface-elevated shadow-soft',
};

export default function Card({ children, variant = 'default', hover = true, className = '', ...props }) {
  const motionProps = hover
    ? {
        whileHover: { y: -4, transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] } },
      }
    : {};

  return (
    <motion.div
      {...motionProps}
      className={`rounded-xl border p-6 transition-shadow duration-200 ease-out hover:shadow-elevated ${variantClasses[variant] || variantClasses.default} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'glass', 'elevated']),
  hover: PropTypes.bool,
  className: PropTypes.string,
};
