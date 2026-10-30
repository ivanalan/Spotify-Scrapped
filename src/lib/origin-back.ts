/**
 * In-app origin back (D-040).
 * Tracks pathname commits so ← Back returns to the prior screen, not a hardcoded route.
 * Cold entry (no prior in-tab path) uses a fallback href.
 */

const STACK_KEY = "scrapped:origin-back-stack";

/** Module lifetime matches the document: full load reseeds; client navigations push/pop. */
let seeded = false;

function readStack(): string[] {
  try {
    const raw = sessionStorage.getItem(STACK_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is string => typeof p === "string");
  } catch {
    return [];
  }
}

function writeStack(stack: string[]) {
  try {
    sessionStorage.setItem(STACK_KEY, JSON.stringify(stack));
  } catch {
    /* private mode / quota */
  }
}

/**
 * Call on each App Router pathname commit (e.g. ProductMain).
 * First call after a full document load seeds `[pathname]`.
 * Later commits push forward paths or pop when the browser went back.
 */
export function trackOriginBackPath(pathname: string) {
  if (typeof window === "undefined") return;

  if (!seeded) {
    seeded = true;
    writeStack([pathname]);
    return;
  }

  const stack = readStack();
  const last = stack[stack.length - 1];
  if (last === pathname) return;

  if (stack.length >= 2 && stack[stack.length - 2] === pathname) {
    stack.pop();
    writeStack(stack);
    return;
  }

  stack.push(pathname);
  if (stack.length > 32) stack.splice(0, stack.length - 32);
  writeStack(stack);
}

/** True when ← Back can use history instead of the cold-entry fallback. */
export function canOriginBack(): boolean {
  if (typeof window === "undefined") return false;
  return readStack().length >= 2;
}

type RouterLike = {
  back: () => void;
  replace: (href: string) => void;
};

/** How long to wait for history.back() to take effect before assuming it was swallowed. */
const BACK_SETTLE_MS = 400;

/**
 * Prefer history.back when we have an in-tab prior path; else replace with the
 * fallback. Replace (not push) so cold-entry Back doesn't leave the screen we
 * just left one browser-Back away (it took several taps to get out).
 *
 * history.back() can be swallowed: in WebKit, iframe navigations (the Spotify
 * embeds) add joint-session-history entries, so a Back tap may only step
 * through those and leave the page unchanged (iOS needed ~3 taps). If no
 * popstate arrives and the path is unchanged, replace to the prior path.
 */
export function originBack(router: RouterLike, fallbackHref: string) {
  if (!canOriginBack()) {
    router.replace(fallbackHref);
    return;
  }

  const stack = readStack();
  const prior = stack[stack.length - 2] ?? fallbackHref;
  const startPath = window.location.pathname;
  let popped = false;
  const onPop = () => {
    popped = true;
  };
  window.addEventListener("popstate", onPop, { once: true });
  router.back();
  window.setTimeout(() => {
    window.removeEventListener("popstate", onPop);
    if (popped || window.location.pathname !== startPath) return;
    router.replace(prior);
  }, BACK_SETTLE_MS);
}
