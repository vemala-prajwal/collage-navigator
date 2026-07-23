import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import PropTypes from 'prop-types';

const starVariants = {
  hidden: { scale: 0.6, opacity: 0 },
  visible: (index) => ({
    scale: 1,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.05 },
  }),
};

export default function StarRating({ value, onChange }) {
  const [hoverValue, setHoverValue] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stars = useMemo(() => [1, 2, 3, 4, 5], []);
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
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-900 text-slate-400 transition-colors duration-200 hover:border-primary-400 hover:text-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400/25"
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
          >
            <motion.span
              initial="hidden"
              animate={mounted ? 'visible' : 'hidden'}
              custom={star}
              variants={starVariants}
              className="absolute inset-0 flex items-center justify-center"
            >
              <Star size={20} className={filled ? 'text-primary-300' : 'text-slate-600'} />
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
