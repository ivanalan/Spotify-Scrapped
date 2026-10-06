"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

function formatWait(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m <= 0) return `${s}s`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

type Props = {
  message: string;
  retryAfterSeconds?: number;
  quotaExceeded?: boolean;
  className?: string;
};

export function SpotifyRateLimitWait({
  message,
  retryAfterSeconds,
  quotaExceeded,
  className,
}: Props) {
  const router = useRouter();
  const until = useMemo(
    () => Date.now() + Math.max(0, retryAfterSeconds ?? 0) * 1000,
    [retryAfterSeconds],
  );
  const [remaining, setRemaining] = useState(() =>
    retryAfterSeconds == null
      ? 0
      : Math.max(0, Math.ceil((until - Date.now()) / 1000)),
  );

  useEffect(() => {
    if (retryAfterSeconds == null) return;
    function tick() {
      setRemaining(Math.max(0, Math.ceil((until - Date.now()) / 1000)));
    }
    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [until, retryAfterSeconds]);

  if (retryAfterSeconds == null) {
    return <p className={className}>{message}</p>;
  }

  const ready = remaining <= 0;

  return (
    <div className={className}>
      <p>
        {quotaExceeded
          ? "Spotify paused this development-mode app (quota). That is not the 30-second rate window — Spotify asked for about an hour."
          : "Spotify is rate-limiting this app."}
      </p>
      {ready ? (
        <button
          type="button"
          onClick={() => router.refresh()}
          className="mt-3 text-foreground underline-offset-2 hover:underline"
        >
          Refresh
        </button>
      ) : (
        <p className="mt-3 font-mono tabular-nums">
          Retry in {formatWait(remaining)}
        </p>
      )}
    </div>
  );
}
