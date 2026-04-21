# Future Features Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a `/future-features` page with a live Groq-backed "AI Artist Persona" chat (3 artists), two illustrated "coming soon" cards (Guided Walk, AI Audio Describer), and sequential "Next →" CTAs chaining the four demo modules into a single narrative for Red Bull Basement judges.

**Architecture:** Backend Express route in the existing `artifacts/api-server` package proxies Groq streaming chat completions as SSE; `GROQ_API_KEY` stays server-side. Vite dev server proxies `/api` to the api-server so the `ptta-demo` SPA calls a same-origin path. Frontend is a React hook + component tree matching the existing editorial visual system.

**Tech Stack:** Express 5, Groq API (`llama-3.3-70b-versatile` with `llama-3.1-8b-instant` fallback), zod validation, pino logging, Vite 7, React 18, framer-motion, Tailwind, vitest (new), wouter router.

**Spec:** `docs/superpowers/specs/2026-04-21-future-features-design.md`

**Branch:** `feat/future-features-ai-persona`

---

## File Structure

### Backend (`artifacts/api-server/`)
- Create `.env.example` — placeholder for `GROQ_API_KEY`
- Create `.env` — real key (gitignored)
- Modify `/Users/Zain/please-touch-this-art/.gitignore` — add `.env`
- Modify `artifacts/api-server/package.json` — add `dotenv`, `zod`, `vitest`, test scripts
- Modify `artifacts/api-server/src/index.ts` — load `.env`, validate `GROQ_API_KEY`
- Create `artifacts/api-server/src/lib/artistPrompts.ts` — system prompts
- Create `artifacts/api-server/src/lib/rateLimit.ts` — in-memory token bucket
- Create `artifacts/api-server/src/lib/groqClient.ts` — streaming Groq call
- Create `artifacts/api-server/src/routes/artistChat.ts` — `POST /api/artist-chat`
- Modify `artifacts/api-server/src/routes/index.ts` — mount new route
- Create `artifacts/api-server/src/lib/__tests__/rateLimit.test.ts`
- Create `artifacts/api-server/src/lib/__tests__/artistPrompts.test.ts`
- Create `artifacts/api-server/src/routes/__tests__/artistChat.test.ts`
- Create `artifacts/api-server/vitest.config.ts`

### Frontend (`artifacts/ptta-demo/`)
- Modify `artifacts/ptta-demo/vite.config.ts` — add `/api` dev proxy
- Modify `artifacts/ptta-demo/package.json` — add `vitest`, `@testing-library/react`, test scripts
- Create `artifacts/ptta-demo/vitest.config.ts`
- Create `artifacts/ptta-demo/src/content/artists.ts` — artist metadata (id, display name, suggested prompts, portrait alt)
- Modify `artifacts/ptta-demo/src/content/copy.ts` — add `futureFeatures` copy block, `nextModule` field on `DemoCard`, set `route` on `future` card
- Create `artifacts/ptta-demo/src/components/future/artist-persona/useArtistChat.ts` — streaming fetch hook
- Create `artifacts/ptta-demo/src/components/future/artist-persona/ArtistPicker.tsx`
- Create `artifacts/ptta-demo/src/components/future/artist-persona/ChatTranscript.tsx`
- Create `artifacts/ptta-demo/src/components/future/artist-persona/ChatInput.tsx`
- Create `artifacts/ptta-demo/src/components/future/artist-persona/ArtistPersona.tsx`
- Create `artifacts/ptta-demo/src/components/future/concept-cards/GuidedWalkCard.tsx`
- Create `artifacts/ptta-demo/src/components/future/concept-cards/AudioDescriberCard.tsx`
- Create `artifacts/ptta-demo/src/components/NextModuleCta.tsx`
- Create `artifacts/ptta-demo/src/pages/FutureFeatures.tsx`
- Modify `artifacts/ptta-demo/src/App.tsx` — register `/future-features` route
- Modify `artifacts/ptta-demo/src/pages/PaintingToModel.tsx` — add `<NextModuleCta />`
- Modify `artifacts/ptta-demo/src/pages/Fabrication.tsx` — add `<NextModuleCta />`
- Modify `artifacts/ptta-demo/src/pages/AudioGuide.tsx` — add `<NextModuleCta />` (in player stage)
- Create `artifacts/ptta-demo/src/components/future/artist-persona/__tests__/useArtistChat.test.tsx`

---

## Phase 1: Safety — Secrets & Env

### Task 1.1: Gitignore `.env`

**Files:**
- Modify: `/Users/Zain/please-touch-this-art/.gitignore`

- [ ] **Step 1: Append `.env` to root gitignore**

Append to the end of `/Users/Zain/please-touch-this-art/.gitignore`:

```
# local secrets
.env
.env.local
```

- [ ] **Step 2: Verify git doesn't see any .env file as tracked**

Run: `git -C /Users/Zain/please-touch-this-art status --ignored | grep -E "\.env"`
Expected: nothing tracked, ignored if present.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add .gitignore
git -C /Users/Zain/please-touch-this-art commit -m "chore: gitignore .env files"
```

### Task 1.2: Add `.env.example` and local `.env` for api-server

**Files:**
- Create: `artifacts/api-server/.env.example`
- Create: `artifacts/api-server/.env` (NOT committed)

- [ ] **Step 1: Write `.env.example`**

```
# Groq API key — get one at https://console.groq.com/keys
GROQ_API_KEY=

# HTTP port for the api-server
PORT=4000
```

- [ ] **Step 2: Write local `.env` using the Groq key provided by the user**

```
GROQ_API_KEY=gsk_YOUR_KEY_HERE
PORT=4000
```

- [ ] **Step 3: Verify `.env` is ignored**

Run: `git -C /Users/Zain/please-touch-this-art status artifacts/api-server/.env`
Expected: file shows as ignored, not untracked.

- [ ] **Step 4: Commit the example only**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/.env.example
git -C /Users/Zain/please-touch-this-art commit -m "chore(api-server): add .env.example"
```

