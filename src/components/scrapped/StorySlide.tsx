"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Props = {
  index: string;
  title: string;
  blurb: string;
  children?: ReactNode;
  footer?: ReactNode;
  active?: boolean;
  className?: string;
};

export function StorySlide({
  index,
  title,
  blurb,
  children,
  footer,
  active = false,
  className,
}: Props) {
  return (
    <section
      data-scrapped-slide
      className={cn(
        "flex h-[calc(100dvh-3.75rem)] min-h-[calc(100dvh-3.75rem)] w-full snap-start snap-always flex-col justify-center px-6 py-16 md:px-10",
        className,
      )}
      aria-hidden={!active}
    >
      <div
        className={cn(
          "mx-auto flex w-full max-w-3xl flex-col gap-6 transition-opacity duration-[var(--duration-move)] ease-[var(--ease-out)]",
          active ? "opacity-100" : "opacity-55",
        )}
      >
        <header className="space-y-3">
          <p className="font-mono text-sm text-ring">{index}</p>
          <h2 className="max-w-[16ch] font-heading text-[clamp(2.25rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
            {title}
          </h2>
          <p className="max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
            {blurb}
          </p>
          <div className="h-px w-16 origin-left bg-ring animate-rule" />
        </header>
        {children ? <div className="min-h-0">{children}</div> : null}
        {footer ? (
          <div className="text-sm text-muted-foreground">{footer}</div>
        ) : null}
      </div>
    </section>
  );
}
