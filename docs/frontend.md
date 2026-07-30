# Frontend

[← Index](./README.md)

React 19 · Vite 7 · Tailwind CSS v4 · Framer Motion. Single page, no router.

## Structure

```
frontend/
├── index.html              Meta, Open Graph, pre-paint theme script
├── public/                 favicon.svg · robots.txt · sitemap.xml · CV
└── src/
    ├── App.jsx             Section order
    ├── sections/           One file per page section
    ├── components/
    │   ├── ui/             Reusable primitives
    │   ├── projects/       ProjectCard · ProjectModal
    │   ├── certificates/   CertificateCard · CertificateModal
    │   ├── github/         ContributionGraph · RecentRepos
    │   ├── Navbar.jsx      Scroll-spy pill nav
    │   ├── TechRing.jsx    Icon marquee
    │   └── ThemeToggle.jsx
    ├── data/               All content — edit here, not in components
    ├── hooks/              useBodyScrollLock · useCachedFetch
    ├── lib/                motion · media · analytics
    ├── config/api.js       API base URL (dev vs prod)
    └── index.css           Tailwind import + keyframes + scrollbar-hide
```

## Section order

`App.jsx` renders, inside `<main>`:

Hero → About → TechRing → Skills → Education → **Certificates** → Experience →
Projects → **GitHub Activity** → Contact

Certificates removes itself — and drops its nav link — when
`data/certificates.js` is empty, which it currently is.

## Data files

Content is fully separated from markup. Adding a project or certificate is a
data edit, never a component edit.

| File | Drives |
|---|---|
| `projects.js` | Cards + case-study modals |
| `certificates.js` | Certificates section (**currently empty**) |
| `skills.js` `education.js` `experience.js` | Those sections |
| `site.js` | Name, email, CV path, socials, `githubUser`, `pinnedRepos` |
| `accents.js` | Per-project accent classes, written as literal strings so Tailwind's scanner sees them |

### Project shape

`slug` `title` `tagline` `year` `accent` `role` `summary` `tech[]`
`links{github,demo}` `media{cover,screenshots[],video,poster,gif}` `overview`
`problem` `objectives[]` `metrics[]` `features[]` `architecture[]`
`highlights[]` `challenges[]` `learnings[]` `futureWork[]`

Every modal block hides itself when its field is empty, so a project can be
filled in gradually. `metrics` is intentionally `[]` on both projects — no
measured numbers have been supplied.

## UI primitives

| Component | Notes |
|---|---|
| `Modal` | Portal, focus trap, Escape, backdrop click, scroll lock, `AnimatePresence` |
| `MediaFrame` | `MediaCarousel` + slide renderer — image, GIF, MP4 |
| `ZoomImage` | Click-to-cycle zoom, drag-to-pan, button controls |
| `Reveal` | `Reveal` · `RevealGroup` · `RevealItem` — fade/slide/stagger |
| `ActionButton` | Renders as `<a>`, `<button>`, or a muted non-interactive span when the target link doesn't exist |
| `Chip` / `ChipList` | The two pill variants already in the design |
| `SectionHeader` | Centred heading + supporting line |

`ActionButton`'s disabled state is why a project with no deployment still shows
a "Live Demo" button — the action row keeps the same shape across projects.

## Features

**Project modals** — cover/carousel, GIF and MP4 support, and ten content
blocks: Overview, Problem Statement, Objectives, Features, Tech Stack,
Architecture, Development Highlights, Challenges, Learnings, Future
Improvements. Metrics renders an eleventh block when populated.

**Certificates** — card with logo (falls back to issuer initials), title,
issuer, date, skills, Preview and View Credential. Preview opens a modal with
image zoom. Data is local; nothing is fetched.

**GitHub Activity** — contribution heatmap in GitHub's own green scale (light
and dark variants) plus repository cards. Both endpoints are unauthenticated
and fire only when the section nears the viewport (`useInView`), cached in
`sessionStorage` for an hour. Any failure hides that block silently.

Repos: `site.pinnedRepos` renders first in order, then the account's own repos
backfill to six, most-starred first. GitHub's real "pinned" list is GraphQL-only
and needs a token, so this curated list is the static-site equivalent.

**Theme** — `.dark` class on `<html>`, persisted in `localStorage`, applied by
an inline script in `index.html` before first paint so dark mode never flashes
white.

**Motion** — one easing curve and one travel distance in `lib/motion.js`.
`useReducedMotion` is honoured throughout, and `index.css` also caps animation
and transition durations under `prefers-reduced-motion`.

## Analytics

`@vercel/analytics` is wired in `frontend/`. `lib/analytics.js` centralises
seven event names — resume download, GitHub click, live demo click, project
preview, certificate preview, credential click, contact submit. Every call is
wrapped so a blocked script can never break a click.

Off Vercel, `/_vercel/insights/script.js` 404s in the console. That is expected
and resolves on deploy.

## Not implemented

- No tests.
- No router — single page, anchor navigation only.
- No i18n. The "🇬🇧 English" button in the navbar is decorative.
- No CMS. All content is committed source.
