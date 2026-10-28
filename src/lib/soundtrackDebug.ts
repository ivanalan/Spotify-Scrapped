/**
 * Temporary investigation logging for soundtrack loop / cutover bugs.
 * Enable with `?debug=soundtrack` (or `&debug=soundtrack`).
 * Log only: never change control flow.
 *
 * On-device panel: `SoundtrackDebugPanel` (cases E/F: first + second loop).
 *
 * @see docs/slices/soundtrack-pause-bugs.md
 */

const PREFIX = "[scrapped:soundtrack]";
const MAX_ENTRIES = 400;

let cachedEnabled: boolean | null = null;
let t0 = 0;

export type SoundtrackDebugFields = Record<
  string,
  string | number | boolean | null | undefined
>;

export type SoundtrackDebugEntry = {
  id: number;
  ms: number;
  event: string;
  fields?: SoundtrackDebugFields;
  line: string;
};

type Listener = () => void;

const buffer: SoundtrackDebugEntry[] = [];
/** Immutable snapshot for useSyncExternalStore (stable until the next push/clear). */
let snapshot: readonly SoundtrackDebugEntry[] = [];
const EMPTY_SNAPSHOT: readonly SoundtrackDebugEntry[] = [];
const listeners = new Set<Listener>();
let nextId = 1;

function readFlag(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URLSearchParams(window.location.search).get("debug") ===
      "soundtrack";
  } catch {
    return false;
  }
}

/** True when `?debug=soundtrack` is on the page URL. */
export function isSoundtrackDebug(): boolean {
  if (cachedEnabled == null) {
    cachedEnabled = readFlag();
    if (cachedEnabled) t0 = performance.now();
  }
  return cachedEnabled;
}

/** Re-read the query flag (rare; most callers use the session cache). */
export function refreshSoundtrackDebugFlag(): boolean {
  cachedEnabled = readFlag();
  if (cachedEnabled && t0 === 0) t0 = performance.now();
  return cachedEnabled;
}

function formatFields(fields?: SoundtrackDebugFields): string {
  if (!fields) return "";
  const parts: string[] = [];
  for (const [k, v] of Object.entries(fields)) {
    if (v === undefined) continue;
    parts.push(`${k}=${v === null ? "null" : String(v)}`);
  }
  return parts.length ? ` ${parts.join(" ")}` : "";
}

let notifyScheduled = false;

/**
 * Always async: callers often log from setState updaters / render-adjacent
 * paths; sync subscriber setState would trip React's setState-in-render.
 */
function notify() {
  if (notifyScheduled) return;
  notifyScheduled = true;
  queueMicrotask(() => {
    notifyScheduled = false;
    for (const listener of listeners) listener();
  });
}

/**
 * Console log + ring buffer with ms-since-first-debug-event.
 * No-op when the flag is off.
 */
export function soundtrackDebug(
  event: string,
  fields?: SoundtrackDebugFields,
): void {
  if (!isSoundtrackDebug()) return;
  const ms = Math.round(performance.now() - t0);
  const line = `${ms}ms ${event}${formatFields(fields)}`;
  const entry: SoundtrackDebugEntry = {
    id: nextId++,
    ms,
    event,
    fields,
    line,
  };
  buffer.push(entry);
  if (buffer.length > MAX_ENTRIES) buffer.splice(0, buffer.length - MAX_ENTRIES);
  snapshot = buffer.slice();

  if (fields && Object.keys(fields).length > 0) {
    console.log(`${PREFIX} ${ms}ms ${event}`, fields);
  } else {
    console.log(`${PREFIX} ${ms}ms ${event}`);
  }
  notify();
}

/** Snapshot of buffered lines (oldest → newest). Stable ref until the next push/clear. */
export function getSoundtrackDebugEntries(): readonly SoundtrackDebugEntry[] {
  return snapshot;
}

/** SSR / first paint: always the same empty array reference. */
export function getSoundtrackDebugEntriesServer(): readonly SoundtrackDebugEntry[] {
  return EMPTY_SNAPSHOT;
}

/** Plain text for Copy (same shape as console lines). */
export function getSoundtrackDebugTranscript(): string {
  return snapshot.map((e) => `${PREFIX} ${e.line}`).join("\n");
}

export function clearSoundtrackDebugBuffer(): void {
  buffer.length = 0;
  snapshot = EMPTY_SNAPSHOT;
  notify();
}

/** Subscribe for panel re-renders. Returns unsubscribe. */
export function subscribeSoundtrackDebug(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Shorten spotify:track:… for log noise. */
export function shortUri(uri: string | null | undefined): string | null {
  if (!uri) return null;
  const m = /^spotify:track:(.+)$/.exec(uri);
  return m ? `track:${m[1]!.slice(0, 8)}…` : uri;
}

/** Events that usually matter for same-URI loop hypothesis mapping. */
export function isSoundtrackDebugHighlight(event: string): boolean {
  return (
    event === "beginLoopCutover" ||
    event === "beginLoopCutover.skip" ||
    event === "tryLoopCutover" ||
    event === "fallbackLoopRestart" ||
    event === "loop.schedule" ||
    event === "loop.pausedAtEnd" ||
    event === "playback.nearEnd" ||
    event === "ensureTwinUri" ||
    event === "notifyExternalPause" ||
    event === "visibilitychange" ||
    event === "sticky" ||
    event === "cutTo"
  );
}
