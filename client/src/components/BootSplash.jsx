import { useEffect, useState } from 'react';
import CampusLogoIcon from './CampusLogo';

/**
 * GPS Lock-On Boot/Splash Sequence for College Navigator
 * 
 * Timeline (3.0s total):
 * 0.0s - 1.0s: SCANNING - Reticle performs 3 sharp position jumps across background grid.
 * 1.0s - 1.1s: LOCKED   - Reticle snaps to center (0,0) and triggers red/orange ripple ring.
 * 1.1s - 2.6s: WORDMARK - "Campus Navigator" text & amber "Location Locked" status snap in.
 * 2.6s - 3.0s: FADING   - Screen fades out smoothly into homepage.
 * 3.0s+:       UNMOUNTED - Component returns null and unmounts from DOM completely.
 * 
 * Session-backed (sessionStorage) so it only plays once per visit session.
 * Supports URL override (?splash=1) and console replay (window.replayBootSplash()).
 * Respects prefers-reduced-motion with a simple 0.5s fade fallback.
 */
export default function BootSplash() {
  // Pure state initializer (NO side effects inside useState to prevent React 18 Strict Mode bugs)
  const [shouldPlay] = useState(() => {
    if (typeof window === 'undefined') return false;

    // Allow forcing splash preview via URL parameter (?splash=1 or ?forceSplash=true)
    const params = new URLSearchParams(window.location.search);
    if (params.get('splash') === '1' || params.get('forceSplash') === 'true') {
      return true;
    }

    const hasSeen = sessionStorage.getItem('hasSeenBootSequence');
    return hasSeen !== 'true';
  });

  const [stage, setStage] = useState('scan'); // 'scan' | 'locked' | 'wordmark' | 'fading' | 'unmounted'

  useEffect(() => {
    // Expose dev console helper to easily re-test splash animation anytime
    window.replayBootSplash = () => {
      sessionStorage.removeItem('hasSeenBootSequence');
      window.location.search = '?splash=1';
    };

    if (!shouldPlay) return;

    // Mark as seen inside useEffect (safe from Strict Mode double-init resets)
    sessionStorage.setItem('hasSeenBootSequence', 'true');

    // Reduced motion fallback
    const isReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) {
      setStage('wordmark');
      const tFade = setTimeout(() => setStage('fading'), 300);
      const tEnd = setTimeout(() => setStage('unmounted'), 500);
      return () => {
        clearTimeout(tFade);
        clearTimeout(tEnd);
      };
    }

    // Single deterministic timer schedule initialized once on mount
    const tLock = setTimeout(() => setStage('locked'), 1000);
    const tWordmark = setTimeout(() => setStage('wordmark'), 1100);
    const tFading = setTimeout(() => setStage('fading'), 2600);
    const tUnmount = setTimeout(() => setStage('unmounted'), 3000);

    return () => {
      clearTimeout(tLock);
      clearTimeout(tWordmark);
      clearTimeout(tFading);
      clearTimeout(tUnmount);
    };
  }, [shouldPlay]);

  // Unmount completely from DOM if session seen or animation finished
  if (!shouldPlay || stage === 'unmounted') {
    return null;
  }

  const isFading = stage === 'fading';
  const isLockedOrLater = stage === 'locked' || stage === 'wordmark' || isFading;
  const showWordmark = stage === 'wordmark' || isFading;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#050404] text-foreground select-none overflow-hidden ${
        isFading ? 'animate-gps-fade-out pointer-events-none' : 'pointer-events-auto'
      }`}
      aria-label="Campus Navigator boot intro"
    >
      {/* ── Faint Static Campus Grid Background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(#ea580c_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />
      
      {/* Center Tactical Axis Lines */}
      <div className="absolute top-1/2 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/20 to-transparent pointer-events-none" />
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-orange-500/20 to-transparent pointer-events-none" />

      {/* Subtle Corner Telemetry HUD */}
      <div className="absolute top-6 left-6 font-mono text-[10px] tracking-widest text-orange-500/40 uppercase pointer-events-none hidden sm:block">
        SYS_GPS // NAV_OS v2.4
      </div>
      <div className="absolute top-6 right-6 font-mono text-[10px] tracking-widest text-orange-500/40 uppercase pointer-events-none hidden sm:block">
        SIGNAL: 100% // LOCKING
      </div>

      <div className="relative flex flex-col items-center justify-center z-10 px-6 text-center">
        
        {/* ── Reticle & Single Accent Ripple Ring ── */}
        <div className="relative flex items-center justify-center mb-6 h-24 w-24">
          
          {/* Single Red/Orange Ripple Pulse on Lock Event */}
          {isLockedOrLater && (
            <div className="absolute h-24 w-24 rounded-full border-2 border-orange-500 animate-gps-ripple pointer-events-none" />
          )}

          {/* Tactical Crosshair Reticle Box */}
          <div
            className={`relative flex h-14 w-14 items-center justify-center ${
              stage === 'scan'
                ? 'animate-gps-scan'
                : 'animate-gps-snap-glow border border-orange-500/80 rounded-lg bg-orange-500/10'
            }`}
          >
            {/* Corner brackets */}
            <span className="absolute top-0 left-0 h-2.5 w-2.5 border-t-2 border-l-2 border-orange-500" />
            <span className="absolute top-0 right-0 h-2.5 w-2.5 border-t-2 border-r-2 border-orange-500" />
            <span className="absolute bottom-0 left-0 h-2.5 w-2.5 border-b-2 border-l-2 border-orange-500" />
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 border-b-2 border-r-2 border-orange-500" />

            {/* Center target dot */}
            <div className={`h-2.5 w-2.5 rounded-full ${isLockedOrLater ? 'bg-orange-500 shadow-[0_0_12px_#f97316]' : 'bg-red-500/80 animate-ping'}`} />
          </div>

          {/* Dynamic Status Badge under reticle during scan */}
          {stage === 'scan' && (
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] tracking-widest text-orange-400/80 uppercase">
              SEARCHING SIGNAL...
            </div>
          )}
        </div>

        {/* ── Brand Logo Wordmark & Amber Status Badge ── */}
        {showWordmark && (
          <div className="animate-gps-wordmark-snap flex flex-col items-center justify-center">
            {/* Navbar style Brand Mark Icon Box */}
            <div className="brand-mark relative flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[rgb(var(--color-accent))] via-orange-600 to-amber-500 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_8px_24px_rgb(234_88_12/0.4)]">
              <CampusLogoIcon />
            </div>

            {/* Wordmark text matching navbar */}
            <h1 className="mt-4 font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Campus <span className="text-gradient">Navigator</span>
            </h1>

            {/* Amber Status Line */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3.5 py-1 text-xs font-mono font-medium tracking-widest text-amber-400 uppercase">
              <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
              Location Locked
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
