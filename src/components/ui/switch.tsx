"use client";

import * as React from "react";
import clsx from "clsx";

export type SwitchProps = {
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
  "aria-label"?: string;
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  id,
  className,
  ...rest
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled || undefined}
      id={id}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onCheckedChange(!checked);
        }
      }}
      className={clsx(
        "relative inline-flex h-6 w-11 cursor-pointer select-none items-center rounded-full border transition-colors",
        checked
          ? "bg-blue-600 border-blue-600"
          : "bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600",
        disabled && "opacity-60 cursor-not-allowed",
        className
      )}
      {...rest}
    >
      <span
        className={clsx(
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform",
          checked ? "translate-x-5" : "translate-x-0.5"
        )}
      />
    </button>
  );
}
