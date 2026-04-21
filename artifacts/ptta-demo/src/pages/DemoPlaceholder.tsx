import { useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";

const titleStyle = { letterSpacing: "-0.05em" } as const;
const eyebrowStyle = { letterSpacing: "0.18em" } as const;

export default function DemoPlaceholder() {
  const { t } = useLanguage();
  const params = useParams<{ slug: string }>();
  const [, navigate] = useLocation();
  const reduceMotion = useReducedMotion() ?? false;

  const card = t.demoHub.cards.find((c) => c.slug === params.slug);
  const title = card?.title ?? t.placeholder.notFoundTitle;

  const handleBack = useCallback(() => {
    navigate("/demo-hub");
  }, [navigate]);

  return (
    <div className="ptta-root min-h-screen bg-stone-50 text-stone-900 flex flex-col">
      <Header showBack backHref="/demo-hub" />

      <main
        className="flex-1 flex items-center justify-center px-6 py-16"
        aria-label={title}
      >
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-xl w-full text-center"
        >
          <p
            className="text-amber-600 text-xs uppercase mb-4"
            style={eyebrowStyle}
          >
            {t.demoHub.eyebrow}
          </p>
          <h1
            className="text-stone-900 text-4xl md:text-6xl leading-[0.95] mb-4"
            style={titleStyle}
          >
            {title}
          </h1>
          <p className="text-stone-600 text-base md:text-lg mb-10">
            {t.placeholder.comingSoon}
          </p>

          <button
            type="button"
            onClick={handleBack}
            aria-label={t.placeholder.backToHub}
            className="px-8 py-3 bg-stone-900 text-stone-50 font-bold text-sm md:text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
            style={{ minHeight: 48, letterSpacing: "-0.02em" }}
          >
            ← {t.placeholder.backToHub}
          </button>
        </motion.section>
      </main>
    </div>
  );
}
