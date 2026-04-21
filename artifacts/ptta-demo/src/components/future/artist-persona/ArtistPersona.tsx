import { useArtistChat } from "./useArtistChat";
import { ARTISTS, type ArtistId } from "@/content/artists";
import { ArtistPicker } from "./ArtistPicker";
import { ArtistHeader } from "./ArtistHeader";
import { ChatTranscript } from "./ChatTranscript";
import { ChatInput } from "./ChatInput";

const ERROR_COPY: Record<string, (name: string) => string> = {
  rate_limit: (name) => `Too many questions at once — give ${name} a breath.`,
  upstream: (name) => `${name} is away from the easel. Try again in a moment.`,
  timeout: (name) => `${name} is away from the easel. Try again in a moment.`,
  network: (name) =>
    `Couldn't reach ${name}. Check your connection and try again.`,
  validation: () =>
    "That message is too long — keep it under 500 characters.",
};

export function ArtistPersona() {
  const chat = useArtistChat("van-gogh");
  const artist = ARTISTS[chat.artistId];

  return (
    <section className="flex flex-col" aria-label="AI Artist Persona">
      <ArtistPicker
        selected={chat.artistId}
        onSelect={(id: ArtistId) => chat.switchArtist(id)}
      />
      <ArtistHeader artist={artist} />
      <ChatTranscript
        messages={chat.messages}
        status={chat.status}
        artistShortName={artist.shortName}
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
      <ChatInput
        placeholder={artist.placeholder}
        suggested={artist.suggested}
        showSuggested={
          chat.messages.length === 0 && chat.status !== "streaming"
        }
        disabled={chat.status === "streaming"}
        onSend={(text) => void chat.send(text)}
      />
    </section>
  );
}
