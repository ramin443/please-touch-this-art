import { useCallback } from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";
import { useLanguage } from "@/context/LanguageContext";

const titleStyle = { letterSpacing: "-0.01em" } as const;

export default function HowItWorks() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  const handleContinue = useCallback(() => {
    navigate("/demo-hub");
  }, [navigate]);

  const intro = t.howItWorks;

  const listContainerVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0 },
        show: {
          opacity: 1,
          transition: { staggerChildren: 0.05, delayChildren: 0.05 },
        },
      };

  const rowVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: -8 },
        show: { opacity: 1, x: 0, transition: { duration: 0.3 } },
      };

  return (
    <div className="ptta-root min-h-screen bg-page text-ink flex flex-col">
      <Header showBack backHref="/" />

      {/* Phone-width content column */}
      <div className="w-full flex-1 mx-auto max-w-[440px] px-5 pt-6 pb-6 flex flex-col">
        {/* INTRO */}
        <SectionLabel label={intro.eyebrow} tag="Dossier · 02" />
        <div className="text-center mb-6">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-serif text-ink text-3xl md:text-4xl leading-[1.02] mb-2"
            style={titleStyle}
          >
            — {intro.headline}
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="text-body-fg text-sm leading-snug"
          >
            {intro.subline}
          </motion.p>
        </div>

        {/* WORKFLOW LIST — titles only */}
        <motion.ol
          variants={listContainerVariants}
          initial="hidden"
          animate="show"
          className="list-none border border-hairline rounded-2xl overflow-hidden bg-surface divide-y divide-hairline"
          aria-label="Production workflow"
        >
          {intro.steps.map((step) => (
            <motion.li
              key={step.num}
              variants={rowVariants}
              className="flex items-center gap-4 px-4 py-3.5 active:bg-surface-muted transition-colors"
            >
              <span
                aria-hidden="true"
                className="ptta-label shrink-0 text-accent w-8"
                style={{ fontSize: "11pt" }}
              >
                {step.num}
              </span>
              <span
                className="flex-1 min-w-0 font-serif italic text-ink text-base md:text-lg leading-tight truncate"
                style={{ letterSpacing: "-0.005em" }}
              >
                {step.title}
              </span>
              <span
                aria-hidden="true"
                className="text-muted-fg shrink-0"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </span>
            </motion.li>
          ))}
        </motion.ol>

        {/* CONTINUE CTA — pinned at bottom of column */}
        <div className="mt-6">
          <motion.button
            whileHover={reduceMotion ? undefined : { scale: 1.02 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            type="button"
            onClick={handleContinue}
            aria-label={intro.continueCta}
            className="w-full px-6 py-4 rounded-full bg-ink text-page text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ minHeight: 56, letterSpacing: "-0.02em" }}
          >
            {intro.continueCta} →
          </motion.button>
        </div>
      </div>
    </div>
  );
}
