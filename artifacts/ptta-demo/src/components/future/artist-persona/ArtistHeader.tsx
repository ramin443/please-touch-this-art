import { motion, useReducedMotion } from "framer-motion";
import type { ArtistMeta } from "@/content/artists";

interface Props {
  artist: ArtistMeta;
}

export function ArtistHeader({ artist }: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const src = `${import.meta.env.BASE_URL || "/"}${artist.portrait}`.replace(
    /\/{2,}/g,
    "/",
  );

  return (
    <motion.div
      key={artist.id}
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="relative overflow-hidden rounded-2xl border border-hairline mb-4"
      style={{
        background: `linear-gradient(160deg, ${artist.palette.gradientFrom} 0%, ${artist.palette.gradientTo} 100%)`,
      }}
    >
      {/* subtle painterly texture overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-40"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.35), transparent 50%), radial-gradient(circle at 80% 80%, rgba(0,0,0,0.35), transparent 55%)",
        }}
      />

      <div className="relative flex items-stretch gap-4 p-4 md:p-5">
        <img
          src={src}
          alt={artist.portraitAlt}
          loading="lazy"
          className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover flex-shrink-0 border"
          style={{
            borderColor: artist.palette.accent,
            boxShadow: `0 8px 24px -8px ${artist.palette.accent}88`,
          }}
        />
        <div className="min-w-0 flex flex-col justify-between text-cream">
          <div>
            <p
              className="ptta-label"
              style={{
                fontSize: "9pt",
                color: artist.palette.accent,
                letterSpacing: "0.08em",
              }}
            >
              Speaking with
            </p>
            <h3
              className="font-serif text-xl md:text-2xl leading-tight mt-0.5 text-white drop-shadow"
              style={{ letterSpacing: "-0.01em" }}
            >
              {artist.displayName}
            </h3>
            <p
              className="text-white/70 text-xs md:text-sm mt-0.5"
              style={{ fontSize: "10.5pt" }}
            >
              {artist.lifespan} · {artist.tagline}
            </p>
          </div>
          <p
            className="font-serif italic text-white/85 text-sm md:text-base mt-2 leading-snug"
            style={{ letterSpacing: "-0.005em" }}
          >
            “{artist.quote}”
          </p>
        </div>
      </div>
    </motion.div>
  );
}
