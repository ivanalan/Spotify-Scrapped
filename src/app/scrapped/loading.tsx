export default function ScrappedLoading() {
  return (
    <div className="animate-rise flex min-h-[60vh] flex-col justify-center space-y-5">
      <p className="font-mono text-sm text-ring">03</p>
      <div className="h-14 w-64 animate-pulse rounded bg-muted" />
      <div className="h-5 max-w-md animate-pulse rounded bg-muted" />
      <div className="h-px w-16 bg-ring" />
      <div className="mt-8 h-40 max-w-sm animate-pulse rounded-xl bg-muted/60" />
    </div>
  );
}
