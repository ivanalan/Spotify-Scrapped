import Link from "next/link";
import { ApiScrappedDeck } from "@/components/scrapped/ApiScrappedDeck";
import { loadScrappedApiLab } from "@/lib/load-scrapped-api-lab";

export const dynamic = "force-dynamic";

export default async function ApiScrappedPage() {
  const result = await loadScrappedApiLab();

  if (result.kind === "needs_auth") {
    return (
      <div className="animate-rise space-y-5">
        <p className="font-mono text-sm text-ring">API</p>
        <h1 className="font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          API Scrapped
        </h1>
        <p className="max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
          {result.message}
        </p>
        <a
          href="/api/spotify/login"
          className="inline-block text-foreground underline-offset-2 hover:underline"
        >
          Connect Spotify →
        </a>
        <p className="text-sm text-muted-foreground">
          Or browse the{" "}
          <Link
            href="/scrapped/lab"
            className="text-foreground underline-offset-2 hover:underline"
          >
            metrics lab
          </Link>
          .
        </p>
        <div className="h-px w-16 origin-left bg-ring animate-rule" />
      </div>
    );
  }

  if (result.kind === "error") {
    return (
      <div className="animate-rise space-y-5">
        <p className="font-mono text-sm text-ring">API</p>
        <h1 className="font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          API Scrapped
        </h1>
        <p className="max-w-md text-sm text-warn">{result.message}</p>
        <Link
          href="/scrapped/lab"
          className="text-foreground underline-offset-2 hover:underline"
        >
          ← Metrics lab
        </Link>
        <div className="h-px w-16 origin-left bg-ring animate-rule" />
      </div>
    );
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 -mx-0 -my-16 md:-my-24">
      <ApiScrappedDeck report={result.report} />
    </div>
  );
}
