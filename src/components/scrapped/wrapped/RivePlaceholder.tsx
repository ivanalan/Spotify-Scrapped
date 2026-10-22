"use client";

import { cn } from "@/lib/utils";

type Props = {
  label: string;
  src?: string | null;
  inputs?: Record<string, string | number | boolean>;
  className?: string;
};

/** Hard-edged slot for a future Rive composition: no soft atmosphere. */
export function RivePlaceholder({ label, src, inputs, className }: Props) {
  void src;
  void inputs;

  return (
    <div
      className={cn(
        "relative flex aspect-square w-full max-w-[14rem] flex-col items-center justify-center border-2 border-[var(--wrapped-accent)] bg-[var(--wrapped-canvas)]",
        className,
      )}
      role="img"
      aria-label={label}
      data-rive-src={src ?? undefined}
    >
      <div className="absolute left-2 top-2 font-mono text-[0.55rem] uppercase tracking-[0.18em] text-[var(--wrapped-muted)]">
        RIV
      </div>
      <div className="absolute bottom-2 right-2 h-2 w-2 bg-[var(--wrapped-accent)]" />
      <p className="max-w-[12ch] text-center font-sans text-base font-extrabold uppercase leading-tight tracking-tight text-[var(--wrapped-ink)]">
        {label}
      </p>
    </div>
  );
}
