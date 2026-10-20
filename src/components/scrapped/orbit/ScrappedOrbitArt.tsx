"use client";

import { useReducedMotion } from "motion/react";
import {
  accentsForSlide,
  INTRO_DISK_COLORS,
  INTRO_SHARED_GRADIENT,
  INTRO_STAR,
  type SlideArtPattern,
} from "@/lib/scrapped-card-palette";
import {
  ConcentricDisks,
  MotifStage,
  OceanWave,
  PointedStar,
} from "@/components/scrapped/art/storyboard/ShapeKit";
import {
  GhostedListFrame,
  GhostedNightEntity,
  ListClouds,
  ListCornerOrb,
  ListFrame,
  ListPerimeterGhosts,
  ListSpikyGrass,
} from "@/components/scrapped/art/storyboard/PeripheralMotifs";
import { FilmLetterboxChrome } from "@/components/scrapped/orbit/FilmLetterboxChrome";
import { LeftOnReadChatChrome } from "@/components/scrapped/orbit/LeftOnReadChatChrome";
import {
  MotifCornerOrigin,
  MotifMeetStage,
  MotifPin,
  usePhoneOrbitArt,
} from "@/components/scrapped/orbit/MotifPin";
import { OneLikeHeartChrome } from "@/components/scrapped/orbit/OneLikeHeartChrome";
import { SoftCloseIrisChrome } from "@/components/scrapped/orbit/SoftCloseIrisChrome";
import "./middeck-metaphors.css";

type Props = {
  slideIndex: number;
  pattern: SlideArtPattern;
  /** When false / reduced-motion, art settles static. */
  active?: boolean;
  /**
   * Bumps when the scene is (re)visited so enter motion remounts.
   * Required for spiral-in — chrome stays mounted in the snap scroller.
   */
  replayKey?: number;
  /**
   * Volume ocean: low under the liked-pile beat; high when the
   * “joined this year” narrative beat lands.
   */
  tide?: "low" | "high";
  /**
   * Active beat within the scene (D-016 middeck metaphors).
   * Mirrors volume `tide` — art can swap hero ↔ list frame.
   */
  beatPhase?: number;
};

type ChromeProps = {
  pattern: SlideArtPattern;
  slideIndex: number;
  accent: string;
  accent2: string;
  freeze: boolean;
  play: boolean;
  replayKey: number;
  tide: "low" | "high";
  beatPhase: number;
};

/** Intro disks @ viewport TL center; star @ viewport BR center. */
function IntroCornerChrome({ freeze }: { freeze: boolean }) {
  return (
    <>
      <MotifCornerOrigin corner="tl" cx={0} cy={0} radius={230} size={0.85}>
        <ConcentricDisks
          cx={0}
          cy={0}
          count={6}
          startR={72}
          step={26}
          rotate={45}
          oval={{ sx: 1.08, sy: 0.94 }}
          colors={[...INTRO_DISK_COLORS]}
          sharedGradient={INTRO_SHARED_GRADIENT}
          animate={freeze ? "none" : "cascade-breathe"}
        />
      </MotifCornerOrigin>
      <MotifCornerOrigin corner="br" cx={0} cy={0} radius={110} size={1}>
        <PointedStar
          cx={0}
          cy={0}
          r={92}
          points={7}
          from={INTRO_STAR.from}
          to={INTRO_STAR.to}
          animate={freeze ? "none" : "grow-spin"}
        />
      </MotifCornerOrigin>
    </>
  );
}

