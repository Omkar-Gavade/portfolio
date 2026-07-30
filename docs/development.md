# Development

[← Index](./README.md)

## Prerequisites

Node **≥20** (backend declares it in `engines`; the frontend toolchain wants it
too) and npm. A MongoDB connection string and a Resend API key are needed only
to run the backend.

## Install

Each app installs independently — there is no root `package.json`.

```bash
npm --prefix frontend install
npm --prefix backend install
```

## Commands

### frontend

| Command | Does |
|---|---|
| `npm run dev` | Vite dev server on `:5173`, HMR |
| `npm run build` | Production build to `dist/` (~1.4 s) |
| `npm run preview` | Serve `dist/` — use this for Lighthouse, not `dev` |
| `npm run lint` | ESLint 9 flat config |

### backend

| Command | Does |
|---|---|
| `npm run dev` | nodemon on `:8080` |
| `npm start` | Production start |
| `npm test` | 23 tests via `node --test` |
| `npm run mail:smoke` | Send one real test email — verifies provider credentials |

Prefix from the repo root: `npm --prefix frontend run build`.

## Running both locally

```bash
cp backend/.env.example backend/.env   # then fill MONGO_URI and RESEND_API_KEY
npm --prefix backend run dev           # :8080
npm --prefix frontend run dev          # :5173
```

`frontend/src/config/api.js` switches on Vite's mode: `development` targets
`http://localhost:8080`, anything else targets the deployed Render URL. So the
frontend alone works against production without configuration.

Leave `ALLOWED_ORIGINS` empty in development — the CORS allowlist falls through
to allow-all only when `NODE_ENV !== production`, and the config schema refuses
to boot in production with it empty.

## Workflow

1. Content changes go in `frontend/src/data/`. Components should not need edits.
2. Design changes: reuse `components/ui/` primitives. Colours, radii, spacing
   and typography are fixed — see [reference.md](./reference.md#design-system).
3. Run `npm --prefix frontend run lint && npm --prefix frontend run build`.
4. For anything visible, check both themes and at 375 / 768 / 1440 px.
5. Backend changes: `npm --prefix backend test`.

## Testing

**Backend — 23 tests**, `node --test` with supertest, no external runner:

| File | Covers |
|---|---|
| `tests/api.test.js` | Endpoint behaviour end-to-end |
| `tests/validator.test.js` | Zod contact schema |
| `tests/retry.test.js` | Retry/backoff utility |
| `tests/template.test.js` | Email template rendering |

**Frontend — no tests.** Verification is lint, production build, and manual
browser checks. This is the largest gap in the project.

## Git

`backend/` is its **own** git repository —
`github.com/Omkar-Gavade/portfolio-backend.git`, current branch
`feature/contact-api`. Remote branches: `feature/contact-api`,
`deploy/backend`.

`frontend/`, `web/` and the repository root are **not under version control**.
Before doing anything else significant, initialise a repo at the root (or one
per app) — there is currently no history and no undo for the frontend.

Observed convention from the backend: short-lived `feature/<name>` branches off
the default branch.
