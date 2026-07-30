# Architecture

[← Index](./README.md)

## System

```mermaid
flowchart LR
  V["Visitor<br/>browser"]

  subgraph Vercel
    F["frontend/<br/>React 19 · Vite 7 · Tailwind v4<br/>static SPA"]
  end

  subgraph Render
    B["backend/<br/>Express 5 · Node 20"]
  end

  A[("MongoDB Atlas<br/>contacts")]
  R["Resend<br/>transactional email"]
  G["GitHub REST<br/>api.github.com"]
  C["jogruber<br/>contributions API"]
  I["Omkar's inbox"]

  V --> F
  F -- "POST /api/contact" --> B
  F -- "client-side fetch" --> G
  F -- "client-side fetch" --> C
  B --> A
  B --> R --> I
```

Two independent deployments. The frontend is fully static — no SSR, no server
runtime. Its only backend dependency is the contact form; every other section
renders from local data or hits a public API straight from the browser.

## Contact request flow

The one non-trivial path in the system. A `2xx` is returned **only** after a
mail provider has accepted the message.

```mermaid
sequenceDiagram
  participant C as Client
  participant M as Middleware
  participant Ctl as Controller
  participant S as Service
  participant DB as MongoDB
  participant Mail as Resend

  C->>M: POST /api/contact
  M->>M: helmet · CORS · rate limit · Zod validate
  M->>Ctl: validated body
  Ctl->>Ctl: honeypot? → fake 201, stop
  Ctl->>S: submitContact()
  S->>DB: duplicate in window?
  alt already delivered
    DB-->>S: existing row
    S-->>C: 200 { duplicate: true }
  else new
    S->>DB: insert status=pending
    S->>Mail: send (retry, bounded budget)
    alt accepted
      Mail-->>S: messageId
      S->>DB: status=sent
      S-->>C: 201 { success: true }
    else failed
      S->>DB: status=failed + lastError
      S-->>C: 502 MAIL_DELIVERY_FAILED
    end
  end
```

Two dedupe layers: a fast read on `dedupeHash`, and a **unique index** on
`dedupeKey` (`sha256(email+message)` bucketed by the dedupe window) that makes
concurrent identical submissions race-safe — MongoDB rejects the second with
`E11000` rather than the app doing check-then-insert.

## Repository layout

```
PORTFOLIO/
├── frontend/          React SPA — the portfolio          → Vercel
├── backend/           Express contact API (own git repo) → Render
├── web/               Abandoned Next.js rebuild — does not build
├── docs/              This documentation
└── .claude/           launch.json — dev server configs for tooling
```

There is **no root `package.json`** and no workspace/monorepo tooling. Each app
is installed and run independently.

## Layer boundaries

**Frontend** — `sections/` compose `components/`, which read from `data/`.
Components never contain content; data files never contain markup. See
[frontend.md](./frontend.md).

**Backend** — strict one-way dependency:

```
routes → controllers → services → repositories → models
```

Controllers do HTTP only. Services own the use case. Repositories are the only
code that touches Mongoose, which keeps services testable against a stub and
confines a future storage change to one directory. See
[backend.md](./backend.md).
