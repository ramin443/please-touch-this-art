import { useCallback } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";
import type { DemoCard as DemoCardType } from "@/content/copy";

const titleStyle = { letterSpacing: "-0.05em" } as const;
const eyebrowStyle = { letterSpacing: "0.18em" } as const;

// col-span rules per card index so the 4th and 5th span wider to balance the grid
// Mobile (1 col): each card = 1
// Tablet (2 col): first four cards = 1 each, 5th spans both cols
// Desktop (6 col): first three span 2 each (3-up row), last two span 3 each (2-up row)
const CARD_SPAN_CLASSES = [
  "md:col-span-1 lg:col-span-2",
  "md:col-span-1 lg:col-span-2",
  "md:col-span-1 lg:col-span-2",
  "md:col-span-1 lg:col-span-3",
  "md:col-span-2 lg:col-span-3",
];

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
        hidden: { opacity: 0, y: 20 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.45, ease: "easeOut" },
        },
      };

  return (
    <motion.button
      type="button"
      onClick={() => onOpen(card.slug)}
      variants={cardVariants}
      whileHover={reduceMotion ? undefined : { scale: 1.02, y: -2 }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      aria-label={ariaLabel}
      className={`
        ${CARD_SPAN_CLASSES[index] ?? ""}
        group relative flex flex-col text-left
        rounded-2xl border shadow-sm
        p-6 md:p-7 min-h-[220px]
        transition-shadow duration-200 hover:shadow-md
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500
        ${
          isFuture
            ? "bg-slate-50 border-slate-200"
            : "bg-stone-50 border-stone-200"
        }
      `}
    >
      {/*
        ILLUSTRATION PLACEHOLDER — replace this <div> with an <img> when assets are ready.
        Expected content for "${card.title}": ${card.illoAlt}
      */}
      <div
        role="img"
        aria-label={card.illoAlt}
        className={`
          w-full aspect-[16/9] rounded-xl mb-5
          ${isFuture ? "bg-slate-200" : "bg-stone-200"}
        `}
      />

      <h2
        className="text-stone-900 text-xl md:text-2xl leading-tight mb-2"
        style={titleStyle}
      >
        {card.title}
      </h2>
      <p className="text-stone-700 text-sm leading-snug">{card.description}</p>

      <span
        aria-hidden="true"
        className={`
          absolute bottom-5 right-6 text-xs uppercase
          transition-transform duration-200
          group-hover:translate-x-0.5
          ${isFuture ? "text-slate-600" : "text-amber-600"}
        `}
        style={eyebrowStyle}
      >
        {openLabel} →
      </span>
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
      navigate(`/demo/${slug}`);
    },
    [navigate]
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
          transition: { staggerChildren: 0.08, delayChildren: 0.1 },
        },
      };

  return (
    <div className="ptta-root min-h-screen bg-stone-50 text-stone-900">
      <Header showBack backHref="/how-it-works" />

      {/* INTRO */}
      <section
        className="w-full px-6 md:px-10 pt-8 pb-6 md:pt-12 md:pb-8 border-b border-stone-200"
        aria-label="Page introduction"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="text-amber-600 text-xs uppercase mb-3"
            style={eyebrowStyle}
          >
            {demoHub.eyebrow}
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-stone-900 text-3xl md:text-5xl leading-[0.95] mb-3"
            style={titleStyle}
          >
            {demoHub.headline}
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-stone-700 text-sm md:text-base leading-relaxed max-w-xl mx-auto"
          >
            {demoHub.subline}
          </motion.p>
        </div>
      </section>

      {/* CARD GRID */}
      <main className="w-full px-6 md:px-10 py-10 md:py-14" aria-label="Demo modules">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 md:gap-5"
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
      </main>

      {/* FOOTER STRIP */}
      <footer
        className="w-full border-t border-stone-200 py-8 px-6 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left"
        role="contentinfo"
      >
        <p className="text-stone-500 text-xs md:text-sm">{demoHub.footer.note}</p>
        <button
          type="button"
          onClick={handleReturn}
          className="text-amber-600 text-xs md:text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
        >
          ← {demoHub.footer.returnLink}
        </button>
      </footer>
    </div>
  );
}