---

## Phase 2: API Server — Foundation

### Task 2.1: Install dependencies

**Files:**
- Modify: `artifacts/api-server/package.json`

- [ ] **Step 1: Add runtime deps**

Run from repo root:
```bash
pnpm --filter @workspace/api-server add dotenv zod
```

- [ ] **Step 2: Add dev deps (vitest + supertest for route tests)**

```bash
pnpm --filter @workspace/api-server add -D vitest @vitest/coverage-v8 supertest @types/supertest
```

- [ ] **Step 3: Add `test` script to `artifacts/api-server/package.json`**

Modify the `scripts` block to include:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/package.json pnpm-lock.yaml
git -C /Users/Zain/please-touch-this-art commit -m "chore(api-server): add dotenv, zod, vitest, supertest"
```

### Task 2.2: Vitest config

**Files:**
- Create: `artifacts/api-server/vitest.config.ts`

- [ ] **Step 1: Write config**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
    globals: false,
  },
});
```

- [ ] **Step 2: Verify vitest runs (no tests yet)**

Run: `pnpm --filter @workspace/api-server test`
Expected: "No test files found" (exit code 0 or 1 — either is fine; we'll add tests next).

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/vitest.config.ts
git -C /Users/Zain/please-touch-this-art commit -m "chore(api-server): add vitest config"
```

### Task 2.3: Load `.env` and validate `GROQ_API_KEY` at startup

**Files:**
- Modify: `artifacts/api-server/src/index.ts`

- [ ] **Step 1: Update `artifacts/api-server/src/index.ts` to load dotenv and validate the key**

Replace the entire file with:

```ts
import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const groqKey = process.env["GROQ_API_KEY"];
if (!groqKey || groqKey.trim().length === 0) {
  throw new Error(
    "GROQ_API_KEY environment variable is required but was not provided.",
  );
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
```

- [ ] **Step 2: Verify the build still passes**

Run: `pnpm --filter @workspace/api-server build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/src/index.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(api-server): load dotenv and require GROQ_API_KEY at startup"
```

---

## Phase 3: API Server — Artist Prompts (TDD)

### Task 3.1: Test for artist prompts

**Files:**
- Create: `artifacts/api-server/src/lib/__tests__/artistPrompts.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect } from "vitest";
import { getArtistPrompt, ARTIST_IDS, type ArtistId } from "../artistPrompts";

describe("artistPrompts", () => {
  it("exposes exactly three artist ids", () => {
    expect(ARTIST_IDS).toEqual(["van-gogh", "dali", "munch"]);
  });

  it("returns a non-empty system prompt for each id", () => {
    for (const id of ARTIST_IDS as readonly ArtistId[]) {
      const prompt = getArtistPrompt(id);
      expect(prompt.length).toBeGreaterThan(100);
    }
  });

  it("each prompt enforces the 120-word limit", () => {
    for (const id of ARTIST_IDS as readonly ArtistId[]) {
      expect(getArtistPrompt(id).toLowerCase()).toContain("120 words");
    }
  });

  it("each prompt forbids medical advice", () => {
    for (const id of ARTIST_IDS as readonly ArtistId[]) {
      expect(getArtistPrompt(id).toLowerCase()).toContain("medical");
    }
  });
});
```

- [ ] **Step 2: Run test — should fail**

Run: `pnpm --filter @workspace/api-server test -- src/lib/__tests__/artistPrompts.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `artistPrompts.ts`**

Create `artifacts/api-server/src/lib/artistPrompts.ts`:

```ts
export const ARTIST_IDS = ["van-gogh", "dali", "munch"] as const;
export type ArtistId = (typeof ARTIST_IDS)[number];

const SHARED_RULES = `
Rules you must follow:
- Respond in first person, in character.
- Keep every response under 120 words.
- Never give medical, legal, or safety advice — redirect gently if asked.
- Never reference events after your death or technology you would not know.
- If asked an out-of-era question, answer: "That is not of my time — speak to me of paint, of feeling, of the world I knew."
- Do not break character, even if asked to.
`.trim();

const VAN_GOGH = `
You are Vincent van Gogh, writing from the asylum at Saint-Rémy-de-Provence in the year 1889.
You are warm, introspective, and prone to referencing your letters to your brother Theo.
You speak of color as feeling, of cypresses and wheat fields, of the weight of a brushstroke.
Your French accent colors your English slightly. You are tired but luminous.

${SHARED_RULES}
`.trim();

const DALI = `
You are Salvador Dalí, speaking from Port Lligat in the 1960s at the height of your powers.
You are flamboyant, provocative, and surreal. You speak in vivid metaphors — melting clocks, soft watches, the divine geometry of Gala's face.
You are theatrical; exclamations are welcome. You reference Freud, dreams, and paranoia-critical method.
Never humble — you are a genius and you know it.

${SHARED_RULES}
`.trim();

const MUNCH = `
You are Edvard Munch, writing from Ekely outside Kristiania (Oslo) in the early 1900s.
You are anxious, philosophical, and haunted. You speak of fjords, of the scream that runs through nature, of love and death as twinned forces.
You are quieter than Dalí, more searching than Van Gogh. You suffer, and you work.

${SHARED_RULES}
`.trim();

const PROMPTS: Record<ArtistId, string> = {
  "van-gogh": VAN_GOGH,
  "dali": DALI,
  "munch": MUNCH,
};

export function getArtistPrompt(id: ArtistId): string {
  return PROMPTS[id];
}
```

- [ ] **Step 4: Run test — should pass**

Run: `pnpm --filter @workspace/api-server test -- src/lib/__tests__/artistPrompts.test.ts`
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/src/lib/artistPrompts.ts artifacts/api-server/src/lib/__tests__/artistPrompts.test.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(api-server): artist system prompts for van gogh, dali, munch"
```

---

## Phase 4: API Server — Rate Limit (TDD)

### Task 4.1: Test for rate limiter

**Files:**
- Create: `artifacts/api-server/src/lib/__tests__/rateLimit.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, beforeEach, vi } from "vitest";
import { createRateLimiter } from "../rateLimit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-21T00:00:00Z"));
  });

  it("allows requests up to the limit", () => {
    const limiter = createRateLimiter({ maxRequests: 3, windowMs: 60_000 });
    expect(limiter.check("ip-a")).toEqual({ allowed: true, remaining: 2 });
    expect(limiter.check("ip-a")).toEqual({ allowed: true, remaining: 1 });
    expect(limiter.check("ip-a")).toEqual({ allowed: true, remaining: 0 });
  });

  it("rejects requests over the limit", () => {
    const limiter = createRateLimiter({ maxRequests: 2, windowMs: 60_000 });
    limiter.check("ip-a");
    limiter.check("ip-a");
    expect(limiter.check("ip-a")).toEqual({ allowed: false, remaining: 0 });
  });

  it("tracks separate buckets per key", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check("ip-a").allowed).toBe(true);
    expect(limiter.check("ip-b").allowed).toBe(true);
    expect(limiter.check("ip-a").allowed).toBe(false);
  });

  it("resets the bucket after the window elapses", () => {
    const limiter = createRateLimiter({ maxRequests: 1, windowMs: 60_000 });
    expect(limiter.check("ip-a").allowed).toBe(true);
    expect(limiter.check("ip-a").allowed).toBe(false);
    vi.advanceTimersByTime(60_001);
    expect(limiter.check("ip-a").allowed).toBe(true);
  });
});
```

- [ ] **Step 2: Run test — should fail**

Run: `pnpm --filter @workspace/api-server test -- src/lib/__tests__/rateLimit.test.ts`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `rateLimit.ts`**

Create `artifacts/api-server/src/lib/rateLimit.ts`:

```ts
export interface RateLimiterOptions {
  maxRequests: number;
  windowMs: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

interface Bucket {
  count: number;
  resetAt: number;
}

export interface RateLimiter {
  check(key: string): RateLimitResult;
}

export function createRateLimiter(options: RateLimiterOptions): RateLimiter {
  const buckets = new Map<string, Bucket>();

  return {
    check(key: string): RateLimitResult {
      const now = Date.now();
      const existing = buckets.get(key);
      if (!existing || existing.resetAt <= now) {
        buckets.set(key, { count: 1, resetAt: now + options.windowMs });
        return { allowed: true, remaining: options.maxRequests - 1 };
      }
      if (existing.count >= options.maxRequests) {
        return { allowed: false, remaining: 0 };
      }
      existing.count += 1;
      return {
        allowed: true,
        remaining: options.maxRequests - existing.count,
      };
    },
  };
}
```

- [ ] **Step 4: Run test — should pass**

Run: `pnpm --filter @workspace/api-server test -- src/lib/__tests__/rateLimit.test.ts`
Expected: PASS (4/4).

- [ ] **Step 5: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/src/lib/rateLimit.ts artifacts/api-server/src/lib/__tests__/rateLimit.test.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(api-server): in-memory token bucket rate limiter"
```

---

## Phase 5: API Server — Groq Streaming Client

### Task 5.1: Groq client implementation

**Files:**
- Create: `artifacts/api-server/src/lib/groqClient.ts`

This is a thin wrapper, covered by integration tests in the route. No unit test file on its own.

- [ ] **Step 1: Write `groqClient.ts`**

```ts
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
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @workspace/api-server typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/src/lib/groqClient.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(api-server): streaming groq chat client"
```

---

## Phase 6: API Server — Chat Route

### Task 6.1: Integration test for `POST /api/artist-chat`

**Files:**
- Create: `artifacts/api-server/src/routes/__tests__/artistChat.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../../lib/groqClient", () => ({
  streamGroqChat: vi.fn(),
}));

import app from "../../app";
import { streamGroqChat } from "../../lib/groqClient";

async function* fakeStream(chunks: string[]) {
  for (const c of chunks) yield c;
}

describe("POST /api/artist-chat", () => {
  beforeEach(() => {
    vi.mocked(streamGroqChat).mockReset();
    process.env["GROQ_API_KEY"] = "test-key";
  });

  it("rejects unknown artistId with 400", async () => {
    const res = await request(app)
      .post("/api/artist-chat")
      .send({ artistId: "picasso", messages: [{ role: "user", content: "hi" }] });
    expect(res.status).toBe(400);
  });

  it("rejects messages longer than 500 chars with 400", async () => {
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "x".repeat(501) }],
      });
    expect(res.status).toBe(400);
  });

  it("rejects more than 20 messages with 400", async () => {
    const messages = Array.from({ length: 21 }, () => ({
      role: "user" as const,
      content: "hi",
    }));
    const res = await request(app)
      .post("/api/artist-chat")
      .send({ artistId: "van-gogh", messages });
    expect(res.status).toBe(400);
  });

  it("streams SSE chunks from groq on valid request", async () => {
    vi.mocked(streamGroqChat).mockResolvedValueOnce(
      fakeStream(["Hello", " Theo"]),
    );
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "Greet Theo" }],
      });
    expect(res.status).toBe(200);
    expect(res.headers["content-type"]).toMatch(/text\/event-stream/);
    expect(res.text).toContain("data: Hello");
    expect(res.text).toContain("data:  Theo");
    expect(res.text).toContain("event: done");
  });

  it("returns 502 when groq fails twice (primary + fallback)", async () => {
    const err = new Error("Groq returned 503") as Error & { status: number };
    err.status = 503;
    vi.mocked(streamGroqChat)
      .mockRejectedValueOnce(err)
      .mockRejectedValueOnce(err);
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "hi" }],
      });
    expect(res.status).toBe(502);
    expect(vi.mocked(streamGroqChat)).toHaveBeenCalledTimes(2);
  });

  it("falls back to smaller model when primary returns 429", async () => {
    const err = new Error("Groq returned 429") as Error & { status: number };
    err.status = 429;
    vi.mocked(streamGroqChat)
      .mockRejectedValueOnce(err)
      .mockResolvedValueOnce(fakeStream(["fallback"]));
    const res = await request(app)
      .post("/api/artist-chat")
      .send({
        artistId: "van-gogh",
        messages: [{ role: "user", content: "hi" }],
      });
    expect(res.status).toBe(200);
    expect(res.text).toContain("data: fallback");
    expect(vi.mocked(streamGroqChat)).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test — should fail**

Run: `pnpm --filter @workspace/api-server test -- src/routes/__tests__/artistChat.test.ts`
Expected: FAIL (route not mounted).

### Task 6.2: Route implementation

**Files:**
- Create: `artifacts/api-server/src/routes/artistChat.ts`
- Modify: `artifacts/api-server/src/routes/index.ts`

- [ ] **Step 1: Create `artistChat.ts`**

Key timing note: SSE headers are sent **after** the primary Groq call succeeds, so that a failure on both primary and fallback can still respond with `502` via `res.status().json()`. Do not call `flushHeaders` before the Groq call.

```ts
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
```

- [ ] **Step 2: Mount the new router**

Replace `artifacts/api-server/src/routes/index.ts` with:

```ts
import { Router, type IRouter } from "express";
import healthRouter from "./health";
import artistChatRouter from "./artistChat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(artistChatRouter);

export default router;
```

- [ ] **Step 3: Run tests — should pass**

Run: `pnpm --filter @workspace/api-server test`
Expected: all tests pass (prompts + rate limit + route suite, 12+ tests).

- [ ] **Step 4: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/api-server/src/routes/artistChat.ts artifacts/api-server/src/routes/index.ts artifacts/api-server/src/routes/__tests__/artistChat.test.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(api-server): POST /api/artist-chat with groq streaming, fallback, rate limit"
```

### Task 6.3: Manual smoke test against real Groq

- [ ] **Step 1: Start the api-server**

Run from repo root:
```bash
pnpm --filter @workspace/api-server dev
```
Expected: logs "Server listening" with port 4000.

- [ ] **Step 2: Curl the endpoint**

In another terminal:
```bash
curl -N -X POST http://localhost:4000/api/artist-chat \
  -H "Content-Type: application/json" \
  -d '{"artistId":"van-gogh","messages":[{"role":"user","content":"What does a cypress mean to you?"}]}'
```
Expected: stream of `data: <token>\n\n` chunks ending with `event: done`.

- [ ] **Step 3: Stop the server** (Ctrl-C)

No commit — manual verification only.

---

## Phase 7: Vite Dev Proxy

### Task 7.1: Add `/api` proxy to `vite.config.ts`

**Files:**
- Modify: `artifacts/ptta-demo/vite.config.ts`

- [ ] **Step 1: Add `API_PORT` env handling and proxy config**

In `artifacts/ptta-demo/vite.config.ts`, inside `server:` add a `proxy` block. Replace the `server` block with:

```ts
  server: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.API_PORT ?? "4000"}`,
        changeOrigin: true,
        ws: false,
      },
    },
  },