function PhoneOrbitChrome({
  pattern,
  slideIndex,
  accent,
  accent2,
  freeze,
  play,
  replayKey,
  tide,
  beatPhase,
}: ChromeProps) {
  // Edge-anchored patterns skip MotifStage — slice crops top/bottom.
  // Share finale (D-014): same intro disks + star as open, behind the inset card.
  if (pattern === "intro" || pattern === "share") {
    return <IntroCornerChrome freeze={freeze} />;
  }
  // Soft close — full-bleed iris (D-016); MotifStage would crop the vignette.
  if (pattern === "close" || slideIndex === 8) {
    return (
      <SoftCloseIrisChrome freeze={freeze} replayKey={replayKey} />
    );
  }
  // Middeck metaphors (D-016) — full-bleed HTML/CSS layers.
  if (slideIndex === 4) {
    return (
      <OneLikeHeartChrome
        mode={beatPhase >= 2 ? "frame" : "hero"}
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }
  if (slideIndex === 5) {
    return (
      <LeftOnReadChatChrome
        mode="pin"
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }
  if (slideIndex === 6) {
    // List narrative starts at phase 2 (setup is title + subline = 0..1).
    // Switching at ≥1 remounted frame mid-setup and replayed bubble enter.
    return (
      <LeftOnReadChatChrome
        mode={beatPhase >= 2 ? "frame" : "quiet"}
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }
  if (slideIndex === 7 || pattern === "reunion") {
    // Setup = title + subline (0..1); list / reveal narrative starts at ≥2.
    return (
      <FilmLetterboxChrome
        mode={beatPhase >= 2 ? "out" : "in"}
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }

  return (
    <MotifStage>
      {pattern === "volume" && (
        <OceanWave from={accent} to={accent2} tide={tide} freeze={freeze} />
      )}

      {pattern === "entity-song" && (
        <GhostedNightEntity
          key={play ? `night-${replayKey}` : "night-settled"}
          accent={accent}
          accent2={accent2}
          freeze={freeze}
        />
      )}

      {pattern === "list" && slideIndex === 3 && (
        <GhostedListFrame
          accent={accent}
          accent2={accent2}
          animate={freeze ? "none" : "soft"}
        />
      )}

      {pattern === "list" && slideIndex !== 3 && (
        <ListFrame
          accent={accent}
          accent2={accent2}
          animate={freeze ? "none" : "soft"}
        />
      )}
    </MotifStage>
  );
}

/** Wide viewport: edge-pinned motifs (D-009). Phone path stays MotifStage. */
function WideOrbitChrome({
  pattern,
  slideIndex,
  accent,
  accent2,
  freeze,
  play,
  replayKey,
  tide,
  beatPhase,
}: ChromeProps) {
  if (pattern === "share" || pattern === "intro") {
    return <IntroCornerChrome freeze={freeze} />;
  }

  // Middeck metaphors — same full-bleed layers as phone (D-016).
  if (pattern === "close" || slideIndex === 8) {
    return (
      <SoftCloseIrisChrome freeze={freeze} replayKey={replayKey} />
    );
  }
  if (slideIndex === 4) {
    return (
      <OneLikeHeartChrome
        mode={beatPhase >= 2 ? "frame" : "hero"}
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }
  if (slideIndex === 5) {
    return (
      <LeftOnReadChatChrome
        mode="pin"
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }
  if (slideIndex === 6) {
    return (
      <LeftOnReadChatChrome
        mode={beatPhase >= 2 ? "frame" : "quiet"}
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }
  if (slideIndex === 7 || pattern === "reunion") {
    // Setup = title + subline (0..1); list / reveal narrative starts at ≥2.
    return (
      <FilmLetterboxChrome
        mode={beatPhase >= 2 ? "out" : "in"}
        freeze={freeze}
        replayKey={replayKey}
      />
    );
  }

  if (pattern === "volume") {
    return (
      <MotifPin
        anchor="bottom"
        width="100%"
        height={1}
        viewBox="0 0 360 640"
        preserveAspectRatio="xMidYMax slice"
      >
        <OceanWave from={accent} to={accent2} tide={tide} freeze={freeze} />
      </MotifPin>
    );
  }

  if (pattern === "entity-song") {
    return (
      <MotifMeetStage viewBox="0 0 360 640">
        <GhostedNightEntity
          key={play ? `night-wide-${replayKey}` : "night-wide-settled"}
          accent={accent}
          accent2={accent2}
          freeze={freeze}
        />
      </MotifMeetStage>
    );
  }

  if (pattern === "list" && slideIndex === 3) {
    return (
      <>
        <MotifPin
          anchor="top"
          width="100%"
          height={0.14}
          viewBox="0 -12 360 80"
          preserveAspectRatio="xMidYMin slice"
        >
          <ListClouds
            from={accent}
            to={accent2}
            freeze={freeze}
            durationSec={32}
            placement="sky"
          />
        </MotifPin>
        <MotifPin
          anchor="bottom"
          width="100%"
          height={0.2}
          viewBox="0 0 360 140"
          preserveAspectRatio="xMidYMax slice"
        >
          <ListSpikyGrass from={accent} to={accent2} freeze={freeze} />
        </MotifPin>
        <MotifMeetStage viewBox="0 0 360 640">
          <ListPerimeterGhosts freeze={freeze} />
        </MotifMeetStage>
      </>
    );
  }

  if (pattern === "list") {
    return (
      <>
        <MotifPin
          anchor="top"
          width="100%"
          height={0.22}
          viewBox="0 0 360 100"
          preserveAspectRatio="xMidYMin slice"
        >
          <ListClouds from={accent} to={accent2} freeze={freeze} />
        </MotifPin>
        <MotifPin
          anchor="bl"
          viewBox="0 0 240 260"
          size={0.5}
          preserveAspectRatio="xMinYMax meet"
        >
          <ListCornerOrb from={accent} to={accent2} freeze={freeze} />
        </MotifPin>
      </>
    );
  }

  return null;
}

/**
 * Production Orbit Cascade chrome for the API deck (D-007 / D-009 / D-016).
 * Canvas color comes from `data-wrapped-tone` on the slide — this layer is motifs only.
 * Phone: legacy MotifStage slice. Wide: corner-pinned layers.
 */
export function ScrappedOrbitArt({
  slideIndex,
  pattern,
  active = true,
  replayKey = 0,
  tide = "low",
  beatPhase = 0,
}: Props) {
  const { accent, accent2 } = accentsForSlide(slideIndex);
  const reduceMotion = useReducedMotion();
  const play = Boolean(active && !reduceMotion);
  const freeze = !play;
  const phone = usePhoneOrbitArt();

  const chrome: ChromeProps = {
    pattern,
    slideIndex,
    accent,
    accent2,
    freeze,
    play,
    replayKey,
    tide,
    beatPhase,
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-visible"
      aria-hidden
    >
      {phone ? (
        <PhoneOrbitChrome {...chrome} />
      ) : (
        <WideOrbitChrome {...chrome} />
      )}
    </div>
  );
}
