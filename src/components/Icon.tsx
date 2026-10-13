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

function ensureIonIcon() {
  if (defined || typeof window === "undefined") return;
  defined = true;
  void import("ionicons/components/ion-icon.js").then((mod) => {
    mod.defineCustomElement();
  });
}

/** Official Ionicons web component — no custom SVG re-stroke. */
export function Icon({ icon, className, style, title }: IconProps) {
  useEffect(() => {
    ensureIonIcon();
  }, []);

  return (
    <ion-icon
      icon={icon}
      className={className}
      style={style}
      aria-hidden={title ? undefined : "true"}
      aria-label={title}
    />
  );
}
