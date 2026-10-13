export default function HomeLoading() {
  return (
    <div
      className="wrapped-story relative left-1/2 flex min-h-[100dvh] w-screen -translate-x-1/2 flex-col items-center justify-center"
      data-wrapped-tone="paper"
    >
      <div className="h-14 w-28 animate-pulse rounded bg-[var(--wrapped-panel)]" />
      <div className="mt-3 h-10 w-48 animate-pulse rounded bg-[var(--wrapped-panel)]" />
    </div>
  );
}