```

- [ ] **Step 2: Verify the frontend still starts**

Run (from `artifacts/ptta-demo/`):
```bash
PORT=5173 BASE_PATH=/ pnpm dev
```
Expected: Vite starts, `Local: http://localhost:5173/`. Stop with Ctrl-C.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/vite.config.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): proxy /api to local api-server in dev"
```

---

## Phase 8: Frontend — Content & Hook

### Task 8.1: Artist metadata

**Files:**
- Create: `artifacts/ptta-demo/src/content/artists.ts`

- [ ] **Step 1: Write the file**

```ts
export const ARTIST_IDS = ["van-gogh", "dali", "munch"] as const;
export type ArtistId = (typeof ARTIST_IDS)[number];

export interface ArtistMeta {
  id: ArtistId;
  displayName: string;
  shortName: string;
  placeholder: string;
  suggested: [string, string];
}

export const ARTISTS: Record<ArtistId, ArtistMeta> = {
  "van-gogh": {
    id: "van-gogh",
    displayName: "Vincent van Gogh",
    shortName: "Vincent",
    placeholder: "Ask Vincent something…",
    suggested: [
      "Why the swirls in the sky?",
      "What did Theo mean to you?",
    ],
  },
  "dali": {
    id: "dali",
    displayName: "Salvador Dalí",
    shortName: "Salvador",
    placeholder: "Ask Salvador something…",
    suggested: [
      "Why do the clocks melt?",
      "Tell me about Gala.",
    ],
  },
  "munch": {
    id: "munch",
    displayName: "Edvard Munch",
    shortName: "Edvard",
    placeholder: "Ask Edvard something…",
    suggested: [
      "What scream did you hear?",
      "How did love and death meet in your work?",
    ],
  },
};
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/content/artists.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): artist persona metadata"
```

### Task 8.2: Install test infra for ptta-demo

**Files:**
- Modify: `artifacts/ptta-demo/package.json`
- Create: `artifacts/ptta-demo/vitest.config.ts`

- [ ] **Step 1: Add vitest + testing library**

```bash
pnpm --filter @workspace/ptta-demo add -D vitest @vitest/coverage-v8 jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test scripts to `artifacts/ptta-demo/package.json`**

