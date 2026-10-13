"use client";

/** Kept for imports; conversational deck uses solid slide fills only. */
export type WrappedSlideTone =
  | "paper"
  | "mist"
  | "sand"
  | "blush"
  | "sage"
  | "sky"
  | "cream"
  | "slate";

type Props = {
  tone: WrappedSlideTone;
  active?: boolean;
};

export function WrappedAccentField(_props: Props) {
  return null;
}
