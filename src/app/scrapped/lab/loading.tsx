export default function ScrappedLabLoading() {
  return (
    <div className="animate-rise space-y-8">
      <header className="space-y-3">
        <p className="font-mono text-sm text-ring">Lab</p>
        <div className="h-12 w-72 animate-pulse rounded bg-muted" />
        <div className="h-5 max-w-lg animate-pulse rounded bg-muted" />
        <div className="h-px w-16 bg-ring" />
      </header>
      <div className="h-40 animate-pulse rounded-xl bg-muted/50" />
      <div className="space-y-6 border-t border-border pt-6">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-7 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}
