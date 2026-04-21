import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, Pause, Play } from "lucide-react";
import type { ModelEntry } from "@/content/models";
import { AUDIO_SRC } from "@/content/audio-guide";
import { Marker } from "@/components/editorial";
import { NextModuleCta } from "@/components/NextModuleCta";

const titleStyle = { letterSpacing: "-0.01em" } as const;

interface Props {
  model: ModelEntry;
  onBack: () => void;
}

const BAR_COUNT = 32;

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function AudioPlayer({ model, onBack }: Props) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const rafRef = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [bars, setBars] = useState<number[]>(() =>
    // Non-zero idle heights so the visualizer isn't flat before play.
    Array.from({ length: BAR_COUNT }, (_, i) =>
      20 + 10 * Math.sin((i / BAR_COUNT) * Math.PI)
    )
  );

  const src = AUDIO_SRC[model.id];

  // Set up Web Audio analysis pipeline the first time the user plays.
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
    analyser.fftSize = 128; // 64 frequency bins; we'll take 32 low-mid bins
    analyser.smoothingTimeConstant = 0.75;
    source.connect(analyser);
    analyser.connect(ctx.destination);
    audioCtxRef.current = ctx;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }, []);

  // Animate the bars while playing.
  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      return;
    }
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    const tick = () => {
      analyser.getByteFrequencyData(data);
      // Take the first BAR_COUNT bins (low/mid — voice lives there).
      const next = Array.from({ length: BAR_COUNT }, (_, i) => {
        const v = data[i] ?? 0;
        // Normalise 0..255 → 8..100 (min 8 so bars stay visible at rest)
        return 8 + (v / 255) * 92;
      });
      setBars(next);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying]);

  // Cleanup on unmount.
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
    // iOS/Safari suspends the context until a user gesture.
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

  const handleLoadedMetadata = () => {
    const audio = audioRef.current;
    if (audio) setDuration(audio.duration);
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

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="ptta-root min-h-[100dvh] bg-page text-ink flex flex-col"
    >
      {/* Custom minimal header with back arrow (full-screen player context) */}
      <header className="flex items-center gap-3 px-5 pt-6 pb-3">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back to picker"
          className="w-11 h-11 flex items-center justify-center rounded-full text-ink hover:bg-surface-muted transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex items-center gap-2">
          <Marker size={6} />
          <span
            className="ptta-label text-accent"
            style={{ fontSize: "10pt" }}
          >
            Audio Guide · 03
          </span>
        </div>
      </header>

      {/* Main body */}
      <main className="flex-1 flex flex-col items-center justify-start px-5 pt-2 pb-10 mx-auto w-full max-w-[440px]">
        {/* Album art */}
        <div className="relative w-full max-w-[300px] aspect-[3/4] overflow-hidden rounded-2xl bg-surface-muted shadow-lg mb-8">
          <img
            src={model.image}
            alt={`${model.title} by ${model.artist}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>

        {/* Title / artist */}
        <div className="text-center mb-8">
          <h1
            className="font-serif text-ink text-2xl md:text-3xl leading-tight mb-1"
            style={titleStyle}
          >
            — {model.title}
          </h1>
          <p className="text-muted-fg text-sm">
            {model.artist} · {model.year}
          </p>
        </div>

        {/* Visualizer — 32 accent bars driven by live frequency data */}
        <div
          aria-hidden="true"
          className="w-full flex items-center justify-center gap-[2px] h-16 mb-6"
        >
          {bars.map((h, i) => (
            <span
              key={i}
              className="flex-1 bg-accent rounded-full transition-[height] duration-[90ms] ease-out"
              style={{
                height: `${h}%`,
                minHeight: 3,
                maxWidth: 6,
                opacity: 0.4 + (h / 100) * 0.6,
              }}
            />
          ))}
        </div>

        {/* Scrubber + times */}
        <div className="w-full mb-6">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.01}
            value={currentTime}
            onChange={handleScrub}
            aria-label="Seek"
            className="ptta-scrubber w-full"
            style={{
              // @ts-expect-error — custom CSS var used by the stylesheet rule
              "--progress": `${progress}%`,
            }}
          />
          <div className="flex items-center justify-between mt-2">
            <span
              className="ptta-label text-muted-fg"
              style={{ fontSize: "9pt" }}
            >
              {formatTime(currentTime)}
            </span>
            <span
              className="ptta-label text-muted-fg"
              style={{ fontSize: "9pt" }}
            >
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Play / pause */}
        <button
          type="button"
          onClick={handlePlayPause}
          aria-label={isPlaying ? "Pause audio" : "Play audio"}
          aria-pressed={isPlaying}
          className="w-16 h-16 rounded-full bg-accent text-cream flex items-center justify-center shadow-lg transition-transform hover:scale-[1.04] active:scale-[0.96] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          {isPlaying ? (
            <Pause size={24} fill="currentColor" />
          ) : (
            <Play size={24} fill="currentColor" className="ml-1" />
          )}
        </button>

        <div className="w-full mt-10">
          <NextModuleCta fromSlug="audio-guide" />
        </div>
      </main>

      {/* Hidden audio element driving playback */}
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
