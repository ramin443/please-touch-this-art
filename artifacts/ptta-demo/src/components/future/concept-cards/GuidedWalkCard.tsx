export function GuidedWalkCard() {
  return (
    <article
      aria-label="Personalized Guided Walk (coming soon)"
      className="bg-surface border border-hairline rounded-2xl overflow-hidden"
    >
      <div
        className="relative w-full aspect-[16/9] bg-page border-b border-hairline"
        role="img"
        aria-label="Stylised museum floor plan with a dotted path linking three marker dots"
      >
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <rect x="8" y="8" width="304" height="164" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
          <rect x="24" y="24" width="120" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="168" y="24" width="120" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="24" y="100" width="264" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <path
            d="M 60 55 Q 120 55 150 90 T 240 130"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <circle cx="60" cy="55" r="5" fill="currentColor" />
          <circle cx="150" cy="90" r="5" fill="currentColor" />
          <circle cx="240" cy="130" r="5" fill="currentColor" />
        </svg>
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink text-page text-xs">
          Modernism · 45 min
        </div>
      </div>
      <div className="p-4">
        <span className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
          Coming 2026
        </span>
        <h3 className="font-sans text-lg mt-1 mb-1">Personalized Guided Walk</h3>
        <p className="text-body-fg text-sm leading-snug">
          A route through the museum tuned to your time and taste — AI builds the path, you walk it.
        </p>
      </div>
    </article>
  );
}
