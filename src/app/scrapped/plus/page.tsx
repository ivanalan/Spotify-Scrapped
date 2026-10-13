import { ScrappedDeck } from "@/components/scrapped/ScrappedDeck";
import { loadScrappedPage } from "@/lib/load-scrapped";

export const dynamic = "force-dynamic";

export default async function ScrappedPlusPage() {
  const result = await loadScrappedPage();

  if (result.kind === "empty") {
    return (
      <div className="animate-rise space-y-5">
        <p className="font-mono text-sm text-ring">03</p>
        <h1 className="font-heading text-[clamp(2.5rem,7vw,3.75rem)] leading-[0.95] tracking-[-0.03em] text-foreground">
          Scrapped Plus
        </h1>
        <p className="max-w-md text-[1.05rem] leading-relaxed text-muted-foreground">
          {result.message}
        </p>
        <p className="text-sm text-muted-foreground">
          Or browse{" "}
          <a
            href="/scrapped/lab"
            className="text-foreground underline-offset-2 hover:underline"
          >
            Scrapped Lab
          </a>{" "}
          for ideas.
        </p>
        <div className="h-px w-16 origin-left bg-ring animate-rule" />
      </div>
    );
  }

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 -mx-0 -my-16 md:-my-24">
      <ScrappedDeck report={result.report} />
    </div>
  );
}
