import { Briefcase, Building2, Sparkles } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import usePageMeta from '../hooks/usePageMeta';

export default function AboutPage() {
  usePageMeta({
    title: 'About',
    description: 'Learn about the Campus Navigator project, the team behind it, and why it was built for college life.',
  });

  return (
    <div className="about-page space-y-10">
      <PageHeader
        icon={Sparkles}
        eyebrow="About"
        title="Built to make campus life feel easier."
        description="Campus Navigator blends navigation, dining, and community feedback into one student-first campus tool."
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <Card icon={Building2} title="College context">
          <p className="text-sm leading-relaxed text-foreground-muted">
            Designed for multi-building campuses where students need fast, reliable orientation between classes, services, and food options.
          </p>
        </Card>
        <Card icon={Briefcase} title="Our approach">
          <p className="text-sm leading-relaxed text-foreground-muted">
            Clean routing, consistent page experiences, and a minimal interface help students do what matters without overload.
          </p>
        </Card>
        <Card icon={Sparkles} title="What matters">
          <p className="text-sm leading-relaxed text-foreground-muted">
            Accessibility, responsiveness, and real-time campus data were the guiding principles for this refactor.
          </p>
        </Card>
      </section>

      <section className="card-surface glass-panel rounded-[2rem] border-border/40 p-8">
        <h2 className="text-2xl font-semibold text-foreground">Team & vision</h2>
        <p className="mt-4 text-base leading-7 text-foreground-muted">
          Campus Navigator is a college-first platform built by students and mentors who care about accessible campus navigation, dining convenience, and a trusted feedback loop.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Design</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Focus on clarity, motion where it helps, and a design system that fits both desktop and phone users.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">Engineering</h3>
            <p className="mt-2 text-sm leading-relaxed text-foreground-muted">Maintainable routes, lazy loading, and page metadata for SEO without changing backend APIs.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
