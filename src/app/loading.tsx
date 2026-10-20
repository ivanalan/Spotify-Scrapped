import { ScrappedOrbitArt } from "@/components/scrapped/orbit/ScrappedOrbitArt";

export default function HomeLoading() {
  return (
    <div
      className="wrapped-story relative left-1/2 flex min-h-[100dvh] w-screen -translate-x-1/2 flex-col items-center justify-center overflow-hidden"
      data-wrapped-tone="ink"
      data-scrapped-field="intro-dusk"
    >
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <ScrappedOrbitArt slideIndex={0} pattern="intro" active={false} />
      </div>
      <div className="relative z-10 flex flex-col items-center">
        <div className="h-14 w-28 animate-pulse rounded bg-[var(--wrapped-panel)]" />
        <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[var(--wrapped-panel)]" />
      </div>
    </div>
  );
}
