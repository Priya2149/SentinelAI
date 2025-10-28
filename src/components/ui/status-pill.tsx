import * as React from "react";
import { CheckCircle2, XCircle, Flag, AlertTriangle } from "lucide-react";

export default function StatusBadgeEnhanced({
  status,
}: {
  status: "success" | "error" | "flagged";
}) {
  const config = (() => {
    switch (status) {
      case "success":
        return {
          icon: <CheckCircle2 className="h-3 w-3" />,
          cls: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
          pulse: false,
        };
      case "error":
        return {
          icon: <XCircle className="h-3 w-3" />,
          cls: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800",
          pulse: true,
        };
      case "flagged":
        return {
          icon: <Flag className="h-3 w-3" />,
          cls: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
          pulse: true,
        };
      default:
        return {
          icon: <AlertTriangle className="h-3 w-3" />,
          cls: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600",
          pulse: false,
        };
    }
  })();

  return (
    <span
      className={`
        inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border
        ${config.cls} ${config.pulse ? "animate-pulse" : ""}
      `}
    >
      {config.icon}
      <span>{status}</span>
    </span>
  );
}
