import { useCallback, useRef } from "react";
import { useLocation } from "wouter";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type Variants,
} from "framer-motion";
import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";
import type { HowItWorksStep } from "@/content/copy";

const titleStyle = { letterSpacing: "-0.05em" } as const;
const eyebrowStyle = { letterSpacing: "0.18em" } as const;

function StepCard({
  step,
  index,
  reduceMotion,
}: {
  step: HowItWorksStep;
  index: number;
  reduceMotion: boolean;
}) {
  const isEven = index % 2 === 0;

  const containerVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, x: isEven ? -48 : 48 },
        show: {
          opacity: 1,
          x: 0,
          transition: {
            type: "spring",
            stiffness: 70,
            damping: 16,
            when: "beforeChildren",
            staggerChildren: 0.08,
          },
        },
      };

  const itemVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1 }, show: { opacity: 1 } }
    : {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      };

  const badgeVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.2, rotate: -20 },
        show: {
          opacity: 1,
          scale: 1,
          rotate: 0,
          transition: { type: "spring", stiffness: 260, damping: 14, delay: 0.1 },
        },
      };

  const illoVariants: Variants = reduceMotion
    ? { hidden: { opacity: 1, scale: 1 }, show: { opacity: 1, scale: 1 } }
    : {
        hidden: { opacity: 0, scale: 0.92 },
        show: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: "easeOut" } },
      };

  return (
    <motion.article
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      whileHover={reduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
      aria-labelledby={`step-${step.num}-title`}
      className={`
        group relative flex items-center gap-4 md:gap-6
        bg-stone-50 border border-stone-200 shadow-sm
        px-4 py-4 md:px-6 md:py-5
        ${isEven ? "md:flex-row" : "md:flex-row-reverse"}
      `}
    >
      {/* Number badge pinned to left edge */}
      <motion.div
        variants={badgeVariants}
        className="shrink-0 flex items-center justify-center w-11 h-11 md:w-12 md:h-12 bg-amber-400 text-stone-900 text-base md:text-lg"
        aria-hidden="true"
        style={titleStyle}
      >
        {step.num}
      </motion.div>

      {/* Illustration placeholder — compact thumbnail */}
      {/*
        Replace this <motion.div> with an <img> when assets are ready.
        Expected content for step ${step.num}: ${step.illoAlt}
      */}
      <motion.div
        variants={illoVariants}
        role="img"
        aria-label={step.illoAlt}
        className="shrink-0 w-20 h-20 md:w-24 md:h-24 bg-stone-200 rounded-t-xl overflow-hidden transition-transform duration-300 group-hover:scale-[1.04]"
      />

      {/* Text block */}
      <motion.div variants={itemVariants} className="min-w-0 flex-1">
        <p className="text-amber-600 text-[10px] md:text-xs uppercase mb-1" style={eyebrowStyle}>
          Step {step.num}
        </p>
        <h2
          id={`step-${step.num}-title`}
          className="text-stone-900 text-lg md:text-xl leading-tight mb-1.5"
          style={titleStyle}
        >
          {step.title}
        </h2>
        <p className="text-stone-700 text-sm leading-snug line-clamp-3 md:line-clamp-none">
          {step.body}
        </p>
      </motion.div>
    </motion.article>
  );
}

export default function HowItWorks() {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  const timelineRef = useRef<HTMLOListElement>(null);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 80%", "end 60%"],
  });
  const lineScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const handleContinue = useCallback(() => {
    navigate("/demo-hub");
  }, [navigate]);

  const intro = t.howItWorks;

  return (
    <div className="ptta-root min-h-screen bg-stone-50 text-stone-900 pb-24 md:pb-0">
      <Header showBack backHref="/" />

      {/* INTRO — tight */}
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
            {intro.eyebrow}
          </motion.p>
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            className="text-stone-900 text-3xl md:text-5xl leading-[0.95] mb-3"
            style={titleStyle}
          >
            {intro.headline}
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-stone-700 text-sm md:text-base leading-relaxed max-w-xl mx-auto"
          >
            {intro.subline}
          </motion.p>
        </div>
      </section>

      {/* TIMELINE — compact alternating strips */}
      <main
        className="w-full px-4 md:px-10 py-8 md:py-10"
        aria-label="Production workflow"
      >
        <div className="relative max-w-4xl mx-auto">
          {/* Scroll-linked timeline line (left side) */}
          <div
            className="absolute left-[22px] top-0 bottom-0 w-px bg-stone-200 md:hidden"
            aria-hidden="true"
          />
          <motion.div
            className="absolute left-[22px] top-0 w-px bg-amber-500 origin-top md:hidden"
            style={{ scaleY: lineScaleY, height: "100%" }}
            aria-hidden="true"
          />

          <ol
            ref={timelineRef}
            className="flex flex-col gap-3 md:gap-4 list-none"
          >
            {intro.steps.map((step, i) => (
              <li key={step.num}>
                <StepCard step={step} index={i} reduceMotion={reduceMotion} />
              </li>
            ))}
          </ol>
        </div>
      </main>

      {/* CONTINUE CTA — inline, compact */}
      <section
        className="hidden md:block w-full border-t border-stone-200 py-8 px-6 text-center"
        aria-label="Continue to demo"
      >
        <motion.button
          whileHover={reduceMotion ? undefined : { scale: 1.03 }}
          whileTap={reduceMotion ? undefined : { scale: 0.98 }}
          type="button"
          onClick={handleContinue}
          aria-label={intro.continueCta}
          className="px-10 py-3.5 bg-stone-900 text-stone-50 font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          style={{ minHeight: 52, letterSpacing: "-0.02em" }}
        >
          {intro.continueCta} →
        </motion.button>
      </section>

      {/* CONTINUE CTA — sticky on mobile */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-3 bg-stone-50/95 backdrop-blur border-t border-stone-200"
        aria-label="Sticky continue"
      >
        <button
          type="button"
          onClick={handleContinue}
          aria-label={intro.continueCta}
          className="w-full px-8 py-3.5 bg-stone-900 text-stone-50 font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
          style={{ minHeight: 52, letterSpacing: "-0.02em" }}
        >
          {intro.continueCta} →
        </button>
      </div>
    </div>
  );
}
