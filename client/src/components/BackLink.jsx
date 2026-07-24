import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import PropTypes from 'prop-types';

export default function BackLink({ to = '/', label = 'Back' }) {
  return (
    <Link
      to={to}
      className="group mb-8 inline-flex items-center gap-2 text-sm font-semibold text-foreground-muted transition-colors duration-300 hover:text-foreground"
    >
      <ArrowLeft
        size={16}
        className="transition-transform duration-300 group-hover:-translate-x-0.5"
      />
      {label}
    </Link>
  );
}

BackLink.propTypes = {
  to: PropTypes.string,
  label: PropTypes.string,
};
