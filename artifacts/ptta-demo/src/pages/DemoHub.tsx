import { useCallback } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Header } from "@/components/Header";
import { SectionLabel, Marker } from "@/components/editorial";
import { useLanguage } from "@/context/LanguageContext";
import type { DemoCard as DemoCardType } from "@/content/copy";

const titleStyle = { letterSpacing: "-0.01em" } as const;

function DemoHubCard({
  card,
  index,
  onOpen,
  ariaLabel,
  openLabel,
  reduceMotion,
  wide = false,
}: {
  card: DemoCardType;
  index: number;
  onOpen: (slug: string) => void;
  ariaLabel: string;
  openLabel: string;
  reduceMotion: boolean;
  /** Future Features banner spans both columns of the 2-col grid. */
  wide?: boolean;
}) {
  const isFuture = card.variant === "future";

  const cardVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 10 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      };

  // Regular 2×2 grid cards use a square-ish thumbnail.
  // Wide banner (Future Features) uses a horizontal 16:9 image.
  const mediaAspect = wide ? "aspect-[16/9]" : "aspect-[5/4]";

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(card.slug)}
      variants={cardVariants}
      whileHover={reduceMotion ? undefined : { y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      aria-label={ariaLabel}
      className={`
        group relative flex flex-col text-left w-full
        ${wide ? "col-span-2" : ""}
        rounded-2xl border shadow-sm overflow-hidden
        transition-shadow duration-200 hover:shadow-md
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent
        ${
          isFuture
            ? "bg-stone-950 text-cream border-stone-950"
            : "bg-surface text-ink border-hairline"
        }
      `}
    >
      {/* Image or abstract numeral block */}
      <div
        className={`
          relative w-full ${mediaAspect} overflow-hidden
          ${isFuture ? "bg-stone-800" : "bg-surface-muted"}
        `}
      >
        {card.imageSrc ? (
          <img
            src={`${import.meta.env.BASE_URL.replace(/\/$/, "")}/${card.imageSrc}`}
            alt={card.illoAlt}
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            role="img"
            aria-label={card.illoAlt}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span
              aria-hidden="true"
              className={`font-serif italic leading-none ${
                isFuture ? "text-cream" : "text-muted-fg"
              }`}
              style={{
                fontSize: wide
                  ? "clamp(3.5rem, 14vw, 5rem)"
                  : "clamp(2.5rem, 14vw, 3.5rem)",
                letterSpacing: "-0.02em",
              }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Compact text block — app-card style */}
      <div className={`${wide ? "p-4" : "p-3"}`}>
        <div className="flex items-center justify-between mb-2">
          <Marker
            className={isFuture ? "!bg-cream" : ""}
            size={wide ? 7 : 6}
          />
          <span
            className={`ptta-label ${isFuture ? "text-accent" : "text-muted-fg"}`}
            style={{ fontSize: "9pt" }}
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h2
          className={`font-sans leading-tight ${
            wide ? "text-lg md:text-xl" : "text-sm md:text-base"
          } ${isFuture ? "text-cream" : "text-ink"}`}
          style={titleStyle}
        >
          — {card.title}
        </h2>

        {wide && (
          <p
            className={`text-xs mt-1 leading-snug line-clamp-2 ${
              isFuture ? "text-stone-400" : "text-body-fg"
            }`}
          >
            {card.description}
          </p>
        )}

        <div className="mt-2 flex items-center justify-between">
          <span
            aria-hidden="true"
            className="ptta-label text-accent inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5"
            style={{ fontSize: "9pt" }}
          >
            {openLabel} →
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function DemoHub() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const reduceMotion = useReducedMotion() ?? false;
  const { demoHub } = t;

  const handleOpen = useCallback(
    (slug: string) => {
      const card = demoHub.cards.find((c) => c.slug === slug);
      navigate(card?.route ?? `/demo/${slug}`);
    },
    [navigate, demoHub.cards]
  );

  const handleReturn = useCallback(() => {
    navigate("/");
  }, [navigate]);

  const containerVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.06, delayChildren: 0.1 },
        },
      };

  return (
    <div className="ptta-root min-h-screen bg-page text-ink">
      <Header showBack backHref="/how-it-works" />

      {/* Phone-width column */}
      <div className="w-full mx-auto max-w-[440px] px-5 pt-6 pb-10">
        {/* INTRO */}
        <SectionLabel label={demoHub.eyebrow} tag="Dossier · 03" />
        <div className="text-center mb-6">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-sans text-ink text-3xl md:text-4xl leading-[1.02] mb-2"
            style={titleStyle}
          >
            — {demoHub.headline}
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-body-fg text-sm leading-snug"
          >
            {demoHub.subline}
          </motion.p>
        </div>

        {/* 2×2 (+1 wide) CARD GRID — app style */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 gap-3"
        >
          {demoHub.cards.map((card, i) => {
            const isFuture = card.variant === "future";
            return (
              <DemoHubCard
                key={card.slug}
                card={card}
                index={i}
                onOpen={handleOpen}
                ariaLabel={demoHub.ariaOpenModule(card.title)}
                openLabel={demoHub.openLabel}
                reduceMotion={reduceMotion}
                wide={isFuture}
              />
            );
          })}
        </motion.div>

        {/* FOOTER STRIP */}
        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="text-muted-fg text-xs">{demoHub.footer.note}</p>
          <button
            type="button"
            onClick={handleReturn}
            className="ptta-label text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ fontSize: "10pt" }}
          >
            ← {demoHub.footer.returnLink}
          </button>
        </div>
      </div>
    </div>
  );
}
