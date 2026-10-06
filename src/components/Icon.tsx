import type { CSSProperties } from "react";

type IconProps = {
  /** Ionicons export value (SVG data URL string in ionicons v8+). */
  icon: string;
  className?: string;
  style?: CSSProperties;
  title?: string;
};

function extractSvgInner(dataUrl: string): string {
  const prefix = "data:image/svg+xml;utf8,";
  const encoded = dataUrl.startsWith(prefix)
    ? dataUrl.slice(prefix.length)
    : dataUrl.replace(/^data:image\/svg\+xml[^,]*,/, "");
  const svg = decodeURIComponent(encoded);
  const match = svg.match(/<svg[^>]*>([\s\S]*)<\/svg>/i);
  return match?.[1] ?? "";
}

/** Lightweight SVG renderer for Ionicons without loading @ionic/react. */
export function Icon({ icon, className, style, title }: IconProps) {
  const inner = extractSvgInner(icon);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      fill="none"
      stroke="currentColor"
      strokeWidth="32"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden={title ? undefined : true}
      role={title ? "img" : undefined}
    >
      {title ? <title>{title}</title> : null}
      <g dangerouslySetInnerHTML={{ __html: inner }} />
    </svg>
  );
}
