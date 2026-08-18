import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ChevronRight } from 'lucide-react';
import { fadeUp } from '../lib/motion';

export default function StepFlow({ steps }) {
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const activeStep = steps[activeStepIndex] || steps[0];

  return (
    <div className="step-flow-wrapper space-y-12">
      {/* ── Desktop Two-Column View (Stepper + Visual Preview) ── */}
      <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
        {/* Left Column: Timeline Stepper (7 cols) */}
        <div className="relative lg:col-span-7 space-y-4">
          {/* Vertical connecting line */}
          <div className="stepper-line hidden sm:block" aria-hidden="true" />

          {steps.map((step, index) => {
            const isActive = activeStepIndex === index;
            const StepIcon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial="hidden"
                whileInView="visible"
                whileTap={{ scale: 0.975 }}
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                onClick={() => setActiveStepIndex(index)}
                className={`relative flex flex-col sm:flex-row items-start gap-4 rounded-2xl p-6 transition-all duration-300 cursor-pointer ${
                  isActive
                    ? 'bg-surface-secondary/90 border border-accent/40 shadow-glow'
                    : 'card-surface hover:bg-surface-secondary/40 border border-border/40'
                }`}
              >
                {/* Step indicator badge */}
                <div className="relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-surface-elevated border border-border/60 text-foreground font-display font-bold shadow-soft transition-transform duration-300 group-hover:scale-105">
                  {isActive ? (
                    <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white">
                      <StepIcon size={20} />
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-sm text-foreground-muted">
                      <span className="text-xs uppercase tracking-wider">0{index + 1}</span>
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold uppercase tracking-widest text-accent">
                      Step {index + 1}
                    </span>
                    {step.badge && (
                      <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent border border-accent/20">
                        {step.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg font-bold text-foreground font-display flex items-center justify-between">
                    <span>{step.title}</span>
                    <ChevronRight
                      size={18}
                      className={`transition-transform duration-300 text-accent ${
                        isActive ? 'rotate-90 text-accent2' : 'opacity-40'
                      }`}
                    />
                  </h3>

                  <p className="text-sm leading-relaxed text-foreground-muted">
                    {step.description}
                  </p>

                  <div className="pt-2">
                    <Link
                      to={step.to}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-2 text-xs font-semibold text-accent hover:text-accent-strong transition-colors"
                    >
                      <span>{step.action}</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Right Column: Dynamic Visual Mockup / Feature Spotlight (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <div className="card-surface glass-panel rounded-3xl border border-border/50 p-6 shadow-elevated overflow-hidden">
            <div className="flex items-center justify-between border-b border-border/40 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs font-mono text-foreground-muted uppercase tracking-wider">
                Step 0{activeStepIndex + 1} Preview
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeStepIndex}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.25 }}
                className="space-y-6"
              >
                {/* Visual Graphic Element */}
                <div className="relative rounded-2xl bg-gradient-to-br from-surface-secondary via-background to-surface-elevated p-6 border border-border/40 overflow-hidden text-center min-h-[220px] flex flex-col items-center justify-center">
                  <div className="absolute inset-0 bg-hero-mesh opacity-30 pointer-events-none" />
                  
                  <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-accent2 text-white shadow-glow mb-4">
                    {activeStep.icon && <activeStep.icon size={32} />}
                  </div>

                  <h4 className="relative z-10 font-display text-lg font-bold text-foreground">
                    {activeStep.title}
                  </h4>
                  <p className="relative z-10 text-xs text-foreground-muted mt-1 max-w-xs">
                    {activeStep.description}
                  </p>
                </div>

                {/* Highlights List */}
                <div className="space-y-2.5">
                  <span className="text-xs font-semibold uppercase tracking-wider text-foreground-muted">
                    Key Features:
                  </span>
                  {(activeStep.highlights || [
                    'Instant live response',
                    'Mobile & Desktop optimized',
                    'Real-time campus sync',
                  ]).map((item) => (
                    <div key={item} className="flex items-center gap-2.5 text-xs text-foreground font-medium">
                      <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  to={activeStep.to}
                  className="btn-gradient flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white shadow-soft"
                >
                  <span>Try {activeStep.action}</span>
                  <ArrowRight size={16} />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