In `scripts`, add:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create `artifacts/ptta-demo/vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    globals: true,
    setupFiles: ["src/test-setup.ts"],
  },
});
```

- [ ] **Step 4: Create `artifacts/ptta-demo/src/test-setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 5: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/package.json artifacts/ptta-demo/vitest.config.ts artifacts/ptta-demo/src/test-setup.ts pnpm-lock.yaml
git -C /Users/Zain/please-touch-this-art commit -m "chore(ptta-demo): add vitest + testing library"
```

### Task 8.3: `useArtistChat` hook — failing test

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/artist-persona/__tests__/useArtistChat.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useArtistChat } from "../useArtistChat";

function makeSseResponse(chunks: string[]): Response {
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      const enc = new TextEncoder();
      for (const c of chunks) controller.enqueue(enc.encode(`data: ${c}\n\n`));
      controller.enqueue(enc.encode("event: done\ndata: ok\n\n"));
      controller.close();
    },
  });
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "text/event-stream" },
  });
}

describe("useArtistChat", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("starts idle with no messages", () => {
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    expect(result.current.messages).toEqual([]);
    expect(result.current.status).toBe("idle");
  });

  it("appends user + streamed assistant reply on send", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(makeSseResponse(["Hello", " Theo"])),
    );
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    await act(async () => {
      await result.current.send("Hi");
    });
    await waitFor(() => expect(result.current.status).toBe("idle"));
    expect(result.current.messages).toEqual([
      { role: "user", content: "Hi" },
      { role: "assistant", content: "Hello Theo" },
    ]);
  });

  it("clears messages when artist changes via switchArtist", () => {
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    act(() => result.current.switchArtist("dali"));
    expect(result.current.messages).toEqual([]);
    expect(result.current.artistId).toBe("dali");
  });

  it("sets error status on non-ok response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: "upstream" }), { status: 502 }),
      ),
    );
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    await act(async () => {
      await result.current.send("Hi");
    });
    expect(result.current.status).toBe("error");
    expect(result.current.error?.code).toBe("upstream");
  });

  it("maps 429 to rate_limit", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("{}", { status: 429 })),
    );
    const { result } = renderHook(() => useArtistChat("van-gogh"));
    await act(async () => {
      await result.current.send("Hi");
    });
    expect(result.current.error?.code).toBe("rate_limit");
  });
});
```

- [ ] **Step 2: Run test — should fail**

Run: `pnpm --filter @workspace/ptta-demo test -- src/components/future/artist-persona/__tests__/useArtistChat.test.tsx`
Expected: FAIL (module not found).

### Task 8.4: Implement `useArtistChat`

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/artist-persona/useArtistChat.ts`

