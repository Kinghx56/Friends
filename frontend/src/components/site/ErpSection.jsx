import { motion, useReducedMotion } from 'framer-motion';
import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import { ERP } from '@/data/saarthiSample';
import { cn } from '@/lib/utils';

function StatusIndicator({ status }) {
  const reduced = useReducedMotion();
  if (status === 'synced') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-xs text-site-text">
        <span className="h-2 w-2 rounded-full bg-site-orange" /> synced
      </span>
    );
  }
  if (status === 'ready') {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-xs text-site-muted">
        <span className="h-2 w-2 rounded-full border border-site-muted" /> ready
      </span>
    );
  }
  // syncing — animated indeterminate bar
  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs text-site-muted">
      <span className="relative h-2 w-2 rounded-full bg-site-amber" />
      syncing
      <span className="relative h-1 w-16 overflow-hidden rounded-full bg-site-line">
        {!reduced && (
          <motion.span
            className="absolute top-0 h-full w-1/2 rounded-full bg-site-orange"
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }}
          />
        )}
      </span>
    </span>
  );
}

export default function ErpSection() {
  return (
    <SectionShell id="erp" className="bg-site-graphite py-20 md:py-28">
      <SectionHeader title="connectors" blurb="Read-only catalog connectors plus the two intelligence engines — SerpApi for live markets, You.com for datasheets. No write access to your ERP." />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ERP.connectors.map((c, i) => (
          <Reveal key={c.name} delay={i * 0.05}>
            <SiteCard className="h-full">
              <p className="font-display lowercase text-xl text-site-text site-card-title">{c.name}</p>
              <p className="mt-1 font-mono text-[11px] text-site-muted site-card-body">{c.note}</p>
              <div className="mt-5">
                <StatusIndicator status={c.status} />
              </div>
            </SiteCard>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 font-mono text-xs text-site-muted">
        sample · status is illustrative
      </p>
    </SectionShell>
  );
}
