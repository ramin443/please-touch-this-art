# Future Features Page + Demo Chaining

Date: 2026-04-21
Branch: `feat/future-features-ai-persona`
Context: Red Bull Basement competition submission

## Purpose

Turn the stub "Future Features" card in `DemoHub` into a real page that signals PTTA's AI ambition to Red Bull Basement judges in under 90 seconds. Ship one live, LLM-backed hero feature and two polished "coming soon" concept cards. Additionally, chain the existing demo modules sequentially so a judge tapping through the demo lands on Future Features as the narrative finale.

## Success Criteria

- A judge can open `/future-features` on a phone and get a streaming reply from "Vincent van Gogh" in under 1 second of first token.
- The page works offline of the Vite dev server only in the sense that all assets are local; the LLM call requires the api-server running and Groq reachable.
- The four existing demo pages (`/painting-to-model`, `/fabrication`, `/audio-guide`, and `/future-features` itself) form a forward-linked chain.
- No Groq key leaks into the client bundle, git history, or logs.

## Feature Set

### Hero: AI Artist Persona (real LLM, Groq)
A chat UI where the judge can pick one of three artists (Van Gogh, Dalí, Munch) and talk to them. Responses stream token-by-token from Groq (`llama-3.3-70b-versatile`, fallback to `llama-3.1-8b-instant` on 429/503). Each artist has a distinct system prompt that constrains voice, era awareness, and response length.

### Supporting Card 1: Personalized Guided Walk
Concept card, no interactivity. Flat SVG illustration of a museum floor plan with a dotted path connecting three marker dots, plus a preference pill ("Modernism · 45 min") at the top. One-sentence caption. "Coming 2026" label.

### Supporting Card 2: Real-time AI Audio Describer
Concept card, no interactivity. Flat SVG illustration of a phone silhouette with a room outline overlay and a soundwave emanating from it. One-sentence caption. "Coming 2026" label.

### Sequential Demo Chaining
Each demo module page gets a "Next: [module name] →" CTA at the bottom.

| From | Next |
|---|---|
| `/painting-to-model` | `/fabrication` |
| `/fabrication` | `/audio-guide` |
| `/audio-guide` | `/future-features` |
| `/future-features` | (terminal — "Return to hub" only) |

## Architecture

### Repository Layout Changes

```
artifacts/
  api-server/
    .env                              # gitignored — GROQ_API_KEY
    .env.example                      # committed placeholder
    src/
      routes/
        artistChat.ts                 # new: POST /api/artist-chat
        index.ts                      # mount new route
      lib/
        groqClient.ts                 # new: fetch wrapper + streaming
        artistPrompts.ts              # new: system prompts per artist
        rateLimit.ts                  # new: in-memory token bucket
  ptta-demo/
    vite.config.ts                    # updated: /api proxy to api-server
    src/
      content/
        artists.ts                    # new: artist metadata
        copy.ts                       # updated: nextModule per card, futureFeatures copy block
      components/
        NextModuleCta.tsx             # new: reusable "Next →" button
        future/
          artist-persona/
            ArtistPersona.tsx         # hero container
            ArtistPicker.tsx          # tab picker
            ChatTranscript.tsx        # message list
            ChatInput.tsx             # input + send + chips
            useArtistChat.ts          # streaming fetch hook
          concept-cards/
            GuidedWalkCard.tsx        # SVG + copy
            AudioDescriberCard.tsx    # SVG + copy
      pages/
        FutureFeatures.tsx            # new page
      App.tsx                         # updated: add /future-features route
docs/
  superpowers/
    specs/
      2026-04-21-future-features-design.md   # this file
```

### Data Flow — Artist Chat

```
[ChatInput] --submit--> [useArtistChat]
                          |
                          | POST /api/artist-chat
                          | body: { artistId, messages }
                          v
                     [Vite dev proxy]
                          |
                          v
                [api-server: /api/artist-chat]
                  - zod validate body
                  - rate-limit check (per IP)
                  - load system prompt by artistId
                  - call Groq (streaming)
                  - pipe tokens as SSE
                          |
                          v
                     [useArtistChat]
                  - accumulates tokens
                  - updates transcript state
                          |
                          v
                  [ChatTranscript renders]
                  - ARIA live region announces
```

### Backend: `POST /api/artist-chat`

Request body (zod-validated):
```ts
{
  artistId: "van-gogh" | "dali" | "munch",
  messages: Array<{
    role: "user" | "assistant",
    content: string  // max 500 chars per message
  }>  // max 20 messages total
}
```

Response: Server-Sent Events stream. Each event is a chunk of text. Terminal event is `event: done`.

Errors:
- `400` zod validation failure
- `429` rate limit exceeded (20 req/min/IP)
- `502` Groq upstream error (after fallback attempt)
- `504` Groq timeout (15s)

### Frontend: `useArtistChat` Hook

State:
```ts
{
  artistId: ArtistId,
  messages: Array<{ role, content }>,
  status: "idle" | "streaming" | "error",
  error?: { code: "rate_limit" | "upstream" | "network" | "timeout" }
}
```

Actions:
- `send(text)` — append user message, POST to endpoint, append assistant message as stream progresses.
- `switchArtist(id)` — clear messages, set new id, focus first tab.
- `retry()` — re-send last user message.

### System Prompts

All prompts share: 120-word response limit, no medical/harmful advice, first-person voice, no modern references (post death year), graceful refusal of out-of-era questions.

**Van Gogh** (d. 1890): warm, introspective, references letters to Theo, Saint-Rémy setting.
**Dalí** (d. 1989): flamboyant, provocative, vivid surreal metaphors, references Gala and dreams.
**Munch** (d. 1944): anxious, philosophical, references fjords and the scream motif.

