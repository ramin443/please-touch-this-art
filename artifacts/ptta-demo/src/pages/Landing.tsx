import { useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { CyclingText } from "@/components/CyclingText";
import { SectionLabel, Marker } from "@/components/editorial";
import { useLanguage } from "@/context/LanguageContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const VIDEO_SRC = `${BASE}/videos/people-using-tactile.mp4`;
const VIDEO_POSTER = `${BASE}/posters/people-using-tactile.jpg`;
const SOLUTION_IMG = `${BASE}/printed/st-nikolai.png`;

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

      {/* App column — phone-width on mobile, grows on tablet/desktop */}
      <div className="w-full mx-auto max-w-[440px] md:max-w-3xl lg:max-w-5xl px-5 md:px-8 pt-6 md:pt-10 pb-8 md:pb-14">
        {/*
          HERO VIDEO — responsive height.
          `aspect-video` (16:9) + `maxWidth: calc(50dvh * 16/9)` ensures the
          video's height never exceeds 50% of the viewport, so the headline
          and CTA stay on-screen even when the browser window is partially
          maximised or shorter than usual. On tall viewports, the video
          still grows with the column up to its lg:max-w-5xl cap.
        */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="relative w-full aspect-video overflow-hidden rounded-[22px] md:rounded-[32px] bg-stone-950 mx-auto"
          style={{ maxWidth: "calc(50dvh * 16 / 9)" }}
        >
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-cover"
            src={VIDEO_SRC}
            poster={VIDEO_POSTER}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Please Touch This Art — people testing tactile art models in a museum"
          />
        </motion.div>

        {/* HERO TEXT — constrained for readability even when container grows */}
        <div className="text-center pt-8 md:pt-12 pb-2 mx-auto max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08 }}
            className="font-serif text-ink text-4xl md:text-6xl leading-[1.05] mb-4"
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
            className="text-ink text-base md:text-lg leading-snug mb-8 max-w-xl mx-auto"
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
            className="w-full max-w-sm mx-auto px-8 py-4 rounded-full bg-ink text-page text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            style={{ minHeight: 56, letterSpacing: "-0.02em" }}
          >
            {t.hero.cta}
          </motion.button>
        </div>
      </div>

      {/* SLOGAN */}
      <section
        className="w-full py-14 md:py-20 px-5 md:px-8 border-t border-hairline"
        aria-label="Mission statement"
      >
        <div className="mx-auto max-w-[440px] md:max-w-2xl">
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
        className="w-full py-12 md:py-20 px-5 md:px-8 border-t border-hairline"
        aria-label="Problem and solution"
      >
        <div className="mx-auto max-w-[440px] md:max-w-5xl">
          <SectionLabel label="Dispatch" tag="Brief · 02" />
          <div className="flex flex-col md:grid md:grid-cols-2 gap-4 md:gap-6 items-stretch">
            {/* PROBLEM — stat-forward, minimal body */}
            <article className="bg-surface border border-hairline rounded-2xl p-5 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <Marker />
                <span className="ptta-label text-muted-fg" style={{ fontSize: "10pt" }}>
                  Problem · 01
                </span>
              </div>

              <h2
                className="font-serif italic text-ink text-xl md:text-2xl mb-5"
                style={headingTight}
              >
                — {t.problem.heading}
              </h2>

              {/* Primary stat */}
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className="font-serif italic text-accent leading-none"
                  style={{
                    fontSize: "clamp(3rem, 14vw, 4.5rem)",
                    letterSpacing: "-0.03em",
                  }}
                >
                  300M
                </span>
              </div>
              <p className="text-body-fg text-sm leading-snug mb-5">
                people worldwide live with vision impairment.
              </p>

              {/* Dot pictogram — 30 dots, each ≈ 10M people */}
              <div
                aria-hidden="true"
                className="grid grid-cols-10 gap-1.5 max-w-[240px] mb-2"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <span
                    key={i}
                    className="aspect-square rounded-full bg-accent"
                  />
                ))}
              </div>
              <p
                className="ptta-label text-muted-fg mb-5"
                style={{ fontSize: "9pt" }}
              >
                Each dot ≈ 10M people
              </p>

              {/* Secondary stat — fully-blind subset with its own mini dot cluster */}
              <div className="pt-4 border-t border-hairline">
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="ptta-label text-muted-fg"
                    style={{ fontSize: "9pt" }}
                  >
                    Of which
                  </span>
                  <span
                    className="font-serif italic text-ink leading-none"
                    style={{ fontSize: "1.75rem", letterSpacing: "-0.02em" }}
                  >
                    43M
                  </span>
                  <span
                    className="ptta-label text-muted-fg"
                    style={{ fontSize: "9pt" }}
                  >
                    fully blind
                  </span>
                  <span
                    aria-hidden="true"
                    className="flex items-center gap-1 ml-auto"
                  >
                    {Array.from({ length: 4 }).map((_, i) => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-accent"
                      />
                    ))}
                  </span>
                </div>
              </div>

              <p
                className="ptta-label text-muted-fg mt-4"
                style={{ fontSize: "9pt" }}
              >
                Source · WHO, 2023
              </p>
            </article>

            {/* SOLUTION — photo header + stat + short body */}
            <article className="bg-surface border border-hairline rounded-2xl overflow-hidden">
              <div className="relative w-full aspect-[16/10] bg-stone-200 overflow-hidden">
                <img
                  src={SOLUTION_IMG}
                  alt="Hands actively exploring a finished tactile relief sculpture"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div
                  className="absolute inset-x-0 bottom-0 p-4"
                  style={{
                    background:
                      "linear-gradient(to top, rgba(12,10,9,0.85) 0%, rgba(12,10,9,0.35) 55%, transparent 100%)",
                  }}
                >
                  <div className="flex items-baseline gap-2">
                    <span
                      className="font-serif italic text-cream leading-none"
                      style={{
                        fontSize: "clamp(2.5rem, 12vw, 3.5rem)",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      27+
                    </span>
                    <span
                      className="ptta-label text-cream/80"
                      style={{ fontSize: "9pt" }}
                    >
                      Installations
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6">
                <div className="flex items-center justify-between mb-3">
                  <Marker />
                  <span
                    className="ptta-label text-accent"
                    style={{ fontSize: "10pt" }}
                  >
                    Solution · 02
                  </span>
                </div>
                <h2
                  className="font-serif italic text-ink text-xl md:text-2xl mb-2"
                  style={headingTight}
                >
                  — {t.solution.heading}
                </h2>
                <p className="text-body-fg text-sm leading-relaxed">
                  {t.solution.body}
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* FOOTER — quiet brand closer */}
      <footer
        className="w-full border-t border-hairline bg-surface-muted"
        role="contentinfo"
      >
        <div className="mx-auto max-w-[440px] md:max-w-2xl px-5 md:px-8 py-16 md:py-24 text-center">
          <div className="flex justify-center mb-6">
            <Marker className="!bg-accent" />
          </div>
          <p
            className="font-serif italic text-ink text-3xl md:text-4xl leading-[1.1] mb-8"
            style={{ letterSpacing: "-0.02em" }}
          >
            Please touch this art.
          </p>
          <p
            className="ptta-label text-muted-fg"
            style={{ fontSize: "10pt" }}
          >
            PTTA · 2026
          </p>
        </div>
      </footer>
    </div>
  );
}
