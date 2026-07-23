import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Reveal } from '../Reveal';
import { premiumTransition } from '../../lib/motion';

const FAQ_ITEMS = [
  {
    question: 'How accurate is the campus map?',
    answer:
      'Every location is verified against official campus records and updated when buildings change. Routes reflect actual walkable paths between mapped points.',
  },
  {
    question: 'How often is canteen status updated?',
    answer:
      'Canteen menu availability and queue status refresh every two minutes during operating hours, so you always see current data before heading over.',
  },
  {
    question: 'Can I submit feedback without an account?',
    answer:
      'Browsing and navigation are open to everyone. Submitting ratings and detailed feedback requires a free student account to keep reviews verified.',
  },
  {
    question: 'Does it work on mobile?',
    answer:
      'Yes — Campus Navigator is fully responsive. Search, navigate, check canteen status, and leave feedback from any phone or tablet.',
  },
  {
    question: 'How do I find a specific room?',
    answer:
      'Use Map Search and type the room number, building name, or facility type. Results filter instantly and link directly to location details with feedback options.',
  },
];

function FaqItem({ item, isOpen, onToggle }) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="border-b border-border/30 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className={`flex w-full items-center justify-between gap-6 py-6 text-left transition-colors duration-300 ${
          isOpen ? 'text-accent' : 'hover:text-accent'
        }`}
        aria-expanded={isOpen}
      >
        <span className="font-display text-lg font-bold sm:text-xl">{item.question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0, backgroundColor: isOpen ? 'rgb(var(--color-accent) / 0.15)' : 'transparent' }}
          transition={premiumTransition(0.3)}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/50"
        >
          <Plus size={18} strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={reduceMotion ? false : { height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={premiumTransition(0.35)}
            className="overflow-hidden"
          >
            <p className="pb-7 pr-12 text-base leading-relaxed text-foreground-muted">{item.answer}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="section-gap border-t border-border/30">
      <div className="section-container">
        <div className="grid gap-16 lg:grid-cols-[1fr_1.4fr] lg:gap-24">
          <Reveal>
            <p className="eyebrow mb-6">FAQ</p>
            <h2 className="display-headline">
              Common
              <br />
              <span className="italic text-foreground-muted">questions.</span>
            </h2>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="premium-card divide-y divide-border/30 px-6 sm:px-8">
              {FAQ_ITEMS.map((item, index) => (
                <FaqItem
                  key={item.question}
                  item={item}
                  isOpen={openIndex === index}
                  onToggle={() => setOpenIndex(openIndex === index ? -1 : index)}
                />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