Prompts live in `artifacts/api-server/src/lib/artistPrompts.ts` as plain string constants. No content escapes into the client.

## Visual Design

Matches existing editorial system:
- Typography: Serif for page heading, sans for body, Courier ("ptta-label") for eyebrow/labels.
- Palette: `bg-page` / `text-ink` / `bg-surface` / `text-cream` / `text-accent`.
- Spacing: 20px horizontal padding, section gaps ~48px, card radius matches `DemoHub` cards.
- No photorealistic or AI-generated imagery. Supporting cards use inline SVG in theme colors.
- Reduced-motion respected throughout (streaming token fade-in disabled under `prefers-reduced-motion`).

### Chat UI Mechanics

- Transcript: **fixed height** (~60vh on mobile, 480px desktop) with internal scroll; input stays pinned at the bottom. Feels like a real chat product.
- On new message, transcript auto-scrolls to bottom unless the user has scrolled up (hold scroll position if not at bottom).
- Suggested-prompt chips (2 per artist) appear only when the transcript is empty. They disappear after the first send.
- Streaming token animation: tokens fade in over 80ms each (skipped under reduced motion).
- Input character counter appears at 400/500 chars.

## Accessibility

- Chat transcript: `role="log"` + `aria-live="polite"` + `aria-atomic="false"` so screen readers announce new tokens as they stream, without repeating prior messages.
- Artist picker: `role="tablist"` with `role="tab"` buttons and a `role="tabpanel"` for the chat area. `aria-selected` reflects state. Arrow-key navigation between tabs.
- All interactive elements reachable via keyboard with visible focus rings (`focus-visible:outline-accent` as in existing code).
- Suggested-prompt chips are real `<button>` elements.
- On send: focus returns to input. On tab switch: focus moves to the selected tab; chat transcript clears and screen reader announces the new artist via an `aria-live` polite status.
- Error states announced via `role="alert"`.

## Error Handling

All user-facing error copy avoids technical terms:

| Condition | Copy |
|---|---|
| Rate limit (429) | "Too many questions at once — give [artist] a breath." |
| Upstream error (502) | "[Artist] is away from the easel. Try again in a moment." |
| Timeout (504) | Same as upstream. |
| Network failure | "Couldn't reach [artist]. Check your connection and try again." |
| Validation (400) | "That message is too long — keep it under 500 characters." |

Each error renders with a **Retry** button (except validation). Errors do not clear the transcript.

## Security & Secrets

- `GROQ_API_KEY` lives in `artifacts/api-server/.env` only. Added to `.gitignore`.
- `.env.example` with `GROQ_API_KEY=` placeholder is committed.
- Server validates `artistId` against a closed enum; no user-supplied IDs reach the prompt loader.
- Messages capped at 500 chars each, 20 messages per request.
- CORS already restricted by existing `cors()` middleware; no changes needed for dev.
- In-memory rate limit (no persistence) — acceptable for a demo.
- Startup check: api-server throws if `GROQ_API_KEY` is missing so the failure is loud and early.

## Testing Strategy

### Unit
- `useArtistChat` hook with mocked fetch: initial state, send flow, streaming accumulation, error mapping, retry, artist switch clears messages.
- `ArtistPicker` tab-switch behaviour and keyboard navigation.
- `rateLimit` token-bucket logic.

### Integration
- `POST /api/artist-chat` with mocked Groq client:
  - Valid request produces SSE stream.
  - Invalid `artistId` returns 400.
  - Message over 500 chars returns 400.
  - 21st message in body returns 400.
  - Rate limit trips on 21st request within a minute.
  - Groq 429 triggers fallback model; if fallback also fails, returns 502.

### Manual E2E
- Start both servers. Walk the chain Landing → How It Works → Hub → 3D Model → 3D Printing → Audio Guide → Future Features.
- Send 3 messages to Van Gogh. Switch to Dalí mid-conversation — transcript clears. Send 1 message.
- Toggle `prefers-reduced-motion` — verify token fade disabled.
- Use VoiceOver to walk the page — verify landmark order, live region announcements, tab navigation.
- Kill the api-server during a send — verify network error + retry works after restart.

## Out of Scope

- User accounts, persistence of chat history.
- Voice input / TTS (audio-guide module already handles audio).
- Translation of artist responses (English only in v1).
- Production deployment, CDN, domain routing.
- Billing / metering beyond the hardcoded rate limit.
- Content moderation beyond system-prompt safety rails.
- A/B testing of prompts.

## Implementation Phases

1. **Backend foundation** — `.env.example`, `GROQ_API_KEY` validation at startup, `groqClient.ts`, `artistPrompts.ts`, `rateLimit.ts`, route file, zod schema, tests.
2. **Vite proxy** — update `vite.config.ts` to forward `/api` in dev.
3. **Frontend data layer** — `artists.ts` content, `useArtistChat.ts` hook + tests.
4. **Chat UI components** — `ArtistPicker`, `ChatTranscript`, `ChatInput`, `ArtistPersona` container.
5. **Concept cards** — SVG illustrations and copy for Guided Walk + Audio Describer.
6. **Page assembly** — `FutureFeatures.tsx`, route registration, copy in `copy.ts`.
7. **Sequential chaining** — `NextModuleCta`, add `nextModule` to copy, drop CTA into four pages.
8. **Accessibility pass** — verify ARIA, keyboard, reduced motion, VoiceOver walk-through.
9. **Polish & manual E2E** — verify the full demo loop on mobile viewport.
