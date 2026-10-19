"use client";

/** Orbit Cascade tones — see D-007 / scrapped-card-palette. */
export type WrappedSlideTone =
  | "ink"
  | "orchid"
  | "ember"
  | "mango"
  | "gold"
  | "teal"
  | "rose";

type Props = {
  tone: WrappedSlideTone;
  active?: boolean;
};

export function WrappedAccentField(_props: Props) {
  return null;
}
