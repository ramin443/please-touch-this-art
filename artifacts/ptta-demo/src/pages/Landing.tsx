import { useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { CyclingText } from "@/components/CyclingText";
import { SectionLabel, AlertBanner, Marker } from "@/components/editorial";
import { useLanguage } from "@/context/LanguageContext";

const VIDEO_SRC = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/videos/people-using-tactile.mp4`;

const titleStyle = { letterSpacing: "-0.01em" } as const;
const headingTight = { letterSpacing: "-0.02em" } as const;

export default function Landing() {
  const { t } = useLanguage();

  const videoRef = useRef<HTMLVideoElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    video.play().catch(() => {});
  }, []);

  const handleCta = useCallback(() => {
    navigate("/how-it-works");
  }, [navigate]);

  return (
    <div className="ptta-root min-h-screen bg-page text-ink">
      <Header />

      {/* Phone-width app column */}
      <div className="w-full mx-auto max-w-[440px] px-5 pt-6 pb-8">
        {/* HERO VIDEO */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full aspect-video overflow-hidden rounded-2xl bg-stone-950"
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-label="Please Touch This Art — people testing tactile art models in a museum"
          />
        </motion.div>

        {/* HERO TEXT */}
        <div className="text-center pt-8 pb-2">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="font-serif text-ink text-4xl md:text-5xl leading-[1.05] mb-4"
            style={titleStyle}
            aria-label={`${t.hero.headline.leading}${t.hero.headline.emphasis}`}
          >
            <span aria-hidden="true">{t.hero.headline.leading}</span>
            <em className="italic" aria-hidden="true">
              <CyclingText
                words={t.hero.headline.emphasisCycle ?? [t.hero.headline.emphasis]}
              />
            </em>
            <span aria-hidden="true">{t.hero.headline.trailing ?? ""}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.14 }}
            className="text-ink text-base leading-snug mb-8"
          >
            {t.hero.subline.leading}
            <strong className="font-bold">{t.hero.subline.emphasis}</strong>
            {t.hero.subline.trailing}
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={handleCta}
            aria-label={t.hero.cta}
            className="w-full px-8 py-4 rounded-full bg-ink text-page text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ minHeight: 56, letterSpacing: "-0.02em" }}
          >
            {t.hero.cta}
          </motion.button>
        </div>
      </div>

      {/* SLOGAN */}
      <section
        className="w-full py-14 px-5 border-t border-hairline"
        aria-label="Mission statement"
      >
        <div className="mx-auto max-w-[440px]">
          <SectionLabel label="Epigraph" tag="Edition 01" />
          <blockquote className="text-center">
            <p
              className="font-sans text-ink text-2xl md:text-4xl leading-[1.15]"
              style={headingTight}
            >
              {t.slogan.quote.leading}
              <span className="font-medium">{t.slogan.quote.emphasis}</span>
              {t.slogan.quote.trailing}
            </p>
            <footer className="ptta-label mt-6 text-muted-fg" style={{ fontSize: "10pt" }}>
              {t.slogan.caption}
            </footer>
          </blockquote>
        </div>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section
        className="w-full py-12 px-5 border-t border-hairline"
        aria-label="Problem and solution"
      >
        <div className="mx-auto max-w-[440px]">
          <SectionLabel label="Dispatch" tag="Brief · 02" />
          <div className="flex flex-col gap-4">
            <article className="bg-surface border border-hairline rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Marker />
                <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>01</span>
              </div>
              <h2 className="font-serif text-ink text-xl md:text-2xl mb-2" style={headingTight}>
                — {t.problem.heading}
              </h2>
              <p className="text-body-fg text-sm leading-relaxed">
                {t.problem.body}
              </p>
            </article>
            <article className="bg-surface border border-hairline rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <Marker />
                <span className="ptta-label text-accent" style={{ fontSize: "10pt" }}>02</span>
              </div>
              <h2 className="font-serif text-ink text-xl md:text-2xl mb-2" style={headingTight}>
                — {t.solution.heading}
              </h2>
              <p className="text-body-fg text-sm leading-relaxed">
                {t.solution.body}
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full" role="contentinfo">
        <AlertBanner tone="accent">Demo prototype — transmission log</AlertBanner>
        <div className="bg-stone-950 py-12 px-5 text-center">
          <a
            href={`mailto:${t.footer.email}`}
            className="font-serif italic text-accent text-xl md:text-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            aria-label={`Email us at ${t.footer.email}`}
          >
            — {t.footer.email}
          </a>
          <p className="mt-5 text-stone-400 text-sm max-w-[440px] mx-auto leading-relaxed">
            {t.footer.disclaimer}
          </p>
        </div>
      </footer>
    </div>
  );
}
