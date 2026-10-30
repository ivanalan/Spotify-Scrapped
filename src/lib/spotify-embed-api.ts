import { isSoundtrackDebug, soundtrackDebug } from "@/lib/soundtrackDebug";

export const SPOTIFY_EMBED_API_SRC = "https://open.spotify.com/embed/iframe-api/v1";

type EmbedApiWindow = Window & {
  onSpotifyIframeApiReady?: (api: unknown) => void;
  __spotifyIframeApi?: unknown;
};

/**
 * Start loading the Spotify IFrame API before DeckSoundtrack mounts (gate,
 * where View example lives) so the walkthrough doesn't pay ~1s for the script
 * after navigation. DeckSoundtrack reads `__spotifyIframeApi` or chains
 * `onSpotifyIframeApiReady`, so either order works.
 */
export function preloadSpotifyEmbedApi() {
  if (typeof window === "undefined") return;
  const win = window as EmbedApiWindow;
  // Latch ?debug=soundtrack while the gate URL still carries it.
  isSoundtrackDebug();
  if (win.__spotifyIframeApi) return;
  if (document.querySelector(`script[src="${SPOTIFY_EMBED_API_SRC}"]`)) return;

  const previous = win.onSpotifyIframeApiReady;
  win.onSpotifyIframeApiReady = (api) => {
    previous?.(api);
    win.__spotifyIframeApi = api;
  };

  const script = document.createElement("script");
  script.src = SPOTIFY_EMBED_API_SRC;
  script.async = true;
  document.body.appendChild(script);
}

/** Same warm look as DeckSoundtrack HOST_WARM (painted, near-invisible). */
const WARM_HOST_CLASS =
  "absolute inset-0 w-full overflow-hidden opacity-[0.02] pointer-events-none";
const WARM_LEAD_TTL_MS = 90_000;
const WARM_LEAD_WRAPPER_ATTR = "data-warm-lead-wrapper";

type WarmController = {
  play: () => void;
  loadUri: (uri: string, preferVideo?: boolean, startAtSeconds?: number) => void;
  addListener: (event: string, cb: (...args: unknown[]) => void) => void;
  destroy: () => void;
};

type WarmApi = {
  createController: (
    element: HTMLElement,
    options: { uri: string; width?: number | string; height?: number | string },
    callback: (controller: WarmController) => void,
  ) => void;
};

export type WarmLead = {
  uri: string;
  controller: WarmController;
  /** Inner host the soundtrack adopts as `entry.host` (never re-parented). */
  host: HTMLElement;
  /** Embed finished loading the URI before it was adopted. */
  ready: boolean;
  /** `performance.now()` when the controller was created. */
  createdAt: number;
};

type WarmLeadWindow = Window & { __spotifyWarmLead?: WarmLead };

function whenEmbedApi(cb: (api: WarmApi) => void) {
  const win = window as EmbedApiWindow;
  if (win.__spotifyIframeApi) {
    cb(win.__spotifyIframeApi as WarmApi);
    return;
  }
  const previous = win.onSpotifyIframeApiReady;
  win.onSpotifyIframeApiReady = (api) => {
    previous?.(api);
    cb(api as WarmApi);
  };
}

/**
 * Create the walkthrough's lead embed while the visitor is still on the gate.
 * The embed needs ~2s to become ready after creation; DeckSoundtrack adopts
 * this controller via `takeWarmLead` instead of creating a cold one. The iframe
 * stays in its own offscreen wrapper in <body> because moving it would reload.
 */
export function warmLeadEmbed(trackUri: string) {
  if (typeof window === "undefined") return;
  const win = window as WarmLeadWindow;
  if (win.__spotifyWarmLead?.uri === trackUri) return;
  preloadSpotifyEmbedApi();

  whenEmbedApi((api) => {
    if (win.__spotifyWarmLead?.uri === trackUri) return;

    const wrapper = document.createElement("div");
    wrapper.setAttribute(WARM_LEAD_WRAPPER_ATTR, "");
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.style.cssText =
      "position:fixed;left:0;top:0;width:320px;height:80px;transform:translateX(-200vw);pointer-events:none;overflow:hidden";
    const host = document.createElement("div");
    host.className = WARM_HOST_CLASS;
    const target = document.createElement("div");
    host.appendChild(target);
    wrapper.appendChild(host);
    document.body.appendChild(wrapper);

    api.createController(
      target,
      { uri: trackUri, width: "100%", height: 80 },
      (controller) => {
        const lead: WarmLead = {
          uri: trackUri,
          controller,
          host,
          ready: false,
          createdAt: performance.now(),
        };
        win.__spotifyWarmLead = lead;
        controller.loadUri(trackUri, false, 0);
        soundtrackDebug("warmLead.created", { uri: trackUri.slice(-8) });
        controller.addListener("ready", () => {
          lead.ready = true;
          soundtrackDebug("warmLead.ready", { uri: trackUri.slice(-8) });
        });
        window.setTimeout(() => {
          // Never adopted (visitor left or went elsewhere): clean up.
          if (win.__spotifyWarmLead !== lead) return;
          win.__spotifyWarmLead = undefined;
          controller.destroy();
          wrapper.remove();
        }, WARM_LEAD_TTL_MS);
      },
    );
  });
}

/** Claim the warm lead for `trackUri` (once); null if none or different URI. */
export function takeWarmLead(trackUri: string): WarmLead | null {
  if (typeof window === "undefined") return null;
  const win = window as WarmLeadWindow;
  const lead = win.__spotifyWarmLead;
  if (!lead || lead.uri !== trackUri) return null;
  win.__spotifyWarmLead = undefined;
  return lead;
}

/** Remove the body-level wrapper of an adopted warm host (on soundtrack unmount). */
export function removeWarmLeadWrapper(host: HTMLElement) {
  host.closest(`[${WARM_LEAD_WRAPPER_ATTR}]`)?.remove();
}

/**
 * Call from the View example click: starts the warm lead inside a real user
 * gesture (iOS/Chrome block play() from effects). The embed lives in <body>,
 * so it keeps playing through the soft navigation and DeckSoundtrack adopts it.
 */
export function playWarmLeadFromGesture() {
  if (typeof window === "undefined") return;
  const lead = (window as WarmLeadWindow).__spotifyWarmLead;
  if (!lead) return;
  soundtrackDebug("warmLead.playFromGesture", {
    uri: lead.uri.slice(-8),
    ready: lead.ready,
  });
  lead.controller.play();
}
