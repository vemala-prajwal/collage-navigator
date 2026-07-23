import PropTypes from 'prop-types';
import { motion, useReducedMotion } from 'framer-motion';
import { fadeUp, premiumTransition, staggerContainer } from '../lib/motion';

export function Reveal({ children, className = '', delay = 0, as = 'div' }) {
  const reduceMotion = useReducedMotion();
  const Component = motion[as] || motion.div;

  return (
    <Component
      className={className}
      initial={reduceMotion ? false : fadeUp.hidden}
      whileInView={reduceMotion ? undefined : fadeUp.visible}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ ...premiumTransition(0.55), delay }}
    >
      {children}
    </Component>
  );
}

export function RevealStagger({ children, className = '', stagger = 0.07 }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      whileInView={reduceMotion ? undefined : 'visible'}
      viewport={{ once: true, amount: 0.1 }}
      variants={staggerContainer(stagger)}
    >
      {children}
    </motion.div>
  );
}

export function RevealItem({ children, className = '' }) {
  return (
    <motion.div className={className} variants={fadeUp}>
      {children}
    </motion.div>
  );
}

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  delay: PropTypes.number,
  as: PropTypes.string,
};

RevealStagger.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  stagger: PropTypes.number,
};

RevealItem.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};
