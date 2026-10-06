import { Button, buttonVariants } from "@/components/ui/button";
import { getSpotifyConnection } from "@/lib/spotify";
import { cn } from "@/lib/utils";

export async function AuthControls() {
  const { connected, displayName } = await getSpotifyConnection();
  const label = displayName || "Spotify";

  if (!connected) {
    return (
      <a
        href="/api/spotify/login"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Connect Spotify
      </a>
    );
  }

  return (
    <form action="/api/spotify/logout" method="post" className="flex items-center gap-3 text-sm">
      <span className="max-w-[10rem] truncate text-muted-foreground" title={label}>
        {label}
      </span>
      <Button type="submit" size="sm" variant="ghost">
        Disconnect
      </Button>
    </form>
  );
}
