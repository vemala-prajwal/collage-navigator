import { useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import {
  ShieldAlert,
  Ambulance,
  HeartHandshake,
  Flame,
  Siren,
  Home,
  Building2,
  Bus,
  PhoneCall,
  Copy,
  Check,
  Search,
  X,
  ShieldCheck,
  AlertTriangle,
  Info,
  Radio,
  Phone,
} from 'lucide-react';
import emergencyContacts from '../lib/emergencyContacts';
import styles from './EmergencyContacts.module.css';

// Map icon names from metadata to Lucide React components
const ICON_MAP = {
  ShieldAlert,
  Ambulance,
  HeartHandshake,
  Flame,
  Siren,
  Home,
  Building2,
  Bus,
};

// "The Guardian Shield Beacon" Custom Logo / Emblem Mark
function GuardianShieldMark({ className = 'w-12 h-12' }) {
  return (
    <div className="relative flex items-center justify-center">
      <div className="absolute inset-0 rounded-2xl bg-rose-500/20 blur-lg dark:bg-rose-500/30" />
      <svg
        className={`relative ${className}`}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Outer Shield Path */}
        <path
          d="M32 4L8 14V30C8 45.47 18.25 57.06 32 60C45.75 57.06 56 45.47 56 30V14L32 4Z"
          fill="url(#shieldGrad)"
          stroke="#E11D48"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        {/* Concentric Radar Rings */}
        <circle cx="32" cy="28" r="16" stroke="rgba(255, 255, 255, 0.3)" strokeWidth="1.5" strokeDasharray="3 3" />
        <circle cx="32" cy="28" r="10" stroke="rgba(255, 255, 255, 0.5)" strokeWidth="1.5" />
        {/* Location / Crosshair Pin Core */}
        <path
          d="M32 20C27.58 20 24 23.58 24 28C24 33.5 32 40 32 40C32 40 40 33.5 40 28C40 23.58 36.42 20 32 20Z"
          fill="#FFF"
        />
        <circle cx="32" cy="27" r="3.5" fill="#E11D48" />
        
        {/* Color Gradient Definition */}
        <defs>
          <linearGradient id="shieldGrad" x1="8" y1="4" x2="56" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E11D48" />
            <stop offset="0.5" stopColor="#D97706" />
            <stop offset="1" stopColor="#991B1B" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function EmergencyContactsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategoryFilter, setActiveCategoryFilter] = useState('all');
  const [copiedNumber, setCopiedNumber] = useState(null);

  // Quick Copy Handler
  const handleCopy = (number, name, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard.writeText(number);
    setCopiedNumber(number);
    toast.success(`Copied ${name} (${number}) to clipboard`, {
      id: `copy-${number}`,
      icon: '📋',
      duration: 2500,
    });
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  // Filter categories based on search query and category filter chips
  const filteredGroups = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return emergencyContacts.filter((group) => {
      // Category filter check
      if (activeCategoryFilter === 'sos' && group.tier !== 1) return false;
      if (activeCategoryFilter === 'security' && !['security', 'police', 'fire'].includes(group.id)) return false;
      if (activeCategoryFilter === 'medical' && !['medical', 'womens-helpline'].includes(group.id)) return false;
      if (activeCategoryFilter === 'hostel' && !['hostel', 'admin', 'transport'].includes(group.id)) return false;

      // Text search check
      if (!query) return true;

      const categoryMatch = group.category.toLowerCase().includes(query);
      const descMatch = group.description?.toLowerCase().includes(query);
      const contactMatch = group.contacts.some(
        (c) => c.name.toLowerCase().includes(query) || c.number.includes(query)
      );

      return categoryMatch || descMatch || contactMatch;
    });
  }, [searchQuery, activeCategoryFilter]);

  // Group filtered contacts by Tier for visual triage
  const tier1Groups = filteredGroups.filter((g) => g.tier === 1);
  const tier2Groups = filteredGroups.filter((g) => g.tier === 2);
  const tier3Groups = filteredGroups.filter((g) => g.tier === 3);

  // Color theme helper mapping for card borders & accents
  const getCardStyle = (accent) => {
    switch (accent) {
      case 'crimson':
        return styles.triageCardCrimson;
      case 'amber':
        return styles.triageCardAmber;
      case 'cobalt':
        return styles.triageCardCobalt;
      case 'teal':
      default:
        return styles.triageCardTeal;
    }
  };

  const getAccentBadgeStyle = (accent) => {
    switch (accent) {
      case 'crimson':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800/60';
      case 'amber':
        return 'bg-amber-100 text-amber-900 border-amber-200 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800/60';
      case 'cobalt':
        return 'bg-blue-100 text-blue-900 border-blue-200 dark:bg-blue-950/80 dark:text-blue-300 dark:border-blue-800/60';
      case 'teal':
      default:
        return 'bg-teal-100 text-teal-900 border-teal-200 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800/60';
    }
  };

  const getCallBtnStyle = (accent, isPrimary) => {
    if (isPrimary && accent === 'crimson') {
      return 'bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/20 dark:bg-rose-500 dark:hover:bg-rose-600';
    }
    if (isPrimary && accent === 'amber') {
      return 'bg-amber-600 text-white hover:bg-amber-700 shadow-md shadow-amber-600/20 dark:bg-amber-500 dark:hover:bg-amber-600';
    }
    if (isPrimary) {
      return 'bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white';
    }
    return 'bg-white/90 text-slate-800 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800/90 dark:text-slate-100 dark:border-slate-700 dark:hover:bg-slate-700';
  };

  return (
    <div className="min-h-screen pb-16 pt-4 text-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 sm:px-6">
        
        {/* HERO DISPATCH HEADER */}
        <section
          className={`relative overflow-hidden rounded-3xl border border-rose-500/20 bg-gradient-to-b from-rose-500/5 via-slate-50 to-white p-6 backdrop-blur-md shadow-sm sm:p-10 dark:border-rose-500/30 dark:from-rose-950/30 dark:via-slate-900/80 dark:to-slate-950 ${styles.radarMesh}`}
        >
          <div className="relative z-10 flex flex-col items-center text-center">
            
            {/* Signature Logo Emblem */}
            <GuardianShieldMark className="mb-4 h-14 w-14 sm:h-16 sm:w-16" />

            {/* Live Monitoring Badge */}
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-600 dark:bg-rose-400" />
              </span>
              Campus Safety Dispatch Node • 24x7 Active
            </div>

            <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl dark:text-white">
              Campus Emergency Directory
            </h1>

            <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
              Instant scannable hotline dispatch. Tap any phone number to place a direct call or copy to clipboard for immediate assistance.
            </p>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="mt-6 w-full max-w-2xl space-y-3">
              {/* Search Bar Input */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search contacts by name, role, or number (e.g. 'Ambulance', 'Warden', '108')..."
                  className="w-full rounded-2xl border border-slate-200/80 bg-white/90 py-3.5 pl-11 pr-10 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 dark:border-slate-700 dark:bg-slate-900/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-rose-400"
                  aria-label="Search emergency contacts"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    aria-label="Clear search query"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-xs">
                {[
                  { id: 'all', label: 'All Contacts' },
                  { id: 'sos', label: '🚨 Critical SOS' },
                  { id: 'security', label: '🛡️ Security & Police' },
                  { id: 'medical', label: '🚑 Medical & Helpline' },
                  { id: 'hostel', label: '🏠 Hostels & Admin' },
                ].map((chip) => {
                  const isActive = activeCategoryFilter === chip.id;
                  return (
                    <button
                      key={chip.id}
                      onClick={() => setActiveCategoryFilter(chip.id)}
                      className={`rounded-full px-3.5 py-1.5 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${
                        isActive
                          ? 'bg-rose-600 text-white shadow-sm dark:bg-rose-500'
                          : 'bg-white/80 text-slate-600 border border-slate-200/80 hover:bg-slate-100 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700 dark:hover:bg-slate-700'
                      }`}
                    >
                      {chip.label}
                    </button>
                  );
                })}
              </div>
            </div>

          </div>
        </section>

        {/* SEARCH ZERO-RESULTS STATE */}
        {filteredGroups.length === 0 && (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
            <h3 className="mt-4 font-display text-lg font-semibold text-slate-900 dark:text-white">
              No emergency contacts found
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              No hotline matches "{searchQuery}". Try searching for standard terms like "Security", "Medical", or "Police".
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategoryFilter('all');
              }}
              className="mt-5 rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
            >
              Reset Search & Filters
            </button>
          </div>
        )}

        {/* TIER 1: IMMEDIATE CRITICAL SOS & LIFE SAFETY (TOP PRIORITY HERO CARDS) */}
        {tier1Groups.length > 0 && (
          <section aria-labelledby="tier1-heading" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-3 w-3 rounded-full bg-rose-500 animate-pulse motion-reduce:animate-none" />
                <h2 id="tier1-heading" className="font-display text-lg font-bold tracking-tight text-rose-700 sm:text-xl dark:text-rose-400">
                  Priority 1: Immediate SOS & Emergency Response
                </h2>
              </div>
              <span className="hidden rounded-full bg-rose-100 px-3 py-0.5 text-xs font-semibold text-rose-800 sm:inline-block dark:bg-rose-950 dark:text-rose-300">
                24x7 Direct Lines
              </span>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tier1Groups.map((group) => {
                const IconComponent = ICON_MAP[group.iconName] || ShieldAlert;
                return (
                  <article
                    key={group.id}
                    className={`flex flex-col justify-between rounded-3xl p-6 transition-all ${getCardStyle(group.accent)}`}
                  >
                    <div>
                      {/* Header with Icon & Badge */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/10 text-2xl dark:bg-rose-500/20">
                            <IconComponent className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                              {group.category}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {group.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className="mt-4 flex items-center gap-2">
                        <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getAccentBadgeStyle(group.accent)}`}>
                          <Radio className="h-3 w-3 animate-pulse text-rose-500 motion-reduce:animate-none" />
                          {group.badge}
                        </span>
                      </div>

                      {/* Contacts Call List */}
                      <ul className="mt-5 space-y-3">
                        {group.contacts.map((contact) => (
                          <li
                            key={`${group.id}-${contact.name}`}
                            className="rounded-2xl border border-slate-200/60 bg-white/90 p-3.5 shadow-sm backdrop-blur transition-all dark:border-slate-800/80 dark:bg-slate-900/90"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {contact.name}
                                </span>
                                <span className="font-mono text-base font-bold tracking-wider text-slate-900 dark:text-white">
                                  {contact.number}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                {/* Copy micro button */}
                                <button
                                  onClick={(e) => handleCopy(contact.number, contact.name, e)}
                                  className="rounded-xl border border-slate-200/80 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                                  title="Copy phone number"
                                  aria-label={`Copy ${contact.name} phone number`}
                                >
                                  {copiedNumber === contact.number ? (
                                    <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="h-4 w-4" />
                                  )}
                                </button>

                                {/* Direct Call Button */}
                                <a
                                  href={`tel:${contact.number}`}
                                  className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${styles.callPill} ${getCallBtnStyle(group.accent, contact.isPrimary)}`}
                                  aria-label={`Call ${contact.name} at ${contact.number}`}
                                >
                                  <PhoneCall className="h-3.5 w-3.5" />
                                  <span>Call</span>
                                </a>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* TIER 2: ESSENTIAL SAFETY & RESPONSE */}
        {tier2Groups.length > 0 && (
          <section aria-labelledby="tier2-heading" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 id="tier2-heading" className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                Priority 2: Safety & Warden Hotline
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {tier2Groups.map((group) => {
                const IconComponent = ICON_MAP[group.iconName] || Siren;
                return (
                  <article
                    key={group.id}
                    className={`flex flex-col justify-between rounded-3xl p-6 transition-all ${getCardStyle(group.accent)}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-500/10 text-xl dark:bg-amber-500/20">
                            <IconComponent className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {group.category}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {group.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${getAccentBadgeStyle(group.accent)}`}>
                          {group.badge}
                        </span>
                      </div>

                      <ul className="mt-4 space-y-2.5">
                        {group.contacts.map((contact) => (
                          <li
                            key={`${group.id}-${contact.name}`}
                            className="rounded-2xl border border-slate-200/60 bg-white/90 p-3 shadow-sm backdrop-blur transition-all dark:border-slate-800/80 dark:bg-slate-900/90"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {contact.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                  {contact.number}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleCopy(contact.number, contact.name, e)}
                                  className="rounded-xl border border-slate-200/80 bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                  title="Copy phone number"
                                  aria-label={`Copy ${contact.name} phone number`}
                                >
                                  {copiedNumber === contact.number ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                <a
                                  href={`tel:${contact.number}`}
                                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${styles.callPill} ${getCallBtnStyle(group.accent, contact.isPrimary)}`}
                                  aria-label={`Call ${contact.name} at ${contact.number}`}
                                >
                                  <PhoneCall className="h-3 w-3" />
                                  <span>Call</span>
                                </a>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* TIER 3: CAMPUS OPERATIONS & ADMIN */}
        {tier3Groups.length > 0 && (
          <section aria-labelledby="tier3-heading" className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 id="tier3-heading" className="font-display text-lg font-bold tracking-tight text-slate-900 sm:text-xl dark:text-white">
                Priority 3: Campus Support & Administration
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {tier3Groups.map((group) => {
                const IconComponent = ICON_MAP[group.iconName] || Building2;
                return (
                  <article
                    key={group.id}
                    className={`flex flex-col justify-between rounded-3xl p-6 transition-all ${getCardStyle(group.accent)}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-xl dark:bg-teal-500/20">
                            <IconComponent className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                          </div>
                          <div>
                            <h3 className="font-display text-base font-bold text-slate-900 dark:text-white">
                              {group.category}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {group.description}
                            </p>
                          </div>
                        </div>
                      </div>

                      <ul className="mt-4 space-y-2.5">
                        {group.contacts.map((contact) => (
                          <li
                            key={`${group.id}-${contact.name}`}
                            className="rounded-2xl border border-slate-200/60 bg-white/90 p-3 shadow-sm backdrop-blur transition-all dark:border-slate-800/80 dark:bg-slate-900/90"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="min-w-0">
                                <span className="block truncate text-xs font-medium text-slate-500 dark:text-slate-400">
                                  {contact.name}
                                </span>
                                <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                                  {contact.number}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => handleCopy(contact.number, contact.name, e)}
                                  className="rounded-xl border border-slate-200/80 bg-slate-50 p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                  title="Copy phone number"
                                  aria-label={`Copy ${contact.name} phone number`}
                                >
                                  {copiedNumber === contact.number ? (
                                    <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="h-3.5 w-3.5" />
                                  )}
                                </button>

                                <a
                                  href={`tel:${contact.number}`}
                                  className={`inline-flex items-center gap-1 rounded-xl px-3 py-1.5 font-mono text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 ${styles.callPill} ${getCallBtnStyle(group.accent, contact.isPrimary)}`}
                                  aria-label={`Call ${contact.name} at ${contact.number}`}
                                >
                                  <PhoneCall className="h-3 w-3" />
                                  <span>Call</span>
                                </a>
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* FOOTER NOTICE BANNER */}
        <footer className="rounded-3xl border border-slate-200 bg-slate-100/80 p-5 text-center text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400">
          <div className="flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-4">
            <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>National Off-Campus Emergency Hotlines:</span>
            </div>
            <div className="flex items-center gap-3 font-mono font-bold">
              <span>National Emergency: <a href="tel:112" className="text-rose-600 hover:underline dark:text-rose-400">112</a></span>
              <span>•</span>
              <span>Police: <a href="tel:100" className="text-rose-600 hover:underline dark:text-rose-400">100</a></span>
              <span>•</span>
              <span>Ambulance: <a href="tel:108" className="text-rose-600 hover:underline dark:text-rose-400">108</a></span>
            </div>
          </div>
        </footer>

      </div>
    </div>
  );
}
