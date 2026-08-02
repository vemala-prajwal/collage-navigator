import PropTypes from 'prop-types';

export default function AuthField({ label, htmlFor, icon, children, hint }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground">
          {label}
        </label>
        {hint ? <span className="text-xs font-medium text-foreground-muted">{hint}</span> : null}
      </div>
      <div className="relative">
        {icon ? (
          <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-foreground-muted/60">
            {icon}
          </span>
        ) : null}
        {children}
      </div>
    </div>
  );
}

AuthField.propTypes = {
  label: PropTypes.node.isRequired,
  htmlFor: PropTypes.string,
  icon: PropTypes.node,
  children: PropTypes.node.isRequired,
  hint: PropTypes.node,
};
