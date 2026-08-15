import { Link } from 'react-router-dom';
import Hero from '../components/Hero';
import Card from '../components/Card';
import Badge from '../components/Badge';
import usePageMeta from '../hooks/usePageMeta';

const QUICK_LINKS = [
  {
    title: 'Search & Navigate',
    description: 'Find buildings, rooms, and live campus routes in one place.',
    to: '/navigate',
    status: 'Live map',
  },
  {
    title: 'Canteen Status',
    description: 'See what’s available and avoid long queues before you go.',
    to: '/canteen',
    status: 'Real-time updates',
  },
  {
    title: 'Feedback',
    description: 'Share ratings and suggestions to improve campus facilities.',
    to: '/feedback',
    status: 'Community-first',
  },
  {
    title: 'How to Use',
    description: 'Get oriented with the app workflow in under a minute.',
    to: '/how-to-use',
    status: 'Step-by-step',
  },
];

export default function HomePage() {
  usePageMeta({
    title: 'Home',
    description: 'Campus Navigator home page for quick access to campus search, navigation, canteen status, and feedback.',
  });

  return (
    <div className="home-page space-y-16">
      <Hero />

      <section className="section-gap section-container">
        <div className="grid gap-6 lg:grid-cols-2">
          {QUICK_LINKS.map((link) => (
            <Link key={link.title} to={link.to} className="group">
              <Card hover className="h-full" title={link.title} status={<Badge status="available">{link.status}</Badge>}>
                <p className="text-sm leading-relaxed text-foreground-muted">{link.description}</p>
                <div className="mt-6 text-sm font-semibold text-accent transition group-hover:text-foreground">Explore →</div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-gap section-container grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="space-y-6">
          <p className="eyebrow">Why Campus Navigator</p>
          <h2 className="text-4xl font-display font-bold leading-tight text-foreground">A clean hub for the things students actually need.</h2>
          <p className="max-w-2xl text-base leading-7 text-foreground-muted">
            Instead of one long landing page, each major action now lives on its own page. Search, navigate, check dining, and share feedback without scrolling through unrelated sections.
          </p>
        </div>
        <div className="grid gap-4">
          <Card title="Focused navigation" className="h-full">
            <p className="text-sm leading-relaxed text-foreground-muted">Dedicated route search and map experience for every campus location.</p>
          </Card>
          <Card title="Minimal entry point" className="h-full">
            <p className="text-sm leading-relaxed text-foreground-muted">Home is now a starting place, not a feature dump.</p>
          </Card>
          <Card title="Accessible design" className="h-full">
            <p className="text-sm leading-relaxed text-foreground-muted">Keyboard and mobile-first interactions are built into the page flow.</p>
          </Card>
        </div>
      </section>
    </div>
  );
}
