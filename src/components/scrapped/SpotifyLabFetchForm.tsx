"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { refreshOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { gatePrimaryTone } from "@/components/scrapped/gateChrome";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  next: "/" | "/scrapped" | "/scrapped/lab";
  label: string;
  /** `gate` = primary CTA on the Orbit landing; default is inline link for Lab. */
  tone?: "link" | "gate";
  /**
   * Kick off Load once on mount (gate fetch). First paint is already busy:
   * URL `action` never flips `useFormStatus().pending`.
   */
  autoStart?: boolean;
  className?: string;
};

function SubmitButton({
  label,
  tone,
  className,
  optimisticBusy,
}: {
  label: string;
  tone: "link" | "gate";
  className?: string;
  /** Local busy: URL form actions never set `useFormStatus().pending`. */
  optimisticBusy: boolean;
}) {
  const { pending } = useFormStatus();
  const busy = pending || optimisticBusy;

  return (
    <Button
      type="submit"
      variant={tone === "gate" ? "default" : "link"}
      size={tone === "gate" ? "lg" : "default"}
      disabled={busy}
      aria-busy={busy}
      className={cn(
        tone === "gate"
          ? cn(
              gatePrimaryTone,
              "w-full gap-2",
            )
          : "h-auto gap-1.5 p-0 text-foreground",
        busy && tone === "gate" && "pointer-events-none opacity-80",
        className,
      )}
    >
      {tone === "gate" ? (
        busy ? (
          <span
            className="size-4 animate-spin rounded-full border-2 border-[var(--wrapped-canvas)] border-t-transparent"
            aria-hidden
          />
        ) : (
          <Icon icon={refreshOutline} className="size-5" />
        )
      ) : null}
      {busy ? "Loading…" : label}
      {tone === "link" && !busy ? " →" : null}
    </Button>
  );
}

export function SpotifyLabFetchForm({
  next,
  label,
  tone = "link",
  autoStart = false,
  className,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  // SSR + first client paint: autoStart gates never flash idle "Load data".
  const [optimisticBusy, setOptimisticBusy] = useState(autoStart);

  // Defer + cancel on cleanup so React Strict Mode remounts (and short-lived
  // mobile mounts) don't latch a "already started" flag and skip the real submit.
  // sessionStorage was wrong here: it was set *before* navigation, so a killed
  // first attempt blocked every later auto-start in the same tab.
  useEffect(() => {
    if (!autoStart) return;
    let cancelled = false;
    const id = window.setTimeout(() => {
      if (cancelled) return;
      formRef.current?.requestSubmit();
    }, 0);
    return () => {
      cancelled = true;
      window.clearTimeout(id);
    };
  }, [autoStart]);

  return (
    <form
      ref={formRef}
      action="/api/spotify/lab-refresh"
      method="post"
      onSubmit={() => setOptimisticBusy(true)}
      className={
        tone === "gate" ? "flex w-full flex-col items-stretch" : undefined
      }
    >
      <input type="hidden" name="next" value={next} />
      <SubmitButton
        label={label}
        tone={tone}
        className={className}
        optimisticBusy={optimisticBusy}
      />
    </form>
  );
}
