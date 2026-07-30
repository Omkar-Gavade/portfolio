# Portfolio — Documentation

Personal portfolio for Omkar Gavade: a React single-page site plus a hardened
Express contact API.

Everything here was written by reading the source. Where something is **not**
implemented, it says so rather than describing an intention.

## Contents

| Doc | What's in it |
|---|---|
| [architecture.md](./architecture.md) | System diagram, request flow, repo layout |
| [frontend.md](./frontend.md) | Vite app — components, data files, features |
| [backend.md](./backend.md) | Express API — layers, model, config |
| [api.md](./api.md) | Endpoint reference |
| [development.md](./development.md) | Commands, workflow, git, testing |
| [deployment.md](./deployment.md) | Vercel, Render, MongoDB Atlas, Resend |
| [reference.md](./reference.md) | Dependency rationale, performance, security, troubleshooting, history, TODOs |

## The three apps

| Directory | Stack | Status |
|---|---|---|
| `frontend/` | React 19 + Vite 7 + Tailwind v4 | **Live and maintained.** This is the portfolio. |
| `backend/` | Node 20 + Express 5 + MongoDB + Resend | **Live.** Serves the contact form. |
| `web/` | Next.js 16 + TypeScript | **Abandoned rebuild. Has never compiled.** See [reference.md](./reference.md#the-web-directory). |

Only `frontend/` and `backend/` are deployed. Treat `web/` as an archive.

## Quick start

```bash
npm --prefix frontend install && npm --prefix frontend run dev
```

Frontend runs at `http://localhost:5173` and talks to the deployed API by
default, so it works standalone. To run the API too, see
[development.md](./development.md).

## Conventions

- No test suite in `frontend/`. `backend/` has 23 tests via `node --test`.
- `backend/` is its own git repository. **The repository root is not
  version-controlled** — see [development.md](./development.md#git).
- All portfolio content lives in `frontend/src/data/`. Editing content should
  never require touching a component.
