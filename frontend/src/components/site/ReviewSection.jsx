import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X, AlertTriangle } from 'lucide-react';
import { SectionShell, Reveal } from './ui';
import SectionHeader from './SectionHeader';
import { REVIEW } from '@/data/saarthiSample';
import { cn } from '@/lib/utils';

const VERDICT = {
  equivalent: { label: '✓ equivalent', cls: 'text-site-orange', icon: Check },
  not_equivalent: { label: '✗ not equivalent', cls: 'text-site-text', icon: X },
  review: { label: '⚠ review required', cls: 'text-site-muted', icon: AlertTriangle },
};

export default function ReviewSection() {
  const [items, setItems] = useState(() => REVIEW.queue.map((q) => ({ ...q, status: 'pending' })));
  const [log, setLog] = useState([]);
  const [toast, setToast] = useState(null);

  const decide = (id, action) => {
    const it = items.find((x) => x.id === id);
    if (!it || it.status !== 'pending') return;
    setItems((prev) => prev.map((x) => (x.id === id ? { ...x, status: action } : x)));
    setLog((prev) => [
      {
        id: `${id}-${Date.now()}`,
        actor: 'you',
        action,
        entity: `${it.codeA} ↔ ${it.codeB}`,
        when: new Date().toLocaleString('en-IN'),
      },
      ...prev,
    ]);
    setToast({ action, label: `${it.codeA} ↔ ${it.codeB}` });
    window.setTimeout(() => setToast(null), 2600);
  };

  const counts = {
    pending: items.filter((i) => i.status === 'pending').length,
    approved: items.filter((i) => i.status === 'approved').length,
    rejected: items.filter((i) => i.status === 'rejected').length,
  };

  return (
    <SectionShell id="verify" className="bg-site-black py-20 md:py-28">
      <SectionHeader index={REVIEW.index} title={REVIEW.title} blurb={REVIEW.blurb} />

      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 font-mono text-sm">
        <span className="text-site-muted">to review <b className="tabular-nums text-site-text">{counts.pending}</b></span>
        <span className="text-site-muted">accepted <b className="tabular-nums text-site-text">{counts.approved}</b></span>
        <span className="text-site-muted">rejected <b className="tabular-nums text-site-text">{counts.rejected}</b></span>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1.4fr_0.9fr] lg:gap-16">
        <div className="space-y-5">
          {items.map((it) => {
            const v = VERDICT[it.verdict] || VERDICT.review;
            const VIcon = v.icon;
            return (
              <Reveal key={it.id}>
                <article
                  className={cn(
                    'rounded-xl border bg-site-graphite p-5 transition-colors',
                    it.status !== 'pending' ? 'border-site-line opacity-60' : 'border-site-line hover:border-site-orange'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-site-muted">
                      <VIcon className="h-3.5 w-3.5" /> verdict
                    </span>
                    <span className={cn('font-mono text-xs uppercase tracking-wider', v.cls)}>{v.label}</span>
                  </div>
                  <div className="mt-2">
                    <div className="mb-1 flex items-center justify-between font-mono text-xs">
                      <span className="text-site-muted">confidence</span>
                      <span className="text-site-text tabular-nums">{it.score.toFixed(0)}%</span>
                    </div>
                    <div className="h-1 w-full overflow-hidden rounded-full bg-site-line">
                      <div className="h-full bg-site-orange" style={{ width: `${it.score}%` }} />
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-lg border border-site-line bg-site-surface p-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-site-orange">requested</span>
                      <p className="mt-0.5 font-mono text-[11px] text-site-muted">{it.codeA}</p>
                      <p className="text-sm text-site-text">{it.descA}</p>
                    </div>
                    <div className="rounded-lg border border-site-line bg-site-surface p-3">
                      <span className="font-mono text-[10px] uppercase tracking-wider text-site-muted">in-stock</span>
                      <p className="mt-0.5 font-mono text-[11px] text-site-muted">{it.codeB}</p>
                      <p className="text-sm text-site-text">{it.descB}</p>
                    </div>
                  </div>

                  <p className="mt-3 text-xs text-site-muted">{it.reason}</p>

                  <div className="mt-4 flex items-center gap-3">
                    {it.status === 'pending' ? (
                      <>
                        <button
                          onClick={() => decide(it.id, 'approved')}
                          className="inline-flex items-center gap-1.5 rounded-full bg-site-orange px-4 py-2 font-mono text-xs text-site-black hover:brightness-95"
                        >
                          <Check className="h-4 w-4" /> accept
                        </button>
                        <button
                          onClick={() => decide(it.id, 'rejected')}
                          className="inline-flex items-center gap-1.5 rounded-full border border-site-line px-4 py-2 font-mono text-xs text-site-muted hover:text-site-text"
                        >
                          <X className="h-4 w-4" /> reject
                        </button>
                      </>
                    ) : (
                      <span className={cn('inline-flex items-center gap-1.5 font-mono text-xs', it.status === 'approved' ? 'text-site-orange' : 'text-site-muted')}>
                        {it.status === 'approved' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        {it.status}
                      </span>
                    )}
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border border-site-line bg-site-graphite p-5">
            <p className="font-mono text-xs uppercase tracking-wider text-site-muted">audit trail</p>
            <div className="mt-4 space-y-4">
              {log.length === 0 && <p className="text-sm text-site-muted">decisions appear here in real time.</p>}
              <AnimatePresence initial={false}>
                {log.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0 }}
                    className="overflow-hidden border-l-2 border-site-orange pl-4"
                  >
                    <p className="font-mono text-xs text-site-text">{e.actor} · {e.action}</p>
                    <p className="mt-0.5 text-xs text-site-muted">{e.entity}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-site-muted">{e.when}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      <div role="status" aria-live="polite" className="pointer-events-none fixed bottom-6 left-1/2 z-[150] -translate-x-1/2">
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className={cn(
                'flex items-center gap-2 rounded-full border border-site-line bg-site-surface px-5 py-3 font-mono text-sm text-site-text shadow-2xl',
                toast.action === 'approved' && 'text-site-orange'
              )}
            >
              {toast.action === 'approved' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              {toast.label} · {toast.action}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}
