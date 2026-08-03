/** Shared precision motion tokens — cubic-bezier(0.16, 1, 0.3, 1) */
export const PREMIUM_EASE = [0.16, 1, 0.3, 1];

export const premiumTransition = (duration = 0.22) => ({
  duration,
  ease: PREMIUM_EASE,
});

export const fadeUp = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: premiumTransition(0.24),
  },
};

export const staggerContainer = (stagger = 0.07, delayChildren = 0.06) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const pageTransition = {
  initial: { opacity: 0, y: 8 },
  animate: {
    opacity: 1,
    y: 0,
    transition: premiumTransition(0.24),
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: premiumTransition(0.18),
  },
};

export const scaleFade = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: premiumTransition(0.24),
  },
};

export const slideUp = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: premiumTransition(0.28),
  },
};
