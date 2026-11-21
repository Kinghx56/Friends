import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import TornPaperDivider from './TornPaperDivider';
import { PROBLEM } from '@/data/saarthiSample';
import { Layers, ShieldAlert, EyeOff } from 'lucide-react';

const PAIN_META = [
  { icon: Layers, tag: 'Operational Drag', badgeColor: 'text-amber-700 bg-amber-50 border-amber-200' },
  { icon: ShieldAlert, tag: 'Safety-Critical Risk', badgeColor: 'text-red-700 bg-red-50 border-red-200' },
  { icon: EyeOff, tag: 'Capital Inefficiency', badgeColor: 'text-orange-700 bg-orange-50 border-orange-200' },
];

export default function ProblemSection() {
  return (
    <>
      <TornPaperDivider />
      <SectionShell id="problem" className="bg-site-graphite py-20 md:py-28">
        <SectionHeader index="00" title="the problem" />
        <div className="mt-12 grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 items-start">
          <div>
            <h3
              className="font-display lowercase text-site-text leading-[0.98] tracking-[-0.03em]"
              style={{ fontSize: 'clamp(32px,5.5vw,60px)' }}
            >
              the same part hides in five catalogs.{' '}
              <span className="bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent font-bold">
                sourcing it is guesswork.
              </span>
            </h3>

            <div className="mt-10 space-y-4">
              {PROBLEM.pains.map((p, i) => {
                const meta = PAIN_META[i] || PAIN_META[0];
                const Icon = meta.icon;
                return (
                  <Reveal key={p.title} delay={i * 0.08}>
                    <div className="group rounded-xl border border-site-line bg-site-surface p-5 shadow-xs transition-all duration-200 hover:border-site-orange/60 hover:shadow-md">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-lg bg-orange-50 border border-orange-200/60 p-2 text-site-orange group-hover:scale-105 transition-transform">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className={`rounded-full border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider ${meta.badgeColor}`}>
                            {meta.tag}
                          </span>
                        </div>
                        <span className="font-mono text-xs text-site-muted/60">0{i + 1} / 03</span>
                      </div>
                      <h4 className="mt-3.5 text-base sm:text-lg font-bold text-site-text group-hover:text-site-orange transition-colors">
                        {p.title}
                      </h4>
                      <p className="mt-1.5 text-sm leading-relaxed text-site-muted">
                        {p.body}
                      </p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>

          <Reveal className="flex items-start lg:items-center">
            <SiteCard stat className="w-full bg-site-surface">
              <div className="flex items-center justify-between">
                <span className="site-card-index font-mono text-xs uppercase tracking-wider text-site-muted">
                  industry benchmark · sample
                </span>
                <span className="rounded-full bg-red-100 border border-red-200 px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider text-red-700">
                  Critical Risk
                </span>
              </div>
              <p
                className="site-card-num mt-5 font-display text-site-orange tabular-nums leading-none font-black"
                style={{ fontSize: 'clamp(64px,10vw,136px)' }}
              >
                {PROBLEM.stat.value}
              </p>
              <p className="site-card-title mt-4 text-lg font-bold text-site-text">
                {PROBLEM.stat.label}
              </p>
              <p className="site-card-body mt-2 text-sm text-site-muted leading-relaxed">
                When enterprise catalog data lacks real-time technical verification, substitutions are made on surface descriptions alone, risking catastrophic plant shutdowns.
              </p>
            </SiteCard>
          </Reveal>
        </div>
      </SectionShell>
    </>
  );
}
