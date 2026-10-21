"use client";

import { useEffect, useState, type FormEvent } from "react";
import { gatePrimaryTone } from "@/components/scrapped/gateChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const HELPER_DEFAULT = "Enter the email you use for Spotify";
const HELPER_SUCCESS =
  "You’re signed up for the waitlist! You’ll get an email with a link when it’s ready.";
const HELPER_EMPTY = "Enter an email to join the waitlist";
const HELPER_INVALID = "That doesn’t look like an email";

const RESET_AFTER_JOINED_MS = 5000;

type Phase = "idle" | "empty" | "invalid" | "success";

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

/**
 * Gate waitlist shell — local UX only; no persistence or email send yet.
 * Composes shadcn Input + Button as two separate controls (D-003).
 *
 * After Join: field + Joined go read-only, then auto-reset after 5s.
 */
export function GateWaitlistForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  const locked = phase === "success";
  const isError = phase === "empty" || phase === "invalid";

  const helper =
    phase === "success"
      ? HELPER_SUCCESS
      : phase === "empty"
        ? HELPER_EMPTY
        : phase === "invalid"
          ? HELPER_INVALID
          : HELPER_DEFAULT;

  useEffect(() => {
    if (phase !== "success") return;
    const id = window.setTimeout(() => {
      setEmail("");
      setPhase("idle");
    }, RESET_AFTER_JOINED_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    const value = email.trim();
    if (!value) {
      setPhase("empty");
      return;
    }
    if (!isValidEmail(value)) {
      setPhase("invalid");
      return;
    }
    setPhase("success");
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn("w-full", className)}
      noValidate
    >
      <div className="flex w-full items-stretch gap-2">
        <label className="sr-only" htmlFor="gate-waitlist-email">
          Email
        </label>
        <Input
          id="gate-waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          spellCheck={false}
          placeholder="Email"
          value={email}
          disabled={locked}
          aria-invalid={isError || undefined}
          onChange={(event) => {
            setEmail(event.target.value);
            if (phase === "empty" || phase === "invalid") {
              setPhase("idle");
            }
          }}
          className={cn(
            "h-12 min-w-0 flex-1 rounded-lg border-[var(--wrapped-ink)]/25 bg-[color-mix(in_oklab,var(--wrapped-ink)_10%,transparent)] px-4 text-base font-medium text-[var(--wrapped-ink)] placeholder:text-[var(--wrapped-ink)]/45 focus-visible:border-[var(--wrapped-ink)]/55 focus-visible:ring-[var(--wrapped-ink)]/20 dark:bg-[color-mix(in_oklab,var(--wrapped-ink)_10%,transparent)]",
            isError &&
              "border-[#ff8a9a]/70 focus-visible:border-[#ff8a9a]/70 focus-visible:ring-[#ff8a9a]/20",
          )}
        />
        <Button
          type="submit"
          size="lg"
          disabled={locked}
          className={cn(
            gatePrimaryTone,
            "h-12 shrink-0 rounded-lg px-5 text-base font-semibold",
            locked &&
              "cursor-default opacity-55 hover:bg-[var(--wrapped-ink)] hover:opacity-55",
          )}
        >
          {locked ? "Joined" : "Join"}
        </Button>
      </div>
      <p
        className="text-caption mt-2.5 w-full text-[var(--wrapped-muted)]"
        aria-live="polite"
      >
        {helper}
      </p>
    </form>
  );
}
