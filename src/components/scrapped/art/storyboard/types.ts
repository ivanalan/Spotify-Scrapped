export type StoryboardDirectionId = "cascade-rings" | "dot-orbit" | "quarter-construct";

export type SlidePattern =
  | "intro"
  | "volume"
  | "entity"
  | "list"
  | "reunion"
  | "close"
  | "share";

export type StoryboardSlide = {
  index: number;
  label: string;
  pattern: SlidePattern;
};

export type DirectionMeta = {
  id: StoryboardDirectionId;
  label: string;
  short: string;
  thesis: string;
  register: string;
};

export type SlideArtProps = {
  slideIndex: number;
  pattern: SlidePattern;
  /** Freeze motifs (overview thumbnails). */
  static?: boolean;
};

export type SlideTheme = {
  bg: string;
  ink: string;
  muted: string;
  accent: string;
  accent2?: string;
  motionNote: string;
  reuseNote: string;
};
