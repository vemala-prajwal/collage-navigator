import PropTypes from 'prop-types';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageTransition } from '../lib/motion';

export default function PageTransition({ children }) {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return children;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial="initial"
        animate="animate"
        exit="exit"
        variants={pageTransition}
        className="will-change-[opacity,transform]"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
};
