import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

const EASE = [0.22, 1, 0.36, 1];

/** Scroll-reveal wrapper. Instant when reduced motion is requested. */
export function Reveal({ children, className, delay = 0, y = 18, once = true, ...props }) {
  const reduced = useReducedMotion();
  if (reduced) return <div className={className} {...props}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.55, ease: EASE, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * SiteCard — a card that fills black and flips all text to cream on hover.
 * Pass `stat` for the large-number stat variant.
 */
export function SiteCard({ children, className, stat = false }) {
  const reduced = useReducedMotion();
  if (reduced) {
    return (
      <div
        className={cn(
          'rounded-xl border border-site-line bg-site-surface p-6',
          className
        )}
      >
        {children}
      </div>
    );
  }
  return (
    <motion.div
      className={cn(
        'site-card group/card rounded-xl border border-site-line bg-site-surface p-6 cursor-default',
        stat && 'site-card--stat',
        className
      )}
      whileHover={{ scale: stat ? 1.02 : 1.015 }}
      transition={{ duration: 0.22, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Small mono eyebrow label. */
export function Tag({ children, className }) {
  return (
    <span className={cn('font-mono text-[11px] uppercase tracking-[0.22em] text-site-orange', className)}>
      {children}
    </span>
  );
}

/** Standard full-bleed section shell with consistent gutters. */
export function SectionShell({ id, className, children }) {
  return (
    <section id={id} className={cn('relative w-full', className)}>
      <div className="mx-auto w-full max-w-[1400px] px-6 md:px-10">{children}</div>
    </section>
  );
}

/** A simple CTA link styled as an underlined offset anchor. */
export function TextLink({ href, children, className, ...props }) {
  return (
    <a
      href={href}
      className={cn('text-site-text underline-offset-[6px] decoration-site-line hover:decoration-site-orange transition-colors', className)}
      {...props}
    >
      {children}
    </a>
  );
}
