import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw, Rewind } from "lucide-react";
import { ModelViewerElement } from "@google/model-viewer";
import type { ModelEntry } from "@/content/models";
import { AUDIO_SRC } from "@/content/audio-guide";

// Idempotent — ViewerStage may have set this already.
ModelViewerElement.meshoptDecoderLocation =
  "https://unpkg.com/meshoptimizer@0.20.0/meshopt_decoder.js";

const titleStyle = { letterSpacing: "-0.015em" } as const;

interface Props {
  model: ModelEntry;
  // Kept for API compatibility with the journey shell.
  onBack: () => void;
}

interface Language {
  code: string;
  flag: string;
  name: string;
  active?: boolean;
}

const LANGUAGES: Language[] = [
  { code: "en", flag: "🇬🇧", name: "English", active: true },
  { code: "de", flag: "🇩🇪", name: "Deutsch" },
  { code: "fr", flag: "🇫🇷", name: "Français" },
  { code: "es", flag: "🇪🇸", name: "Español" },
  { code: "it", flag: "🇮🇹", name: "Italiano" },
  { code: "ja", flag: "🇯🇵", name: "日本語" },
  { code: "zh", flag: "🇨🇳", name: "中文" },
  { code: "ar", flag: "🇸🇦", name: "العربية" },
];

const BAR_COUNT = 40;
const SPEEDS = [1, 1.25, 1.5, 2, 0.75] as const;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// ── Left: slowly-rotating 3D model on the gallery stage ──────────────────────
function ModelStage({ model }: { model: ModelEntry }) {
  const viewerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el || !model.glb) return;
    el.setAttribute("src", model.glb);
  }, [model.glb]);

  const envUrl = `${import.meta.env.BASE_URL || "/"}environments/studio.hdr`
    .replace(/\/{2,}/g, "/");

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Warm key-light pool */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[72%] w-[64%] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, color-mix(in srgb, var(--color-accent) 12%, transparent) 0%, transparent 66%)",
          filter: "blur(22px)",
        }}
      />
      {model.glb ? (
        <model-viewer
          ref={viewerRef}
          alt={`Rotating 3D model of ${model.title} by ${model.artist}`}
          orientation={model.orientation ?? "0 0 0"}
          camera-controls
          auto-rotate
          auto-rotate-delay="0"
          rotation-per-second="9deg"
          camera-orbit="-28deg 80deg auto"
          shadow-intensity="2.4"
          shadow-softness="0.22"
          tone-mapping="aces"
          exposure="0.9"
          environment-image={envUrl}
          interaction-prompt="none"
          loading="eager"
          reveal="auto"
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            backgroundColor: "transparent",
          }}
        />
      ) : (
        <img
          src={model.image}
          alt={`${model.title} by ${model.artist}`}
          className="absolute inset-0 h-full w-full object-contain p-8"
        />
      )}
      {/* Vignette so it emerges from darkness */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 72% 72% at 50% 50%, transparent 42%, rgba(0,0,0,0.42) 80%, rgba(0,0,0,0.72) 100%)",
        }}
      />
    </div>
  );
}

