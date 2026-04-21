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
}: {
  card: DemoCardType;
  index: number;
  onOpen: (slug: string) => void;
  ariaLabel: string;
  openLabel: string;
  reduceMotion: boolean;
}) {
  const isFuture = card.variant === "future";

  const cardVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.35, ease: "easeOut" },
        },
      };

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
          relative w-full aspect-[16/9] overflow-hidden
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
              style={{ fontSize: "clamp(4rem, 22vw, 6rem)", letterSpacing: "-0.02em" }}
            >
              {String(index + 1).padStart(2, "0")}
            </span>
          </div>
        )}
      </div>

      {/* Meta strip + title + description */}
      <div className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Marker className={isFuture ? "!bg-cream" : ""} />
          <span
            className={`ptta-label ${isFuture ? "text-accent" : "text-muted-fg"}`}
            style={{ fontSize: "10pt" }}
          >
            Module · {String(index + 1).padStart(2, "0")}
          </span>
        </div>

        <h2
          className={`font-serif text-xl md:text-2xl leading-tight mb-2 ${
            isFuture ? "text-cream" : "text-ink"
          }`}
          style={titleStyle}
        >
          — {card.title}
        </h2>
        <p
          className={`text-sm leading-snug mb-4 ${
            isFuture ? "text-stone-400" : "text-body-fg"
          }`}
        >
          {card.description}
        </p>

        <span
          aria-hidden="true"
          className="ptta-label text-accent inline-flex items-center gap-1 transition-transform duration-200 group-hover:translate-x-0.5"
          style={{ fontSize: "10pt" }}
        >
          {openLabel} →
        </span>
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
        <div className="text-center mb-8">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-serif text-ink text-3xl md:text-4xl leading-[1.02] mb-2"
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

        {/* CARD STACK */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-col gap-4"
        >
          {demoHub.cards.map((card, i) => (
            <DemoHubCard
              key={card.slug}
              card={card}
              index={i}
              onOpen={handleOpen}
              ariaLabel={demoHub.ariaOpenModule(card.title)}
              openLabel={demoHub.openLabel}
              reduceMotion={reduceMotion}
            />
          ))}
        </motion.div>

        {/* FOOTER STRIP */}
        <div className="mt-10 flex flex-col items-center gap-3 text-center">
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
