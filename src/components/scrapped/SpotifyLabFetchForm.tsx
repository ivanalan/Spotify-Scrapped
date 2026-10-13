import { refreshOutline } from "ionicons/icons";
import { Icon } from "@/components/Icon";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Props = {
  next: "/" | "/scrapped" | "/scrapped/lab";
  label: string;
  /** `gate` = primary CTA on the light landing; default is inline link for Lab. */
  tone?: "link" | "gate";
  className?: string;
};

export function SpotifyLabFetchForm({
  next,
  label,
  tone = "link",
  className,
}: Props) {
  return (
    <form
      action="/api/spotify/lab-refresh"
      method="post"
      className={tone === "gate" ? "flex flex-col items-center" : undefined}
    >
      <input type="hidden" name="next" value={next} />
      <Button
        type="submit"
        variant={tone === "gate" ? "default" : "link"}
        size={tone === "gate" ? "lg" : "default"}
        className={cn(
          tone === "gate"
            ? "h-12 w-full max-w-[12rem] gap-2 rounded-2xl bg-[var(--wrapped-ink)] px-8 text-base font-semibold text-[var(--wrapped-canvas)] hover:bg-[var(--wrapped-ink)] hover:opacity-90"
            : "h-auto gap-1.5 p-0 text-foreground",
          className,
        )}
      >
        {tone === "gate" ? (
          <Icon icon={refreshOutline} className="size-5" />
        ) : null}
        {label}
        {tone === "link" ? " →" : null}
      </Button>
    </form>
  );
}
