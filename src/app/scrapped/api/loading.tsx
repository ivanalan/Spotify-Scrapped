export default function ApiScrappedLoading() {
  return (
    <div className="animate-rise space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-sm text-ring">API</p>
        <div className="h-12 w-72 animate-pulse rounded bg-muted" />
        <div className="h-5 max-w-lg animate-pulse rounded bg-muted" />
        <div className="h-px w-16 bg-ring" />
      </header>
      <div className="h-[40vh] animate-pulse rounded-xl bg-muted/50" />
    </div>
  );
}
