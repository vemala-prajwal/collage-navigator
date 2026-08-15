import { motion } from 'framer-motion';
import { Code2, Github, Linkedin, Mail, Sparkles, UserCheck } from 'lucide-react';

export default function TeamCard({ name, role, bio, tags = [], github, linkedin, email, initials, photo }) {
  const hasSocials = Boolean(github || linkedin || email);

  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="card-surface team-card-glow rounded-3xl border border-border/50 p-6 shadow-elevated flex flex-col justify-between h-full"
    >
      <div>
        {/* Top Header Row */}
        <div className="flex items-center gap-4">
          {photo ? (
            <img
              src={photo}
              alt={name}
              className="h-14 w-14 shrink-0 rounded-2xl object-cover border border-border/50 shadow-soft"
            />
          ) : (
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-accent/80 via-accent2/70 to-accent text-white font-display text-xl font-extrabold shadow-glow">
              {initials || name.split(' ').map((n) => n[0]).join('')}
              <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white ring-2 ring-background">
                <UserCheck size={12} />
              </span>
            </div>
          )}
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-foreground tracking-tight">
              {name}
            </h3>
            {role ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-accent mt-0.5">
                {role}
              </p>
            ) : null}
          </div>
        </div>

        {/* Bio / Contribution Statement (Optional) */}
        {bio ? (
          <p className="text-sm leading-relaxed text-foreground-muted mt-5 mb-6">
            {bio}
          </p>
        ) : null}

        {/* Contribution Tags (Optional) */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4 mb-6">
            {tags.map((tag) => (
              <span
                key={tag}
                className="rounded-xl bg-surface-secondary px-3 py-1 text-xs font-medium text-foreground-muted border border-border/40 flex items-center gap-1.5"
              >
                <Sparkles size={11} className="text-accent" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Footer Social Links (Optional) */}
      {hasSocials ? (
        <div className="mt-6 pt-4 border-t border-border/30 flex items-center justify-between">
          <span className="text-xs font-medium text-foreground-muted">Project Contributor</span>
          <div className="flex items-center gap-2 text-foreground-muted">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl hover:bg-surface-elevated hover:text-foreground transition-colors"
                aria-label={`${name}'s GitHub profile`}
              >
                <Github size={16} />
              </a>
            )}
            {linkedin && (
              <a
                href={linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl hover:bg-surface-elevated hover:text-accent transition-colors"
                aria-label={`${name}'s LinkedIn profile`}
              >
                <Linkedin size={16} />
              </a>
            )}
            {email && (
              <a
                href={`mailto:${email}`}
                className="p-2 rounded-xl hover:bg-surface-elevated hover:text-accent2 transition-colors"
                aria-label={`Email ${name}`}
              >
                <Mail size={16} />
              </a>
            )}
          </div>
        </div>
      ) : null}
    </motion.div>
  );
}
