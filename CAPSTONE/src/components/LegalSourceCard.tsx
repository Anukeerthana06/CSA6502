import React, { useState } from 'react';
import { ChevronDown, ChevronUp, BookmarkCheck } from 'lucide-react';

export interface SourceItemData {
  document: string;
  act?: string;
  section?: string;
  chapter?: string | null;
  page?: number | null;
  relevance: number;
  excerpt: string;
}

interface LegalSourceCardProps {
  source: SourceItemData;
  index: number;
}

export const LegalSourceCard: React.FC<LegalSourceCardProps> = ({ source, index }) => {
  const [expanded, setExpanded] = useState(false);
  const relevancePct = Math.round(source.relevance * 100);

  return (
    <div
      id={`source-card-${index}`}
      className="rounded-lg border border-slate-200 bg-white p-3.5 shadow-2xs transition hover:border-slate-300"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700 font-mono text-xs font-bold">
            #{index + 1}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight text-slate-900 uppercase">
                {source.act || source.document}
              </h4>
              {source.section && (
                <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 font-mono text-xs font-semibold text-blue-700 border border-blue-200/80">
                  <BookmarkCheck className="mr-1 h-3 w-3 text-blue-600" />
                  {source.section}
                </span>
              )}
            </div>

            <div className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-slate-500">
              {source.chapter && <span>{source.chapter}</span>}
              {source.page && <span>Page: {source.page}</span>}
              {source.document && source.document !== source.act && (
                <span className="text-slate-400 font-mono text-[11px]">Doc: {source.document}</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
              relevancePct >= 70
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : relevancePct >= 40
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            {relevancePct}% Grounding Match
          </span>

          <button
            type="button"
            id={`btn-toggle-source-${index}`}
            onClick={() => setExpanded(!expanded)}
            aria-label={expanded ? 'Collapse source excerpt' : 'Expand source excerpt'}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition"
          >
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className={`mt-2.5 text-xs leading-relaxed text-slate-700 bg-slate-50 rounded p-2.5 border border-slate-100 ${expanded ? '' : 'line-clamp-2'}`}>
        <p className="font-serif italic text-slate-800">
          "{source.excerpt}"
        </p>
      </div>
    </div>
  );
};
