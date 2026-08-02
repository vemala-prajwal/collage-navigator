import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const reduceMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={toggleTheme}
      whileHover={reduceMotion ? undefined : { y: -1 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-border/60 bg-surface-secondary/70 px-3 py-2 text-foreground backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-surface-elevated/80 focus:outline-none focus:ring-2 focus:ring-accent/30 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Icon track */}
      <span className="relative inline-flex h-5 w-5 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center text-amber-400"
            >
              <Moon size={18} strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: 90, scale: 0.5 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.5 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center text-accent"
            >
              <Sun size={18} strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>

      {showLabel ? (
        <span className="text-sm font-semibold">{isDark ? 'Dark' : 'Light'}</span>
      ) : null}
    </motion.button>
  );
}

ThemeToggle.propTypes = {
  className:  PropTypes.string,
  showLabel:  PropTypes.bool,
};
