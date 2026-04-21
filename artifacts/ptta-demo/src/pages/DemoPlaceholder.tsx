import { useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";
import { useLanguage } from "@/context/LanguageContext";

const titleStyle = { letterSpacing: "-0.01em" } as const;

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
    <div className="ptta-root min-h-screen bg-page text-ink flex flex-col">
      <Header showBack backHref="/demo-hub" />

      <main
        className="flex-1 flex items-center justify-center px-5 py-12"
        aria-label={title}
      >
        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-[440px] text-center"
        >
          <div className="text-left">
            <SectionLabel label={t.demoHub.eyebrow} tag="Module" />
          </div>
          <h1
            className="font-serif text-ink text-4xl md:text-5xl leading-[0.98] mb-4"
            style={titleStyle}
          >
            — {title}
          </h1>
          <p className="text-body-fg text-base md:text-lg mb-10">
            {t.placeholder.comingSoon}
          </p>

          <button
            type="button"
            onClick={handleBack}
            aria-label={t.placeholder.backToHub}
            className="w-full px-8 py-4 rounded-full bg-ink text-page font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ minHeight: 56, letterSpacing: "-0.02em" }}
          >
            ← {t.placeholder.backToHub}
          </button>
        </motion.section>
      </main>
    </div>
  );
}
