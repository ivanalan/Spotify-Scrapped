"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  clearSoundtrackDebugBuffer,
  getSoundtrackDebugEntries,
  getSoundtrackDebugEntriesServer,
  getSoundtrackDebugTranscript,
  isSoundtrackDebug,
  isSoundtrackDebugHighlight,
  soundtrackDebug,
  subscribeSoundtrackDebug,
  type SoundtrackDebugEntry,
} from "@/lib/soundtrackDebug";
import { cn } from "@/lib/utils";

const CASES = [
  {
    id: "A",
    title: "Autoplay",
    hint: "Continue; do not tap. Watch first 3 slides for silence with || chrome.",
  },
  {
    id: "B",
    title: "Long-press",
    hint: "Hold right zone ≥500ms. Watch for primeTo → cancelPrime; no next-song bleed.",
  },
  {
    id: "C",
    title: "Control Center",
    hint: "Open Control Center mid-slide; check visibilitychange / sticky.",
  },
  {
    id: "D",
    title: "Tap-advance",
    hint: "Tap right each slide. Prefer cutTo path=hot; note ~1s gaps.",
  },
] as const;

type CaseId = (typeof CASES)[number]["id"];

function useDebugEntries(): readonly SoundtrackDebugEntry[] {
  return useSyncExternalStore(
    subscribeSoundtrackDebug,
    getSoundtrackDebugEntries,
    getSoundtrackDebugEntriesServer,
  );
}

function subscribeAlwaysEnabled(onStoreChange: () => void) {
  return subscribeSoundtrackDebug(onStoreChange);
}

function getEnabledSnapshot() {
  return isSoundtrackDebug();
}

function getServerEnabled() {
  return false;
}

/**
 * On-device repro HUD for `?debug=soundtrack`.
 * Does not change pause / prime / cutover control flow.
 */
export function SoundtrackDebugPanel() {
  const enabled = useSyncExternalStore(
    subscribeAlwaysEnabled,
    getEnabledSnapshot,
    getServerEnabled,
  );
  const entries = useDebugEntries();
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<Partial<Record<CaseId, boolean>>>({});
  const [copyState, setCopyState] = useState<"idle" | "ok" | "fail">("idle");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || !open) return;
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [entries.length, enabled, open]);

  useEffect(() => {
    if (!enabled) return;
    soundtrackDebug("panel.ready", { cases: CASES.length });
  }, [enabled]);

  const onCopy = useCallback(async () => {
    const text = getSoundtrackDebugTranscript();
    try {
      await navigator.clipboard.writeText(text);
      setCopyState("ok");
    } catch {
      // iOS Safari sometimes blocks clipboard without a stronger gesture; fall back.
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        setCopyState("ok");
      } catch {
        setCopyState("fail");
      }
    }
    window.setTimeout(() => setCopyState("idle"), 1600);
  }, []);

  const onClear = useCallback(() => {
    clearSoundtrackDebugBuffer();
    soundtrackDebug("panel.cleared");
  }, []);

  const toggleCase = useCallback((id: CaseId) => {
    let marked = false;
    setDone((prev) => {
      marked = !prev[id];
      return { ...prev, [id]: marked };
    });
    // Never notify the debug store from inside a setState updater.
    queueMicrotask(() => {
      soundtrackDebug("panel.case", { id, done: marked });
    });
  }, []);

  if (!enabled) return null;

  const doneCount = CASES.filter((c) => done[c.id]).length;

  return (
    <div
      className={cn(
        "pointer-events-auto fixed z-[80] font-mono text-[10px] leading-snug text-white",
        "bottom-[max(0.5rem,env(safe-area-inset-bottom))] left-2 right-2",
        "sm:left-auto sm:right-3 sm:w-[min(100%,22rem)]",
      )}
    >
      <div className="overflow-hidden rounded-lg border border-white/25 bg-black/85 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2 border-b border-white/15 px-2 py-1.5">
          <button
            type="button"
            className="min-h-10 flex-1 text-left text-[11px] font-semibold tracking-wide"
            onClick={() => setOpen((o) => !o)}
          >
            soundtrack debug {open ? "▾" : "▸"} · {entries.length} · cases{" "}
            {doneCount}/{CASES.length}
          </button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 shrink-0 px-2 text-[10px]"
            onClick={onCopy}
          >
            {copyState === "ok"
              ? "Copied"
              : copyState === "fail"
                ? "Copy failed"
                : "Copy"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-10 shrink-0 px-2 text-[10px]"
            onClick={onClear}
          >
            Clear
          </Button>
        </div>

        {open ? (
          <div className="flex max-h-[42vh] flex-col gap-1.5 p-2">
            <div className="grid grid-cols-2 gap-1">
              {CASES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  title={c.hint}
                  onClick={() => toggleCase(c.id)}
                  className={cn(
                    "min-h-10 rounded border px-1.5 py-1 text-left",
                    done[c.id]
                      ? "border-emerald-400/60 bg-emerald-500/20"
                      : "border-white/20 bg-white/5",
                  )}
                >
                  <span className="font-semibold">
                    {done[c.id] ? "✓" : "○"} {c.id} {c.title}
                  </span>
                </button>
              ))}
            </div>
            <p className="text-[9px] text-white/55">
              Mark a case when finished. Copy dumps the buffer for the slice
              doc. Highlighted rows: cutover, sticky, visibility, prime.
            </p>
            <div
              ref={listRef}
              className="min-h-[7rem] flex-1 overflow-y-auto rounded border border-white/10 bg-black/50 px-1.5 py-1"
            >
              {entries.length === 0 ? (
                <div className="text-white/40">Waiting for events…</div>
              ) : (
                entries.map((e) => (
                  <div
                    key={e.id}
                    className={cn(
                      "whitespace-pre-wrap break-all border-b border-white/5 py-0.5",
                      isSoundtrackDebugHighlight(e.event)
                        ? "text-amber-200"
                        : "text-white/80",
                    )}
                  >
                    {e.line}
                  </div>
                ))
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
