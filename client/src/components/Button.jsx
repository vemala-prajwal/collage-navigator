import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variantStyles = {
  primary:
    'bg-accent text-on-accent shadow-glow hover:bg-accent-strong hover:brightness-110 focus:ring-accent/40',
  secondary:
    'border border-border/60 bg-surface-secondary/50 text-foreground backdrop-blur-sm hover:border-accent/30 hover:bg-surface-elevated/80 focus:ring-accent/30',
  ghost:
    'bg-transparent text-foreground ring-1 ring-border/60 hover:bg-surface-secondary/60 focus:ring-accent/30',
};

export default function Button({
  children,
  variant = 'primary',
  loading = false,
  className = '',
  type = 'button',
  as: Component = 'button',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-300 ease-premium focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60';

  const combined = `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  const motionProps = {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.97 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  };

  if (Component !== 'button') {
    return (
      <motion.span {...motionProps} className="inline-flex">
        <Component className={combined} {...props}>
          {children}
        </Component>
      </motion.span>
    );
  }

  return (
    <motion.button
      type={type}
      className={combined}
      disabled={loading || props.disabled}
      {...motionProps}
      {...props}
    >
      {loading ? (
        <span className="inline-flex gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70 [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70 [animation-delay:240ms]" />
        </span>
      ) : null}
      <span>{children}</span>
    </motion.button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  loading: PropTypes.bool,
  className: PropTypes.string,
  as: PropTypes.elementType,
};
