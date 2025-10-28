"use client";

import * as React from "react";
import clsx from "clsx";

type ClickableChildProps = {
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  "aria-haspopup"?: string;
  "aria-expanded"?: boolean;
};

type PopoverContextValue = {
  open: boolean;
  setOpen: (v: boolean) => void;
  // NOTE: allow null in the ref's current type
  anchorRef: React.RefObject<HTMLDivElement | null>;
};

const PopoverCtx = React.createContext<PopoverContextValue | null>(null);

export function Popover({
  children,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  // NOTE: ref typed with `HTMLDivElement | null`
  const anchorRef = React.useRef<HTMLDivElement | null>(null);
  const [open, setOpen] = React.useState<boolean>(defaultOpen);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onClick = (e: MouseEvent) => {
      const el = anchorRef.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  return (
    <PopoverCtx.Provider value={{ open, setOpen, anchorRef }}>
      <div ref={anchorRef} className="relative inline-block">
        {children}
      </div>
    </PopoverCtx.Provider>
  );
}

export function PopoverTrigger({
  children,
  asChild = false,
  className,
}: {
  children: React.ReactElement<ClickableChildProps>;
  asChild?: boolean;
  className?: string;
}) {
  const ctx = React.useContext(PopoverCtx);
  if (!ctx) throw new Error("PopoverTrigger must be used within <Popover />");
  const { open, setOpen } = ctx;

  if (asChild) {
    const child = React.Children.only(children) as React.ReactElement<ClickableChildProps>;
    const childOnClick = child.props.onClick;
    const handleClick = (e: React.MouseEvent) => {
      childOnClick?.(e);
      setOpen(!open);
    };
    return React.cloneElement(child, {
      onClick: handleClick,
      "aria-haspopup": "dialog",
      "aria-expanded": open,
      className: child.props.className,
    });
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={clsx("inline-flex items-center", className)}
      aria-haspopup="dialog"
      aria-expanded={open}
    >
      {children}
    </button>
  );
}

export function PopoverContent({
  children,
  align = "end",
  className,
}: {
  children: React.ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const ctx = React.useContext(PopoverCtx);
  if (!ctx) throw new Error("PopoverContent must be used within <Popover />");
  const { open } = ctx;

  if (!open) return null;

  const alignClass = align === "start" ? "left-0" : "right-0";

  return (
    <div
      role="dialog"
      aria-modal="true"
      className={clsx(
        "absolute z-50 mt-2 min-w-[12rem] rounded-md border bg-white dark:bg-gray-900 text-sm shadow-xl outline-none",
        "border-gray-200 dark:border-gray-800",
        alignClass,
        className
      )}
    >
      <div className="p-2">{children}</div>
    </div>
  );
}
