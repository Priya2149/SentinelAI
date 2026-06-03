"use client";

import { FileDown, X as CloseIcon } from "lucide-react";

export function PdfPreviewModal({
  showPdfPreview,
  previewUrl,
  previewLoading,
  downloading,
  onClose,
  onDownload,
}: {
  showPdfPreview: boolean;
  previewUrl: string | null;
  previewLoading: boolean;
  downloading: boolean;
  onClose: () => void;
  onDownload: () => void;
}) {
  if (!showPdfPreview) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      <div className="absolute inset-4 flex flex-col rounded-xl bg-white shadow-xl dark:bg-gray-900">
        <div className="flex items-center gap-3 border-b px-4 py-2 dark:border-gray-800">
          <div className="text-sm font-medium">PDF Preview</div>

          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={onDownload}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 disabled:opacity-60 dark:border-gray-700 dark:hover:bg-gray-800"
              title="Download PDF"
            >
              <FileDown className="h-4 w-4" />
              {downloading ? "Preparing…" : "Download"}
            </button>

            <button
              onClick={onClose}
              className="inline-flex items-center gap-2 rounded-md border border-gray-200 px-3 py-1.5 text-sm hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
              title="Close preview"
            >
              <CloseIcon className="h-4 w-4" />
              Close
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1">
          {previewLoading && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Generating preview…
            </div>
          )}

          {!previewLoading && previewUrl && (
            <iframe
              src={previewUrl}
              className="h-full w-full rounded-b-xl"
              title="PDF preview"
            />
          )}

          {!previewLoading && !previewUrl && (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              No preview available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}