import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import PropTypes from 'prop-types';
import { fadeUp, staggerContainer } from '../lib/motion';

export default function StepFlow({ steps }) {
  const safeSteps = Array.isArray(steps) ? steps : [];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={staggerContainer(0.08, 0.05)}
      className="grid gap-4 sm:gap-5"
    >
      {safeSteps.map((step, index) => {
        const Icon = step.icon;

        return (
          <motion.article
            key={`${step.title}-${index}`}
            variants={fadeUp}
            className="card-surface rounded-2xl border border-border/40 bg-surface/60 p-5 shadow-soft transition-all duration-300 hover:border-accent/45 hover:shadow-elevated sm:p-6"
          >
            <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-start">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-accent/30 bg-accent/10 text-accent">
                    {Icon ? <Icon size={18} /> : null}
                  </span>
                  <div>
                    {step.badge ? <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">{step.badge}</p> : null}
                    <h3 className="font-display text-lg font-bold text-foreground">{step.title}</h3>
                  </div>
                </div>

                {step.description ? (
                  <p className="text-sm leading-relaxed text-foreground-muted">{step.description}</p>
                ) : null}

                {Array.isArray(step.highlights) && step.highlights.length > 0 ? (
                  <ul className="grid gap-1.5 text-xs text-foreground-muted sm:grid-cols-2">
                    {step.highlights.map((item) => (
                      <li key={item} className="rounded-lg border border-border/30 bg-surface-secondary/40 px-3 py-2">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>

              {step.action && step.to ? (
                <div className="lg:pl-4">
                  <Link
                    to={step.to}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-accent/35 bg-accent/10 px-4 py-2 text-xs font-semibold text-accent transition-colors hover:bg-accent hover:text-white"
                  >
                    <span>{step.action}</span>
                    <ArrowRight size={14} />
                  </Link>
                </div>
              ) : null}
            </div>
          </motion.article>
        );
      })}
    </motion.div>
  );
}

StepFlow.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      icon: PropTypes.elementType,
      action: PropTypes.string,
      to: PropTypes.string,
      badge: PropTypes.string,
      highlights: PropTypes.arrayOf(PropTypes.string),
    })
  ),
};
