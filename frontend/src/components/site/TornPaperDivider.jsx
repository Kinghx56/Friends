import { useMemo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Quoti-style torn-paper divider: a paper-coloured strip with a jagged top and
 * bottom edge, sitting on the black page. The clip-path is generated once and
 * memoised so it stays stable across renders.
 */
function jaggedPath(steps = 28, amp = 7) {
  const pts = [];
  pts.push(`0 ${(Math.random() * amp).toFixed(2)}`);
  for (let i = 1; i <= steps; i++) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)} ${(Math.random() * amp).toFixed(2)}`);
  }
  pts.push(`100 ${(94 + Math.random() * 6).toFixed(2)}`);
  for (let i = steps; i >= 0; i--) {
    const x = (i / steps) * 100;
    pts.push(`${x.toFixed(2)} ${(100 - Math.random() * amp).toFixed(2)}`);
  }
  pts.push(`0 ${(100 - Math.random() * amp).toFixed(2)}`);
  return `polygon(${pts.join(',')})`;
}

export default function TornPaperDivider({ className, height = 48 }) {
  const clip = useMemo(() => jaggedPath(), []);
  return (
    <div
      aria-hidden
      className={cn('site-paper-edge w-full', className)}
      style={{ height, clipPath: clip, WebkitClipPath: clip }}
    />
  );
}
