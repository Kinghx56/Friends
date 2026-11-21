import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import RollingTextButton from './RollingTextButton';

const LINKS = [
  { id: 'source', label: '01 source' },
  { id: 'verify', label: '02 verify' },
  { id: 'decide', label: '03 decide' },
];

function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToId(id) {
  return (e) => {
    e.preventDefault();
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  };
}

export default function SiteNav() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    LINKS.forEach((l) => {
      const el = document.getElementById(l.id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="On this page"
      className={cn(
        'sticky top-0 z-[120] transition-colors',
        scrolled ? 'border-b border-site-line bg-site-black/85 backdrop-blur' : 'border-b border-transparent bg-site-black'
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between px-6 md:h-20 md:px-10">
        <a href="#top" onClick={scrollToId('top')} className="font-display lowercase text-2xl tracking-tight text-site-text">
          saarthi
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={scrollToId(l.id)}
              className={cn(
                'font-mono text-sm transition-colors',
                active === l.id ? 'text-site-orange' : 'text-site-muted hover:text-site-text'
              )}
            >
              {l.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <RollingTextButton
            href="#demo"
            onClick={scrollToId('demo')}
            className="hidden rounded-full border border-site-line px-5 py-2 font-mono text-sm text-site-text hover:border-site-orange md:inline-flex"
          >
            see the demo
          </RollingTextButton>
          {/* Login button */}
          <button
            onClick={() => navigate('/login')}
            className="rounded-full bg-site-orange px-5 py-2 font-mono text-sm text-site-black hover:brightness-95 transition-all"
          >
            login →
          </button>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
            className="font-mono text-sm text-site-muted hover:text-site-text md:hidden"
          >
            menu
          </button>
        </div>
      </div>

      {open && (
        <div id="site-mobile-menu" className="border-t border-site-line bg-site-black px-6 py-4 md:hidden">
          <div className="flex flex-col gap-3">
            {LINKS.map((l) => (
              <a
                key={l.id}
                href={`#${l.id}`}
                onClick={(e) => {
                  scrollToId(l.id)(e);
                  setOpen(false);
                }}
                className={cn(
                  'font-mono text-sm',
                  active === l.id ? 'text-site-orange' : 'text-site-muted'
                )}
              >
                {l.label}
              </a>
            ))}
            <a
              href="#demo"
              onClick={(e) => {
                scrollToId('demo')(e);
                setOpen(false);
              }}
              className="font-mono text-sm text-site-text"
            >
              see the demo →
            </a>
            <button
              onClick={() => navigate('/login')}
              className="text-left font-mono text-sm text-site-orange"
            >
              login →
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
