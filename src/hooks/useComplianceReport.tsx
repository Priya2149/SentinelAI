"use client";

import { useEffect, useMemo, useState } from "react";
import type { ComplianceReportData } from "@/server/metrics/metrics.types";

export function useComplianceReport(pdfData: ComplianceReportData) {
  const [showPdfPreview, setShowPdfPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const fileName = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    return `AI_Governance_Report_${year}-${month}-${day}.pdf`;
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      if (!showPdfPreview) return;

      setShowPdfPreview(false);
      setPreviewLoading(false);

      setPreviewUrl((url) => {
        if (url) URL.revokeObjectURL(url);
        return null;
      });
    };

    window.addEventListener("popstate", handlePopState);

    return () => window.removeEventListener("popstate", handlePopState);
  }, [showPdfPreview]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  async function createPdfBlob() {
    const [{ pdf }, { default: ComplianceReport }] = await Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/pdf/ComplianceReport"),
    ]);

    const document = <ComplianceReport data={pdfData} />;

    return pdf(document).toBlob();
  }

  async function openPdfPreview() {
    try {
      window.history.pushState({ pdfPreview: true }, "", window.location.href);

      setPreviewLoading(true);
      setShowPdfPreview(true);

      const blob = await createPdfBlob();
      const url = URL.createObjectURL(blob);

      setPreviewUrl((oldUrl) => {
        if (oldUrl) URL.revokeObjectURL(oldUrl);
        return url;
      });
    } catch (error) {
      console.error("PDF preview failed:", error);
      alert("Could not generate the preview. Check the console for details.");
      setShowPdfPreview(false);
    } finally {
      setPreviewLoading(false);
    }
  }

  function closePdfPreview() {
    if (window.history.state?.pdfPreview) {
      window.history.back();
      return;
    }

    setShowPdfPreview(false);
    setPreviewLoading(false);

    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }

  async function downloadPdf() {
    try {
      setDownloading(true);

      const blob = await createPdfBlob();
      const url = URL.createObjectURL(blob);

      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = fileName;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Could not generate the PDF. Check the console for details.");
    } finally {
      setDownloading(false);
    }
  }

  return {
    showPdfPreview,
    previewUrl,
    previewLoading,
    downloading,
    openPdfPreview,
    closePdfPreview,
    downloadPdf,
  };
}