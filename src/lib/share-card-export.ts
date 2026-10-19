import { domToBlob } from "modern-screenshot";

export type ShareCardImageOptions = {
  /** File name shown in the OS sheet / download. Default `myscrapped.png`. */
  fileName?: string;
  /** Device-pixel scale for crisp export. Default 2. */
  scale?: number;
  title?: string;
  text?: string;
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

async function captureCardBlob(
  node: HTMLElement,
  scale: number,
): Promise<Blob> {
  await waitForImages(node);

  const blob = await domToBlob(node, {
    scale,
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

/**
 * Capture the inset share card as a PNG, then open the native OS share sheet
 * with that file (Save Image / Messages / IG / etc.). Does not auto-download
 * when the sheet is available.
 *
 * Fallback: browsers that cannot `canShare({ files })` (common on desktop)
 * download the PNG so the card image is still obtainable.
 *
 * Hero art via `/_next/image` is same-origin. If a capture blanks the hero,
 * prefer load-wait / fetch options before an allowlisted `i.scdn.co` proxy.
 */
export async function shareCardImage(
  node: HTMLElement,
  options: ShareCardImageOptions = {},
): Promise<void> {
  const {
    fileName = "myscrapped.png",
    scale = 2,
    title = "Scrapped",
    text = "Taste under revision — ghosted artists & songs.",
  } = options;

  const blob = await captureCardBlob(node, scale);
  const file = new File([blob], fileName, { type: "image/png" });
  const shareData: ShareData = { files: [file], title, text };

  if (
    typeof navigator.canShare === "function" &&
    navigator.canShare(shareData) &&
    typeof navigator.share === "function"
  ) {
    try {
      await navigator.share(shareData);
      return;
    } catch (err) {
      // User dismissed the sheet — do not fall through to auto-download.
      if (err instanceof DOMException && err.name === "AbortError") {
        return;
      }
      throw err;
    }
  }

  // No file share sheet (e.g. many desktop browsers) — last-resort download.
  downloadBlob(blob, fileName);
}
