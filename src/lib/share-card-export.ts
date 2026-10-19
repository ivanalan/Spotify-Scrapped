import { domToBlob } from "modern-screenshot";
import { SHARE_FINALE_DENSITY as D } from "@/lib/scrapped-card-palette";

export type ShareCardImageOptions = {
  /** File name shown in the OS sheet / download. Default `myscrapped.png`. */
  fileName?: string;
  /**
   * Device-pixel scale. Default: scale so the PNG’s width ≈ `exportWidthPx`
   * (1080) while keeping the on-screen 9:16 layout (rem density intact).
   */
  scale?: number;
  title?: string;
  text?: string;
  /**
   * Pre-captured PNG from `captureShareCardBlob`. When set, Share runs without
   * awaiting capture — required for iOS WebKit user-gesture → `navigator.share`.
   */
  blob?: Blob;
};

/** Wait for same-origin `/_next/image` (and any other) imgs inside the card. */
async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll("img"));
  await Promise.all(
    images.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        }),
    ),
  );
}

/**
 * Scale so the shared PNG is ~`exportWidthPx` wide (still 9:16). Avoids
 * forcing absolute width/height on the node (that would crush rem density).
 */
function scaleForExportWidth(node: HTMLElement): number {
  const w = node.offsetWidth;
  if (!w) return 2;
  return Math.max(1, D.exportWidthPx / w);
}

/**
 * Capture the inset share card as a PNG blob (no share sheet).
 * Node must already be 9:16; output stays 9:16 at ~1080×1920.
 */
export async function captureShareCardBlob(
  node: HTMLElement,
  scale?: number,
): Promise<Blob> {
  await waitForImages(node);

  const blob = await domToBlob(node, {
    scale: scale ?? scaleForExportWidth(node),
    type: "image/png",
    backgroundColor: null,
    fetch: {
      requestInit: { cache: "no-cache" },
    },
  });

  if (!blob) {
    throw new Error("Share card export produced an empty image.");
  }
  return blob;
}

function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.download = fileName;
  a.href = url;
  a.style.display = "none";
  document.body.append(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function isAbortError(err: unknown): boolean {
  return err instanceof DOMException && err.name === "AbortError";
}

/**
 * WebKit rejects (or `canShare` → false) when `files` is combined with
 * `title` / `text` / `url`. Files-only is the reliable iOS path.
 */
function filesOnlyShareData(file: File): ShareData {
  return { files: [file] };
}

async function tryNativeFileShare(file: File): Promise<boolean> {
  if (typeof navigator.share !== "function") return false;

  const data = filesOnlyShareData(file);
  // Prefer canShare when present; if it throws/false, still try share once —
  // some iOS builds lie about canShare for image files.
  if (typeof navigator.canShare === "function") {
    try {
      if (!navigator.canShare(data)) return false;
    } catch {
      // fall through and attempt share
    }
  }

  try {
    await navigator.share(data);
    return true;
  } catch (err) {
    if (isAbortError(err)) return true; // user dismissed — not a failure
    // NotAllowedError / TypeError → caller may download
    return false;
  }
}

/**
 * Capture the inset share card as a PNG, then open the native OS share sheet
 * with that file (Save Image / Messages / IG / etc.). Does not auto-download
 * when the sheet is available.
 *
 * Fallback: browsers that cannot share files (common on desktop) download the
 * PNG so the card image is still obtainable.
 *
 * iOS: pass a pre-captured `blob` (from `captureShareCardBlob` while the finale
 * is idle) so `navigator.share` stays inside the tap gesture. Files-only
 * ShareData — WebKit breaks when title/text ride along with files.
 */
export async function shareCardImage(
  node: HTMLElement,
  options: ShareCardImageOptions = {},
): Promise<void> {
  const { fileName = "myscrapped.png", scale, blob: precaptured } = options;

  const blob = precaptured ?? (await captureShareCardBlob(node, scale));
  const file = new File([blob], fileName, { type: "image/png" });

  if (await tryNativeFileShare(file)) return;

  // No file share sheet (e.g. many desktop browsers) — last-resort download.
  downloadBlob(blob, fileName);
}
