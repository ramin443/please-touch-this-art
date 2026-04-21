# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Deployment secrets

The AI Artist Persona chat (`POST /api/artist-chat`) calls Groq for LLM completions. For the deployed Replit app to work:

- In **Replit → Tools → Secrets**, add `GROQ_API_KEY` with a valid key from https://console.groq.com/keys.
- The api-server will refuse to start without it (by design, to fail loud if misconfigured).

The artifact-based multi-service setup (`artifacts/api-server/.replit-artifact/artifact.toml` and `artifacts/ptta-demo/.replit-artifact/artifact.toml`) already routes `/api/*` to the api-server and everything else to the static ptta-demo — no additional wiring required.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
