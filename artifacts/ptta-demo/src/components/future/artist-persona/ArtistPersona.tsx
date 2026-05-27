import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useArtistChat } from "./useArtistChat";
import { ARTISTS, type ArtistId } from "@/content/artists";
import { ArtistPicker } from "./ArtistPicker";
import { ArtistHeader } from "./ArtistHeader";
import { ChatTranscript } from "./ChatTranscript";
import { ChatInput } from "./ChatInput";

const ERROR_COPY: Record<string, (name: string) => string> = {
  rate_limit: (name) => `Too many questions at once. Give ${name} a breath.`,
  upstream: (name) => `${name} is away from the easel. Try again in a moment.`,
  timeout: (name) => `${name} is away from the easel. Try again in a moment.`,
  network: (name) =>
    `Couldn't reach ${name}. Check your connection and try again.`,
  validation: () =>
    "That message is too long. Keep it under 500 characters.",
};

interface ArtistPersonaProps {
  /** Initial artist to show. Defaults to "van-gogh". */
  initialArtist?: ArtistId;
  /**
   * When true, the artist picker is hidden — the chat is locked to
   * `initialArtist`. Use inside the journey, where the painter has
   * already been determined by the chosen artwork.
   */
  lockArtist?: boolean;
  /** Extra classes for the root section (e.g. flex sizing in the journey). */
  className?: string;
}

export function ArtistPersona({
  initialArtist = "van-gogh",
  lockArtist = false,
  className = "",
}: ArtistPersonaProps = {}) {
  const chat = useArtistChat(initialArtist);
  const artist = ARTISTS[chat.artistId];
  const reduceMotion = useReducedMotion() ?? false;

  return (
    <section
      className={`flex flex-col min-h-0 ${className}`}
      aria-label="AI Artist Persona"
    >
      {!lockArtist && (
        <div className="shrink-0">
          <ArtistPicker
            selected={chat.artistId}
            onSelect={(id: ArtistId) => chat.switchArtist(id)}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={chat.artistId}
          className="shrink-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          exit={reduceMotion ? undefined : { opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <ArtistHeader artist={artist} />
        </motion.div>
      </AnimatePresence>

      <ChatTranscript
        messages={chat.messages}
        status={chat.status}
        artistShortName={artist.shortName}
        accentColor={artist.palette.accent}
      />

      {chat.status === "error" && chat.error && (
        <div
          role="alert"
          className="mt-3 px-4 py-3 rounded-xl bg-surface border border-hairline text-sm text-ink flex items-center justify-between gap-3"
        >
          <span>
            {ERROR_COPY[chat.error.code]?.(artist.shortName) ??
              "Something went wrong."}
          </span>
          {chat.error.code !== "validation" && (
            <button
              type="button"
              onClick={() => void chat.retry()}
              className="px-3 py-1.5 rounded-full bg-ink text-page text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="shrink-0">
        <ChatInput
          placeholder={artist.placeholder}
          suggested={artist.suggested}
          showSuggested={
            chat.messages.length === 0 && chat.status !== "streaming"
          }
          disabled={chat.status === "streaming"}
          accentColor={artist.palette.accent}
          onSend={(text) => void chat.send(text)}
        />
      </div>
    </section>
  );
}