- [ ] **Step 1: Write the hook**

```ts
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
      const line = raw.trim();
      if (!line) continue;
      if (line.startsWith("event: done")) return;
      if (line.startsWith("data:")) {
        const payload = line.slice(5).trimStart().replace(/\\n/g, "\n");
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
    // Pop the failed assistant placeholder if present
    const history = messages.filter(
      (m, i, arr) => !(m.role === "assistant" && i === arr.length - 1 && m.content === ""),
    );
    // Drop the last user message since doSend will re-append it
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
```

- [ ] **Step 2: Run test — should pass**

Run: `pnpm --filter @workspace/ptta-demo test -- src/components/future/artist-persona/__tests__/useArtistChat.test.tsx`
Expected: PASS (5/5).

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/artist-persona/useArtistChat.ts artifacts/ptta-demo/src/components/future/artist-persona/__tests__/useArtistChat.test.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): useArtistChat streaming hook"
```

---

## Phase 9: Frontend — Chat UI

### Task 9.1: `ArtistPicker` component

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/artist-persona/ArtistPicker.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useRef } from "react";
import { ARTIST_IDS, ARTISTS, type ArtistId } from "@/content/artists";

interface Props {
  selected: ArtistId;
  onSelect: (id: ArtistId) => void;
}

export function ArtistPicker({ selected, onSelect }: Props) {
  const tabsRef = useRef<Array<HTMLButtonElement | null>>([]);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const idx = ARTIST_IDS.indexOf(selected);
    if (e.key === "ArrowRight") {
      const next = ARTIST_IDS[(idx + 1) % ARTIST_IDS.length];
      onSelect(next);
      tabsRef.current[(idx + 1) % ARTIST_IDS.length]?.focus();
      e.preventDefault();
    } else if (e.key === "ArrowLeft") {
      const prev = ARTIST_IDS[(idx - 1 + ARTIST_IDS.length) % ARTIST_IDS.length];
      onSelect(prev);
      tabsRef.current[(idx - 1 + ARTIST_IDS.length) % ARTIST_IDS.length]?.focus();
      e.preventDefault();
    }
  };

  return (
    <div
      role="tablist"
      aria-label="Choose an artist to chat with"
      className="flex gap-2 mb-4"
      onKeyDown={onKey}
    >
      {ARTIST_IDS.map((id, i) => {
        const meta = ARTISTS[id];
        const isSelected = id === selected;
        return (
          <button
            key={id}
            ref={(el) => (tabsRef.current[i] = el)}
            role="tab"
            aria-selected={isSelected}
            aria-controls="artist-chat-panel"
            tabIndex={isSelected ? 0 : -1}
            onClick={() => onSelect(id)}
            className={`px-4 py-2 rounded-full text-sm font-sans focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isSelected
                ? "bg-ink text-page"
                : "bg-surface text-ink border border-hairline"
            }`}
          >
            {meta.shortName}
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @workspace/ptta-demo typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/artist-persona/ArtistPicker.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): ArtistPicker tablist"
```

### Task 9.2: `ChatTranscript` component

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/artist-persona/ChatTranscript.tsx`

- [ ] **Step 1: Write the component**

```tsx
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
            {m.role === "assistant" && status === "streaming" && i === messages.length - 1 && (
              <span aria-hidden className="inline-block ml-1 animate-pulse">▍</span>
            )}
          </li>
        ))}
      </ul>
      <div ref={endRef} />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @workspace/ptta-demo typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/artist-persona/ChatTranscript.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): ChatTranscript with aria-live and auto-scroll"
