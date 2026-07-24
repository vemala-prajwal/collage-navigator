import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const statusStyles = {
  available: {
    container:
      'border-success/30 bg-success-muted/40 text-success dark:border-success/25 dark:bg-success/10 dark:text-success',
    dot: 'bg-success',
    pulse: true,
  },
  limited: {
    container:
      'border-warning/30 bg-warning-muted/40 text-warning dark:border-warning/25 dark:bg-warning/10 dark:text-warning',
    dot: 'bg-warning',
    pulse: false,
  },
  soldOut: {
    container:
      'border-error/30 bg-error-muted/40 text-error dark:border-error/25 dark:bg-error/10 dark:text-error',
    dot: 'bg-error',
    pulse: false,
  },
};

export default function Badge({ status = 'available', children, className = '', ...props }) {
  const style = statusStyles[status] || statusStyles.available;

  return (
    <motion.span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ease-out ${style.container} ${className}`}
      {...props}
    >
      <span className="relative inline-flex h-2.5 w-2.5">
        <span className={`inline-flex h-full w-full rounded-full ${style.dot}`} />
        {style.pulse ? (
          <motion.span
            className={`absolute inset-0 rounded-full ${style.dot}`}
            animate={{ scale: [1, 1.6, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: [0.16, 1, 0.3, 1] }}
          />
        ) : null}
      </span>
      {children}
    </motion.span>
  );
}

Badge.propTypes = {
  status: PropTypes.oneOf(['available', 'limited', 'soldOut']),
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
