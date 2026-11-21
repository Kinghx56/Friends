import { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import IntroOverlay from '@/components/site/IntroOverlay';
import SiteNav from '@/components/site/SiteNav';
import Hero from '@/components/site/Hero';
import Marquee from '@/components/site/Marquee';
import ProblemSection from '@/components/site/ProblemSection';
import MatchSection from '@/components/site/MatchSection';
import ReviewSection from '@/components/site/ReviewSection';
import GovernSection from '@/components/site/GovernSection';
import AnalyticsSection from '@/components/site/AnalyticsSection';
import ErpSection from '@/components/site/ErpSection';
import HowItWorks from '@/components/site/HowItWorks';
import ImpactSection from '@/components/site/ImpactSection';
import FaqSection from '@/components/site/FaqSection';
import FinalCta from '@/components/site/FinalCta';

const INTRO_KEY = 'saarthi_intro_seen';

export default function Landing() {
  const [introDone, setIntroDone] = useState(() => {
    if (typeof window === 'undefined') return true;
    return !!sessionStorage.getItem(INTRO_KEY);
  });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div className="saarthi-site min-h-screen bg-site-black text-site-text">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[201] focus:rounded focus:bg-site-orange focus:px-4 focus:py-2 focus:font-mono focus:text-sm focus:text-site-black"
        >
          skip to content
        </a>
        {!introDone && <IntroOverlay onComplete={() => setIntroDone(true)} />}
        <SiteNav />
        <main id="main-content">
          <Hero animateIn={introDone} />
          <Marquee />
          <ProblemSection />
          <MatchSection />
          <ReviewSection />
          <GovernSection />
          <AnalyticsSection />
          <ErpSection />
          <HowItWorks />
          <ImpactSection />
          <FaqSection />
          <FinalCta />
        </main>
      </div>
    </MotionConfig>
  );
}
