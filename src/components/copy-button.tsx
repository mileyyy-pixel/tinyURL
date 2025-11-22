"use client";

import { useCallback, useMemo, useState } from "react";

type CopyButtonProps = {
  value: string;
  size?: "sm" | "md";
};

const COPY_RESET_DELAY = 1800;

export function CopyButton({ value, size = "md" }: CopyButtonProps) {
  const [state, setState] = useState<"idle" | "copied" | "error">("idle");

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
      setState("copied");
    } catch {
      setState("error");
    } finally {
      setTimeout(() => setState("idle"), COPY_RESET_DELAY);
    }
  }, [value]);

  const { label, styles } = useMemo(() => {
    const baseStyles =
      "inline-flex items-center justify-center rounded-md border text-sm font-medium transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500";
    const padding = size === "sm" ? "px-2 py-1" : "px-3 py-1.5";

    switch (state) {
      case "copied":
        return {
          label: "Copied",
          styles: `${baseStyles} ${padding} border-emerald-600 bg-emerald-50 text-emerald-900`,
        };
      case "error":
        return {
          label: "Copy failed",
          styles: `${baseStyles} ${padding} border-red-500 bg-red-50 text-red-900`,
        };
      default:
        return {
          label: "Copy",
          styles: `${baseStyles} ${padding} border-slate-300 bg-white text-slate-900 hover:bg-slate-50`,
        };
    }
  }, [size, state]);

  return (
    <button type="button" onClick={copy} className={styles}>
      {label}
    </button>
  );
}


