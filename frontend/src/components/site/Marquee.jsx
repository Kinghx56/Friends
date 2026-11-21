import { cn } from '@/lib/utils';
import { MARQUEE_ITEMS } from '@/data/saarthiSample';

/**
 * Looping marquee of orange outlined text on black. Two identical tracks sit
 * side by side; the -50% translate gives a seamless loop. Paused instantly under
 * prefers-reduced-motion via the scoped CSS in index.css.
 */
export default function Marquee({ className }) {
  const text = MARQUEE_ITEMS.map((i) => `// ${i}`).join('  ') + '  ';
  return (
    <div className={cn('overflow-hidden border-y border-site-line bg-site-black py-6', className)} aria-hidden>
      <div className="flex w-max animate-site-marquee">
        <span className="site-marquee-outline font-display lowercase text-[13vw] leading-none md:text-[10vw]">
          {text}
        </span>
        <span className="site-marquee-outline font-display lowercase text-[13vw] leading-none md:text-[10vw]">
          {text}
        </span>
      </div>
    </div>
  );
}
