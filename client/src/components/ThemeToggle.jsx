import { AnimatePresence, motion } from 'framer-motion';
import { Moon, Sun } from 'lucide-react';
import PropTypes from 'prop-types';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = '', showLabel = false }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-secondary px-3 py-2 text-foreground transition-all duration-200 ease-out hover:border-accent/40 hover:bg-accent-muted/30 focus:outline-none focus:ring-2 focus:ring-accent/30 ${className}`}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <span className="relative inline-flex h-5 w-5 items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.span
              key="sun"
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Sun size={18} strokeWidth={2} />
            </motion.span>
          ) : (
            <motion.span
              key="moon"
              initial={{ opacity: 0, rotate: 90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -90, scale: 0.6 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Moon size={18} strokeWidth={2} />
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      {showLabel ? (
        <span className="text-sm font-semibold">{isDark ? 'Light' : 'Dark'}</span>
      ) : null}
    </button>
  );
}

ThemeToggle.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
};
