import { useRef } from "react";
import { ARTIST_IDS, ARTISTS, type ArtistId } from "@/content/artists";

interface Props {
  selected: ArtistId;
  onSelect: (id: ArtistId) => void;
}

export function ArtistPicker({ selected, onSelect }: Props) {
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = ARTIST_IDS.indexOf(selected);
    if (e.key === "ArrowRight") {
      const nextIdx = (idx + 1) % ARTIST_IDS.length;
      onSelect(ARTIST_IDS[nextIdx]);
      tabsRef.current[nextIdx]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prevIdx = (idx - 1 + ARTIST_IDS.length) % ARTIST_IDS.length;
      onSelect(ARTIST_IDS[prevIdx]);
      tabsRef.current[prevIdx]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Choose an artist to chat with"
      className="flex gap-2 mb-4"
      onKeyDown={onKey}
    >
      {ARTIST_IDS.map((id, i) => {
        const meta = ARTISTS[id];
        const isSelected = id === selected;
        return (
          <button
            key={id}
            ref={(el) => {
              tabsRef.current[i] = el;
            }}
            role="tab"
            aria-selected={isSelected}
            aria-controls="artist-chat-panel"
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(id)}
            className={`px-4 py-2 rounded-full text-sm font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected
                ? "bg-ink text-page"
                : "bg-surface text-ink border border-hairline"
            }`}
          >
            {meta.shortName}
          </button>
        );
      })}
    </div>
  );
}
