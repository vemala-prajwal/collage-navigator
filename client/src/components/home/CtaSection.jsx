import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Reveal } from '../Reveal';
import Button from '../Button';

export default function CtaSection() {
  return (
    <section className="section-gap">
      <div className="section-container">
        <Reveal>
          <div className="premium-card relative overflow-hidden px-8 py-16 sm:px-14 sm:py-20">
            <div
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/10 via-transparent to-accent/5 dark:from-accent/[0.06] dark:to-transparent"
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl dark:bg-accent/[0.04]" aria-hidden="true" />

            <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <p className="eyebrow mb-5">Start navigating</p>
                <h2 className="font-display text-display-md font-extrabold text-foreground">
                  Your campus.
                  <br />
                  <span className="italic text-foreground-muted">One tap away.</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-foreground-muted">
                  Search any building, check what&apos;s open, and share feedback — free for every student.
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link to="/map-search">
                  <Button className="min-w-[200px] px-8 py-4 text-base">
                    Open Map Search
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                <Link
                  to="/register"
                  className="text-center text-sm font-semibold text-foreground-muted transition-colors hover:text-foreground"
                >
                  Create free account
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
