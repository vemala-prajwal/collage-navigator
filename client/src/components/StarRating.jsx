import { useState } from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const starVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: (index) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 },
  }),
};

export default function StarRating({ value, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  const [hoverValue, setHoverValue] = useState(0);

  const displayValue = hoverValue || value;

  return (
    <div className="flex items-center gap-2">
      {stars.map((star) => {
        const filled = displayValue >= star;
        return (
          <motion.button
            type="button"
            key={star}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            onClick={() => onChange(star)}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-surface-secondary text-foreground-muted transition-colors duration-200 hover:border-accent hover:text-accent focus:outline-none focus:ring-2 focus:ring-accent/25"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <motion.span
              initial="hidden"
              animate="visible"
              custom={star}
              variants={starVariants}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Star
                size={20}
                className={filled ? 'fill-accent text-accent' : 'text-foreground-muted/50'}
              />
            </motion.span>
          </motion.button>
        );
      })}
    </div>
  );
}

StarRating.propTypes = {
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};
