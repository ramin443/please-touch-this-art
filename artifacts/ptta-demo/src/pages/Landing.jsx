import { useRef, useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import { copy } from "@/content/copy.js";

export default function Landing() {
  const [lang, setLang] = useState("en");
  const [muted, setMuted] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const [heroPast, setHeroPast] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const videoRef = useRef(null);
  const heroRef = useRef(null);
  const [, navigate] = useLocation();

  const t = copy[lang];

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    if (prefersReducedMotion) {
      vid.pause();
    } else {
      vid.play().catch(() => {});
    }
  }, [prefersReducedMotion]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        setHeroPast(rect.bottom < 0);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleMute = useCallback(() => {
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setMuted(vid.muted);
  }, []);

  const handleCta = useCallback(() => {
    navigate("/how-it-works");
  }, [navigate]);

  return (
    <div className="ptta-root min-h-screen" style={{ scrollBehavior: "smooth" }}>

      {/* ─── 1. HEADER ─────────────────────────────────────────────────────── */}
      <header
        className={`ptta-header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 transition-all duration-300 ${
          scrolled ? "bg-white/90 backdrop-blur shadow-sm" : "bg-transparent"
        }`}
        role="banner"
      >
        {/*
          LOGO PLACEHOLDER
          ─────────────────────────────────────────────────────────────────────
          Replace the text below with your actual logo once you have the file.
          Example (after placing logo.svg in /src/assets/):
            <img src={logo} alt="Please Touch This Art" className="h-8" />
          ─────────────────────────────────────────────────────────────────────
        */}
        <a
          href="/"
          className={`ptta-logo font-serif text-lg font-bold tracking-tight transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
            scrolled ? "text-stone-900" : "text-white"
          }`}
          aria-label="Please Touch This Art – home"
        >
          {t.header.logoText}
        </a>

        <nav aria-label="Language selection">
          <div className="flex gap-1 text-sm font-medium" role="group">
            <button
              onClick={() => setLang("en")}
              aria-label="Switch to English"
              aria-pressed={lang === "en"}
              className={`px-3 py-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                lang === "en"
                  ? "bg-amber-500 text-stone-900"
                  : scrolled
                  ? "text-stone-600 hover:text-stone-900"
                  : "text-white/80 hover:text-white"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang("de")}
              aria-label="Zur deutschen Sprache wechseln"
              aria-pressed={lang === "de"}
              className={`px-3 py-1.5 rounded-full transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 ${
                lang === "de"
                  ? "bg-amber-500 text-stone-900"
                  : scrolled
                  ? "text-stone-600 hover:text-stone-900"
                  : "text-white/80 hover:text-white"
              }`}
            >
              DE
            </button>
          </div>
        </nav>
      </header>

      {/* ─── 2. HERO VIDEO BLOCK ────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="ptta-hero relative w-full bg-stone-950 overflow-hidden"
        style={{ aspectRatio: "16/9", maxHeight: "100svh" }}
        aria-label="Hero video"
      >
        {/*
          VIDEO PLACEHOLDER
          ─────────────────────────────────────────────────────────────────────
          Replace the src attributes with your actual video file paths.
          The poster image should be a still frame from the footage.
          Footage will show blind visitors interacting with tactile 3D models in a museum.

          Example:
            <source src="/videos/ptta-hero.mp4" type="video/mp4" />
            poster="/images/ptta-hero-poster.jpg"
          ─────────────────────────────────────────────────────────────────────
        */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          autoPlay={!prefersReducedMotion}
          muted={muted}
          loop
          playsInline
          aria-label="Video showing blind visitors experiencing tactile art models in a museum"
        >
          {/* Replace the src below with your actual footage */}
          {/* <source src="/videos/ptta-hero.mp4" type="video/mp4" /> */}

          {/*
            CAPTIONS TRACK PLACEHOLDER
            ───────────────────────────────────────────────────────────────────
            Once your WebVTT captions file is ready, uncomment the line below:
            <track kind="captions" src="/captions/ptta-hero-en.vtt" srcLang="en" label="English" default />
            ───────────────────────────────────────────────────────────────────
          */}
        </video>

        {/* Dark gradient overlay at bottom for text contrast (desktop) */}
        <div
          className="absolute inset-x-0 bottom-0 h-2/3 pointer-events-none"
          style={{
            background:
              "linear-gradient(to top, rgba(10,9,8,0.82) 0%, rgba(10,9,8,0.35) 55%, transparent 100%)",
          }}
          aria-hidden="true"
        />

        {/* Mute / Unmute toggle */}
        <button
          onClick={toggleMute}
          aria-label={muted ? "Unmute video" : "Mute video"}
          className="absolute bottom-4 right-4 z-10 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
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

        {/* ─── 3. HERO COPY (desktop: overlaid on bottom of video) ────────── */}
        <div className="absolute inset-x-0 bottom-0 z-10 hidden md:flex flex-col items-start p-10 lg:p-16 max-w-3xl">
          <p className="ptta-eyebrow text-amber-400 text-xs font-sans font-semibold uppercase tracking-widest mb-3">
            {t.hero.eyebrow}
          </p>
          <h1 className="ptta-headline font-serif text-white text-4xl lg:text-6xl font-bold leading-tight mb-4">
            {t.hero.headline}
          </h1>
          <p className="ptta-subline font-sans text-white/80 text-base lg:text-lg leading-relaxed mb-8 max-w-xl">
            {t.hero.subline}
          </p>
          <button
            onClick={handleCta}
            aria-label={t.hero.cta}
            className="ptta-cta w-full sm:w-auto px-10 py-4 rounded-full bg-amber-400 text-stone-900 font-sans font-bold text-base tracking-wide hover:bg-amber-300 active:bg-amber-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            style={{ minHeight: 56 }}
          >
            {t.hero.cta}
          </button>
        </div>
      </section>

      {/* ─── 3. HERO COPY (mobile: below video) ─────────────────────────────── */}
      <section className="md:hidden bg-stone-950 px-6 pt-8 pb-10">
        <p className="ptta-eyebrow text-amber-400 text-xs font-sans font-semibold uppercase tracking-widest mb-3">
          {t.hero.eyebrow}
        </p>
        <h1 className="ptta-headline font-serif text-white text-4xl font-bold leading-tight mb-4">
          {t.hero.headline}
        </h1>
        <p className="ptta-subline font-sans text-white/75 text-base leading-relaxed mb-8">
          {t.hero.subline}
        </p>
        <button
          onClick={handleCta}
          aria-label={t.hero.cta}
          className="ptta-cta w-full px-8 py-4 rounded-full bg-amber-400 text-stone-900 font-sans font-bold text-base tracking-wide hover:bg-amber-300 active:bg-amber-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-200"
          style={{ minHeight: 56 }}
        >
          {t.hero.cta}
        </button>
      </section>

      {/* ─── 4. SLOGAN BLOCK ────────────────────────────────────────────────── */}
      <section className="ptta-slogan w-full bg-stone-50 py-16 px-6 text-center" aria-label="Mission statement">
        <blockquote>
          <p className="font-serif text-stone-800 text-2xl md:text-4xl font-bold leading-snug max-w-3xl mx-auto">
            {t.slogan.quote}
          </p>
          <footer className="mt-5 font-sans text-stone-500 text-sm tracking-wide">
            {t.slogan.caption}
          </footer>
        </blockquote>
      </section>

      {/* ─── 5. PROBLEM / SOLUTION ──────────────────────────────────────────── */}
      <section
        className="ptta-cards w-full bg-stone-100 py-16 px-6"
        aria-label="Problem and solution"
      >
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Problem card */}
          <article
            className="ptta-card-problem rounded-2xl p-8 md:p-10"
            style={{ background: "hsl(34 30% 94%)" }}
          >
            <h2 className="font-serif text-stone-900 text-2xl font-bold mb-4">
              {t.problem.heading}
            </h2>
            <p className="font-sans text-stone-700 text-base leading-relaxed">
              {t.problem.body}
            </p>
          </article>

          {/* Solution card */}
          <article
            className="ptta-card-solution rounded-2xl p-8 md:p-10"
            style={{ background: "hsl(40 35% 91%)" }}
          >
            <h2 className="font-serif text-stone-900 text-2xl font-bold mb-4">
              {t.solution.heading}
            </h2>
            <p className="font-sans text-stone-700 text-base leading-relaxed">
              {t.solution.body}
            </p>
          </article>
        </div>
      </section>

      {/* ─── 6. CONTEXT STRIP ───────────────────────────────────────────────── */}
      <section
        className="ptta-facts w-full bg-white py-12 px-6"
        aria-label="Key facts"
      >
        <div className="max-w-5xl mx-auto">
          {/* horizontal scroll on mobile, grid on desktop */}
          <div className="flex gap-4 overflow-x-auto pb-2 md:overflow-visible md:grid md:grid-cols-4 md:pb-0 snap-x snap-mandatory md:snap-none">
            {t.facts.map((fact, i) => (
              <div
                key={i}
                className="snap-start shrink-0 w-44 md:w-auto rounded-xl border border-stone-200 bg-stone-50 px-5 py-5 text-center"
              >
                <p className="font-sans text-stone-800 text-sm font-semibold leading-snug">
                  {fact.label}
                </p>
              </div>
            ))}
          </div>
          <p className="mt-5 text-center font-sans text-stone-400 text-xs">
            {t.factsCaption}
          </p>
        </div>
      </section>

      {/* ─── 7. FOOTER ──────────────────────────────────────────────────────── */}
      <footer
        className="ptta-footer w-full bg-stone-950 py-10 px-6 text-center"
        role="contentinfo"
      >
        <a
          href={`mailto:${t.footer.email}`}
          className="font-sans text-amber-400 text-sm hover:text-amber-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-400"
          aria-label={`Email us at ${t.footer.email}`}
        >
          {t.footer.email}
        </a>
        <p className="mt-4 font-sans text-stone-500 text-xs max-w-lg mx-auto leading-relaxed">
          {t.footer.disclaimer}
        </p>
      </footer>

      {/* ─── FIXED MOBILE CTA (after hero scrolled past) ──────────────────── */}
      {heroPast && (
        <div
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/95 backdrop-blur border-t border-stone-200"
          aria-label="Sticky call to action"
        >
          <button
            onClick={handleCta}
            aria-label={t.hero.cta}
            className="w-full px-8 py-4 rounded-full bg-amber-400 text-stone-900 font-sans font-bold text-base tracking-wide hover:bg-amber-300 active:bg-amber-500 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600"
            style={{ minHeight: 56 }}
          >
            {t.hero.cta}
          </button>
        </div>
      )}
    </div>
  );
}
