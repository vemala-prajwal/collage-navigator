import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';

const variantStyles = {
  primary: 'ui-button-primary text-white focus:ring-accent/40',
  secondary:
    'ui-button-secondary focus:ring-accent/30',
  ghost:
    'ui-button-ghost focus:ring-accent/30',
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
  const reduceMotion = useReducedMotion();
  const baseClasses =
    'ui-button inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300 ease-premium focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60';

  const combined = `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  const motionProps = reduceMotion
    ? {}
    : {
        whileHover: { y: -1 },
        whileTap: { scale: 0.985 },
         transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] },
      };

  const inner = (
    <>
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
