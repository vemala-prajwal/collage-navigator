/** Shared premium motion tokens — cubic-bezier(0.16, 1, 0.3, 1) */
export const PREMIUM_EASE = [0.16, 1, 0.3, 1];

export const premiumTransition = (duration = 0.45) => ({
  duration,
  ease: PREMIUM_EASE,
});

export const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: premiumTransition(0.55),
  },
};

export const staggerContainer = (stagger = 0.07, delayChildren = 0.06) => ({
  hidden: {},
  visible: {
    transition: { staggerChildren: stagger, delayChildren },
  },
});

export const pageTransition = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: premiumTransition(0.48),
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: premiumTransition(0.32),
  },
};
