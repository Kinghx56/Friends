import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import { HOW_IT_WORKS } from '@/data/saarthiSample';

export default function HowItWorks() {
  return (
    <SectionShell id="how" className="bg-site-black py-20 md:py-28">
      <SectionHeader title="how it works" />
      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {HOW_IT_WORKS.map((s, i) => (
          <Reveal key={s.n} delay={i * 0.07}>
            <SiteCard>
              <p className="site-card-index font-mono text-sm text-site-orange">{s.n}</p>
              <h3 className="site-card-title mt-3 font-display lowercase text-2xl text-site-text">
                {s.title}
              </h3>
              <p className="site-card-body site-measure mt-3 text-site-muted">{s.body}</p>
            </SiteCard>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
