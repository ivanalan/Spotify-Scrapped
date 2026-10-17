"use client";

import { useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { refreshOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  next: "/" | "/scrapped" | "/scrapped/lab";
  label: string;
  /** `gate` = primary CTA on the light landing; default is inline link for Lab. */
  tone?: "link" | "gate";
  /** Kick off Load once on mount (gate fetch) so Start is a loading indicator. */
  autoStart?: boolean;
  className?: string;
};

function SubmitButton({
  label,
  tone,
  className,
}: {
  label: string;
  tone: "link" | "gate";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={tone === "gate" ? "default" : "link"}
      size={tone === "gate" ? "lg" : "default"}
      disabled={pending}
      aria-busy={pending}
      className={cn(
        tone === "gate"
          ? "h-12 w-full gap-2 rounded-2xl bg-[var(--wrapped-ink)] px-8 text-base font-semibold text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90"
          : "h-auto gap-1.5 p-0 text-foreground",
        pending && tone === "gate" && "pointer-events-none opacity-80",
        className,
      )}
    >
      {tone === "gate" ? (
        pending ? (
          <span
            className="size-4 animate-spin rounded-full border-2 border-[var(--wrapped-canvas)] border-t-transparent"
            aria-hidden
          />
        ) : (
          <Icon icon={refreshOutline} className="size-5" />
        )
      ) : null}
      {pending ? "Loading…" : label}
      {tone === "link" && !pending ? " →" : null}
    </Button>
  );
}

function GateHint() {
  const { pending } = useFormStatus();
  return (
    <p
      className="text-caption mt-3 w-full text-left text-[var(--wrapped-muted)]"
      aria-live="polite"
    >
      {pending
        ? "Fetching tops and Liked Songs. Keep this tab open…"
        : "Pulls tops and Liked Songs — large libraries can take a minute."}
    </p>
  );
}

const AUTO_START_KEY = "scrapped-lab-autostart";

export function SpotifyLabFetchForm({
  next,
  label,
  tone = "link",
  autoStart = false,
  className,
}: Props) {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!autoStart) return;
    try {
      if (sessionStorage.getItem(AUTO_START_KEY) === "1") return;
      sessionStorage.setItem(AUTO_START_KEY, "1");
    } catch {
      /* private mode — still attempt once via ref guard below */
    }
    formRef.current?.requestSubmit();
  }, [autoStart]);

  return (
    <form
      ref={formRef}
      action="/api/spotify/lab-refresh"
      method="post"
      className={
        tone === "gate" ? "flex w-full flex-col items-stretch" : undefined
      }
    >
      <input type="hidden" name="next" value={next} />
      <SubmitButton label={label} tone={tone} className={className} />
      {tone === "gate" ? <GateHint /> : null}
    </form>
  );
}
