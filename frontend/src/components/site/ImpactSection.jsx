import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import { IMPACT } from '@/data/saarthiSample';

export default function ImpactSection() {
  return (
    <SectionShell id="impact" className="bg-site-graphite py-20 md:py-28">
      <SectionHeader
        title="expected impact"
        blurb="What sourcing any material and proving any substitute is expected to deliver. No inflated metrics — these are the goals from the brief."
      />
      <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {IMPACT.map((c, i) => (
          <Reveal key={c.title} delay={(i % 3) * 0.06}>
            <SiteCard>
              <p className="site-card-index font-mono text-xs text-site-orange tabular-nums">
                {String(i + 1).padStart(2, '0')}
              </p>
              <h3 className="site-card-title mt-3 font-display lowercase text-xl text-site-text">
                {c.title}
              </h3>
              <p className="site-card-body site-measure mt-2 text-sm text-site-muted">
                {c.body}
              </p>
            </SiteCard>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
