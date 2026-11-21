import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import { MATCH } from '@/data/saarthiSample';
import { cn } from '@/lib/utils';

function SourceTable() {
  const { rows, nationalCode, description } = MATCH.audit;
  return (
    <div className="overflow-hidden rounded-xl border border-site-line bg-site-surface shadow-sm">
      <div className="border-b border-site-line px-5 py-4 bg-site-surface">
        <p className="font-mono text-xs uppercase tracking-wider text-site-muted">external sourcing audit</p>
        <p className="mt-1 text-sm font-semibold text-site-text">{description}</p>
        <p className="mt-1.5 font-mono text-xs text-site-orange">{nationalCode}</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-site-graphite font-mono text-[11px] uppercase tracking-wider text-site-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Vendor</th>
              <th scope="col" className="px-4 py-3">Listing</th>
              <th scope="col" className="px-4 py-3">Price</th>
              <th scope="col" className="px-4 py-3">Stock</th>
              <th scope="col" className="px-4 py-3">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-site-line bg-site-surface">
            {rows.map((r) => (
              <tr key={r.source} className="hover:bg-site-graphite/60 transition-colors">
                <td className="px-4 py-3 font-mono text-xs font-semibold text-site-orange">{r.source}</td>
                <td className="px-4 py-3 text-site-text">{r.title}</td>
                <td className={cn('px-4 py-3 font-mono text-xs font-medium', r.diff.includes('price') ? 'text-site-orange' : 'text-site-muted')}>
                  {r.price}
                </td>
                <td className={cn('px-4 py-3 font-mono text-xs font-medium', r.diff.includes('stock') ? 'text-site-orange' : 'text-site-muted')}>
                  {r.stock}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-site-muted">{r.rating}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function MatchSection() {
  return (
    <SectionShell id="source" className="bg-site-graphite py-20 md:py-28">
      <SectionHeader index={MATCH.index} title={MATCH.title} blurb={MATCH.blurb} />
      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="lg:sticky lg:top-24 lg:self-start">
          <SourceTable />
          <p className="mt-3 font-mono text-xs text-site-muted">live SerpApi · Google Shopping · prices in ₹INR · sample</p>
        </div>
        <div className="space-y-10">
          {MATCH.bullets.map((b, i) => (
            <Reveal key={b.title} delay={i * 0.05}>
              <SiteCard className="p-6">
                <p className="font-mono text-sm text-site-orange tabular-nums site-card-index">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="mt-2 font-display lowercase text-2xl text-site-text site-card-title">{b.title}</h3>
                <p className="site-measure mt-3 text-site-muted site-card-body">{b.body}</p>
              </SiteCard>
            </Reveal>
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
