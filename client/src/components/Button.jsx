import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variantStyles = {
  primary:
    'bg-primary-600 text-white shadow-soft hover:bg-primary-500 hover:shadow-elevated',
  secondary:
    'bg-slate-800 text-slate-100 shadow-soft hover:bg-slate-700 hover:shadow-elevated',
  ghost:
    'bg-transparent text-slate-100 ring-1 ring-white/10 hover:bg-white/5 hover:shadow-soft',
};

const loaderVariants = {
  initial: { rotate: 0 },
  animate: { rotate: 360 },
};

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-xl border border-transparent px-5 py-3 text-sm font-semibold transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none focus:ring-2 focus:ring-primary-400/40 disabled:cursor-not-allowed disabled:opacity-60';

  return (
    <button
      type="button"
      className={`${baseClasses} ${variantStyles[variant]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <motion.span
          className="inline-flex h-4 w-4 rounded-full border-2 border-white border-t-transparent"
          variants={loaderVariants}
          initial="initial"
          animate="animate"
          transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
        />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  loading: PropTypes.bool,
  className: PropTypes.string,
};
