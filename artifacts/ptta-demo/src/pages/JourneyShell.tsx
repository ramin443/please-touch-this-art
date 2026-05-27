import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useRoute } from "wouter";
import { AnimatePresence, motion } from "framer-motion";
import { MODELS, type ModelEntry, type ModelId } from "@/content/models";
import type { ArtistId } from "@/content/artists";
import { Header } from "@/components/Header";
import {
  ProcessStepper,
  PROCESSES,
  processesForType,
  type ProcessSlug,
} from "@/components/ProcessStepper";
import { JourneyArtworkBar } from "@/components/JourneyArtworkBar";

// Process stage components — same building blocks the standalone pages used.
import { ProcessingStage } from "@/components/painting-to-model/ProcessingStage";
import { ViewerStage } from "@/components/painting-to-model/ViewerStage";
import { FabricateStage } from "@/components/fabrication/FabricateStage";
import { PolishStage } from "@/components/fabrication/PolishStage";
import { RevealStage } from "@/components/fabrication/RevealStage";
import { AudioProcessingStage } from "@/components/audio-guide/AudioProcessingStage";
import { AudioPlayer } from "@/components/audio-guide/AudioPlayer";
import { ArtistPersona } from "@/components/future/artist-persona/ArtistPersona";
import { hasCompleted, markCompleted } from "@/lib/journeyMemory";
import { fabricationAssetUrls } from "@/content/fabrication-images";
import { preloadImages } from "@/lib/preloadImages";

const PROCESS_SLUGS = new Set<ProcessSlug>(PROCESSES.map((p) => p.slug));

function isProcessSlug(value: string | undefined): value is ProcessSlug {
  return value !== undefined && PROCESS_SLUGS.has(value as ProcessSlug);
}

const FADE = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.2 },
} as const;

// Compresses every per-stage animation timeline. 1 = original.
const SPEED = 1.25;

// Mona Lisa → Leonardo, Van Gogh → Van Gogh, etc. Monuments fall back to a default.
const ARTWORK_TO_ARTIST: Partial<Record<ModelId, ArtistId>> = {
  "mona-lisa": "leonardo",
  "van-gogh": "van-gogh",
  "starry-night": "van-gogh",
  "sunflowers": "van-gogh",
  "girl-with-pearl-earring": "vermeer",
  "guernica": "picasso",
  "three-musicians": "picasso",
  "the-weeping-woman": "picasso",
  "the-night-watch": "rembrandt",
  "dogs-playing-poker": "coolidge",
  "napoleon-crossing-the-alps": "david",
  "the-great-wave": "hokusai",
  "takiyasha": "kuniyoshi",
  "harlequins-carnival": "miro",
  "whaam": "lichtenstein",
  "the-scream": "munch",
  "persistence-of-memory": "dali",
};

// ─── "See it in action" gallery — appears below the 3D model / reveal / player ─
const MEDIA_BASE = import.meta.env.BASE_URL.replace(/\/$/, "");
const PEOPLE_PHOTOS = [
  "people-01.jpg",
  "people-02.png",
  "people-03.png",
  "people-04.png",
  "people-05.png",
  "people-06.png",
  "people-07.png",
  "people-08.png",
  "people-09.jpeg",
  "people-10.jpeg",
  "people-11.jpeg",
  "people-12.jpeg",
].map((f) => `${MEDIA_BASE}/images/people-using-models/${f}`);
const PEOPLE_VIDEO = `${MEDIA_BASE}/videos/people-using-tactile.mp4`;
const PEOPLE_VIDEO_POSTER = `${MEDIA_BASE}/posters/people-using-tactile.jpg`;

const SEE_IT_ID = "see-it-in-action";

