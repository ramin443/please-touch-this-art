import { useCallback, useRef, useState } from "react";
import type { ArtistId } from "@/content/artists";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export type ChatErrorCode =
  | "rate_limit"
  | "upstream"
  | "network"
  | "timeout"
  | "validation";

export interface ChatError {
  code: ChatErrorCode;
}

export type ChatStatus = "idle" | "streaming" | "error";

export interface UseArtistChat {
  artistId: ArtistId;
  messages: ChatMessage[];
  status: ChatStatus;
  error?: ChatError;
  send: (text: string) => Promise<void>;
  retry: () => Promise<void>;
  switchArtist: (id: ArtistId) => void;
}

function mapErrorStatus(status: number): ChatErrorCode {
  if (status === 429) return "rate_limit";
  if (status === 400) return "validation";
  if (status === 502 || status === 504) return "upstream";
  return "upstream";
}

async function readSseStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (delta: string) => void,
): Promise<void> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const raw of lines) {
      const line = raw.replace(/\r$/, "");
      if (!line) continue;
      if (line.startsWith("event: done")) return;
      if (line.startsWith("data: ")) {
        const payload = line.slice(6).replace(/\\n/g, "\n");
        if (payload.length > 0) onDelta(payload);
      } else if (line.startsWith("data:")) {
        const payload = line.slice(5).replace(/\\n/g, "\n");
        if (payload.length > 0) onDelta(payload);
      }
    }
  }
}

export function useArtistChat(initial: ArtistId): UseArtistChat {
  const [artistId, setArtistId] = useState<ArtistId>(initial);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [error, setError] = useState<ChatError | undefined>(undefined);
  const lastUserText = useRef<string>("");

  const doSend = useCallback(
    async (text: string, artist: ArtistId, history: ChatMessage[]) => {
      setStatus("streaming");
      setError(undefined);
      const userMsg: ChatMessage = { role: "user", content: text };
      const nextHistory = [...history, userMsg];
      setMessages([...nextHistory, { role: "assistant", content: "" }]);
      let response: Response;
      try {
        response = await fetch("/api/artist-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ artistId: artist, messages: nextHistory }),
        });
      } catch {
        setMessages(history);
        setStatus("error");
        setError({ code: "network" });
        return;
      }
      if (!response.ok || !response.body) {
        setMessages(history);
        setStatus("error");
        setError({ code: mapErrorStatus(response.status) });
        return;
      }
      try {
        await readSseStream(response.body, (delta) => {
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            if (last.role !== "assistant") return prev;
            const updated: ChatMessage = {
              role: "assistant",
              content: last.content + delta,
            };
            return [...prev.slice(0, -1), updated];
          });
        });
        setStatus("idle");
      } catch {
        setStatus("error");
        setError({ code: "network" });
      }
    },
    [],
  );

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;
      lastUserText.current = trimmed;
      await doSend(trimmed, artistId, messages);
    },
    [artistId, messages, doSend],
  );

  const retry = useCallback(async () => {
    const text = lastUserText.current;
    if (!text) return;
    const history = messages.filter(
      (m, i, arr) => !(m.role === "assistant" && i === arr.length - 1 && m.content === ""),
    );
    const withoutLastUser =
      history.length > 0 && history[history.length - 1].role === "user"
        ? history.slice(0, -1)
        : history;
    await doSend(text, artistId, withoutLastUser);
  }, [messages, artistId, doSend]);

  const switchArtist = useCallback((id: ArtistId) => {
    setArtistId(id);
    setMessages([]);
    setStatus("idle");
    setError(undefined);
    lastUserText.current = "";
  }, []);

  return { artistId, messages, status, error, send, retry, switchArtist };
}
