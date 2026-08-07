import emergencyContacts from '../lib/emergencyContacts';

export default function EmergencyContactsPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Emergency Contacts</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Campus safety contacts at a glance</h1>
        <p className="max-w-2xl text-sm text-foreground-muted sm:text-base">
          Keep these numbers handy for security, medical support, transport, and campus administration.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {emergencyContacts.map((group) => (
          <article key={group.category} className="rounded-2xl border border-border/60 bg-surface/80 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center gap-3">
              <span className="text-2xl">{group.icon}</span>
              <h2 className="text-lg font-semibold text-foreground">{group.category}</h2>
            </div>
            <ul className="space-y-2">
              {group.contacts.map((contact) => (
                <li key={`${group.category}-${contact.name}`} className="rounded-xl bg-surface-secondary/70 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{contact.name}</p>
                  <a href={`tel:${contact.number}`} className="text-sm text-accent hover:underline">
                    {contact.number}
                  </a>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
