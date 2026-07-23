import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const statusStyles = {
  available: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#a7f3d0',
    borderColor: 'rgba(16, 185, 129, 0.24)',
    dotColor: '#34d399',
  },
  limited: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    color: '#fcd34d',
    borderColor: 'rgba(245, 158, 11, 0.24)',
    dotColor: '#fbbf24',
  },
  soldOut: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    color: '#fecaca',
    borderColor: 'rgba(239, 68, 68, 0.24)',
    dotColor: '#f87171',
  },
};

export default function Badge({ status = 'available', children, className = '', ...props }) {
  const style = statusStyles[status] || statusStyles.available;
  const hasPulse = status === 'available';

  return (
    <motion.span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${className}`}
      animate={{
        backgroundColor: style.backgroundColor,
        color: style.color,
        borderColor: style.borderColor,
      }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      <span
        className="inline-flex h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: style.dotColor, opacity: hasPulse ? 1 : 0.75 }}
      >
        {hasPulse ? (
          <motion.span
            className="absolute inset-0 rounded-full"
            animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
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
