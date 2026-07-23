import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function Card({ children, className = '', ...props }) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 26px 90px rgba(15, 23, 42, 0.18)' }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`rounded-xl border border-white/10 bg-slate-950/75 p-6 shadow-soft backdrop-blur-sm ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
