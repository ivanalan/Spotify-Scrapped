"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  chrome: ReactNode;
  children: ReactNode;
  className?: string;
};

/** Phone-aspect story stage: shared chrome behind a content frame. */
export function StoryChromeStage({ chrome, children, className }: Props) {
  return (
    <div
      className={cn(
        "relative mx-auto aspect-[9/16] w-full max-w-[360px] overflow-hidden rounded-2xl border border-border shadow-[0_24px_64px_-24px_rgba(0,0,0,0.55)]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {chrome}
      </div>
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
