"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import {
  gateCaptionLinkChromeClass,
  gateFieldTone,
  gatePrimaryTone,
} from "@/components/scrapped/gateChrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  isValidWaitlistEmail,
  normalizeWaitlistEmail,
} from "@/lib/waitlist/email";
import { cn } from "@/lib/utils";

const HELPER_DEFAULT =
  "Join with your Spotify email. Seat emails only.";
const HELPER_SUCCESS =
  "You’re signed up for the waitlist! You’ll get an email with a link when it’s ready.";
const HELPER_EMPTY = "Enter an email to join the waitlist";
const HELPER_INVALID = "That doesn’t look like an email";
const HELPER_ERROR = "Something went wrong. Try again in a moment.";
const HELPER_RATE = "Too many tries. Wait a few minutes and try again.";

const RESET_AFTER_JOINED_MS = 5000;

type Phase =
  | "idle"
  | "empty"
  | "invalid"
  | "submitting"
  | "success"
  | "error"
  | "rate_limited";

/**
 * Gate waitlist: Join posts to /api/waitlist (Neon + Upstash rate limit).
 * Composes shadcn Input + Button as two separate controls (D-003).
 *
 * After Join: field + Joined go read-only, then auto-reset after 5s.
 */
export function GateWaitlistForm({ className }: { className?: string }) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");

  const locked = phase === "success" || phase === "submitting";
  const isError =
    phase === "empty" ||
    phase === "invalid" ||
    phase === "error" ||
    phase === "rate_limited";

  const helper =
    phase === "success"
      ? HELPER_SUCCESS
      : phase === "empty"
        ? HELPER_EMPTY
        : phase === "invalid"
          ? HELPER_INVALID
          : phase === "rate_limited"
            ? HELPER_RATE
            : phase === "error"
              ? HELPER_ERROR
              : HELPER_DEFAULT;

  useEffect(() => {
    if (phase !== "success") return;
    const id = window.setTimeout(() => {
      setEmail("");
      setPhase("idle");
    }, RESET_AFTER_JOINED_MS);
    return () => window.clearTimeout(id);
  }, [phase]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
    const value = normalizeWaitlistEmail(email);
    if (!value) {
      setPhase("empty");
      return;
    }
    if (!isValidWaitlistEmail(value)) {
      setPhase("invalid");
      return;
    }

    setPhase("submitting");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      if (res.status === 429) {
        setPhase("rate_limited");
        return;
      }
      if (!res.ok) {
        setPhase(res.status === 400 ? "invalid" : "error");
        return;
      }
      setPhase("success");
    } catch {
      setPhase("error");
    }
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
            if (
              phase === "empty" ||
              phase === "invalid" ||
              phase === "error" ||
              phase === "rate_limited"
            ) {
              setPhase("idle");
            }
          }}
          className={cn(
            gateFieldTone,
            "min-w-0 flex-1",
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
            "shrink-0",
            phase === "success" &&
              "cursor-default opacity-55 hover:bg-[var(--wrapped-ink)] hover:opacity-55",
          )}
        >
          {phase === "submitting"
            ? "Joining…"
            : phase === "success"
              ? "Joined"
              : "Join waitlist"}
        </Button>
      </div>
      <div className="mt-2.5 w-full">
        <p
          className="w-full text-xs text-[var(--wrapped-muted)]"
          aria-live="polite"
        >
          {helper}
          {helper === HELPER_DEFAULT ? (
            <>
              {" "}
              <Link
                href="/about#privacy"
                className={cn(
                  gateCaptionLinkChromeClass,
                  "inline text-xs no-underline hover:no-underline",
                )}
              >
                Privacy
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </form>
  );
}
