import { motion, useReducedMotion } from 'framer-motion';

export default function AmbientBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="ambient-bg pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="ambient-bg__noise" />
      <motion.div
        className="ambient-orb ambient-orb--primary"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 30, -20, 0],
                y: [0, -25, 15, 0],
                scale: [1, 1.05, 0.98, 1],
              }
        }
        transition={{ duration: 28, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
      />
      <motion.div
        className="ambient-orb ambient-orb--secondary"
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -35, 20, 0],
                y: [0, 20, -30, 0],
                scale: [1, 1.08, 1, 1.04],
              }
        }
        transition={{ duration: 32, ease: [0.16, 1, 0.3, 1], repeat: Infinity, repeatType: 'mirror' }}
      />
      <div className="ambient-orb ambient-orb--accent" />
    </div>
  );
}
