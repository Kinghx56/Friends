import { useNavigate } from 'react-router-dom';
import { FINAL_CTA } from '@/data/saarthiSample';

export default function FinalCta() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-site-black px-6 pb-10 pt-28 md:px-10 md:pt-40">
      <div className="mx-auto max-w-[1400px] text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-site-orange">
          procurement · equivalence
        </p>
        <h2 className="mt-6 font-display lowercase text-[clamp(40px,8vw,112px)] leading-[0.9] text-site-text">
          {FINAL_CTA.headline}
        </h2>
        <p className="mx-auto mt-6 max-w-[52ch] text-site-muted">{FINAL_CTA.body}</p>
        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate('/login')}
            className="rounded-full bg-site-orange px-8 py-3.5 font-mono text-sm text-site-black hover:brightness-95 transition-all"
          >
            login to portal →
          </button>
          <span className="font-mono text-xs text-site-muted">four roles · engineer · accounts · admin · operator</span>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none mt-16 select-none text-center">
        <span
          className="font-display lowercase leading-none"
          style={{ fontSize: '24vw', color: 'rgba(178,58,10,0.06)' }}
        >
          saarthi
        </span>
      </div>

      <footer className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-3 border-t border-site-line pt-6 md:flex-row">
        <p className="font-mono text-xs text-site-muted">© 2026 saarthi · sample data · enterprise prototype</p>
        <p className="font-mono text-xs text-site-muted">source any material. prove any substitute.</p>
      </footer>
    </section>
  );
}
