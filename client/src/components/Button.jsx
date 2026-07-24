import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const variantStyles = {
  primary:
    'relative overflow-hidden text-white shadow-glow hover:shadow-glow2 focus:ring-accent/40',
  secondary:
    'border border-border/70 bg-surface-secondary/60 text-foreground backdrop-blur-sm hover:border-accent/50 hover:bg-surface-elevated/80 focus:ring-accent/30',
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
    whileHover: { scale: 1.04, y: -1 },
    whileTap:   { scale: 0.97 },
    transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
  };

  const inner = (
    <>
      {/* Gradient fill for primary */}
      {variant === 'primary' && (
        <>
          <span
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: 'var(--gradient-accent)' }}
            aria-hidden="true"
          />
          {/* Hover reverse gradient */}
          <span
            className="pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-400 hover:opacity-100"
            style={{ background: 'var(--gradient-accent-rev)' }}
            aria-hidden="true"
          />
        </>
      )}
      {loading ? (
        <span className="relative z-10 inline-flex gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70 [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70 [animation-delay:240ms]" />
        </span>
      ) : null}
      <span className="relative z-10">{children}</span>
    </>
  );

  if (Component !== 'button') {
    return (
      <motion.span {...motionProps} className="inline-flex">
        <Component className={combined} {...props}>{inner}</Component>
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
      {inner}
    </motion.button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant:  PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  loading:  PropTypes.bool,
  className: PropTypes.string,
  as: PropTypes.elementType,
};
