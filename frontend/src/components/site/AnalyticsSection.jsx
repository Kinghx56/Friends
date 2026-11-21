import { useRef, useState } from 'react';
import { SectionShell, Reveal, SiteCard } from './ui';
import SectionHeader from './SectionHeader';
import { ANALYTICS } from '@/data/saarthiSample';

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function CategoryBars() {
  const max = Math.max(...ANALYTICS.sectors.map((s) => s.duplicates));
  return (
    <SiteCard>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-wider text-site-muted site-card-index">external listings by category</p>
        <span className="font-mono text-[11px] text-site-muted site-card-body">sample</span>
      </div>
      <div className="mt-5 space-y-4">
        {ANALYTICS.sectors.map((s) => (
          <div key={s.sector}>
            <div className="flex items-baseline justify-between font-mono text-xs">
              <span className="text-site-text site-card-title">{s.sector}</span>
              <span className="text-site-muted site-card-body">
                {s.duplicates.toLocaleString()} <span className="opacity-60">/ {s.total.toLocaleString()}</span>
              </span>
            </div>
            <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-site-line">
              <div className="h-full rounded-full bg-site-orange" style={{ width: `${(s.duplicates / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </SiteCard>
  );
}

function PriceGraph() {
  const [nodes, setNodes] = useState(() => ANALYTICS.cluster.nodes.map((n) => ({ ...n })));
  const dragId = useRef(null);
  const containerRef = useRef(null);
  const hub = nodes.find((n) => n.hub);

  const update = (id, x, y) =>
    setNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));

  const onPointerDown = (e, id) => {
    if (id === hub?.id) return;
    dragId.current = id;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e) => {
    const id = dragId.current;
    if (!id || !containerRef.current) return;
    const r = containerRef.current.getBoundingClientRect();
    const x = clamp(((e.clientX - r.left) / r.width) * 100, 6, 94);
    const y = clamp(((e.clientY - r.top) / r.height) * 100, 8, 92);
    update(id, x, y);
  };
  const onPointerUp = (e) => {
    dragId.current = null;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };
  const onKey = (e, id) => {
    const step = 2;
    const map = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
    const d = map[e.key];
    if (!d) return;
    e.preventDefault();
    const n = nodes.find((x) => x.id === id);
    if (!n) return;
    update(id, clamp(n.x + d[0], 6, 94), clamp(n.y + d[1], 8, 92));
  };

  return (
    <div
      ref={containerRef}
      className="relative h-[340px] overflow-hidden rounded-xl border border-site-line bg-site-surface md:h-[400px]"
    >
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {nodes
          .filter((n) => !n.hub)
          .map((n) => (
            <line
              key={n.id}
              x1={hub.x}
              y1={hub.y}
              x2={n.x}
              y2={n.y}
              stroke="#B23A0A"
              strokeWidth={1.5}
              strokeOpacity={0.45}
              vectorEffect="non-scaling-stroke"
            />
          ))}
      </svg>

      {nodes.map((n) => (
        <div
          key={n.id}
          className="absolute -translate-x-1/2 -translate-y-1/2"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.hub ? (
            <div className="rounded-full border-2 border-site-orange bg-site-graphite px-3 py-2 text-center">
              <p className="font-mono text-[10px] uppercase tracking-wider text-site-muted">{n.cpse}</p>
              <p className="font-mono text-xs text-site-orange">{n.label}</p>
            </div>
          ) : (
            <button
              type="button"
              onPointerDown={(e) => onPointerDown(e, n.id)}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onKeyDown={(e) => onKey(e, n.id)}
              className="cursor-grab touch-none rounded-lg border border-site-line bg-site-graphite px-2.5 py-1.5 text-left hover:border-site-orange focus-visible:border-site-orange active:cursor-grabbing"
              aria-label={`${n.cpse} ${n.label}, drag or use arrow keys to move`}
            >
              <p className="font-mono text-[10px] uppercase tracking-wider text-site-muted">{n.cpse}</p>
              <p className="font-mono text-[11px] text-site-text">{n.label}</p>
            </button>
          )}
        </div>
      ))}

      <p className="absolute bottom-3 left-3 font-mono text-[11px] text-site-muted">
        drag the vendors · sample
      </p>
    </div>
  );
}

function PriceTable() {
  return (
    <div className="overflow-hidden rounded-xl border border-site-line bg-site-surface shadow-sm">
      <div className="border-b border-site-line px-5 py-4 bg-site-surface">
        <p className="font-mono text-xs uppercase tracking-wider text-site-muted">price comparison · sample</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-site-graphite font-mono text-[11px] uppercase tracking-wider text-site-muted">
            <tr>
              <th scope="col" className="px-4 py-3">Material</th>
              <th scope="col" className="px-4 py-3">Vendor prices</th>
              <th scope="col" className="px-4 py-3">Vendors</th>
              <th scope="col" className="px-4 py-3">Saving</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-site-line bg-site-surface">
            {ANALYTICS.demand.map((d) => (
              <tr key={d.material} className="hover:bg-site-graphite/60 transition-colors">
                <td className="px-4 py-3 text-site-text font-medium">{d.material}</td>
                <td className="px-4 py-3 font-mono text-[11px] text-site-muted">{d.cpseDemand}</td>
                <td className="px-4 py-3 font-mono text-xs tabular-nums text-site-text">{d.combinedQty.toLocaleString()}</td>
                <td className="px-4 py-3 font-mono text-xs font-semibold text-site-orange">{d.saving}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AnalyticsSection() {
  return (
    <SectionShell id="analytics" className="bg-site-black py-20 md:py-28">
      <SectionHeader index="04" title="analytics" blurb="Where the listings sit, how prices spread across vendors, and what comparing them is worth. Every figure below is sample data." />
      <div className="mt-14 grid gap-6 lg:grid-cols-2">
        <CategoryBars />
        <Reveal className="flex items-center">
          <SiteCard stat className="w-full">
            <span className="font-mono text-[11px] uppercase tracking-wider text-site-muted site-card-index">sample</span>
            <p className="mt-4 font-display text-[clamp(48px,8vw,96px)] leading-none text-site-orange site-card-num">
              {ANALYTICS.inventoryReduction.value}
            </p>
            <p className="mt-3 text-site-muted site-card-body">{ANALYTICS.inventoryReduction.label}</p>
            <p className="mt-1 font-mono text-[11px] text-site-muted site-card-body">{ANALYTICS.inventoryReduction.sub}</p>
          </SiteCard>
        </Reveal>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Reveal>
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-wider text-site-muted">
              price comparison — {ANALYTICS.cluster.label}
            </p>
            <PriceGraph />
          </div>
        </Reveal>
        <Reveal delay={0.05}>
          <PriceTable />
        </Reveal>
      </div>
    </SectionShell>
  );
}