export function AudioPlayer({ model }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(0);
  const speed = SPEEDS[speedIdx];
  const [bars, setBars] = useState<number[]>(() =>
    Array.from({ length: BAR_COUNT }, (_, i) => {
      const t = i / (BAR_COUNT - 1);
      return 16 + Math.sin(Math.PI * t) * 44 + (0.5 + 0.5 * Math.sin(i * 0.85)) * 10;
    }),
  );

  const src = AUDIO_SRC[model.id];

  const ensureAudioGraph = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || audioCtxRef.current) return;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const source = ctx.createMediaElementSource(audio);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.86;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  // Ease each bar toward its live target every frame for fluid motion.
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      return;
    }
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const EASE = 0.22;
    const tick = () => {
      analyser.getByteFrequencyData(data);
      setBars((prev) =>
        prev.map((cur, i) => {
          const v = data[i] ?? 0;
          const targetH = 8 + (v / 255) * 92;
          return cur + (targetH - cur) * EASE;
        }),
      );
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  useEffect(() => {
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  const handlePlayPause = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioGraph();
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume().catch(() => {});
    }
    if (audio.paused) {
      await audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [ensureAudioGraph]);

  const handleReplay = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio) return;
    ensureAudioGraph();
    if (audioCtxRef.current?.state === "suspended") {
      await audioCtxRef.current.resume().catch(() => {});
    }
    audio.currentTime = 0;
    setCurrentTime(0);
    await audio.play().catch(() => {});
    setIsPlaying(true);
  }, [ensureAudioGraph]);

  const handleBack15 = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Math.max(0, audio.currentTime - 15);
    audio.currentTime = next;
    setCurrentTime(next);
  }, []);

  const cycleSpeed = useCallback(() => {
    setSpeedIdx((prev) => {
      const nextIdx = (prev + 1) % SPEEDS.length;
      const audio = audioRef.current;
      if (audio) audio.playbackRate = SPEEDS[nextIdx];
      return nextIdx;
    });
  }, []);

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) {
      setDuration(audio.duration);
      audio.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (audio) setCurrentTime(audio.currentTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = Number(e.target.value);
    audio.currentTime = next;
    setCurrentTime(next);
  };

  const playedFrac = duration > 0 ? currentTime / duration : 0;

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-transparent md:flex-row">
      {/* LEFT — rotating 3D model */}
      <section
        aria-label="Rotating 3D model of the artwork"
        className="relative h-[42%] w-full shrink-0 md:h-full md:w-[42%]"
      >
        <ModelStage model={model} />
      </section>

      {/* RIGHT — audio guide + languages */}
      <section
        className="flex min-h-0 flex-1 flex-col justify-start md:justify-center gap-5 md:gap-6 overflow-y-auto px-4 sm:px-7 pt-5 pb-28 md:px-12 md:py-6"
      >
        <div className="w-full max-w-[640px]">
          <h1
            className="font-serif text-ink leading-[0.98]"
            style={{ ...titleStyle, fontSize: "clamp(1.7rem, 6vw, 3.7rem)" }}
          >
            {model.title}
          </h1>
          <p
            className="ptta-label text-muted-fg mt-2 sm:mt-3"
            style={{ fontSize: "9pt", letterSpacing: "0.14em" }}
          >
            {model.artist} · {model.year}
          </p>

          {/* Transport */}
          <div className="mt-5 sm:mt-7 flex items-center gap-2.5 sm:gap-4">
            <button
              type="button"
              onClick={handleReplay}
              aria-label="Replay from the start"
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-hairline text-muted-fg transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <RotateCcw size={16} />
            </button>
            <button
              type="button"
              onClick={handleBack15}
              aria-label="Back 15 seconds"
              className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full border border-hairline text-muted-fg transition-colors hover:text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              <Rewind size={16} />
            </button>
            <button
              type="button"
              onClick={handlePlayPause}
              aria-label={isPlaying ? "Pause audio" : "Play audio"}
              aria-pressed={isPlaying}
              className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 items-center justify-center rounded-full bg-accent shadow-xl transition-transform hover:scale-[1.04] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
              style={{ color: "#241A0E" }}
            >
              {isPlaying ? (
                <Pause size={22} fill="currentColor" />
              ) : (
                <Play size={22} fill="currentColor" className="ml-1" />
              )}
            </button>

            {/* Waveform doubles as the scrubber */}
            <div className="min-w-0 flex-1">
              <div className="relative rounded-md focus-within:outline focus-within:outline-2 focus-within:outline-offset-4 focus-within:outline-accent">
                <div
                  aria-hidden="true"
                  className="flex h-12 items-center gap-[2px]"
                >
                  {bars.map((h, i) => {
                    const played = i / (BAR_COUNT - 1) <= playedFrac;
                    return (
                      <span
                        key={i}
                        className={`flex-1 rounded-full ${played ? "bg-accent" : ""}`}
                        style={{
                          height: `${Math.min(100, h)}%`,
                          minHeight: 3,
                          background: played
                            ? undefined
                            : "rgba(242,233,214,0.20)",
                          opacity: played ? 0.5 + (h / 100) * 0.5 : 1,
                        }}
                      />
                    );
                  })}
                </div>
                <input
                  type="range"
                  min={0}
                  max={duration || 0}
                  step={0.01}
                  value={currentTime}
                  onChange={handleScrub}
                  aria-label="Seek through the audio guide"
                  aria-valuetext={`${formatTime(currentTime)} of ${formatTime(duration)}`}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>
              <div className="mt-2.5 flex items-center justify-between">
                <span
                  className="ptta-label text-muted-fg tabular-nums"
                  style={{ fontSize: "9pt" }}
                >
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
                <button
                  type="button"
                  onClick={cycleSpeed}
                  aria-label={`Playback speed ${speed}×, tap to change`}
                  className={`rounded-full border border-hairline px-3 py-1 text-xs font-semibold tabular-nums transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                    speed === 1 ? "text-muted-fg" : "text-accent"
                  }`}
                >
                  {speed}×
                </button>
              </div>
            </div>
          </div>
        </div>

        <LanguageRail />
      </section>

      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={handleLoadedMetadata}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        preload="metadata"
        crossOrigin="anonymous"
      />
    </div>
  );
}

function LanguageChip({ lang }: { lang: Language }) {
  return (
    <li>
      <div
        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg border ${
          lang.active
            ? "border-accent/40 bg-accent/10 text-ink"
            : "border-hairline bg-page text-body-fg"
        }`}
      >
        <span className="flex items-center gap-2 min-w-0">
          <span
            aria-hidden="true"
            className="text-sm sm:text-base leading-none shrink-0"
            style={{ fontFamily: "system-ui, sans-serif" }}
          >
            {lang.flag}
          </span>
          <span className="text-xs font-medium truncate">{lang.name}</span>
        </span>
        {lang.active && (
          <span
            aria-hidden
            className="w-1.5 h-1.5 rounded-full bg-accent shrink-0"
          />
        )}
      </div>
    </li>
  );
}

function LanguageRail() {
  const available = LANGUAGES.filter((lang) => lang.active);
  const comingSoon = LANGUAGES.filter((lang) => !lang.active);

  return (
    <aside
      aria-label="Audio guide languages"
      className="w-full max-w-[640px] rounded-2xl border border-hairline bg-surface p-3 sm:p-5"
    >
      <h2
        className="font-serif text-ink text-base sm:text-lg md:text-xl leading-tight"
        style={titleStyle}
      >
        Available languages
      </h2>
      <ul className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {available.map((lang) => (
          <LanguageChip key={lang.code} lang={lang} />
        ))}
      </ul>

      <h2
        className="font-serif text-ink text-base sm:text-lg md:text-xl leading-tight mt-4 sm:mt-5"
        style={titleStyle}
      >
        Coming soon
      </h2>
      <ul className="mt-2 sm:mt-3 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {comingSoon.map((lang) => (
          <LanguageChip key={lang.code} lang={lang} />
        ))}
      </ul>
    </aside>
  );
}
