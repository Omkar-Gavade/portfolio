# Reference

[← Index](./README.md)

## Dependencies — why each is here

### frontend

| Package | Why |
|---|---|
| `react` `react-dom` 19 | UI runtime. React Compiler lint rules are active, so manual `useMemo`/`useCallback` that doesn't match inferred deps is rejected — prefer plain functions |
| `vite` 7 + `@vitejs/plugin-react` | Dev server and build. Chosen over a framework because the site is static with no server needs |
| `tailwindcss` v4 + `@tailwindcss/vite` | Styling. v4 is CSS-first — `@import "tailwindcss"` in `index.css`, no PostCSS config |
| `framer-motion` | Reveal animations, modal transitions, `useReducedMotion`, `useInView`. Vendored into its own ~128 kB chunk |
| `lucide-react` | Interface icons |
| `react-icons` | Brand/tech logos in the TechRing marquee — lucide has no brand set |
| `@vercel/analytics` | Page views + seven custom events |
| `eslint` + `eslint-plugin-react` / `-hooks` / `-refresh` | Linting. `eslint-plugin-react` is needed for `jsx-uses-vars`; core ESLint doesn't understand JSX and flags markup-only identifiers as unused |
| `@tailwindcss/cli` | **Unused** — the Vite plugin does the work. Safe to remove |

### backend

| Package | Why |
|---|---|
| `express` 5 | HTTP. v5 handles async errors natively |
| `mongoose` 9 | MongoDB ODM, schema validation, index declaration |
| `zod` | Validates both request bodies and environment config — one schema language for both |
| `helmet` | Security headers |
| `cors` | Origin allowlist |
| `express-rate-limit` | Abuse throttling. `ipKeyGenerator` normalises IPv6 to /64 so a client can't rotate addresses |
| `pino` | Structured JSON logs, greppable in Render |
| `dotenv` | Local `.env` loading |
| `nodemailer` *(optional)* | SMTP fallback only. Marked `optionalDependencies` so a Resend-only deploy needn't install it |
| `nodemon` `pino-pretty` `supertest` | Dev/test only |

Resend is called over plain `fetch` — no SDK dependency.

## Design system

Fixed. New UI must reuse these, not introduce alternatives.

| Token | Value |
|---|---|
| Section | `min-h-screen bg-white dark:bg-black text-black dark:text-white px-6 py-24` |
| Container | `max-w-6xl mx-auto` (`max-w-4xl` for Education/Experience) |
| Card | `bg-gray-50 dark:bg-white/5` · `border-gray-200 dark:border-white/10` · `rounded-2xl` (projects) / `rounded-xl` · `p-6` |
| Chip | `px-3 py-1 rounded-full text-xs bg-white dark:bg-white/10 border-gray-300 dark:border-white/10` |
| Primary button | `rounded-full bg-black text-white dark:bg-white dark:text-black hover:opacity-90` |
| Muted text | `text-gray-600 dark:text-gray-400` |
| Divider | `h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent` |

One deliberate exception: the contribution heatmap uses GitHub's green scale,
because the green *is* the information.

## Performance

Measured on the production build (`npm run preview`, Lighthouse 12, mobile):

| Category | Score |
|---|---|
| Performance | 99 |
| Accessibility | 100 |
| Best Practices | 96 |
| SEO | 100 |

Best Practices is 96 solely because `/_vercel/insights/script.js` 404s off
Vercel; it returns 200 once deployed.

What earns it: modals are `React.lazy` + `Suspense` so their code and the media
viewer stay out of the initial bundle; `react` and `framer-motion` are separate
manual chunks so a content edit doesn't invalidate them in cache; images use
`loading="lazy"` + `decoding="async"`; video is `preload="metadata"`; GitHub
requests are gated behind `useInView` and cached in `sessionStorage`; the theme
is applied by an inline pre-paint script to avoid a flash and a reflow.

## Security

- Zod validation with unknown keys stripped, rejecting control characters and
  CR/LF — these values are interpolated into email, where CR/LF is a header
  injection vector.
- Honeypot field; bots get a fake success and nothing is stored or sent.
- Helmet headers, `x-powered-by` disabled, `trust proxy` set so rate limiting
  keys on the real client IP rather than Render's proxy.
- CORS allowlist, mandatory in production.
- IPs stored only as a salted SHA-256 prefix — never raw.
- Provider errors truncated to 500 chars before storage, to avoid persisting
  payload echoes.
- Secrets only via environment; `render.yaml` marks them `sync: false`.
- Internal error details never reach the client.

**Known limits:** rate limiting is in-memory and per-instance; there is no
CAPTCHA; there is no authenticated way to read submissions (use Atlas).