function scrollToSeeItInAction() {
  document
    .getElementById(SEE_IT_ID)
    ?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SeeItInActionSection() {
  return (
    <section
      id={SEE_IT_ID}
      aria-label="See it in action"
      className="bg-page px-5 md:px-8 pt-14 md:pt-16 pb-40"
      style={{ borderTop: "1px solid var(--color-hairline)" }}
    >
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="text-center mb-8 md:mb-10 max-w-2xl mx-auto">
          <p
            className="ptta-mono-eyebrow mb-3 font-medium"
            style={{
              fontSize: "clamp(13px, 3.6vw, 15px)",
              color: "hsl(38, 95%, 52%)",
            }}
          >
            See it in action
          </p>
          <h2
            className="font-serif text-ink leading-[1.08]"
            style={{ letterSpacing: "-0.02em", fontSize: "clamp(1.8rem, 5vw, 3rem)" }}
          >
            How people experience it.
          </h2>
          <p className="text-muted-fg mt-3 text-sm md:text-base">
            Real visitors exploring our tactile models, by hand.
          </p>
        </div>

        <div
          className="relative w-full aspect-video overflow-hidden rounded-[20px] md:rounded-[26px] mb-3 md:mb-4"
          style={{ border: "1px solid var(--color-hairline)" }}
        >
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={PEOPLE_VIDEO}
            poster={PEOPLE_VIDEO_POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            aria-label="Visitors exploring tactile art models in museums"
          />
        </div>

        {/* Organic masonry of real interaction photos (not a slideshow). */}
        <div className="columns-2 md:columns-3 gap-3 md:gap-4">
          {PEOPLE_PHOTOS.map((src, i) => (
            <div
              key={i}
              className="mb-3 md:mb-4 break-inside-avoid overflow-hidden rounded-xl"
              style={{ border: "1px solid var(--color-hairline)" }}
            >
              <img
                src={src}
                alt=""
                aria-hidden
                loading="lazy"
                className="block w-full h-auto"
              />
            </div>
          ))}
        </div>

        <p className="text-muted-fg mt-7 text-center text-xs md:text-sm">
          <span className="text-accent">Not AI generated.</span> Real
          photographs of people testing our models at partner museums.
        </p>
      </div>
    </section>
  );
}

export default function JourneyShell() {
  const [, params] = useRoute<{ artworkId: string; processSlug?: string }>(
    "/journey/:artworkId/:processSlug?",
  );
  const [, navigate] = useLocation();

  const model = params
    ? MODELS.find((m) => m.id === params.artworkId)
    : undefined;

  // Steps available for this artwork (monuments have no artist step).
  const processes = useMemo(
    () => (model ? processesForType(model.type) : PROCESSES),
    [model],
  );

  const requestedSlug: ProcessSlug = isProcessSlug(params?.processSlug)
    ? (params!.processSlug as ProcessSlug)
    : "model";
  // Clamp to a step this artwork actually has.
  const slug: ProcessSlug = processes.some((p) => p.slug === requestedSlug)
    ? requestedSlug
    : "model";

  useEffect(() => {
    if (params && !model) navigate("/");
  }, [params, model, navigate]);

  // Warm the heavy Fabrication renders in the background while the user is on
  // the earlier model step, so that stage paints instantly instead of popping
  // in mid-animation. Deferred briefly so the model step's own assets load
  // first.
  useEffect(() => {
    if (!model || slug !== "model") return;
    const urls = fabricationAssetUrls(model.id);
    const t = window.setTimeout(() => preloadImages(urls), 600);
    return () => window.clearTimeout(t);
  }, [model, slug]);

  // If the URL asks for a step this artwork doesn't have (e.g. a monument
  // routed to /artist), correct the URL instead of rendering a mismatch.
  useEffect(() => {
    if (model && requestedSlug !== slug) {
      navigate(`/journey/${model.id}/${slug}`, { replace: true });
    }
  }, [model, requestedSlug, slug, navigate]);

  const advanceToNext = useCallback(() => {
    if (!model) return;
    const idx = processes.findIndex((p) => p.slug === slug);
    const next = processes[idx + 1];
    if (next) navigate(`/journey/${model.id}/${next.slug}`);
  }, [model, processes, slug, navigate]);

  // Back goes one step up the journey: previous process, or to the
  // picker when on the first process.
  const goBack = useCallback(() => {
    if (!model) return;
    const idx = processes.findIndex((p) => p.slug === slug);
    if (idx <= 0) {
      navigate("/demo");
    } else {
      navigate(`/journey/${model.id}/${processes[idx - 1].slug}`);
    }
  }, [model, processes, slug, navigate]);

  const backToPicker = useCallback(() => navigate("/demo"), [navigate]);

  if (!model) return null;

  const isLastProcess = processes[processes.length - 1].slug === slug;

  return (
    <div className="ptta-root h-[100dvh] flex flex-col overflow-hidden bg-page text-ink">
      <Header showBack onBack={goBack} tag={model.title.toUpperCase()} />
      <JourneyArtworkBar currentId={model.id} />
      <ProcessStepper
        artworkId={model.id}
        activeSlug={slug}
        processes={processes}
      />

      <div className="flex-1 min-h-0 relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={slug}
            {...FADE}
            className="h-full overflow-y-auto overscroll-contain"
          >
            <ProcessBody
              slug={slug}
              model={model}
              onComplete={advanceToNext}
              onBackToPicker={backToPicker}
              isLastProcess={isLastProcess}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProcessBody({
  slug,
  model,
  onComplete,
  onBackToPicker,
  isLastProcess,
}: {
  slug: ProcessSlug;
  model: ModelEntry;
  onComplete: () => void;
  onBackToPicker: () => void;
  isLastProcess: boolean;
}) {
  switch (slug) {
    case "model":
      return (
        <ModelProcess
          model={model}
          onComplete={onComplete}
          onBackToPicker={onBackToPicker}
        />
      );
    case "fabrication":
      return (
        <FabricationProcess
          model={model}
          onComplete={onComplete}
          onBackToPicker={onBackToPicker}
        />
      );
    case "audio":
      return (
        <AudioProcess
          model={model}
          onComplete={onComplete}
          onBackToPicker={onBackToPicker}
          isLastProcess={isLastProcess}
        />
      );
    case "artist":
      return <ArtistProcess model={model} onBackToPicker={onBackToPicker} />;
  }
}

interface ProcessProps {
  model: ModelEntry;
  onComplete: () => void;
  onBackToPicker: () => void;
}

// ─── Process 1: Painting → 3D Model ───────────────────────────────────────────
function ModelProcess({ model, onComplete, onBackToPicker }: ProcessProps) {
  const [stage, setStage] = useState<"processing" | "viewer">(() =>
    hasCompleted(model.id, "model") ? "viewer" : "processing",
  );

  const finishProcessing = useCallback(() => {
    markCompleted(model.id, "model");
    setStage("viewer");
  }, [model.id]);

  if (stage === "processing") {
    return (
      <ProcessingStage
        model={model}
        onDone={finishProcessing}
        onBack={onBackToPicker}
        speedMultiplier={SPEED}
      />
    );
  }

  return (
    <>
      <div className="relative h-full min-h-[480px]">
        <ViewerStage model={model} onBack={onBackToPicker} />
      </div>
      <SeeItInActionSection />
      <ContinueStrip
        label="Next: Fabrication"
        onClick={onComplete}
        onSeeItInAction={scrollToSeeItInAction}
      />
    </>
  );
}

// ─── Process 2: Fabrication ───────────────────────────────────────────────────
function FabricationProcess({
  model,
  onComplete,
  onBackToPicker,
}: ProcessProps) {
  const [stage, setStage] = useState<"fabricate" | "polish" | "reveal">(() =>
    hasCompleted(model.id, "fabrication") ? "reveal" : "fabricate",
  );

  const finishToReveal = useCallback(() => {
    markCompleted(model.id, "fabrication");
    setStage("reveal");
  }, [model.id]);

  if (stage === "fabricate") {
    return (
      <FabricateStage
        model={model}
        onDone={() => setStage("polish")}
        onBack={onBackToPicker}
        speedMultiplier={SPEED}
      />
    );
  }
  if (stage === "polish") {
    return (
      <PolishStage
        model={model}
        onDone={finishToReveal}
        onBack={onBackToPicker}
        speedMultiplier={SPEED}
      />
    );
  }
  return (
    <>
      <div className="relative h-full min-h-[480px]">
        <RevealStage model={model} onBack={onBackToPicker} />
      </div>
      <SeeItInActionSection />
      <ContinueStrip
        label="Next: Audio Guide"
        onClick={onComplete}
        onSeeItInAction={scrollToSeeItInAction}
      />
    </>
  );
}

// ─── Process 3: Audio Guide ───────────────────────────────────────────────────
function AudioProcess({
  model,
  onComplete,
  onBackToPicker,
  isLastProcess,
}: ProcessProps & { isLastProcess: boolean }) {
  const [stage, setStage] = useState<"processing" | "player">(() =>
    hasCompleted(model.id, "audio") ? "player" : "processing",
  );

  const finishProcessing = useCallback(() => {
    markCompleted(model.id, "audio");
    setStage("player");
  }, [model.id]);

  if (stage === "processing") {
    return (
      <AudioProcessingStage
        model={model}
        onDone={finishProcessing}
        onBack={onBackToPicker}
        speedMultiplier={SPEED}
      />
    );
  }
  return (
    <>
      <div className="relative h-full min-h-[480px]">
        <AudioPlayer model={model} onBack={onBackToPicker} />
      </div>
      <SeeItInActionSection />
      {isLastProcess ? (
        <ContinueStrip
          label="Explore another artwork"
          onClick={onBackToPicker}
          onSeeItInAction={scrollToSeeItInAction}
        />
      ) : (
        <ContinueStrip
          label="Next: Artist Persona"
          onClick={onComplete}
          onSeeItInAction={scrollToSeeItInAction}
        />
      )}
    </>
  );
}

// ─── Process 4: Artist Persona (paintings only) ───────────────────────────────
function ArtistProcess({
  model,
  onBackToPicker,
}: {
  model: ModelEntry;
  onBackToPicker: () => void;
}) {
  // Every painting maps to an artist; the default is a defensive fallback.
  const matchedArtist = ARTWORK_TO_ARTIST[model.id] ?? "van-gogh";
  const lastName = model.artist.split(" ").slice(-1)[0];

  return (
    <main className="h-full flex flex-col px-4 sm:px-5 pt-3 sm:pt-4 pb-3 w-full max-w-[560px] md:max-w-[780px] lg:max-w-[880px] mx-auto min-h-0">
      <div className="shrink-0 mb-2 sm:mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1
            className="font-serif text-lg sm:text-xl md:text-2xl leading-tight"
            style={{ letterSpacing: "-0.01em" }}
          >
            Talk to {lastName}.
          </h1>
          <p className="hidden sm:block text-muted-fg text-xs md:text-sm mt-0.5">
            Ask about a brushstroke, a memory, a dream. AI-interpreted, not
            historical fact.
          </p>
        </div>
        <button
          type="button"
          onClick={onBackToPicker}
          className="shrink-0 rounded-full border border-hairline px-3 py-1.5 text-xs font-medium text-muted-fg transition-colors hover:text-ink hover:border-ink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent whitespace-nowrap"
        >
          Explore another artwork →
        </button>
      </div>

      <ArtistPersona
        initialArtist={matchedArtist}
        lockArtist
        className="flex-1 min-h-0"
      />
    </main>
  );
}

function ContinueStrip({
  label,
  onClick,
  onSeeItInAction,
}: {
  label: string;
  onClick: () => void;
  onSeeItInAction?: () => void;
}) {
  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center gap-2.5 sm:gap-3"
      style={{
        bottom: "max(1.25rem, env(safe-area-inset-bottom) + 0.75rem)",
        maxWidth: "94vw",
      }}
    >
      {onSeeItInAction && (
        <button
          type="button"
          onClick={onSeeItInAction}
          aria-label="See it in action"
          className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-white text-[13.5px] sm:text-base shadow-xl transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent whitespace-nowrap"
          style={{
            minHeight: 48,
            color: "#241A0E",
            fontWeight: 400,
            letterSpacing: "-0.005em",
            boxShadow: "0 12px 34px -10px rgba(0,0,0,0.55)",
          }}
        >
          See it in action ↓
        </button>
      )}
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        className="px-4 sm:px-6 py-3 sm:py-3.5 rounded-full bg-accent text-[13.5px] sm:text-base shadow-xl transition-transform hover:scale-[1.03] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent whitespace-nowrap"
        style={{
          minHeight: 48,
          letterSpacing: "-0.005em",
          fontWeight: 400,
          color: "#241A0E",
          boxShadow:
            "0 12px 34px -8px color-mix(in srgb, var(--color-accent) 45%, transparent)",
        }}
      >
        {label} →
      </button>
    </div>
  );
}
