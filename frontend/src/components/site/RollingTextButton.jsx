import { cn } from '@/lib/utils';

/**
 * Rolling-text button (Quoti-style): on hover/focus the label slides up and a
 * copy rolls in from below. The duplicate is aria-hidden so screen readers read
 * the label once.
 */
export default function RollingTextButton({
  children,
  className,
  href,
  onClick,
  type = 'button',
  ...props
}) {
  const Tag = href ? 'a' : 'button';
  const roll = 'transition-transform duration-roll ease-roll';
  return (
    <Tag
      {...(href ? { href } : { type })}
      onClick={onClick}
      className={cn('group relative inline-flex', className)}
      {...props}
    >
      <span className="relative block overflow-hidden">
        <span className={cn('block', roll, 'group-hover:-translate-y-full group-focus-visible:-translate-y-full')}>
          {children}
        </span>
        <span
          aria-hidden
          className={cn(
            'absolute left-0 top-0 block translate-y-full',
            roll,
            'group-hover:translate-y-0 group-focus-visible:translate-y-0'
          )}
        >
          {children}
        </span>
      </span>
    </Tag>
  );
}
