"use client";

import { X } from "lucide-react";

type FeedbackModalProps = {
  open: boolean;
  onClose: () => void;
  formUrl: string;
};

export function FeedbackModal({ open, onClose, formUrl }: FeedbackModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />

      {/* Panel */}
      <div className="absolute inset-4 md:inset-16 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200/60 dark:border-slate-700/60">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-200/60 dark:border-slate-700/60">
          <div>
            <div className="text-sm font-semibold">We’d love your feedback</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Help shape the next version of SentinelAI. This takes &lt; 30s.
            </div>
          </div>

          <button
            onClick={onClose}
            className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-slate-200/70 dark:border-slate-700/70 px-2.5 py-1.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <X className="h-3.5 w-3.5" />
            Close
          </button>
        </div>

        {/* Iframe */}
        <div className="flex-1 min-h-0">
          <iframe
            src={formUrl}
            className="w-full h-full"
            frameBorder="0"
            marginHeight={0}
            marginWidth={0}
          >
            Loading…
          </iframe>
        </div>
      </div>
    </div>
  );
}
