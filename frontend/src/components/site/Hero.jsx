import { useEffect, useRef } from 'react';
import { motion, useMotionValue, useReducedMotion } from 'framer-motion';
import RollingTextButton from './RollingTextButton';
import HeroDemo from './HeroDemo';

const EASE = [0.76, 0, 0.24, 1];

function HeroCursorGlow({ targetRef }) {
  const reduced = useReducedMotion();
  const x = useMotionValue(-1000);
  const y = useMotionValue(-1000);

  useEffect(() => {
    if (reduced) return undefined;
    const el = targetRef.current;
    if (!el) return undefined;
    const onMove = (e) => {
      const r = el.getBoundingClientRect();
      x.set(e.clientX - r.left);
      y.set(e.clientY - r.top);
    };
    el.addEventListener('mousemove', onMove);
    return () => el.removeEventListener('mousemove', onMove);
  }, [reduced, targetRef, x, y]);

  if (reduced) return null;
  return (
    <motion.div
      aria-hidden
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2"
      style={{
        x,
        y,
        width: 360,
        height: 360,
        background:
          'radial-gradient(circle, rgba(178,58,10,0.18) 0%, rgba(178,58,10,0.07) 35%, transparent 70%)',
      }}
    />
  );
}

export default function Hero({ animateIn }) {
  const reduced = useReducedMotion();
  const ref = useRef(null);

  return (
    <section
      ref={ref}
      id="top"
      className="site-hero-glow relative overflow-hidden bg-site-black px-6 pt-16 pb-20 md:px-10 md:pt-24 md:pb-28"
    >
      <HeroCursorGlow targetRef={ref} />

      <div className="relative mx-auto max-w-[1400px]">
        <div className="max-w-[68ch]">
          {/* Eyebrow Pill */}
          <motion.div
            className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-site-line bg-site-surface px-4 py-1.5 shadow-xs"
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={animateIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.5, ease: EASE }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-orange-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-site-orange" />
            </span>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-site-orange">
              Material Intelligence // BharatOil CPSE
            </span>
          </motion.div>

          {reduced ? (
            <h1
              className="font-display lowercase leading-[0.88] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(52px,10vw,144px)' }}
            >
              <span className="block text-site-text font-black">
                source any material.
              </span>
              <span className="block bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent font-black italic">
                prove the substitute.
              </span>
            </h1>
          ) : (
            <motion.h1
              className="font-display lowercase leading-[0.88] tracking-[-0.04em]"
              style={{ fontSize: 'clamp(52px,10vw,144px)' }}
              initial={{ opacity: 0, y: 44 }}
              animate={animateIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 44 }}
              transition={{ duration: 0.75, ease: EASE, delay: animateIn ? 0.15 : 0 }}
            >
              <span className="block text-site-text font-black">
                source any material.
              </span>
              <span className="block bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 bg-clip-text text-transparent font-black italic">
                prove the substitute.
              </span>
            </motion.h1>
          )}

          <motion.p
            className="site-measure mt-8 max-w-[58ch] text-lg text-site-muted md:text-xl leading-relaxed"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={animateIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: EASE, delay: animateIn ? 0.4 : 0 }}
          >
            Built on <span className="font-medium text-site-text">one unified material catalog</span> — Saarthi searches live external
            markets with <span className="font-semibold text-site-orange">SerpApi</span> for verified suppliers, and proves engineering
            equivalence with <span className="font-semibold text-site-orange">You.com datasheets</span> and Gemini analysis before any
            substitution.
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-start gap-3 sm:flex-row sm:items-center"
            initial={reduced ? false : { opacity: 0, y: 20 }}
            animate={animateIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, ease: EASE, delay: animateIn ? 0.55 : 0 }}
          >
            <RollingTextButton
              href="#demo"
              onClick={(e) => {
                e.preventDefault();
                const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                document.getElementById('demo')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
              }}
              className="rounded-full bg-site-orange px-7 py-3 font-mono text-sm text-site-black hover:brightness-95"
            >
              see the demo
            </RollingTextButton>
            <span className="font-mono text-xs text-site-muted">sample data here · live SerpApi + You.com in the portal</span>
          </motion.div>
        </div>

        <motion.div
          className="mt-14 md:mt-20"
          initial={reduced ? false : { opacity: 0, y: 30 }}
          animate={animateIn ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
          transition={{ duration: 0.7, ease: EASE, delay: animateIn ? 0.7 : 0 }}
        >
          <HeroDemo />
        </motion.div>
      </div>
    </section>
  );
}