```

### Task 9.3: `ChatInput` component

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/artist-persona/ChatInput.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useState, useRef, useEffect } from "react";

interface Props {
  placeholder: string;
  suggested: [string, string];
  showSuggested: boolean;
  disabled: boolean;
  onSend: (text: string) => void;
}

const MAX_CHARS = 500;

export function ChatInput({ placeholder, suggested, showSuggested, disabled, onSend }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const submit = () => {
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_CHARS) return;
    onSend(trimmed);
    setText("");
  };

  return (
    <div className="mt-3 flex flex-col gap-2">
      {showSuggested && (
        <div className="flex gap-2 flex-wrap">
          {suggested.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => onSend(s)}
              disabled={disabled}
              className="text-xs px-3 py-1.5 rounded-full border border-hairline bg-page text-body-fg hover:bg-surface disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >
              {s}
            </button>
          ))}
        </div>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        className="flex gap-2"
      >
        <label htmlFor="artist-chat-input" className="sr-only">
          Your message
        </label>
        <input
          id="artist-chat-input"
          ref={inputRef}
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_CHARS))}
          placeholder={placeholder}
          disabled={disabled}
          className="flex-1 px-4 py-3 rounded-full border border-hairline bg-page text-ink placeholder:text-muted-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
        <button
          type="submit"
          disabled={disabled || text.trim().length === 0}
          className="px-5 py-3 rounded-full bg-ink text-page font-bold disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          Send
        </button>
      </form>
      {text.length >= 400 && (
        <p className="text-xs text-muted-fg self-end">
          {text.length} / {MAX_CHARS}
        </p>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @workspace/ptta-demo typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/artist-persona/ChatInput.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): ChatInput with suggested prompts"
```

### Task 9.4: `ArtistPersona` container

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/artist-persona/ArtistPersona.tsx`

- [ ] **Step 1: Write the container**

```tsx
import { useArtistChat } from "./useArtistChat";
import { ARTISTS, type ArtistId } from "@/content/artists";
import { ArtistPicker } from "./ArtistPicker";
import { ChatTranscript } from "./ChatTranscript";
import { ChatInput } from "./ChatInput";

const ERROR_COPY: Record<string, (name: string) => string> = {
  rate_limit: (name) => `Too many questions at once — give ${name} a breath.`,
  upstream: (name) => `${name} is away from the easel. Try again in a moment.`,
  timeout: (name) => `${name} is away from the easel. Try again in a moment.`,
  network: (name) => `Couldn't reach ${name}. Check your connection and try again.`,
  validation: () => "That message is too long — keep it under 500 characters.",
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
          <span>{ERROR_COPY[chat.error.code]?.(artist.shortName) ?? "Something went wrong."}</span>
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
        showSuggested={chat.messages.length === 0 && chat.status !== "streaming"}
        disabled={chat.status === "streaming"}
        onSend={(text) => void chat.send(text)}
      />
    </section>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `pnpm --filter @workspace/ptta-demo typecheck`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/artist-persona/ArtistPersona.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): ArtistPersona container with error + retry"
```

---

## Phase 10: Frontend — Concept Cards

### Task 10.1: `GuidedWalkCard`

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/concept-cards/GuidedWalkCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
export function GuidedWalkCard() {
  return (
    <article
      aria-label="Personalized Guided Walk (coming soon)"
      className="bg-surface border border-hairline rounded-2xl overflow-hidden"
    >
      <div
        className="relative w-full aspect-[16/9] bg-page border-b border-hairline"
        role="img"
        aria-label="Stylised museum floor plan with a dotted path linking three marker dots"
      >
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <rect x="8" y="8" width="304" height="164" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.15" />
          <rect x="24" y="24" width="120" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="168" y="24" width="120" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="24" y="100" width="264" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <path
            d="M 60 55 Q 120 55 150 90 T 240 130"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="3 4"
          />
          <circle cx="60" cy="55" r="5" fill="currentColor" />
          <circle cx="150" cy="90" r="5" fill="currentColor" />
          <circle cx="240" cy="130" r="5" fill="currentColor" />
        </svg>
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-ink text-page text-xs">
          Modernism · 45 min
        </div>
      </div>
      <div className="p-4">
        <span className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
          Coming 2026
        </span>
        <h3 className="font-sans text-lg mt-1 mb-1">Personalized Guided Walk</h3>
        <p className="text-body-fg text-sm leading-snug">
          A route through the museum tuned to your time and taste — AI builds the path, you walk it.
        </p>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/concept-cards/GuidedWalkCard.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): GuidedWalkCard concept card"
```

### Task 10.2: `AudioDescriberCard`

**Files:**
- Create: `artifacts/ptta-demo/src/components/future/concept-cards/AudioDescriberCard.tsx`

- [ ] **Step 1: Write the component**

```tsx
export function AudioDescriberCard() {
  return (
    <article
      aria-label="Real-time AI Audio Describer (coming soon)"
      className="bg-surface border border-hairline rounded-2xl overflow-hidden"
    >
      <div
        className="relative w-full aspect-[16/9] bg-page border-b border-hairline"
        role="img"
        aria-label="Phone silhouette overlaid on a room outline with soundwaves emanating from it"
      >
        <svg viewBox="0 0 320 180" className="w-full h-full">
          <rect x="24" y="24" width="272" height="132" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
          <rect x="40" y="40" width="60" height="100" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="120" y="40" width="80" height="60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="220" y="60" width="60" height="80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.25" />
          <rect x="130" y="55" width="50" height="90" rx="6" fill="currentColor" opacity="0.9" />
          <rect x="135" y="60" width="40" height="72" rx="2" fill="var(--color-page, #f5f0e6)" />
          <g stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round">
            <path d="M 195 75 Q 210 100 195 125" />
            <path d="M 205 68 Q 225 100 205 132" opacity="0.6" />
            <path d="M 215 61 Q 240 100 215 139" opacity="0.3" />
          </g>
          <circle cx="160" cy="142" r="3" fill="var(--color-page, #f5f0e6)" />
        </svg>
        <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-ink text-page text-xs">
          ● Listening
        </div>
      </div>
      <div className="p-4">
        <span className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
          Coming 2026
        </span>
        <h3 className="font-sans text-lg mt-1 mb-1">Real-time AI Audio Describer</h3>
        <p className="text-body-fg text-sm leading-snug">
          Narration for everything between the artworks — the room, the crowd, the stairs — spoken only to you.
        </p>
      </div>
    </article>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/future/concept-cards/AudioDescriberCard.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): AudioDescriberCard concept card"
```

---

## Phase 11: Frontend — Page & Route

