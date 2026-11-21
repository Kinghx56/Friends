import { SectionShell } from './ui';
import SectionHeader from './SectionHeader';
import { FAQS } from '@/data/saarthiSample';
import { ChevronDown } from 'lucide-react';

export default function FaqSection() {
  return (
    <SectionShell id="faq" className="bg-site-black py-20 md:py-28">
      <SectionHeader title="faq" />
      <div className="mt-12 max-w-[760px]">
        {FAQS.map((f, i) => (
          <details key={i} className="group border-b border-site-line py-5 [&::-webkit-details-marker]:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-site-text">
              <span className="text-lg">{f.q}</span>
              <ChevronDown className="h-5 w-5 shrink-0 text-site-orange transition-transform group-open:rotate-180" />
            </summary>
            <p className="site-measure mt-3 text-site-muted">{f.a}</p>
          </details>
        ))}
      </div>
    </SectionShell>
  );
}
