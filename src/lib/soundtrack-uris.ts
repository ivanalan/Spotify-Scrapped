/** Unique soundtrack URIs across a deck (for warm-up). */
export function collectSoundtrackUris(
  getUri: (slideIndex: number) => string | null,
  slideCount: number,
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (let i = 0; i < slideCount; i++) {
    const uri = getUri(i);
    if (!uri || seen.has(uri)) continue;
    seen.add(uri);
    out.push(uri);
  }
  return out;
}