## Assets and media

| Path | Contents |
|---|---|
| `frontend/src/assets/` | `zerodha.png`, `chatgpt.png` — project covers, imported so Vite hashes them. Files under 4 kB are inlined as data URIs |
| `frontend/public/` | `favicon.svg`, `robots.txt`, `sitemap.xml`, `Omkar_Gavade_CV.pdf` |
| `frontend/public/projects/<slug>/` | **Convention, not yet created** — screenshots, `demo.mp4`, GIFs |
| `frontend/public/certificates/` | **Not yet created** — certificate scans and `logos/` |

`Chat-GPT.webp` and `ChatGPT-Logo.png` in `src/assets/` are unreferenced
leftovers.

Missing: no screenshots, no demo video, no `og.png` (so link previews are blank
despite `twitter:card = summary_large_image` being declared).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| Backend exits at boot with a config report | Zod rejected the environment. The report names each bad key |
| `503 DB_UNAVAILABLE` | Atlas unreachable — check the IP access list and `MONGO_URI` |
| `502 MAIL_DELIVERY_FAILED` | Message **is stored**; provider rejected it. Check `RESEND_API_KEY`, and that `MAIL_FROM` is on a verified domain |
| Email only reaches your own address | Using Resend's sandbox sender. Verify a domain |
| CORS rejection in production | `ALLOWED_ORIGINS` doesn't include the frontend origin, exactly (scheme + host, no trailing slash) |
| First message after idle is slow | Render starter instance cold start |
| `/_vercel/insights/script.js` 404 | Expected off Vercel |
| GitHub sections empty | Unauthenticated rate limit (60/hr per IP) or the third-party contributions API is down. Both hide by design |
| `npm install` or builds hang, `ETIMEDOUT` on a local file | The project was on iCloud-synced Desktop. It now lives in `~/Documents`. Do not move it back under an iCloud-synced folder |

## Project history

- **v1 frontend** — single-page React portfolio, project cards hardcoded in JSX.
- **`web/` rebuild** — a Next.js 16 + TypeScript redesign ("SIGNAL" design
  system, amber accent, R3F hero, command terminal). Abandoned.
- **Backend v2** — rewritten from a single controller into the layered
  architecture here: Zod config validation, durable delivery tracking,
  race-safe dedupe, retry with budget, graceful shutdown, 23 tests.
- **Frontend enhancement** — data layer extracted from components; project
  cards gained GitHub / Live Demo / Preview; case-study modals; Certificates
  section; GitHub Activity; Framer Motion throughout; analytics; SEO
  (`robots.txt`, `sitemap.xml`, Open Graph, canonical); Lighthouse raised to
  99/100/96/100.
- **Content pass** — CGPA 8.06, GDG dates to Jul 2026, both projects expanded
  to full case studies, NovaGPT repositioned as a multi-provider AI platform.
- **Relocation** — moved off iCloud-synced Desktop to `~/Documents` after
  iCloud file-provider stalls made `npm install` and Next builds hang.

### The `web/` directory

A Next.js 16 + TypeScript rebuild. Feature-complete on paper — project modal,
certificates, GitHub activity, TS data layer — but **it has never compiled
successfully**. `next dev` boots, then hangs serving the first request, and
`next build` produces no output. The likely cause was file-system stalls at its
old iCloud location, and this has not been re-tested since the move.

It is not deployed and nothing depends on it. Either revive it deliberately or
delete it — leaving it is a trap for the next developer.

## Future improvements

**High**
- Put `frontend/` and the repo root under version control. There is no history.
- Replace the placeholder domain in the four SEO locations.
- Add `frontend/public/og.png` (1200×630) and the `og:image` tag.

**Medium**
- Add frontend tests — Vitest + Testing Library. Modal focus trap, dedupe of
  nav/section visibility, and the repo-picking logic are the highest value.
- Populate `frontend/src/data/certificates.js`; the section is built and hidden.
- Add project screenshots and a demo video; the carousel and MP4 path are wired
  but unused.
- Fill `metrics` on both projects with measured numbers.
- Set `site.socials.x` or remove the X icon — it currently links nowhere.
- Write GitHub descriptions for the repos; most cards read "No description
  provided".
- Retry worker for `delivery.status: failed`; `findUndelivered()` already
  exists and has no caller.

**Low**
- Move rate limiting to Redis for a real cross-instance quota.
- Delete unreferenced assets (`Chat-GPT.webp`, `ChatGPT-Logo.png`).
- Add a linter to `backend/`.
- Decide the fate of `web/`.
- Add live demo URLs once either project is deployed.
