import {
  useRef,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useLocation } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { Pause, Play } from "lucide-react";
import { Header } from "@/components/Header";
import { CyclingText } from "@/components/CyclingText";
import { useTheme } from "@/context/ThemeContext";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const HERO_VIDEO = `${BASE}/videos/people-using-tactile.mp4`;
const HERO_POSTER = `${BASE}/posters/people-using-tactile.jpg`;
const TESTIMONIALS_VIDEO = `${BASE}/videos/testimonials.mp4`;
const HELA_IMG = `${BASE}/images/testimonials/Hela.jpg`;
const KATJA_IMG = `${BASE}/images/testimonials/Katja.jpg`;
const PAINTING_IMG = `${BASE}/paintings/starry-night.webp`;
const RELIEF_IMG = `${BASE}/printed/starry-night.png`;
const EXPERIENCE_IMG = `${BASE}/images/hands-exploring-model.jpeg`;
// Content v2: portrait for the problem section (a blind / visually impaired person).
const PROBLEM_IMG = `${BASE}/images/problem-blind-visitor.jpg`;
const CONTACT_EMAIL = "contact@ptta.art";

const PEOPLE_IMAGES = [
  "people-01.jpg",
  "people-09.jpeg",
  "people-02.png",
  "people-10.jpeg",
  "people-03.png",
  "people-11.jpeg",
  "people-04.png",
  "people-12.jpeg",
  "people-05.png",
  "people-06.png",
  "people-07.png",
  "people-08.png",
].map((f) => `${BASE}/images/people-using-models/${f}`);

const tight = { letterSpacing: "-0.02em" } as const;

function DotLine({
  total,
  filled,
  accent = false,
}: {
  total: number;
  filled: number;
  accent?: boolean;
}) {
  const filledColor = accent
    ? "var(--color-accent)"
    : "rgba(242,233,214,0.70)";
  const emptyColor = "rgba(242,233,214,0.10)";
  return (
    <div
      className="flex flex-nowrap gap-[2px] md:gap-[5px]"
      aria-hidden
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className="block w-[6px] h-[6px] md:w-[10px] md:h-[10px] rounded-full shrink-0"
          style={{ background: i < filled ? filledColor : emptyColor }}
        />
      ))}
    </div>
  );
}

function Eyebrow({
  children,
  color,
}: {
  children: ReactNode;
  color?: string;
}) {
  // Content v2 nudges the section kicker labels slightly larger; default is
  // left byte-for-byte unchanged.
  const { fontTheme } = useTheme();
  const contentV2 = fontTheme === "content";
  return (
    <p
      className="ptta-mono-eyebrow mb-3 font-medium"
      style={{
        fontSize: contentV2
          ? "clamp(11.5px, 3.2vw, 16px)"
          : "clamp(13px, 3.6vw, 15px)",
        color: color ?? "hsl(38, 95%, 52%)",
      }}
    >
      {children}
    </p>
  );
}

