import emergencyContacts from '../lib/emergencyContacts';

export default function EmergencyContactsPage() {
  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="space-y-2">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent">Emergency Contacts</p>
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">Emergency Contacts</h1>
        <p className="max-w-2xl text-sm text-foreground-muted sm:text-base">
          Tap any number to call directly from your phone.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {emergencyContacts.map((group) => (
          <div key={group.category} className="rounded-2xl border border-border/60 bg-surface/80 p-5 shadow-sm backdrop-blur">
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
              <span className="text-2xl">{group.icon}</span>
              {group.category}
            </h2>
            <ul className="space-y-2">
              {group.contacts.map((contact) => (
                <li key={`${group.category}-${contact.name}`} className="flex flex-col rounded-xl bg-surface-secondary/70 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-sm font-medium text-foreground">{contact.name}</span>
                  <a href={`tel:${contact.number}`} className="text-sm font-semibold text-accent hover:underline">
                    {contact.number}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
