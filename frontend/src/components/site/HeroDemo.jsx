import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ShoppingCart, ShieldCheck, Star, Check, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { HERO_DEMO_STEPS, HERO_DEMO_PROCUREMENT, HERO_DEMO_EQUIVALENCE } from '@/data/saarthiSample';
import { cn } from '@/lib/utils';

const EASE = [0.76, 0, 0.24, 1];
const STEP_ICONS = [ShoppingCart, ShieldCheck];
const URLS = ['saarthi.app/procurement', 'saarthi.app/equivalence'];

function Stars({ rating }) {
  return (
    <span className="inline-flex items-center gap-1 font-mono text-[11px] text-site-muted">
      <Star className="h-3 w-3 text-site-orange" fill="currentColor" />
      {rating.toFixed(1)}
    </span>
  );
}

/* ── Step 1: Source (SerpApi · Google Shopping) ─────────────────────────── */
function StepSource() {
  const d = HERO_DEMO_PROCUREMENT;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs text-site-muted">{d.query}</p>
        <span className="rounded-full border border-site-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-site-orange">
          {d.poweredBy}
        </span>
      </div>

      <div className="space-y-2.5">
        {d.results.map((r, i) => (
          <motion.div
            key={r.source}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.14, duration: 0.4, ease: EASE }}
            className="flex items-center gap-3 rounded-lg border border-site-line bg-site-surface px-4 py-3"
          >
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] text-site-orange">{r.source}</p>
              <p className="truncate text-sm text-site-text">{r.title}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className="font-mono text-sm text-site-text">₹{r.price.toFixed(2)}</span>
              <div className="flex items-center gap-2">
                <Stars rating={r.rating} />
                <span
                  className={cn(
                    'rounded-full border px-2 py-0.5 font-mono text-[10px]',
                    r.inStock ? 'border-site-orange/40 text-site-text' : 'border-site-line text-site-muted'
                  )}
                >
                  {r.inStock ? 'in stock' : 'backorder'}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <p className="font-mono text-xs text-site-muted">{d.summary}</p>
    </div>
  );
}

/* ── Step 2: Verify (You.com + Gemini) ──────────────────────────────────── */
function StepVerify() {
  const d = HERO_DEMO_EQUIVALENCE;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="grid grid-cols-2 gap-3">
          {[d.materialA, d.materialB].map((m) => (
            <div key={m.cnmc} className="rounded-lg border border-site-line bg-site-surface p-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-site-orange">{m.tag}</span>
              <p className="mt-0.5 text-sm text-site-text">{m.desc}</p>
              <p className="mt-0.5 font-mono text-[11px] text-site-muted">{m.cnmc}</p>
            </div>
          ))}
        </div>
        <span className="rounded-full border border-site-line px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-site-orange">
          {d.poweredBy}
        </span>
      </div>

      <div className="overflow-hidden rounded-lg border border-site-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-site-graphite font-mono text-[10px] uppercase tracking-wider text-site-muted">
            <tr>
              <th scope="col" className="px-3 py-2 font-normal">parameter</th>
              <th scope="col" className="px-3 py-2 font-normal">requested</th>
              <th scope="col" className="px-3 py-2 font-normal">in-stock</th>
              <th scope="col" className="px-3 py-2 font-normal">status</th>
            </tr>
          </thead>
          <tbody>
            {d.parameters.map((p) => (
              <tr key={p.name} className="border-t border-site-line">
                <td className="px-3 py-2.5 text-site-text">
                  {p.name}
                  {p.critical && (
                    <span className="ml-1.5 inline-flex items-center gap-0.5 font-mono text-[10px] text-site-orange">
                      <AlertTriangle className="h-3 w-3" /> critical
                    </span>
                  )}
                </td>
                <td className="px-3 py-2.5 font-mono text-xs text-site-text">{p.a}</td>
                <td className="px-3 py-2.5 font-mono text-xs text-site-text">{p.b}</td>
                <td
                  className={cn(
                    'px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider',
                    p.match === 'match' ? 'text-site-orange' : 'text-site-muted'
                  )}
                >
                  {p.match === 'match' ? (
                    <span className="inline-flex items-center gap-1"><Check className="h-3 w-3" /> match</span>
                  ) : (
                    <span className="inline-flex items-center gap-1"><X className="h-3 w-3" /> mismatch</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-site-orange/40 bg-site-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <X className="h-5 w-5 shrink-0 text-site-orange" />
          <div>
            <p className="font-mono text-sm uppercase tracking-wider text-site-text">{d.verdictLabel}</p>
            <p className="text-xs text-site-muted">{d.reason}</p>
          </div>
        </div>
        <div className="font-mono text-sm text-site-text">{d.confidence}% confidence</div>
      </div>

      <a
        href={d.evidence.url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-site-muted transition-colors hover:text-site-text"
      >
        <ExternalLink className="h-3.5 w-3.5" /> {d.evidence.title}
      </a>
    </div>
  );
}

const STEP_VIEWS = [StepSource, StepVerify];

export default function HeroDemo() {
  const [step, setStep] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setStep((s) => (s >= 1 ? 0 : s + 1)), 3400);
    return () => clearTimeout(t);
  }, [step, paused]);

  const View = STEP_VIEWS[step];
  return (
    <div
      id="demo"
      className="overflow-hidden rounded-xl border border-site-line bg-site-graphite shadow-2xl"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-2 border-b border-site-line bg-site-black px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-site-muted/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-site-muted/50" />
        <span className="h-2.5 w-2.5 rounded-full bg-site-orange/70" />
        <div className="ml-3 flex-1 rounded-md bg-site-surface px-3 py-1.5 font-mono text-xs text-site-muted">
          {URLS[step]}
        </div>
      </div>

      {/* Stage */}
      <div className="min-h-[340px] p-6 md:p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -10 }}
            transition={{ duration: 0.32, ease: EASE }}
          >
            <View />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Step tabs */}
      <div className="flex flex-wrap items-center gap-2 border-t border-site-line px-4 py-3">
        {HERO_DEMO_STEPS.map((s, i) => {
          const Icon = STEP_ICONS[i];
          return (
            <button
              key={s.id}
              onClick={() => setStep(i)}
              aria-current={step === i ? 'step' : undefined}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-xs transition-colors',
                step === i
                  ? 'border-site-orange text-site-text'
                  : 'border-site-line text-site-muted hover:text-site-text'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