function ExperienceGallery({ fade = true }: { fade?: boolean }) {
  const trackRef = useRef<HTMLUListElement>(null);

  const stateRef = useRef({
    x: 0,
    half: 0,
    lastPointerX: 0,
    lastFrameTime: 0,
    activePointer: -1,
  });

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const measure = () => {
      stateRef.current.half = track.scrollWidth / 2;
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(track);

    const SECONDS_PER_LOOP = 45;
    let rafId = 0;

    const tick = (t: number) => {
      const s = stateRef.current;
      const dt = s.lastFrameTime ? (t - s.lastFrameTime) / 1000 : 0;
      s.lastFrameTime = t;

      if (s.half > 0) {
        s.x -= (s.half / SECONDS_PER_LOOP) * dt;

        if (s.x <= -s.half) s.x += s.half;
        else if (s.x > 0) s.x -= s.half;
      }

      track.style.transform = `translate3d(${s.x}px, 0, 0)`;
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLUListElement>) => {
    const s = stateRef.current;
    s.activePointer = e.pointerId;
    s.lastPointerX = e.clientX;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
  };
  const onPointerMove = (e: React.PointerEvent<HTMLUListElement>) => {
    const s = stateRef.current;
    if (s.activePointer !== e.pointerId) return;
    const dx = e.clientX - s.lastPointerX;
    s.lastPointerX = e.clientX;
    s.x += dx;
  };
  const endDrag = (e: React.PointerEvent<HTMLUListElement>) => {
    const s = stateRef.current;
    if (s.activePointer !== e.pointerId) return;
    s.activePointer = -1;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}
  };

  return (
    <div
      className="relative overflow-hidden"
      aria-label="Gallery of visitors exploring PTTA tactile models in museums"
      style={
        fade
          ? {
              maskImage:
                "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            }
          : undefined
      }
    >
      <ul
        ref={trackRef}
        className="flex gap-3 md:gap-5 py-2 select-none cursor-grab active:cursor-grabbing"
        style={{
          width: "fit-content",
          touchAction: "pan-y",
          willChange: "transform",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {[...PEOPLE_IMAGES, ...PEOPLE_IMAGES].map((src, i) => (
          <li
            key={`${src}-${i}`}
            className="shrink-0 w-[200px] md:w-[280px] aspect-[3/4] overflow-hidden rounded-2xl"
            style={{
              border: "1px solid var(--color-hairline)",
              boxShadow: "0 18px 40px -22px rgba(0,0,0,0.7)",
            }}
          >
            <img
              src={src}
              alt=""
              aria-hidden={i >= PEOPLE_IMAGES.length}
              loading="lazy"
              draggable={false}
              className="h-full w-full object-cover pointer-events-none"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

const STEPS: { n: string; t: string; d: string; dV2?: string }[] = [
  {
    n: "01",
    t: "Capture the painting",
    d: "A high-resolution scan captures every brushstroke.",
  },
  {
    n: "02",
    t: "AI sculpts the depth",
    d: "Our AI turns the flat image into depth: brushwork becomes relief, made for fingers, not eyes.",
    // Content v2 (shorter, ~two lines): default copy stays untouched above.
    dV2: "Our AI turns the flat image into relief you can feel.",
  },
  {
    n: "03",
    t: "Print & narrate",
    d: "We 3D print a durable relief and add audio that tells its story.",
  },
];

const LOGOS = [
  { src: "logos/luebecker-museum.svg", alt: "Lübecker Museen" },
  { src: "logos/st-nikolai-church-museum.png", alt: "Mahnmal St. Nikolai" },
  { src: "logos/overbeck-museum.png", alt: "Overbeck-Museum Bremen" },
  { src: "logos/european-space-agency.svg", alt: "European Space Agency" },
  { src: "logos/tvibit.webp", alt: "Tvibit" },
];

/**
 * Content v2 preview of THE PROBLEM section.
 * Keeps museums framed positively, makes the 300M people shut out of art the
 * emotional centre, and pairs it with an evocative photo. Rendered only when the
 * "Content v2" version is selected from the header menu — the default is untouched.
 */
function ProblemSectionContentV2() {
  return (
    <section
      aria-label="The problem"
      className="mx-auto w-full max-w-[480px] md:max-w-4xl px-5 md:px-8 py-16 md:py-24"
    >
      <Eyebrow>The problem</Eyebrow>

      <div className="mt-4 md:mt-2 flex flex-row items-center gap-4 sm:gap-6 md:grid md:grid-cols-[1.05fr_1fr] md:gap-12 md:items-center">
        {/* Image: a blind / visually impaired person */}
        <figure className="order-2 md:order-1 w-[40%] sm:w-[36%] shrink-0 md:w-auto">
          <div
            className="relative aspect-[4/5] overflow-hidden rounded-2xl"
            style={{ border: "1px solid var(--color-hairline)" }}
          >
            <img
              src={PROBLEM_IMG}
              alt="A blind person walking with a white cane"
              loading="lazy"
              className="h-full w-full object-cover"
              style={{ filter: "grayscale(0.9) brightness(0.85) contrast(1.06)" }}
            />
            <div
              aria-hidden
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(180deg, rgba(3,5,8,0) 45%, rgba(3,5,8,0.5) 100%)",
              }}
            />
          </div>
        </figure>

        {/* Copy: minimal, problem-focused */}
        <div className="order-1 md:order-2 flex-1 min-w-0">
          <h2
            className="font-serif text-ink leading-[1.05] mb-3 md:mb-5"
            style={{ ...tight, fontSize: "clamp(1.95rem, 6vw, 3.75rem)" }}
          >
            <span className="block text-accent">300&nbsp;million people</span>
            <span className="block">can&rsquo;t experience art.</span>
          </h2>
          <p className="text-body-fg text-base sm:text-lg leading-relaxed max-w-md">
            Blind and visually impaired, 43&nbsp;million of them fully blind.
          </p>
          <p className="text-muted-fg mt-3" style={{ fontSize: "12px" }}>
            Source: World Health Organization, 2023
          </p>
        </div>
      </div>

      {/* Voice of the community: demand callout. The stat, then the voice
          behind it. The label spells out what 86% measures so the whole card
          reads as one sentence leading into the quote. */}
      <figure
        className="mt-12 md:mt-16 rounded-2xl px-5 sm:px-6 md:px-12 py-8 md:py-11 md:grid md:grid-cols-[minmax(0,16rem)_1fr] md:gap-10 md:items-center"
        style={{
          background: "rgba(242,233,214,0.05)",
          border: "1px solid var(--color-hairline)",
        }}
      >
        {/* Stat anchor: the number + a plain-language label of what it measures */}
        <div className="text-center md:text-left mb-7 md:mb-0 shrink-0">
          <p
            className="font-serif italic leading-none"
            style={{
              color: "var(--color-accent)",
              fontSize: "clamp(3.75rem, 10vw, 5.5rem)",
              letterSpacing: "-0.03em",
            }}
          >
            86%
          </p>
          <p className="text-body-fg mt-3 text-lg md:text-lg leading-snug">
            of blind and visually impaired visitors say:
          </p>
        </div>
        {/* The voice: their own words, set off with a divider + quote mark */}
        <figcaption
          className="text-center md:text-left md:border-l md:pl-10"
          style={{ borderColor: "var(--color-hairline)" }}
        >
          <span
            aria-hidden
            className="block font-serif leading-none select-none"
            style={{ color: "var(--color-hairline)", fontSize: "2.75rem" }}
          >
            &ldquo;
          </span>
          <blockquote
            className="font-sans text-ink leading-snug -mt-4"
            style={{
              fontSize: "clamp(1.2rem, 3.5vw, 1.5rem)",
              fontWeight: 400,
              letterSpacing: "-0.005em",
            }}
          >
            We would visit museums far more often if they were more inclusive
            and accessible.
          </blockquote>
          <p className="text-muted-fg mt-4 text-sm">Source: visitor survey</p>
        </figcaption>
      </figure>
    </section>
  );
}

/**
 * Content v2: the "Our solution" process shown as a line-based pathway (the same
 * line-and-dots theme the "Built with the community" section used) instead of
 * numbered step cards.
 */
function SolutionPathwayV2() {
  return (
    <ol className="relative mx-auto flex max-w-5xl items-start justify-between gap-4 md:gap-10">
      <span
        aria-hidden
        className="absolute left-0 right-0 top-[7px] h-px"
        style={{ background: "var(--color-hairline)" }}
      />
      {STEPS.map((s, i) => (
        <li
          key={s.n}
          className="relative flex flex-1 flex-col items-center px-1 text-center"
        >
          <span
            className="block h-[15px] w-[15px] rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
          <span
            className="ptta-mono-eyebrow text-accent mt-3 md:mt-4"
            style={{ fontSize: "11px" }}
          >
            Step {i + 1}
          </span>
          <h3
            className="font-serif text-ink mt-2 text-base md:text-xl lg:text-2xl leading-tight"
            style={tight}
          >
            {s.t}
          </h3>
          <p className="hidden md:block text-muted-fg text-base lg:text-lg mt-2 leading-snug max-w-[20rem] mx-auto">
            {s.dV2 ?? s.d}
          </p>
        </li>
      ))}
    </ol>
  );
}

/**
 * Content v2 (items 3 & 4): "Tested with blind collaborators". A concise section:
 * heading, description, and the experience gallery. (The earlier progression-line
 * graphic was removed.)
 */
function TestedWithBlindSectionV2() {
  return (
    <section aria-label="Tested with blind collaborators" className="w-full py-12 md:py-16">
      <div className="mx-auto w-full max-w-[480px] md:max-w-4xl px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10 md:mb-12">
          <Eyebrow>Built with the community</Eyebrow>
          <h2
            className="font-serif text-ink leading-[1.06] mb-4"
            style={{ ...tight, fontSize: "clamp(2.3rem, 5vw, 3.25rem)" }}
          >
            Tested with blind collaborators.
          </h2>
          <p className="text-body-fg text-base md:text-lg leading-relaxed">
            Every model is shaped by the people it&rsquo;s made for. Blind and
            low-vision testers guide each round, from first relief to final print.
          </p>
        </div>
      </div>

      {/* Content v2: the experience gallery, moved here from its own section so
          the proof of real, hands-on testing closes out this section. Full-bleed
          and without the edge fade. */}
      <div id="experience-gallery" className="mt-12 md:mt-16">
        <ExperienceGallery fade={false} />
        <p className="mt-6 text-center leading-relaxed mx-auto max-w-2xl px-5 text-sm md:text-base">
          <span className="text-accent">Not AI-generated or enhanced.</span>{" "}
          <span className="text-muted-fg">
            Real photographs of people testing our models at the
            Overbeck-Museum, Bremen, Germany and BSVH, Hamburg.
          </span>
        </p>
      </div>

      {/* Content v2: accessibility partners, moved here from "Installations at
          museums". Labelled like the section kicker titles. */}
      <div className="mx-auto w-full max-w-[480px] md:max-w-4xl px-5 md:px-8 mt-14 md:mt-20 text-center">
        <Eyebrow>Our accessibility partners</Eyebrow>
        <div
          className="rounded-2xl bg-white flex md:inline-flex items-center justify-center gap-5 md:gap-8 px-4 md:px-7 py-3 w-full md:w-auto max-w-full mt-5"
          style={{ minHeight: 150, boxShadow: "0 18px 40px -22px rgba(0,0,0,0.55)" }}
        >
          <img
            src={`${BASE}/logos/bsvh.png`}
            alt="BSVH, Blinden- und Sehbehindertenverein Hamburg"
            loading="lazy"
            className="block max-w-full w-auto h-12 md:h-16 object-contain"
          />
          <img
            src={`${BASE}/logos/bsvb.png`}
            alt="BSVB, Blinden- und Sehbehindertenverein Bremen"
            loading="lazy"
            className="block max-w-full w-auto h-12 md:h-16 object-contain"
          />
          <img
            src={`${BASE}/logos/dbsv.svg`}
            alt="DBSV, Deutscher Blinden- und Sehbehindertenverband"
            loading="lazy"
            className="block max-w-full w-auto h-12 md:h-16 object-contain"
          />
        </div>
      </div>
    </section>
  );
}

/**
 * Content v2 (item 5, for Zain): "The difference" with a cost comparison added
 * alongside time, and clearer messaging.
 * NOTE: the $35,000 / $300 cost figures are ILLUSTRATIVE placeholders; confirm
 * real numbers with Zain before this is promoted to the default.
 */
function DifferenceSectionV2() {
  return (
    <section
      aria-label="The difference"
      className="mx-auto w-full max-w-[480px] md:max-w-4xl px-5 md:px-8 py-12 md:py-16"
    >
      <div className="text-center max-w-2xl mx-auto mb-9 md:mb-10">
        <Eyebrow color="var(--color-accent)">The difference</Eyebrow>
        <h2
          className="font-serif text-ink leading-[1.06] mb-4"
          style={{ ...tight, fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
        >
          Faster, affordable, made to last.
        </h2>
        <p className="text-body-fg text-base md:text-lg leading-relaxed">
          Traditional reliefs take months and cost upwards of $35,000. Ours take
          days, at a fraction of the price.
        </p>
      </div>

      <div className="max-w-xl mx-auto flex flex-col gap-12 md:gap-14">
        {/* TIME */}
        <div>
          <div className="w-fit mx-auto flex flex-col gap-5 md:gap-6">
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-[120px] md:w-[200px] text-right shrink-0">
                <p
                  className="font-serif italic text-ink leading-none"
                  style={{ fontSize: "clamp(1.5rem, 5vw, 2.6rem)", letterSpacing: "-0.03em" }}
                >
                  5 months
                </p>
                <p className="text-muted-fg text-sm md:text-base mt-2">
                  Conventional
                </p>
              </div>
              <DotLine total={22} filled={22} />
            </div>
            <div className="flex items-center gap-4 md:gap-6">
              <div className="w-[120px] md:w-[200px] text-right shrink-0">
                <p
                  className="font-serif italic leading-none"
                  style={{
                    fontSize: "clamp(1.5rem, 5vw, 2.6rem)",
                    letterSpacing: "-0.03em",
                    color: "var(--color-accent)",
                  }}
                >
                  1 week
                </p>
                <p className="text-muted-fg text-sm md:text-base mt-2">
                  With PTTA
                </p>
              </div>
              <DotLine total={22} filled={1} accent />
            </div>
          </div>
          <p
            className="ptta-mono-eyebrow text-accent mt-7 md:mt-8 text-center"
            style={{ fontSize: "14px" }}
          >
            Time per piece &nbsp;·&nbsp; one dot = 1 week
          </p>
        </div>

        {/* COST — dollars; a direct figure comparison rather than the dot scale,
            which doesn't read at this ratio. Illustrative; confirm with Zain. */}
        <div>
          <div className="flex items-center justify-center gap-5 md:gap-10 text-center">
            <div>
              <p
                className="font-serif italic text-ink leading-none whitespace-nowrap"
                style={{ fontSize: "clamp(1.5rem, 5.5vw, 2.75rem)", letterSpacing: "-0.03em" }}
              >
                $35,000
              </p>
              <p className="text-muted-fg text-sm md:text-base mt-2">
                Conventional
              </p>
            </div>
            <span
              aria-hidden
              className="shrink-0 text-muted-fg"
              style={{ fontSize: "clamp(1.25rem, 3vw, 1.75rem)" }}
            >
              &rarr;
            </span>
            <div>
              <p
                className="font-serif italic leading-none whitespace-nowrap"
                style={{
                  fontSize: "clamp(1.5rem, 5.5vw, 2.75rem)",
                  letterSpacing: "-0.03em",
                  color: "var(--color-accent)",
                }}
              >
                A fraction
              </p>
              <p className="text-muted-fg text-sm md:text-base mt-2">
                With PTTA
              </p>
            </div>
          </div>
          <p
            className="ptta-mono-eyebrow text-accent mt-7 md:mt-8 text-center"
            style={{ fontSize: "14px" }}
          >
            Cost per piece
          </p>
        </div>
      </div>
    </section>
  );
}

/**
 * Content v2 (item 7): community quotes shown below "Hear what they have to say".
 * Katja's quote is a minimized English translation of her German testimonial for
 * the Overbeck-Museum. NOTE: Hela's quote is still a PLACEHOLDER; replace with her
 * real words before promoting to default.
 */
const COMMUNITY_QUOTES = [
  {
    name: "Dr. Katja Pourshirazi",
    role: "Museum Director",
    org: "Overbeck-Museum",
    image: KATJA_IMG,
    quote:
      "The tactile models are a wonderful enrichment for our exhibition: an invitation for blind and visually impaired people to experience art, and a chance for everyone to discover it with all their senses.",
  },
  {
    name: "Hela Michalski",
    role: "Germany’s accessibility expert",
    org: null,
    image: HELA_IMG,
    quote:
      "The first time I could feel the brushstrokes, I finally understood what everyone had been describing to me for years.",
  },
];

function CommunityQuotesV2() {
  return (
    <div className="mt-10 md:mt-16 flex flex-col gap-14 md:gap-20">
      {COMMUNITY_QUOTES.map((q) => (
        <figure key={q.name} className="text-center">
          <span
            aria-hidden="true"
            className="block font-serif leading-none select-none"
            style={{ color: "var(--color-hairline)", fontSize: "3.75rem" }}
          >
            &ldquo;
          </span>
          <blockquote
            className="font-serif text-ink leading-snug -mt-5 mx-auto max-w-4xl"
            style={{ ...tight, fontSize: "clamp(1.3rem, 2.8vw, 1.85rem)" }}
          >
            {q.quote}
          </blockquote>
          <figcaption className="mt-8 flex items-center justify-center gap-4 text-left">
            <img
              src={q.image}
              alt={q.name}
              loading="lazy"
              className="h-20 w-20 md:h-24 md:w-24 shrink-0 rounded-full object-cover"
              style={{ border: "1px solid var(--color-hairline)" }}
            />
            <span className="leading-tight">
              <span
                className="block font-serif text-xl md:text-2xl"
                style={{ color: "var(--color-accent)" }}
              >
                {q.name}
              </span>
              <span className="block text-muted-fg text-sm md:text-base mt-0.5">
                {q.role}
                {q.org && (
                  <>
                    , <span className="font-medium text-body-fg">{q.org}</span>
                  </>
                )}
              </span>
            </span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}

export default function Landing() {
  const heroRef = useRef<HTMLVideoElement>(null);
  const [, navigate] = useLocation();
  const { fontTheme } = useTheme();
  const contentV2 = fontTheme === "content";
  const reduce = useReducedMotion() ?? false;
  const [heroPlaying, setHeroPlaying] = useState(true);
  const [showFloatCta, setShowFloatCta] = useState(false);

  useEffect(() => {
    const v = heroRef.current;
    if (!v) return;
    v.muted = true;
    v.play().then(() => setHeroPlaying(true)).catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setShowFloatCta(window.scrollY > 520);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const tryDemo = useCallback(() => navigate("/demo"), [navigate]);

  const toggleHero = useCallback(() => {
    const v = heroRef.current;
    if (!v) return;
    if (v.paused) {
      v.play().then(() => setHeroPlaying(true)).catch(() => {});
    } else {
      v.pause();
      setHeroPlaying(false);
    }
  }, []);

  const fade = (delay = 0) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay },
        };

  return (
    <div className="ptta-root min-h-screen bg-page text-ink">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold"
        style={{ color: "#241A0E" }}
      >
        Skip to content
      </a>
      <Header />

      <main id="main">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section
          aria-label="Introduction"
          className="mx-auto w-full max-w-[480px] md:max-w-3xl lg:max-w-5xl px-5 md:px-8 pt-7 md:pt-12 pb-10 md:pb-12"
        >
          <motion.div
            {...fade(0.05)}
            className="relative mx-auto w-full overflow-hidden rounded-[20px] md:rounded-[28px]"
            style={{
              maxWidth: "min(100%, calc(42dvh * 16 / 9), 880px)",
              border: "1px solid var(--color-hairline)",
            }}
          >
            <div className="relative w-full" style={{ aspectRatio: "16 / 9" }}>
              <video
                ref={heroRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={HERO_VIDEO}
                poster={HERO_POSTER}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                aria-label="A blind visitor reading a tactile art relief with both hands in a museum"
              />
              <button
                type="button"
                onClick={toggleHero}
                aria-label={
                  heroPlaying ? "Pause background video" : "Play background video"
                }
                className="absolute bottom-3 left-3 z-10 flex h-11 w-11 items-center justify-center rounded-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={{
                  background: "rgba(3,5,8,0.6)",
                  color: "var(--color-cream)",
                  backdropFilter: "blur(4px)",
                }}
              >
                {heroPlaying ? (
                  <Pause size={15} />
                ) : (
                  <Play size={15} className="ml-0.5" />
                )}
              </button>
              {/* Content v2: authenticity tag, in the same mono styling as the
                  section eyebrow titles (e.g. "The problem", "Our solution"). */}
              {contentV2 && (
                <span
                  className="ptta-mono-eyebrow absolute bottom-3 right-3 z-10 font-medium"
                  style={{
                    fontSize: "10px",
                    color: "#fff",
                  }}
                >
                  Not AI generated
                </span>
              )}
            </div>
          </motion.div>

          <div className="text-center mx-auto max-w-3xl mt-9 md:mt-12">
            <motion.h1
              {...fade(0.1)}
              className="font-serif text-ink leading-[1.06] mb-5"
              style={{
                letterSpacing: "-0.02em",
                fontSize: "clamp(2.5rem, 10vw, 4.5rem)",
              }}
            >
              <span className="block whitespace-nowrap">
                Museum art<span className="hidden lg:inline"> you can</span>
              </span>
              <span className="block lg:whitespace-nowrap">
                <span className="lg:hidden">you can </span>
                <em className="italic text-accent">
                  <CyclingText
                    words={["touch", "feel", "experience"]}
                    reduceMotion={false}
                    caret="_"
                    blink={false}
                  />
                </em>
              </span>
            </motion.h1>
            <motion.p
              {...fade(0.17)}
              className="text-body-fg mx-auto max-w-2xl text-lg md:text-2xl leading-relaxed"
            >
              We use <strong className="font-bold text-ink">AI</strong> to turn
              museum artworks into{" "}
              <strong className="font-bold text-ink">tactile 3D models</strong>,
              for blind visitors and for all.
            </motion.p>
            <motion.div
              {...fade(0.25)}
              className="mt-7"
            >
              <button
                type="button"
                onClick={tryDemo}
                className="ptta-cta-attn inline-flex items-center gap-2 rounded-full bg-accent px-7 md:px-8 py-3.5 md:py-4 font-semibold text-base md:text-lg transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                style={{ color: "#241A0E", minHeight: 52 }}
              >
                Try the demo →
              </button>
            </motion.div>
          </div>
        </section>

        {/* TRUSTED BY (client logos) */}
        <section
          aria-label="Trusted by museums and partners"
          className="mx-auto w-full max-w-[480px] md:max-w-5xl px-5 md:px-8 pt-6 pb-2 md:pt-10 md:pb-4"
        >
          <div className="text-center mb-6">
            <h2
              className="font-serif text-ink leading-[1.1]"
              style={{ ...tight, fontSize: "clamp(1.5rem, 3.6vw, 2.25rem)" }}
            >
              Trusted by museums &amp; partners
            </h2>
          </div>
          <div
            className="rounded-3xl bg-white px-3 py-5 sm:px-6 sm:py-7 md:px-10 md:py-9"
            style={{ boxShadow: "0 20px 55px -22px rgba(0,0,0,0.65)" }}
          >
            <ul className="grid grid-cols-5 items-center gap-2 sm:gap-4 md:gap-8">
              {LOGOS.map((l) => (
                <li
                  key={l.src}
                  className="flex min-w-0 items-center justify-center"
                >
                  <img
                    src={`${BASE}/${l.src}`}
                    alt={l.alt}
                    loading="lazy"
                    className="block w-auto max-w-full object-contain max-h-6 sm:max-h-9 md:max-h-12"
                  />
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── THE PROBLEM ──────────────────────────────────────────────────── */}
        {contentV2 ? (
          <ProblemSectionContentV2 />
        ) : (
        <section
          aria-label="The problem"
          className="mx-auto w-full max-w-[480px] md:max-w-4xl px-5 md:px-8 py-16 md:py-24"
        >
          <div className="md:grid md:grid-cols-[1fr_auto] md:gap-14 md:items-center">
            <div>
              <Eyebrow>The problem</Eyebrow>
              <h2
                className="font-serif text-ink leading-[1.06] mb-5"
                style={{ ...tight, fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
              >
                <span className="block">Museums say: don&rsquo;t touch.</span>
                <span className="block">We&rsquo;re changing that.</span>
              </h2>
              <p className="text-body-fg text-lg leading-relaxed max-w-xl">
                For blind and low-vision visitors, art has always lived behind
                glass, present but out of reach.
              </p>
            </div>
            <div className="mt-10 md:mt-0 md:text-right shrink-0">
              <p
                className="font-serif italic text-accent leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 13vw, 6rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                300M
              </p>
              <p className="text-body-fg mt-2 text-base">
                people live with vision impairment
              </p>
              <p className="text-muted-fg mt-1 text-base">
                43&nbsp;million of them fully blind.
              </p>
              <p className="text-muted-fg mt-4" style={{ fontSize: "12px" }}>
                Source: World Health Organization, 2023
              </p>
            </div>
          </div>

          {/* Voice of the community: demand callout */}
          <div
            className="mt-14 md:mt-16 rounded-2xl px-6 md:px-10 py-8 md:py-10 md:grid md:grid-cols-[auto_1fr] md:gap-12 md:items-center"
            style={{
              background: "rgba(242,233,214,0.05)",
              border: "1px solid var(--color-hairline)",
            }}
          >
            <div className="text-center md:text-left mb-4 md:mb-0 shrink-0">
              <p
                className="font-serif italic text-accent leading-none"
                style={{
                  fontSize: "clamp(3.5rem, 10vw, 5.25rem)",
                  letterSpacing: "-0.03em",
                }}
              >
                86%
              </p>
              <p
                className="ptta-mono-eyebrow text-muted-fg mt-3"
                style={{ fontSize: "11px" }}
              >
                say the same
              </p>
            </div>
            <div className="text-center md:text-left">
              <p
                className="font-sans text-ink leading-snug"
                style={{
                  fontSize: "clamp(1.05rem, 2.4vw, 1.35rem)",
                  fontWeight: 400,
                  letterSpacing: "-0.005em",
                }}
              >
                &ldquo;Current museums aren&rsquo;t inclusive enough for us. We
                would visit far more often if their content were accessible.&rdquo;
              </p>
              <p className="text-muted-fg mt-3 text-sm">
                Survey of blind and visually impaired museum visitors.
              </p>
            </div>
          </div>
        </section>
        )}

        {/* ── OUR SOLUTION ─────────────────────────────────────────────────── */}
        <section
          aria-label="Our solution"
          className="w-full px-5 md:px-8 py-16 md:py-24"
          style={{ background: "rgba(242,233,214,0.035)" }}
        >
          <div className="mx-auto max-w-[480px] md:max-w-5xl">
            <div className="text-center mb-12 md:mb-14 max-w-2xl mx-auto">
              <Eyebrow>Our solution</Eyebrow>
              <h2
                className="font-serif text-ink leading-[1.05] mb-6"
                style={{
                  ...tight,
                  fontSize: contentV2
                    ? "clamp(2.5rem, 5.5vw, 3.75rem)"
                    : "clamp(2.2rem, 5.5vw, 3.75rem)",
                }}
              >
                Art, made tactile.
              </h2>
              <p className="text-body-fg text-lg leading-relaxed">
                We turn paintings and sculptures into{" "}
                <strong className="font-bold text-ink">3D printed tactile models</strong>,
                each with its own{" "}
                <strong className="font-bold text-ink">audio guide</strong>.
                {!contentV2 && " Built with blind collaborators, for everyone."}
              </p>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-center gap-5 md:gap-3 mb-14 md:mb-16">
              <figure className="w-full max-w-[340px]">
                <div
                  className="aspect-[4/3] overflow-hidden rounded-2xl"
                  style={{ border: "1px solid var(--color-hairline)" }}
                >
                  <img
                    src={PAINTING_IMG}
                    alt="Van Gogh's The Starry Night, the original flat painting"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="text-muted-fg mt-2 text-center text-sm">
                  The original painting
                </figcaption>
              </figure>

              <div
                className="flex shrink-0 flex-col items-center gap-1 px-2 md:px-4"
                aria-hidden="true"
              >
                <span className="font-serif italic text-accent text-2xl">
                  AI
                </span>
                <span
                  className="text-muted-fg"
                  style={{ fontSize: "11px", letterSpacing: "0.14em" }}
                >
                  CONVERTS DEPTH
                </span>
                <span
                  className="hidden md:block h-px w-16"
                  style={{ background: "var(--color-hairline)" }}
                />
              </div>

              <figure className="w-full max-w-[340px]">
                <div
                  className="aspect-[4/3] overflow-hidden rounded-2xl"
                  style={{ border: "1px solid var(--color-hairline)" }}
                >
                  <img
                    src={RELIEF_IMG}
                    alt="The Starry Night rebuilt as a raised, touchable 3D relief"
                    loading="lazy"
                    className="h-full w-full object-cover"
                  />
                </div>
                <figcaption className="text-muted-fg mt-2 text-center text-sm">
                  The tactile 3D relief
                </figcaption>
              </figure>
            </div>

            {contentV2 ? (
              <SolutionPathwayV2 />
            ) : (
              <ol className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {STEPS.map((s) => (
                  <li key={s.n}>
                    <p
                      className="font-serif italic text-accent leading-none mb-4"
                      style={{ fontSize: "2rem", letterSpacing: "-0.02em" }}
                    >
                      {s.n}
                    </p>
                    <h3
                      className="font-serif text-ink text-xl md:text-2xl mb-2"
                      style={tight}
                    >
                      {s.t}
                    </h3>
                    <p className="text-body-fg text-base leading-relaxed">
                      {s.d}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* ── TESTED WITH BLIND COLLABORATORS (Content v2, items 3 & 4) ─────── */}
        {contentV2 && <TestedWithBlindSectionV2 />}

        {/* ── THE DIFFERENCE ───────────────────────────────────────────────── */}
        {contentV2 ? (
          <DifferenceSectionV2 />
        ) : (
        <section
          aria-label="The difference"
          className="mx-auto w-full max-w-[480px] md:max-w-4xl px-5 md:px-8 py-12 md:py-16"
        >
          <div className="text-center max-w-2xl mx-auto mb-9 md:mb-10">
            <Eyebrow color="var(--color-accent)">The difference</Eyebrow>
            <h2
              className="font-serif text-ink leading-[1.06] mb-4"
              style={{ ...tight, fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              A better product, faster.
            </h2>
            <p className="text-body-fg text-base md:text-lg leading-relaxed">
              Hand-carved reliefs are slow and costly. We do it better.
            </p>
          </div>

          <div className="max-w-xl mx-auto">
            {/* TIME */}
            <div className="w-fit mx-auto flex flex-col gap-5 md:gap-6">
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-[120px] md:w-[200px] text-right shrink-0">
                  <p
                    className="font-serif italic text-ink leading-none"
                    style={{
                      fontSize: "clamp(1.5rem, 5vw, 2.6rem)",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    5 months
                  </p>
                  <p className="text-muted-fg text-sm md:text-base mt-2">
                    Conventional
                  </p>
                </div>
                <DotLine total={22} filled={22} />
              </div>
              <div className="flex items-center gap-4 md:gap-6">
                <div className="w-[120px] md:w-[200px] text-right shrink-0">
                  <p
                    className="font-serif italic leading-none"
                    style={{
                      fontSize: "clamp(1.5rem, 5vw, 2.6rem)",
                      letterSpacing: "-0.03em",
                      color: "var(--color-accent)",
                    }}
                  >
                    1 week
                  </p>
                  <p className="text-muted-fg text-sm md:text-base mt-2">
                    With PTTA
                  </p>
                </div>
                <DotLine total={22} filled={1} accent />
              </div>
            </div>

            <p
              className="ptta-mono-eyebrow text-accent mt-7 md:mt-8 text-center"
              style={{ fontSize: "14px" }}
            >
              Time per piece &nbsp;·&nbsp; one dot = 1 week
            </p>
          </div>
        </section>
        )}

        {/* ── THE EXPERIENCE (default only; in Content v2 the gallery moves to
            the end of "Built with the community") ──────────────────────────── */}
        {!contentV2 && (
        <section
          aria-label="The experience"
          className="w-full px-0 md:px-0 py-16 md:py-24"
        >
          <div className="mx-auto max-w-[480px] md:max-w-3xl px-5 md:px-8 text-center mb-10 md:mb-14">
            <Eyebrow>The experience</Eyebrow>
            <h2
              className="font-serif text-ink leading-[1.08] mb-5"
              style={{ ...tight, fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
            >
              Art you explore by hand.
            </h2>
            <p className="text-body-fg text-lg leading-relaxed max-w-2xl mx-auto">
              A visitor traces a starry sky or a stranger&rsquo;s face by hand,
              while the story plays in their ears.
            </p>
          </div>

          <ExperienceGallery />
        </section>
        )}

        {/* SEE IT (video) */}
        <section
          aria-label="In the museum"
          className="w-full px-5 md:px-8 py-16 md:py-24"
          style={{ background: "rgba(242,233,214,0.035)" }}
        >
          <div className="mx-auto max-w-[480px] md:max-w-3xl lg:max-w-4xl">
            <div className="text-center mb-8 max-w-2xl mx-auto">
              <Eyebrow>In the museum</Eyebrow>
              <h2
                className="font-serif text-ink leading-[1.08]"
                style={{ ...tight, fontSize: "clamp(2rem, 5vw, 3.25rem)" }}
              >
                Hear what they have to say.
              </h2>
            </div>
            <div
              className="relative w-full aspect-video overflow-hidden rounded-[20px] md:rounded-[26px]"
              style={{ border: "1px solid var(--color-hairline)" }}
            >
              <video
                className="absolute inset-0 h-full w-full object-cover"
                src={TESTIMONIALS_VIDEO}
                controls
                playsInline
                preload="metadata"
                aria-label="Visitors and museum partners describing the Please Touch This Art tactile experience"
              />
            </div>
            <p className="text-muted-fg mt-3 text-sm text-center">
              Real visitors. Real museums.
            </p>
            {contentV2 && <CommunityQuotesV2 />}
          </div>
        </section>

        {/* ── ALREADY IN MUSEUMS ───────────────────────────────────────────── */}
        <section
          aria-label="Already in museums"
          className="mx-auto w-full max-w-[480px] md:max-w-5xl px-5 md:px-8 pt-6 pb-14 md:pt-10 md:pb-20"
        >
          <div className="text-center mb-9 md:mb-10 max-w-2xl mx-auto">
            <h2
              className="font-serif text-ink leading-[1.08]"
              style={{
                ...tight,
                fontSize: contentV2
                  ? "clamp(2.3rem, 5vw, 3.25rem)"
                  : "clamp(2rem, 5vw, 3.25rem)",
              }}
            >
              {contentV2 ? "Installations at museums" : "Already in museums"}
            </h2>
          </div>

          <dl className="flex flex-col md:flex-row md:flex-wrap items-center md:justify-center gap-3 md:gap-6 w-full">
            {/* Museums */}
            <div className="flex flex-col items-center text-center w-full md:w-auto">
              <div
                className="rounded-2xl bg-white flex md:inline-flex items-center justify-center gap-4 md:gap-7 px-4 md:px-7 py-3 w-full md:w-auto max-w-full"
                style={{
                  minHeight: 150,
                  boxShadow: "0 18px 40px -22px rgba(0,0,0,0.55)",
                }}
              >
                {/* Left: Lübecker on top, Overbeck below */}
                <div className="flex flex-col items-center gap-3 md:gap-5 min-w-0">
                  <img
                    src={`${BASE}/logos/luebecker-museum.svg`}
                    alt="Die Lübecker Museen"
                    loading="lazy"
                    className="block max-w-full w-auto h-9 md:h-12 object-contain"
                  />
                  <img
                    src={`${BASE}/logos/overbeck-museum.png`}
                    alt="Overbeck Museum"
                    loading="lazy"
                    className="block max-w-full w-auto h-9 md:h-12 object-contain"
                  />
                </div>
                {/* Right: St. Nikolai + Tvibit in a row */}
                <div className="flex items-center gap-3 md:gap-5 min-w-0">
                  <img
                    src={`${BASE}/logos/st-nikolai-church-museum.png`}
                    alt="St. Nikolai Church Museum"
                    loading="lazy"
                    className="block max-w-full w-auto h-14 md:h-20 object-contain"
                  />
                  <img
                    src={`${BASE}/logos/tvibit.webp`}
                    alt="Tvibit"
                    loading="lazy"
                    className="block max-w-full w-auto h-10 md:h-14 object-contain"
                  />
                </div>
              </div>
              {!contentV2 && (
                <dd className="mt-5">
                  <span
                    className="font-serif italic text-accent block leading-none"
                    style={{
                      fontSize: "clamp(1.65rem, 4vw, 2rem)",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    27+
                  </span>
                  <span className="text-body-fg block mt-1.5 text-base">
                    museum installations
                  </span>
                </dd>
              )}
            </div>

            {/* Accessibility partners (default only; in Content v2 these move to
                the end of "Built with the community"). */}
            {!contentV2 && (
            <div className="flex flex-col items-center text-center w-full md:w-auto">
              <div
                className="rounded-2xl bg-white flex md:inline-flex items-center justify-center gap-5 md:gap-8 px-4 md:px-7 py-3 w-full md:w-auto max-w-full"
                style={{
                  minHeight: 150,
                  boxShadow: "0 18px 40px -22px rgba(0,0,0,0.55)",
                }}
              >
                <img
                  src={`${BASE}/logos/bsvh.png`}
                  alt="BSVH, Blinden- und Sehbehindertenverein Hamburg"
                  loading="lazy"
                  className="block max-w-full w-auto h-12 md:h-16 object-contain"
                />
                <img
                  src={`${BASE}/logos/bsvb.png`}
                  alt="BSVB, Blinden- und Sehbehindertenverein Bremen"
                  loading="lazy"
                  className="block max-w-full w-auto h-12 md:h-16 object-contain"
                />
                {/* item 8: DBSV, Deutscher Blinden- und Sehbehindertenverband */}
                {contentV2 && (
                  <img
                    src={`${BASE}/logos/dbsv.svg`}
                    alt="DBSV, Deutscher Blinden- und Sehbehindertenverband"
                    loading="lazy"
                    className="block max-w-full w-auto h-12 md:h-16 object-contain"
                  />
                )}
              </div>
              <dd className="mt-5">
                <span
                  aria-hidden
                  className="hidden md:block leading-none"
                  style={{
                    fontSize: "clamp(1.65rem, 4vw, 2rem)",
                    visibility: "hidden",
                  }}
                >
                  &nbsp;
                </span>
                <span className="text-body-fg block md:mt-1.5 text-base">
                  Accessibility partners
                </span>
              </dd>
            </div>
            )}
          </dl>
        </section>

        {/* ── FOOTER ───────────────────────────────────────────────────────── */}
        <footer
          className="w-full"
          role="contentinfo"
          style={{ background: "rgba(242,233,214,0.04)" }}
        >
          <div className="mx-auto max-w-[480px] md:max-w-2xl px-5 md:px-8 py-16 md:py-20 pb-28 md:pb-32 text-center">
            <p
              className="font-serif italic text-ink leading-[1.1] mb-5"
              style={{ ...tight, fontSize: "clamp(1.75rem,5vw,2.75rem)" }}
            >
              Please touch this art.
            </p>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-muted-fg hover:text-ink transition-colors"
              style={{ fontSize: "14px" }}
            >
              {CONTACT_EMAIL}
            </a>
            <p className="text-muted-fg mt-2" style={{ fontSize: "12px" }}>
              PTTA · 2026
            </p>
          </div>
        </footer>
      </main>

      {/* Floating CTA: appears after scrolling past the hero */}
      {showFloatCta && (
        <motion.button
          initial={reduce ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          type="button"
          onClick={tryDemo}
          aria-label="Try the demo"
          className="ptta-cta-attn fixed left-1/2 z-50 -translate-x-1/2 rounded-full bg-accent px-8 py-3.5 font-semibold shadow-xl transition-transform hover:scale-[1.04] active:scale-[0.97] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          style={{
            bottom: "max(1.25rem, env(safe-area-inset-bottom) + 0.75rem)",
            color: "#241A0E",
            letterSpacing: "-0.01em",
            minHeight: 52,
          }}
        >
          Try the demo →
        </motion.button>
      )}
    </div>
  );
}
