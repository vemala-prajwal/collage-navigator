import PropTypes from 'prop-types';

const variantStyles = {
  primary:
    'bg-accent text-on-accent shadow-card hover:bg-accent-strong hover:shadow-elevated focus:ring-accent/40',
  secondary:
    'border border-border bg-surface-secondary text-foreground shadow-card hover:border-accent/30 hover:bg-surface-elevated hover:shadow-soft focus:ring-accent/30',
  ghost:
    'bg-transparent text-foreground ring-1 ring-border hover:bg-surface-secondary hover:shadow-card focus:ring-accent/30',
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
    'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60';

  const combined = `${baseClasses} ${variantStyles[variant] || variantStyles.primary} ${className}`;

  if (Component !== 'button') {
    return (
      <Component className={combined} {...props}>
        {children}
      </Component>
    );
  }

  return (
    <button type={type} className={combined} disabled={loading || props.disabled} {...props}>
      {loading ? (
        <span className="inline-flex gap-1" aria-hidden="true">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70 [animation-delay:120ms]" />
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current opacity-70 [animation-delay:240ms]" />
        </span>
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
  as: PropTypes.elementType,
};
