import { Link } from 'react-router-dom';
import { ArrowRight, MapPinned } from 'lucide-react';
import { Reveal } from '../Reveal';
import Button from '../Button';

export default function CtaSection() {
  return (
    <section className="section-gap">
      <div className="section-container">
        <Reveal>
          <div className="card-surface card-static cta-card">
            <div className="card-header">
              <div className="card-header__main">
                <span className="card-header__icon" aria-hidden="true">
                  <MapPinned size={16} strokeWidth={1.8} />
                </span>
                <span className="card-title">Start navigating</span>
              </div>
            </div>
            <div className="relative flex flex-col items-start gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-xl">
                <h2 className="font-display text-display-md font-extrabold text-foreground">
                  Your campus.
                  <br />
                  <span className="italic text-foreground-muted">One tap away.</span>
                </h2>
                <p className="mt-4 text-base leading-relaxed text-foreground-muted">
                  Search any building, check what&apos;s open, and share feedback — free for every student.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
