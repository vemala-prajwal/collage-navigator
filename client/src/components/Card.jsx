import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variantClasses = {
  default: '',
  glass: 'border-border/40 bg-surface/60 backdrop-blur-xl',
  elevated: 'border-border/50 bg-surface-elevated/80 shadow-soft',
};

export default function Card({ children, variant = 'default', hover = true, className = '', ...props }) {
  const motionProps = hover
    ? {
        whileHover: {
          y: -6,
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
        },
      }
    : {};

  const isPremium = variant === 'default';

  return (
    <motion.div
      {...motionProps}
      className={`relative overflow-hidden rounded-2xl border p-6 transition-all duration-500 ease-premium ${
        isPremium ? 'premium-card' : `border ${variantClasses[variant] || variantClasses.glass}`
      } ${className}`}
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
