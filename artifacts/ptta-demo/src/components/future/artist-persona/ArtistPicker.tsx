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
      className="flex gap-5 md:gap-8 justify-center mb-5"
      onKeyDown={onKey}
    >
      {ARTIST_IDS.map((id, i) => {
        const meta = ARTISTS[id];
        const isSelected = id === selected;
        const src = `${import.meta.env.BASE_URL || "/"}${meta.portrait}`.replace(
          /\/{2,}/g,
          "/",
        );
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
            className="flex flex-col items-center gap-1.5 focus-visible:outline-none group"
          >
            <span
              className={`rounded-full p-[3px] transition-all duration-300 ${
                isSelected
                  ? "scale-110"
                  : "opacity-55 group-hover:opacity-90 group-hover:scale-105"
              }`}
              style={{
                background: isSelected
                  ? `linear-gradient(135deg, ${meta.palette.accent}, ${meta.palette.gradientFrom})`
                  : "transparent",
                boxShadow: isSelected
                  ? `0 6px 20px -6px ${meta.palette.accent}55`
                  : "none",
              }}
            >
              <img
                src={src}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover bg-surface-muted border border-hairline"
              />
            </span>
            <span
              className={`text-xs md:text-sm font-sans transition-colors ${
                isSelected ? "text-ink font-semibold" : "text-muted-fg"
              }`}
            >
              {meta.shortName}
            </span>
          </button>
        );
      })}
    </div>
  );
}
