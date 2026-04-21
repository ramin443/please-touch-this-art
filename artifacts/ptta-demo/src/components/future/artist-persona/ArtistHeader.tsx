import type { ArtistMeta } from "@/content/artists";

interface Props {
  artist: ArtistMeta;
}

export function ArtistHeader({ artist }: Props) {
  const src = `${import.meta.env.BASE_URL || "/"}${artist.portrait}`.replace(
    /\/{2,}/g,
    "/",
  );

  return (
    <div className="flex items-center gap-3 mb-3">
      <img
        src={src}
        alt={artist.portraitAlt}
        className="w-14 h-14 rounded-full object-cover border border-hairline bg-surface-muted"
        loading="lazy"
      />
      <div className="min-w-0">
        <p className="font-serif text-lg leading-tight text-ink">
          {artist.displayName}
        </p>
        <p
          className="ptta-label text-muted-fg mt-0.5"
          style={{ fontSize: "9pt" }}
        >
          {artist.lifespan} · {artist.tagline}
        </p>
      </div>
    </div>
  );
}
