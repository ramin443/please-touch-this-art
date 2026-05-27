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
  // Audio narration pending — files will be added under public/audio/.
  "starry-night": publicPath("audio/starry-night.mp3"),
  "sunflowers": publicPath("audio/sunflowers.mp3"),
  "girl-with-pearl-earring": publicPath("audio/girl-with-pearl-earring.mp3"),
  "guernica": publicPath("audio/guernica.mp3"),
  "three-musicians": publicPath("audio/three-musicians.mp3"),
  "the-night-watch": publicPath("audio/the-night-watch.mp3"),
  "dogs-playing-poker": publicPath("audio/dogs-playing-poker.mp3"),
  "napoleon-crossing-the-alps": publicPath("audio/napoleon-crossing-the-alps.mp3"),
  "the-great-wave": publicPath("audio/the-great-wave.mp3"),
  "takiyasha": publicPath("audio/takiyasha.mp3"),
  "harlequins-carnival": publicPath("audio/harlequins-carnival.mp3"),
  "whaam": publicPath("audio/whaam.mp3"),
  "the-weeping-woman": publicPath("audio/the-weeping-woman.mp3"),
  "the-scream": publicPath("audio/the-scream.mp3"),
  "persistence-of-memory": publicPath("audio/persistence-of-memory.mp3"),
  "st-nikolai": publicPath("audio/st-nikolai.mp3"),
  "eiffel-tower": publicPath("audio/eiffel-tower.mp3"),
};
