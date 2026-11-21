import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { BRAND } from '@/data/saarthiSample';

const KEY = 'saarthi_intro_seen';
const EASE = [0.76, 0, 0.24, 1];

/**
 * Opening animation — plays once per session.
 * Black window → orange line draws → "saarthi" reveals letter by letter +
 * "सारथी" fades in → mono counter 000→100 → at 100 the line expands and the
 * window splits up/down, revealing the hero. Skippable; falls back to a quick
 * fade under prefers-reduced-motion. Locks scroll while active.
 */
export default function IntroOverlay({ onComplete }) {
  const reduced = useReducedMotion();
  const [count, setCount] = useState(0);
  const [split, setSplit] = useState(false);
  const [gone, setGone] = useState(false);

  // Lock scroll while the intro is active.
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  // Counter 000 → 100 (or quick fade for reduced motion).
  useEffect(() => {
    if (reduced) {
      const t = setTimeout(finish, 500);
      return () => clearTimeout(t);
    }
    let raf;
    const delay = 200;
    const dur = 1500;
    const start = performance.now() + delay;
    const tick = (now) => {
      const p = Math.min(1, Math.max(0, (now - start) / dur));
      setCount(Math.round(p * BRAND.introCounterTo));
      if (p < 1) raf = requestAnimationFrame(tick);
      else setSplit(true);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  // After the split finishes, tear down.
  useEffect(() => {
    if (!split) return;
    const t = setTimeout(finish, 950);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [split]);

  function finish() {
    sessionStorage.setItem(KEY, '1');
    onComplete?.();
    setGone(true);
  }

  const skip = () => finish();

  if (gone) return null;

  const letters = BRAND.wordmark.split('');

  return (
    <div className="fixed inset-0 z-[200] bg-site-black">
      {/* Top half */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/2 bg-site-black"
        animate={split ? { y: '-100%' } : { y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      />
      {/* Bottom half */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 bg-site-black"
        animate={split ? { y: '100%' } : { y: 0 }}
        transition={{ duration: 0.9, ease: EASE }}
      />

      {/* Centre orange line */}
      <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 overflow-visible">
        <motion.div
          className="h-full w-full origin-center bg-site-orange"
          initial={{ scaleX: 0 }}
          animate={split ? { scaleY: 90, opacity: 0 } : { scaleX: 1 }}
          transition={{
            scaleX: { duration: 0.6, ease: EASE },
            scaleY: { duration: 0.3, ease: EASE },
            opacity: { duration: 0.3 },
          }}
        />
      </div>

      {/* Wordmark */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        animate={split ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div
          className="flex font-display lowercase leading-none text-site-text"
          style={{ fontSize: 'clamp(48px, 11vw, 168px)', letterSpacing: '-0.04em' }}
        >
          {letters.map((ch, i) => (
            <span key={i} className="inline-block overflow-hidden">
              <motion.span
                className="inline-block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.4, ease: EASE, delay: 0.15 + i * 0.06 }}
              >
                {ch}
              </motion.span>
            </span>
          ))}
        </div>
        <motion.div
          className="mt-4 text-site-muted text-sm tracking-wide md:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          {BRAND.hindi}
        </motion.div>
      </motion.div>

      {/* Counter bottom-left */}
      <motion.div
        aria-hidden
        className="absolute bottom-6 left-6 font-mono text-sm tabular-nums text-site-muted md:bottom-10 md:left-10"
        animate={split ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {String(count).padStart(3, '0')}
      </motion.div>

      {/* Tagline bottom-right */}
      <motion.div
        className="absolute bottom-6 right-6 font-mono text-xs text-site-muted md:bottom-10 md:right-10 md:text-sm"
        initial={{ opacity: 0 }}
        animate={split ? { opacity: 0 } : { opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
      >
        {BRAND.tagline}
      </motion.div>

      {/* Skip */}
      <button
        onClick={skip}
        className="absolute right-6 top-6 font-mono text-xs text-site-muted transition-colors hover:text-site-orange focus-visible:text-site-orange md:right-10 md:top-10"
      >
        skip →
      </button>
    </div>
  );
}
