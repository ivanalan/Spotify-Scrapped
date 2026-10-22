/**
 * Share finale footer slot layout (D-033).
 * Absolute % placement inside the 9:16 card for liked metrics + brand.
 */

export type ShareFinaleFooterSlot = {
  /** % from the card’s left edge. */
  leftPct: number;
  /** % from the card’s bottom edge. */
  bottomPct: number;
};

export type ShareFinaleFooterLayout = {
  likedSongs: ShareFinaleFooterSlot;
  likedYear: ShareFinaleFooterSlot;
  brand: ShareFinaleFooterSlot & {
    /** `end` = right edge of text at leftPct (BR default). */
    anchor: "start" | "end";
  };
};

/** Locked footer slots: liked metrics + myscrapped.com. */
export const SHARE_FINALE_FOOTER_DEFAULT: ShareFinaleFooterLayout = {
  likedSongs: { leftPct: 4.4, bottomPct: 10 },
  likedYear: { leftPct: 52, bottomPct: 10 },
  brand: { leftPct: 91, bottomPct: 4, anchor: "end" },
};