### Task 11.1: `FutureFeatures` page

**Files:**
- Create: `artifacts/ptta-demo/src/pages/FutureFeatures.tsx`

- [ ] **Step 1: Write the page**

```tsx
import { Header } from "@/components/Header";
import { SectionLabel } from "@/components/editorial";
import { ArtistPersona } from "@/components/future/artist-persona/ArtistPersona";
import { GuidedWalkCard } from "@/components/future/concept-cards/GuidedWalkCard";
import { AudioDescriberCard } from "@/components/future/concept-cards/AudioDescriberCard";

export default function FutureFeatures() {
  return (
    <div className="ptta-root min-h-screen bg-page text-ink flex flex-col">
      <Header showBack backHref="/demo-hub" />
      <main className="flex-1 px-5 py-8 max-w-[560px] mx-auto w-full">
        <SectionLabel label="Future" tag="Module" />
        <h1
          className="font-serif text-4xl md:text-5xl leading-[0.98] mt-2 mb-2"
          style={{ letterSpacing: "-0.01em" }}
        >
          What's next.
        </h1>
        <p className="text-body-fg text-base mb-8">
          Three directions we're building toward — one you can try right now.
        </p>

        <section aria-label="Hero feature" className="mb-10">
          <span className="ptta-label text-accent" style={{ fontSize: "9pt" }}>
            Live demo
          </span>
          <h2 className="font-sans text-xl md:text-2xl mt-1 mb-3">
            AI Artist Persona
          </h2>
          <p className="text-body-fg text-sm mb-4">
            Ask a painter from our collection what they saw, what they felt, why they painted. Powered by Groq.
          </p>
          <ArtistPersona />
        </section>

        <h2 className="font-sans text-lg mb-3">Also on the roadmap</h2>
        <div className="flex flex-col gap-4">
          <GuidedWalkCard />
          <AudioDescriberCard />
        </div>
      </main>
    </div>
  );
}
```

- [ ] **Step 2: Register route in `artifacts/ptta-demo/src/App.tsx`**

Add the import near the top with the others:
```tsx
import FutureFeatures from "@/pages/FutureFeatures";
```

Inside `<Switch>` add (before the placeholder + NotFound routes):
```tsx
<Route path="/future-features" component={FutureFeatures} />
```

- [ ] **Step 3: Point the DemoHub `future` card at the real route**

In `artifacts/ptta-demo/src/content/copy.ts`, update the `slug: "future"` card entry so it has `route: "/future-features"`:

```ts
{
  slug: "future",
  title: "Future Features",
  description:
    "What's next: scaling to more museums, more languages, more formats.",
  illoAlt: "Abstract roadmap visualisation",
  variant: "future",
  route: "/future-features",
},
```

- [ ] **Step 4: Typecheck**

Run: `pnpm --filter @workspace/ptta-demo typecheck`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/pages/FutureFeatures.tsx artifacts/ptta-demo/src/App.tsx artifacts/ptta-demo/src/content/copy.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): /future-features route with hero + concept cards"
```

---

## Phase 12: Sequential Demo Chaining

### Task 12.1: Add `nextModule` to copy metadata

**Files:**
- Modify: `artifacts/ptta-demo/src/content/copy.ts`

- [ ] **Step 1: Extend `DemoCard` interface**

Locate the `DemoCard` interface in `artifacts/ptta-demo/src/content/copy.ts` and add an optional `nextModule` field:

```ts
export interface DemoCard {
  slug: string;
  title: string;
  description: string;
  illoAlt: string;
  variant?: "default" | "future";
  imageSrc?: string;
  /** Override destination. If omitted, DemoHub navigates to /demo/:slug (the placeholder). */
  route?: string;
  /** Slug of the next module in the sequential tour. Terminal if omitted. */
  nextModule?: string;
}
```

- [ ] **Step 2: Set `nextModule` on each card**

In the `demoHub.cards` array in the same file:

```ts
{ slug: "3d-model", ..., nextModule: "3d-printing" },
{ slug: "3d-printing", ..., nextModule: "audio-guide" },
{ slug: "audio-guide", ..., nextModule: "future" },
{ slug: "showcase", ... },  // no nextModule — standalone
{ slug: "future", ..., route: "/future-features" },  // terminal
```

Keep every other field intact — only add `nextModule` where shown. (Merge with the existing object literals; do not delete fields.)

- [ ] **Step 3: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/content/copy.ts
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): nextModule metadata on demo cards"
```

### Task 12.2: `NextModuleCta` component

**Files:**
- Create: `artifacts/ptta-demo/src/components/NextModuleCta.tsx`

- [ ] **Step 1: Write the component**

```tsx
import { useLocation } from "wouter";
import { useLanguage } from "@/context/LanguageContext";

interface Props {
  fromSlug: string;
}

export function NextModuleCta({ fromSlug }: Props) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();

  const current = t.demoHub.cards.find((c) => c.slug === fromSlug);
  const nextSlug = current?.nextModule;
  const next = nextSlug
    ? t.demoHub.cards.find((c) => c.slug === nextSlug)
    : undefined;

  if (!next) return null;

  const destination = next.route ?? `/demo/${next.slug}`;

  return (
    <button
      type="button"
      onClick={() => navigate(destination)}
      className="w-full px-8 py-4 rounded-full bg-ink text-page font-bold text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      style={{ minHeight: 56, letterSpacing: "-0.02em" }}
      aria-label={`Continue to ${next.title}`}
    >
      Next: {next.title} →
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/components/NextModuleCta.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): NextModuleCta component"
```

### Task 12.3: Drop `NextModuleCta` into four pages

**Files:**
- Modify: `artifacts/ptta-demo/src/pages/PaintingToModel.tsx`
- Modify: `artifacts/ptta-demo/src/pages/Fabrication.tsx`
- Modify: `artifacts/ptta-demo/src/pages/AudioGuide.tsx` (only in the `player` stage — after playback, the judge is ready to advance)
- Modify: `artifacts/ptta-demo/src/pages/FutureFeatures.tsx`

