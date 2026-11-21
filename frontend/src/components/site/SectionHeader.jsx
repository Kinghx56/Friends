import { cn } from '@/lib/utils';

/**
 * Section header: a large mono index + oversized display title + optional blurb.
 * The index is sized to ~30% of the title height so they read as a pair.
 */
export default function SectionHeader({ index, title, blurb, className }) {
  return (
    <header className={cn('', className)}>
      <div className="flex items-baseline gap-4 sm:gap-6 flex-wrap">
        {index && (
          <span
            className="font-mono text-site-orange font-bold tabular-nums shrink-0 leading-none tracking-tight border-b-2 border-site-orange pb-1"
            style={{ fontSize: 'clamp(24px,3.8vw,52px)' }}
          >
            {index}
          </span>
        )}
        <h2
          className="font-display lowercase leading-[0.88] text-site-text font-bold tracking-[-0.03em]"
          style={{ fontSize: 'clamp(38px,7vw,96px)' }}
        >
          {title}
        </h2>
      </div>
      {blurb && (
        <p className="site-measure mt-5 max-w-[65ch] text-site-muted text-base sm:text-lg leading-relaxed">
          {blurb}
        </p>
      )}
    </header>
  );
}
