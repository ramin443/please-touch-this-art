import { logger } from "./logger";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface GroqChatRequest {
  model: string;
  messages: GroqMessage[];
  timeoutMs?: number;
}

export interface GroqStreamError extends Error {
  status: number | null;
}

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function streamGroqChat(
  req: GroqChatRequest,
): Promise<AsyncIterable<string>> {
  const apiKey = process.env["GROQ_API_KEY"];
  if (!apiKey) {
    throw new Error("GROQ_API_KEY not configured");
  }

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    req.timeoutMs ?? 15_000,
  );

  let response: Response;
  try {
    response = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: req.model,
        messages: req.messages,
        stream: true,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeout);
    const e = new Error("Groq request failed") as GroqStreamError;
    e.status = null;
    throw e;
  }

  if (!response.ok || !response.body) {
    clearTimeout(timeout);
    const body = await response.text().catch(() => "");
    logger.error({ status: response.status, body }, "Groq non-OK response");
    const e = new Error(`Groq returned ${response.status}`) as GroqStreamError;
    e.status = response.status;
    throw e;
  }

  return toTextIterable(response.body, timeout);
}

async function* toTextIterable(
  body: ReadableStream<Uint8Array>,
  timeout: NodeJS.Timeout,
): AsyncGenerator<string> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || !line.startsWith("data:")) continue;
        const payload = line.slice(5).trim();
        if (payload === "[DONE]") return;
        try {
          const json = JSON.parse(payload);
          const delta = json.choices?.[0]?.delta?.content;
          if (typeof delta === "string" && delta.length > 0) {
            yield delta;
          }
        } catch {
          // skip malformed chunks
        }
      }
    }
  } finally {
    clearTimeout(timeout);
    reader.releaseLock();
  }
}
