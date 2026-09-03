import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface DisclaimerBannerProps {
  compact?: boolean;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ compact = false }) => {
  return (
    <div
      id="nyayamithra-disclaimer"
      className={`rounded-xl border border-slate-200 bg-white text-slate-700 ${
        compact ? 'p-3 text-xs' : 'p-4 text-xs sm:text-sm'
      } flex items-start gap-3 shadow-2xs`}
    >
      <ShieldAlert className={`${compact ? 'h-4 w-4 mt-0.5' : 'h-5 w-5 mt-0.5'} shrink-0 text-blue-600`} />
      <div className="leading-relaxed">
        <span className="font-bold text-slate-900">Legal Notice & Disclaimer: </span>
        NyayaMithra provides general legal information and AI-assisted preliminary legal drafts under Indian law. It is not a substitute for advice from a qualified advocate or formal legal representation before a court of law.
      </div>
    </div>
  );
};
