import { Router, type IRouter, type Request, type Response } from "express";
import { z } from "zod";
import { ARTIST_IDS, getArtistPrompt } from "../lib/artistPrompts";
import { createRateLimiter } from "../lib/rateLimit";
import { streamGroqChat, type GroqStreamError } from "../lib/groqClient";
import { logger } from "../lib/logger";

const PRIMARY_MODEL = "llama-3.3-70b-versatile";
const FALLBACK_MODEL = "llama-3.1-8b-instant";

const BodySchema = z.object({
  artistId: z.enum(ARTIST_IDS),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(500),
      }),
    )
    .min(1)
    .max(20),
});

const limiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 });

const router: IRouter = Router();

router.post("/artist-chat", async (req: Request, res: Response) => {
  const parsed = BodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "invalid_body", detail: parsed.error.flatten() });
    return;
  }

  const key = req.ip ?? "unknown";
  const rl = limiter.check(key);
  if (!rl.allowed) {
    res.status(429).json({ error: "rate_limited" });
    return;
  }

  const { artistId, messages } = parsed.data;
  const systemPrompt = getArtistPrompt(artistId);

  const attempt = async (model: string) => {
    return streamGroqChat({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    });
  };

  let stream: AsyncIterable<string>;
  try {
    stream = await attempt(PRIMARY_MODEL);
  } catch (primaryErr) {
    const e = primaryErr as GroqStreamError;
    logger.warn({ err: e, status: e.status }, "Primary Groq call failed, falling back");
    try {
      stream = await attempt(FALLBACK_MODEL);
    } catch (fallbackErr) {
      logger.error({ err: fallbackErr }, "Fallback Groq call failed");
      res.status(502).json({ error: "upstream" });
      return;
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  try {
    for await (const chunk of stream) {
      const safe = chunk.replace(/\n/g, "\\n");
      res.write(`data: ${safe}\n\n`);
    }
    res.write(`event: done\ndata: ok\n\n`);
    res.end();
  } catch (streamErr) {
    logger.error({ err: streamErr }, "Stream error mid-response");
    res.write(`event: error\ndata: stream\n\n`);
    res.end();
  }
});

export default router;
