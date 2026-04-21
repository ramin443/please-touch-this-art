import { useEffect, useRef } from "react";
import type { ChatMessage } from "./useArtistChat";

interface Props {
  messages: ChatMessage[];
  status: "idle" | "streaming" | "error";
  artistShortName: string;
}

export function ChatTranscript({ messages, status, artistShortName }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const userScrolledUp = useRef(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handler = () => {
      const nearBottom =
        el.scrollHeight - el.scrollTop - el.clientHeight < 40;
      userScrolledUp.current = !nearBottom;
    };
    el.addEventListener("scroll", handler);
    return () => el.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (!userScrolledUp.current) {
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  return (
    <div
      ref={scrollRef}
      id="artist-chat-panel"
      role="log"
      aria-live="polite"
      aria-atomic="false"
      aria-label={`Chat with ${artistShortName}`}
      className="flex-1 overflow-y-auto px-4 py-3 bg-surface rounded-2xl border border-hairline"
      style={{ minHeight: "60vh", maxHeight: "60vh" }}
    >
      {messages.length === 0 && (
        <p className="text-muted-fg text-sm italic">
          Say hello to {artistShortName}.
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {messages.map((m, i) => (
          <li
            key={i}
            className={`max-w-[80%] px-3 py-2 rounded-xl text-sm leading-snug whitespace-pre-wrap ${
              m.role === "user"
                ? "self-end bg-ink text-page"
                : "self-start bg-page text-ink border border-hairline"
            }`}
          >
            {m.content}
            {m.role === "assistant" &&
              status === "streaming" &&
              i === messages.length - 1 && (
                <span aria-hidden className="inline-block ml-1 animate-pulse">
                  ▍
                </span>
              )}
          </li>
        ))}
      </ul>
      <div ref={endRef} />
    </div>
  );
}
