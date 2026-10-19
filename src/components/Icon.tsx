"use client";

import { useEffect, type CSSProperties } from "react";

type IconProps = {
  /** Ionicons export from `ionicons/icons` (data URL). */
  icon: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

let defined = false;

/**
 * Start fetching `ion-icon` as soon as something imports this module
 * (e.g. the auth gate), so the first painted Icon isn’t blank.
 */
export function preloadIonIcon() {
  if (defined || typeof window === "undefined") return;
  defined = true;
  void import("ionicons/components/ion-icon.js").then((mod) => {
    mod.defineCustomElement();
  });
}

// Any import of this module (gate, deck, etc.) starts the fetch before paint.
preloadIonIcon();

/** Official Ionicons web component — no custom SVG re-stroke. */
export function Icon({ icon, className, style, title }: IconProps) {
  useEffect(() => {
    preloadIonIcon();
  }, []);

  return (
    // Ionicons upgrades the custom element after paint (`md hydrated`, role).
    <ion-icon
      icon={icon}
      className={className}
      style={style}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
      suppressHydrationWarning
    />
  );
}