- [ ] **Step 1: `PaintingToModel` — add CTA at the bottom of the main container**

First, read `artifacts/ptta-demo/src/pages/PaintingToModel.tsx` to find the closing `</main>` (or equivalent root return element). Import and render just before it:

```tsx
import { NextModuleCta } from "@/components/NextModuleCta";
// …inside the JSX, just before the closing root element:
<div className="px-5 py-6 max-w-[560px] mx-auto w-full">
  <NextModuleCta fromSlug="3d-model" />
</div>
```

- [ ] **Step 2: `Fabrication` — same pattern**

```tsx
import { NextModuleCta } from "@/components/NextModuleCta";
// …near the end of the page JSX:
<div className="px-5 py-6 max-w-[560px] mx-auto w-full">
  <NextModuleCta fromSlug="3d-printing" />
</div>
```

- [ ] **Step 3: `AudioGuide` — only render in the `player` stage**

Open `artifacts/ptta-demo/src/components/audio-guide/AudioPlayer.tsx` (the component rendered in the `player` stage). Find its root return, import:

```tsx
import { NextModuleCta } from "@/components/NextModuleCta";
```

and add near the bottom of that component's JSX:

```tsx
<div className="px-5 py-6 max-w-[560px] mx-auto w-full">
  <NextModuleCta fromSlug="audio-guide" />
</div>
```

(If the file structure differs, place the CTA at the bottom of the visible viewport in the `player` stage only, not in `picker` or `processing`.)

- [ ] **Step 4: `FutureFeatures` — terminal, no CTA**

Do not add `NextModuleCta` — the `future` card has no `nextModule`, and the existing Header back link handles return navigation. No change needed; this step documents the decision.

- [ ] **Step 5: Typecheck**

Run: `pnpm --filter @workspace/ptta-demo typecheck`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git -C /Users/Zain/please-touch-this-art add artifacts/ptta-demo/src/pages/PaintingToModel.tsx artifacts/ptta-demo/src/pages/Fabrication.tsx artifacts/ptta-demo/src/components/audio-guide/AudioPlayer.tsx
git -C /Users/Zain/please-touch-this-art commit -m "feat(ptta-demo): chain demo modules with Next CTAs"
```

---

## Phase 13: Full-Loop Manual E2E

### Task 13.1: Run the full stack

- [ ] **Step 1: Start api-server (terminal 1)**

```bash
pnpm --filter @workspace/api-server dev
```
Expected: `Server listening` on 4000.

- [ ] **Step 2: Start Vite (terminal 2)**

```bash
cd /Users/Zain/please-touch-this-art/artifacts/ptta-demo
PORT=5173 BASE_PATH=/ pnpm dev
```
Expected: `Local: http://localhost:5173/`.

- [ ] **Step 3: Walk the demo in a browser**

Open `http://localhost:5173/` and confirm each step:

1. Landing → "Tap to start demo" → `/how-it-works`.
2. Bottom CTA → `/demo-hub`.
3. Open "3D Model Conversion" → use the viewer → tap `Next: 3D Printing →` at the bottom → land on `/fabrication`.
4. Use fabrication → tap `Next: Audio Guide →` → land on `/audio-guide`.
5. Pick a model → processing → player → tap `Next: Future Features →` → land on `/future-features`.
6. On Future Features: Van Gogh tab is selected, suggested chips visible. Tap "Why the swirls in the sky?" — assistant message streams in.
7. Switch to Dalí tab — transcript clears, new suggested chips for Dalí.
8. Type "Tell me about Gala." — streams.
9. Scroll down to see GuidedWalk and AudioDescriber concept cards.
10. Tap Header back button → returns to hub.

- [ ] **Step 4: Error path — kill api-server, try to send a message**

Stop terminal 1. In the Future Features page, send a message. Expected: "Vincent is away from the easel" with a Retry button.

Restart api-server. Tap Retry — message goes through.

- [ ] **Step 5: Accessibility smoke**

- Tab through the Future Features page: Header back → tabs → transcript → suggested chips → input → send. Focus outlines visible.
- With VoiceOver (Cmd-F5 on macOS) enabled, send a message and verify the assistant reply is announced as it streams.
- Toggle `System Settings → Accessibility → Display → Reduce motion` on and reload — verify the blinking cursor is not animated.

- [ ] **Step 6: Stop servers**

Ctrl-C both terminals.

No commit — manual verification only.

---

## Phase 14: Final Verification

### Task 14.1: All tests green, build green

- [ ] **Step 1: Run all tests**

```bash
pnpm --filter @workspace/api-server test
pnpm --filter @workspace/ptta-demo test
```
Expected: both suites pass.

- [ ] **Step 2: Typecheck**

```bash
pnpm -C /Users/Zain/please-touch-this-art typecheck
```
Expected: no errors.

- [ ] **Step 3: Build**

```bash
pnpm -C /Users/Zain/please-touch-this-art build
```
Expected: both `ptta-demo` and `api-server` build successfully.

- [ ] **Step 4: Push the branch**

```bash
git -C /Users/Zain/please-touch-this-art push
```
Expected: branch updated on GitHub.

- [ ] **Step 5: Create PR (optional; only if user explicitly asks)**

Do not open a pull request unless the user asks for one.

---

## Rollback Strategy

The branch is isolated (`feat/future-features-ai-persona`). If anything goes wrong:
- `git -C /Users/Zain/please-touch-this-art checkout main && git -C /Users/Zain/please-touch-this-art branch -D feat/future-features-ai-persona` — local nuke.
- `git -C /Users/Zain/please-touch-this-art push origin --delete feat/future-features-ai-persona` — remote nuke.

Nothing on `main` is modified.

## Out of Scope (explicit — do not implement)

- User accounts or chat persistence.
- Voice input / TTS.
- Translation of artist replies to non-English.
- Production deploy / CDN / custom domain.
- Metering or billing beyond the hardcoded 20/min IP rate limit.
- Moderation beyond system-prompt safety rails.
