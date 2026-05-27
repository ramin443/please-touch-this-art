// Fire-and-forget image preloader. Holds a reference to each Image so the
// browser keeps the fetched/decoded asset around until the real <img> mounts
// later. Each URL is fetched at most once across the session.
const preloaded = new Map<string, HTMLImageElement>();

export function preloadImages(urls: readonly string[]): void {
  if (typeof window === "undefined") return;
  for (const url of urls) {
    if (!url || preloaded.has(url)) continue;
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    preloaded.set(url, img);
  }
}
