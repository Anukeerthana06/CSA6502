import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface OfflineNoticeProps {
  onRetry?: () => void;
  message?: string;
  onUseDemoMode?: () => void;
}

export const OfflineNotice: React.FC<OfflineNoticeProps> = ({
  onRetry,
  message,
}) => {
  return (
    <div
      id="nyayamithra-offline-notice"
      className="rounded-xl border border-amber-200 bg-amber-50/90 p-4 shadow-2xs text-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-amber-200/70 p-2 text-amber-900 shrink-0">
          <AlertCircle className="h-4 w-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-950">
            Offline Legal Knowledge Active
          </h4>
          <p className="text-xs text-amber-900 leading-relaxed">
            {message ||
              'Standard Indian statutory reference templates and offline legal guidance are active.'}
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-900 hover:bg-amber-100/50 transition shadow-2xs shrink-0"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Retry Connection</span>
        </button>
      )}
    </div>
  );
};
