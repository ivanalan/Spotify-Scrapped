type Props = {
  next: "/scrapped/api" | "/scrapped/lab";
  label: string;
};

export function SpotifyLabFetchForm({ next, label }: Props) {
  return (
    <form action="/api/spotify/lab-refresh" method="post">
      <input type="hidden" name="next" value={next} />
      <button
        type="submit"
        className="text-foreground underline-offset-2 hover:underline"
      >
        {label} →
      </button>
    </form>
  );
}
