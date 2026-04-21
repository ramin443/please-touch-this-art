import type { ModelId } from "./models";

function publicPath(relative: string): string {
  const base = import.meta.env.BASE_URL || "/";
  return `${base}${relative}`.replace(/\/{2,}/g, "/");
}

/**
 * ModelId → audio-guide MP3 URL. Narrated via ElevenLabs (voice:
 * Michael C. Vincent — Suspenseful Storyteller) and staged under
 * public/audio/ with clean filenames.
 */
export const AUDIO_SRC: Record<ModelId, string> = {
  "mona-lisa": publicPath("audio/mona-lisa.mp3"),
  "van-gogh": publicPath("audio/van-gogh.mp3"),
  "the-scream": publicPath("audio/the-scream.mp3"),
  "persistence-of-memory": publicPath("audio/persistence-of-memory.mp3"),
  "st-nikolai": publicPath("audio/st-nikolai.mp3"),
  "eiffel-tower": publicPath("audio/eiffel-tower.mp3"),
};
