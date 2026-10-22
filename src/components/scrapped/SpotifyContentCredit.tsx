import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

/** Quiet provenance line for Spotify metadata / cover art (not co-branding). */
export function SpotifyContentCredit({ className }: Props) {
  return (
    <p
      className={cn(
        "text-caption w-full text-[var(--wrapped-muted)]",
        className,
      )}
    >
      Content from Spotify
    </p>
  );
}
