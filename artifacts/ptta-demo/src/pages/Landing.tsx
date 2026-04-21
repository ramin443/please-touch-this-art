import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/Header";
import { useLanguage } from "@/context/LanguageContext";

const VIDEO_SRC = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/videos/testimonials.mp4`;

const titleStyle = { letterSpacing: "-0.05em" } as const;
const eyebrowStyle = { letterSpacing: "0.18em" } as const;

export default function Landing() {
  const { t } = useLanguage();
  const [muted, setMuted] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const [, navigate] = useLocation();

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      const video = videoRef.current;
      if (!video) return;
      if (e.matches) video.pause();
      else video.play().catch(() => {});
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    const next = !muted;
    video.muted = next;
    setMuted(next);
  }, [muted]);

  const handleCta = useCallback(() => {
    navigate("/how-it-works");
  }, [navigate]);

  return (
    <div className="ptta-root min-h-screen bg-stone-50 text-stone-900">

      <Header />

      {/* HERO VIDEO */}
      <section
        className="relative w-full bg-stone-950 overflow-hidden"
        style={{ aspectRatio: "16/9", maxHeight: "70vh" }}
        aria-label="Hero video"
      >
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          src={VIDEO_SRC}
          autoPlay={!prefersReducedMotion}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Please Touch This Art — blind visitors experiencing tactile art models in a museum"
        />

        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,9,8,0.82) 0%, rgba(10,9,8,0.35) 55%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-10 h-10 bg-black/60 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
        >
          {muted ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <line x1="23" y1="9" x2="17" y2="15" />
              <line x1="17" y1="9" x2="23" y2="15" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </button>

        {/* Hero copy — desktop: overlaid on bottom of video */}
        <div className="absolute inset-x-0 bottom-0 z-10 hidden md:flex flex-col items-start p-10 lg:p-16 max-w-3xl">
          <p className="text-amber-400 text-xs font-medium uppercase mb-4" style={eyebrowStyle}>
            {t.hero.eyebrow}
          </p>
          <h1 className="text-white text-5xl lg:text-7xl leading-[0.95] mb-6" style={titleStyle}>
            {t.hero.headline}
          </h1>
          <p className="text-white/80 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
            {t.hero.subline}
          </p>
          <button
            onClick={handleCta}
            aria-label={t.hero.cta}
            className="px-10 py-4 bg-amber-400 text-stone-900 font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ minHeight: 56, letterSpacing: "-0.02em" }}
          >
            {t.hero.cta}
          </button>
        </div>
      </section>

      {/* Hero copy — mobile: below video */}
      <section className="md:hidden bg-stone-950 px-6 pt-10 pb-12">
        <p className="text-amber-400 text-xs font-medium uppercase mb-4" style={eyebrowStyle}>
          {t.hero.eyebrow}
        </p>
        <h1 className="text-white text-4xl leading-[0.95] mb-5" style={titleStyle}>
          {t.hero.headline}
        </h1>
        <p className="text-white/75 text-base leading-relaxed mb-8">
          {t.hero.subline}
        </p>
        <button
          onClick={handleCta}
          aria-label={t.hero.cta}
          className="w-full px-8 py-4 bg-amber-400 text-stone-900 font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          style={{ minHeight: 56, letterSpacing: "-0.02em" }}
        >
          {t.hero.cta}
        </button>
      </section>

      {/* SLOGAN */}
      <section className="w-full bg-stone-50 py-24 px-6 text-center border-b border-stone-200" aria-label="Mission statement">
        <blockquote>
          <p className="text-stone-900 text-3xl md:text-5xl leading-[1.05] max-w-3xl mx-auto" style={titleStyle}>
            {t.slogan.quote}
          </p>
          <footer className="mt-8 text-stone-500 text-xs uppercase" style={eyebrowStyle}>
            {t.slogan.caption}
          </footer>
        </blockquote>
      </section>

      {/* PROBLEM / SOLUTION */}
      <section className="w-full bg-stone-100 py-20 px-6" aria-label="Problem and solution">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-px bg-stone-200 border border-stone-200">
          <article className="bg-stone-50 p-8 md:p-12">
            <p className="text-stone-400 text-xs uppercase mb-4" style={eyebrowStyle}>
              01
            </p>
            <h2 className="text-stone-900 text-3xl mb-5" style={titleStyle}>
              {t.problem.heading}
            </h2>
            <p className="text-stone-700 text-base leading-relaxed">
              {t.problem.body}
            </p>
          </article>
          <article className="bg-stone-50 p-8 md:p-12">
            <p className="text-amber-600 text-xs uppercase mb-4" style={eyebrowStyle}>
              02
            </p>
            <h2 className="text-stone-900 text-3xl mb-5" style={titleStyle}>
              {t.solution.heading}
            </h2>
            <p className="text-stone-700 text-base leading-relaxed">
              {t.solution.body}
            </p>
          </article>
        </div>
      </section>

      {/* CONTEXT STRIP */}
      <section className="w-full bg-stone-50 py-16 px-6 border-t border-stone-200" aria-label="Key facts">
        <div className="max-w-5xl mx-auto">
          <p className="text-stone-400 text-xs uppercase mb-8 text-center" style={eyebrowStyle}>
            In numbers
          </p>
          <div className="flex gap-6 overflow-x-auto md:overflow-visible md:grid md:grid-cols-4 md:gap-6 snap-x snap-mandatory md:snap-none pb-2 md:pb-0">
            {t.facts.map((fact, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-52 md:w-auto flex flex-col"
              >
                <div
                  className="aspect-square w-full bg-stone-200 rounded-t-2xl"
                  aria-hidden="true"
                />
                <p className="mt-4 text-stone-900 text-base leading-tight" style={titleStyle}>
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center text-stone-400 text-xs uppercase" style={eyebrowStyle}>
            {t.factsCaption}
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="w-full bg-stone-950 py-16 px-6 text-center" role="contentinfo">
        <a
          href={`mailto:${t.footer.email}`}
          className="text-amber-400 text-2xl md:text-3xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          style={titleStyle}
          aria-label={`Email us at ${t.footer.email}`}
        >
          {t.footer.email}
        </a>
        <p className="mt-6 text-stone-500 text-xs max-w-lg mx-auto leading-relaxed">
          {t.footer.disclaimer}
        </p>
      </footer>
    </div>
  );
}
