import { motion } from 'framer-motion';
import { BookOpenCheck, Compass, ShieldCheck, Sparkles, Users } from 'lucide-react';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import { fadeUp, staggerContainer } from '../lib/motion';
import usePageMeta from '../hooks/usePageMeta';

const VALUES = [
  {
    title: 'Student-first experience',
    description: 'Every workflow is designed around what students need in the moment: quick search, reliable routes, and less campus friction.',
    icon: Users,
  },
  {
    title: 'Accurate location data',
    description: 'Buildings and facilities are mapped with clear labels, so users can find lecture halls, offices, and services quickly.',
    icon: Compass,
  },
  {
    title: 'Transparent feedback loop',
    description: 'Community ratings and comments help highlight what is working and what can be improved across the campus.',
    icon: ShieldCheck,
  },
];

export default function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'Learn about Campus Navigator, its mission, and how it helps students find locations, dining updates, and trusted campus feedback.',
  });

  return (
    <div className="about-page space-y-10">
      <PageHeader
        icon={BookOpenCheck}
        eyebrow="About Campus Navigator"
        title="Built to make every campus day simpler."
        description="Campus Navigator combines location search, route guidance, canteen updates, and student feedback into one focused platform."
        status={<span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"><Sparkles size={12} /> Student project</span>}
      />

      <section className="section-container">
        <div className="card-surface rounded-3xl border border-border/40 p-6 shadow-elevated sm:p-8">
          <p className="text-sm leading-relaxed text-foreground-muted sm:text-base">
            The goal of this project is straightforward: reduce confusion around campus movement and improve daily decision-making with practical, real-time information.
            Instead of switching between disconnected tools, students can search locations, inspect details, and share useful feedback from one place.
          </p>
        </div>
      </section>

      <section className="section-container">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={staggerContainer(0.08, 0.05)}
          className="grid gap-4 md:grid-cols-3"
        >
          {VALUES.map((item) => (
            <motion.div key={item.title} variants={fadeUp}>
              <Card icon={item.icon} title={item.title} className="h-full">
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">{item.description}</p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>
    </div>
  );
}
