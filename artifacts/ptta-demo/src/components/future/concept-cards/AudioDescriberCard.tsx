export function AudioDescriberCard() {
  return (
    <article
      aria-label="Real-time AI Audio Describer (coming soon)"
      className="bg-surface border border-hairline rounded-2xl overflow-hidden"
    >
      <div
        className="relative w-full aspect-[16/9] bg-page border-b border-hairline"
        role="img"
        aria-label="Phone silhouette overlaid on a room outline with soundwaves emanating from it"
      >
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <rect x="24" y="24" width="272" height="132" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <rect x="40" y="40" width="60" height="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="120" y="40" width="80" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="220" y="60" width="60" height="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="130" y="55" width="50" height="90" rx="6" fill="currentColor" opacity="0.9" />
          <rect x="135" y="60" width="40" height="72" rx="2" fill="var(--color-page, #f5f0e6)" />
          <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M 195 75 Q 210 100 195 125" />
            <path d="M 205 68 Q 225 100 205 132" opacity="0.6" />
            <path d="M 215 61 Q 240 100 215 139" opacity="0.3" />
          </g>
          <circle cx="160" cy="142" r="3" fill="var(--color-page, #f5f0e6)" />
        </svg>
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-ink text-page text-xs">
          ● Listening
        </div>
      </div>
      <div className="p-4">
        <span className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
          Coming 2026
        </span>
        <h3 className="font-sans text-lg mt-1 mb-1">Real-time AI Audio Describer</h3>
        <p className="text-body-fg text-sm leading-snug">
          Narration for everything between the artworks — the room, the crowd, the stairs — spoken only to you.
        </p>
      </div>
    </article>
  );
}
