import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import { GOVERN } from '@/data/saarthiSample';
import { cn } from '@/lib/utils';

function ApprovalChain() {
  return (
    <SiteCard>
      <p className="font-mono text-xs uppercase tracking-wider text-site-muted site-card-index">approval chain</p>
      <ol className="mt-5 space-y-0">
        {GOVERN.chain.map((c, i) => {
          const last = i === GOVERN.chain.length - 1;
          return (
            <li key={c.role} className="relative pb-6 last:pb-0">
              {!last && <span className="absolute left-[7px] top-5 h-full w-px bg-site-line" aria-hidden />}
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2',
                    c.tone === 'orange' ? 'border-site-orange bg-site-orange' : 'border-site-line bg-site-graphite'
                  )}
                />
                <div>
                  <p className={cn('text-sm site-card-title', c.tone === 'orange' ? 'text-site-orange' : 'text-site-text')}>{c.role}</p>
                  <p className="font-mono text-xs text-site-muted site-card-body">{c.action}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </SiteCard>
  );
}

function DryRun() {
  const pct = (GOVERN.dryRun.to / GOVERN.dryRun.from) * 100;
  return (
    <SiteCard stat>
      <p className="font-mono text-xs uppercase tracking-wider text-site-muted site-card-index">decisions · sample</p>
      <div className="mt-5 flex items-end gap-4">
        <span className="font-display text-4xl tabular-nums text-site-muted site-card-num">{GOVERN.dryRun.from}</span>
        <span className="pb-1 font-mono text-site-orange">→</span>
        <span className="font-display text-5xl tabular-nums text-site-orange site-card-num">{GOVERN.dryRun.to}</span>
      </div>
      <p className="mt-1 font-mono text-xs text-site-muted site-card-body">{GOVERN.dryRun.label}</p>
      <div className="mt-5 h-2 w-full overflow-hidden rounded-full bg-site-line">
        <div className="h-full rounded-full bg-site-orange" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 font-mono text-[11px] text-site-muted site-card-body">
        {Math.round(100 - pct)}% rejected · every decision logged
      </p>
    </SiteCard>
  );
}

function AuditTimeline() {
  return (
    <div className="rounded-xl border border-site-line bg-site-graphite p-6">
      <p className="font-mono text-xs uppercase tracking-wider text-site-muted">audit trail</p>
      <ol className="mt-5 space-y-5">
        {GOVERN.audit.map((e, i) => (
          <Reveal key={i} delay={i * 0.04}>
            <li className="relative border-l-2 border-site-line pl-5">
              <span className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-site-orange" aria-hidden />
              <p className="text-sm text-site-text">
                <span className="text-site-orange">{e.actor}</span> · {e.action}
              </p>
              <p className="mt-0.5 text-xs text-site-muted">{e.entity}</p>
              <p className="mt-1 font-mono text-[11px] text-site-muted">{e.when} · {e.why}</p>
            </li>
          </Reveal>
        ))}
      </ol>
    </div>
  );
}

export default function GovernSection() {
  return (
    <SectionShell id="decide" className="bg-site-graphite py-20 md:py-28">
      <SectionHeader index={GOVERN.index} title={GOVERN.title} blurb={GOVERN.blurb} />
      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-12 items-start">
        <div className="flex flex-col gap-6">
          <ApprovalChain />
          <DryRun />
        </div>
        <AuditTimeline />
      </div>
    </SectionShell>
  );
}
