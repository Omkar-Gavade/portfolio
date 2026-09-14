/**
 * Single source of truth for the Projects section.
 *
 * To add a project: append an object below. Nothing else needs to change —
 * the card grid, the buttons and the preview modal all read from here. Every
 * block in the modal hides itself when its field is empty, so a project can be
 * filled in gradually.
 *
 * @typedef {Object} ProjectMedia
 * @property {string}   cover        Card image + modal hero. Import from
 *                                   `src/assets` (hashed & optimised) or use a
 *                                   `/public` path.
 * @property {{src: string, alt: string}[]} screenshots
 *                                   Extra stills. 2+ turns the modal hero into
 *                                   a carousel. Leave `[]` if you have none.
 * @property {string=}  video        Demo recording, e.g. "/projects/lumora/demo.webm".
 *                                   Rendered muted + looping with controls.
 * @property {string=}  poster       Poster frame for `video`.
 * @property {string=}  gif          GIF demo. Used only when `video` is absent.
 *
 * Drop new media in `public/projects/<slug>/` and reference it as
 * "/projects/<slug>/file.ext".
 *
 * @typedef {Object} Project
 * @property {string}   slug
 * @property {string}   title
 * @property {string}   tagline
 * @property {string}   year
 * @property {"blue"|"emerald"|"violet"|"amber"} accent
 * @property {string}   role
 * @property {string}   summary      Card body.
 * @property {string[]} tech         Chips on the card and in the modal.
 * @property {{github: string, demo: string|null}} links
 * @property {ProjectMedia} media
 * @property {string}   overview     Modal opener.
 * @property {string}   problem      Why the project exists.
 * @property {string[]} objectives   What it set out to do.
 * @property {{label: string, value: string}[]} metrics
 *                                   Measured numbers only — leave `[]` rather
 *                                   than estimating; the block hides itself.
 * @property {{title: string, body: string}[]} features
 * @property {{layer: string, detail: string}[]} architecture
 * @property {string[]} highlights   Implementation details worth calling out.
 * @property {{title: string, body: string}[]} challenges
 * @property {string[]} learnings
 * @property {string[]} futureWork
 */

/** @type {Project[]} */
export const projects = [
  {
    slug: "lumora",
    title: "Lumora — Chat With Your Documents",
    tagline: "AI · Retrieval-augmented generation",
    year: "2026",
    accent: "violet",
    role: "Full-stack — RAG pipeline, API, auth, UI",
    summary:
      "A retrieval-augmented knowledge base: upload PDFs, Word files, text or Markdown, then ask questions in plain language and get streamed answers grounded in your own documents — every claim cited to the exact passage it came from, and an honest \"not in your documents\" when nothing matches.",
    tech: [
      "TypeScript",
      "React 19",
      "Vite",
      "Tailwind CSS v4",
      "TanStack Query",
      "Express 5",
      "PostgreSQL",
      "pgvector",
      "Kysely",
      "Google Gemini",
      "S3 / Supabase Storage",
      "JWT + Argon2id",
      "Vitest",
    ],
    links: {
      github: "https://github.com/Omkar-Gavade/Lumora",
      demo: "https://lumora.omkargavade.xyz/",
    },
    media: {
      cover: "/projects/lumora/cover.jpg",
      screenshots: [
        { src: "/projects/lumora/app-chat.jpg", alt: "Signed-in chat — a question about a sample contract answered with inline citations" },
        { src: "/projects/lumora/app-documents.jpg", alt: "Documents page — two sample PDFs indexed and ready" },
        { src: "/projects/lumora/features.jpg", alt: "Lumora features — citations, abstention and hybrid search" },
        { src: "/projects/lumora/why-rag.jpg", alt: "Why RAG — a general chatbot's guess next to Lumora's cited answer" },
        { src: "/projects/lumora/privacy.jpg", alt: "Privacy and security commitments" },
        { src: "/projects/lumora/faq.jpg", alt: "Frequently asked questions" },
        { src: "/projects/lumora/sign-in.jpg", alt: "Lumora sign-in screen" },
      ],
      video: "/projects/lumora/demo.webm",
      poster: "/projects/lumora/cover.jpg",
      gif: null,
    },

    overview:
      "Lumora is a private knowledge workspace. You upload documents, Lumora parses, chunks and embeds them in the background, and you chat with them. Answers stream token by token, carry inline citation markers that tie each claim to its source passage, and are refused rather than invented when retrieval finds nothing relevant. It is built as a TypeScript monorepo — a React SPA, an Express API with an in-process ingestion worker, and a shared package that holds the contract both sides compile against.",

    problem:
      "General LLMs have never read your lease, your handbook or last quarter's board deck, so they answer with the most plausible text instead of the correct one. Pasting documents into a chat window does not scale either: context windows are finite, nothing persists, and nothing can be cited. People who sign their name under an answer need to see where it came from.",

    objectives: [
      "Ground every answer in the user's own documents, with a citation per claim",
      "Abstain explicitly when retrieval returns nothing above threshold",
      "Find both paraphrased questions and exact terms like clause numbers or part codes",
      "Make deletion real — file bytes, chunks and vectors all removed",
      "Keep each user's documents strictly isolated at the data-access layer",
    ],

    metrics: [
      { label: "Database tables", value: "13" },
      { label: "Ordered SQL migrations", value: "8" },
      { label: "Test files (backend + frontend)", value: "56" },
      { label: "Embedding dimensions", value: "768" },
    ],

    features: [
      {
        title: "Citations you can check",
        body: "Inline [1], [2] markers tie each claim to the retrieved chunk it came from, and citations are validated before the answer is saved.",
      },
      {
        title: "Hybrid retrieval",
        body: "pgvector semantic search and Postgres full-text BM25 run side by side and are merged with Reciprocal Rank Fusion, so meaning and exact tokens both match.",
      },
      {
        title: "Background ingestion",
        body: "Uploads return 202 immediately; a job queue drives each file through queued → parsing → chunking → embedding → ready, with a readable reason when one fails.",
      },
      {
        title: "Streaming chat with memory",
        body: "Answers stream over SSE, generation can be stopped without losing the partial answer, and follow-ups like \"what about the second one?\" resolve against the conversation.",
      },
      {
        title: "Knowledge bases",
        body: "Named collections of documents let a conversation be scoped to just the files that matter for it.",
      },
      {
        title: "Own authentication",
        body: "Email verification, password reset, Argon2id hashing and rotating refresh tokens — no third-party auth provider.",
      },
    ],

    architecture: [
      {
        layer: "Client",
        detail: "React 19 + Vite SPA, Tailwind v4 tokens, TanStack Query for server state, React Hook Form + Zod",
      },
      {
        layer: "API + worker",
        detail: "Express 5 in strict Route → Controller → Service → Repository layers; the ingestion worker drains the job queue in the same process",
      },
      {
        layer: "Data",
        detail: "PostgreSQL via Kysely with pgvector (HNSW index) for vectors and tsvector for BM25 — one database, no separate vector store",
      },
      {
        layer: "Storage + AI",
        detail: "Original uploads in S3-protocol object storage (Supabase Storage); Google Gemini for embeddings and chat",
      },
    ],

    highlights: [
      "Repositories require the user id in their signatures (findByIdForUser), which makes cross-tenant reads structurally difficult rather than merely forbidden.",
      "The document row and its ingestion job are written in the same transaction, so there are never orphan jobs or documents that silently never process.",
      "Uploads are deduplicated by SHA-256 content hash and validated by magic bytes, not by file extension.",
      "Chunking is structure-aware — ~512 tokens with 75 overlap, never splitting a sentence, a table or a code block.",
      "Production config refuses to boot with fake providers, local storage, localhost URLs or disabled encryption.",
      "The shared @lumora/shared package is the API contract, so a breaking change is a compile error instead of a runtime surprise.",
    ],

    challenges: [
      {
        title: "Fusing two incomparable rankings",
        body: "Cosine similarity and BM25 scores live on different scales, so a weighted blend needs constant re-tuning. Reciprocal Rank Fusion (k = 60) combines the lists by rank alone, which is comparable by construction.",
      },
      {
        title: "Knowing what can actually be rebuilt",
        body: "The design assumed Postgres alone could rebuild the vector index. Deleting the entire vectors table and re-running reindex proved the real invariant: Postgres plus the original files in object storage are authoritative — which is why storage versioning is not optional.",
      },
      {
        title: "A worker on free hosting",
        body: "Running the API and ingestion worker in one process is cheap and simple, but a host that sleeps or only allocates CPU during requests freezes the queue. That constraint drove the hosting choice, request timeouts sized for a cold backend, and a keep-warm ping.",
      },
    ],

    learnings: [
      "In RAG, retrieval quality is bounded by chunk quality — no reranker recovers a sentence split from its subject.",
      "Refusing to answer is a feature: an abstention users can trust beats a fluent guess.",
      "Choosing pgvector over a proprietary vector database turned a hosting migration into a configuration change.",
      "Verifying a recovery path end to end surfaces wrong assumptions that reading the design never will.",
    ],

    futureWork: [
      "OCR for scanned PDFs and ingestion of URLs, slides and spreadsheets",
      "Session management UI to list and revoke active devices",
      "Sharing knowledge bases with teammates",
      "An evaluation set to measure retrieval and citation accuracy over time",
    ],
  },

  {
    slug: "nexusai",
    title: "NexusAI — Multi-Model AI Workspace",
    tagline: "AI · Multi-model orchestration",
    year: "2026",
    accent: "blue",
    role: "Full-stack — orchestrator, streaming protocol, auth, UI",
    summary:
      "A multi-model AI workspace: ask one model and get its answer directly, or send the question to several at once and have a synthesis model reconcile their responses into one answer — with provenance showing which models responded, which agreed and which diverged.",
    tech: [
      "TypeScript",
      "React 19",
      "Vite",
      "Tailwind CSS v4",
      "TanStack Query",
      "Zustand",
      "Node.js",
      "Fastify 5",
      "MongoDB",
      "Zod",
      "Server-Sent Events",
      "JWT (EdDSA)",
      "Vitest",
    ],
    links: {
      github: "https://github.com/Omkar-Gavade/NexusAI",
      demo: "https://nexusai.omkargavade.xyz/",
    },
    media: {
      cover: "/projects/nexusai/cover.jpg",
      screenshots: [
        { src: "/projects/nexusai/app-chat.jpg", alt: "Signed-in workspace — a question answered with conversation history in the sidebar" },
        { src: "/projects/nexusai/app-response-modes.jpg", alt: "Response mode menu — single model, synthesis across three or five models, or one chosen model" },
        { src: "/projects/nexusai/response-modes.jpg", alt: "Direct and synthesis response modes" },
        { src: "/projects/nexusai/models.jpg", alt: "Six models across six providers" },
        { src: "/projects/nexusai/orchestration.jpg", alt: "Parallel fan-out and synthesis pipeline" },
        { src: "/projects/nexusai/provenance.jpg", alt: "Provenance recorded with every answer" },
        { src: "/projects/nexusai/workspace.jpg", alt: "Workspace showing a synthesised answer with per-model stances" },
        { src: "/projects/nexusai/sign-in.jpg", alt: "NexusAI sign-in screen" },
      ],
      video: "/projects/nexusai/demo.webm",
      poster: "/projects/nexusai/cover.jpg",
      gif: null,
    },

    overview:
      "NexusAI decides per question how an answer is produced. In Direct mode one chosen model answers alone, unedited. In Synthesis mode the question fans out to three or five models in parallel, and a synthesis pass reads only the responses that actually returned and writes a single answer — naming disagreement instead of quietly picking a side. Every answer is persisted with its provenance: model identity, latency, outcome and stance.",

    problem:
      "Tools that call several LLMs usually show four columns side by side, which hands the work of reconciling them back to the user. Worse, they tend to hide failures — a degraded turn where one provider timed out looks exactly like a perfect one. Users need one readable answer and a record they can check.",

    objectives: [
      "Support both a single-model Direct mode and a multi-model Synthesis mode",
      "Run models in parallel without turning one request into an unbounded burst",
      "Record failed and unavailable models honestly instead of dropping them",
      "Keep frontend and backend in lockstep through one shared contract",
      "Never fake anything — responses, latency, availability or agreement counts",
    ],

    metrics: [
      { label: "Automated tests", value: "439" },
      { label: "Models across providers", value: "6" },
      { label: "Max concurrent model calls", value: "4" },
      { label: "Bundled server artifact", value: "~334 KB" },
    ],

    features: [
      {
        title: "Direct or Synthesis, per question",
        body: "Pick a model and it answers alone, or ask several and read one reconciled answer — the choice sits next to the composer, not in account settings.",
      },
      {
        title: "Parallel orchestration",
        body: "A bounded worker pool fans the question out; each model reports the moment it finishes, and failures are excluded from synthesis but kept in the record.",
      },
      {
        title: "Streaming SSE protocol",
        body: "The synthesised answer streams token by token over a typed event stream — start, model_complete, model_error, synthesis_start, delta, agreement, complete.",
      },
      {
        title: "Provenance with every answer",
        body: "\"Two of three responded · one concurs · one diverges\" is measured, persisted and rendered beside the answer when you return to the conversation.",
      },
      {
        title: "Six providers",
        body: "OpenAI, Anthropic, Google, Mistral, DeepSeek and Groq behind one adapter layer; unconfigured models report themselves unavailable before you send.",
      },
      {
        title: "Secure sessions",
        body: "Argon2id passwords, EdDSA-signed JWTs and a SameSite=Strict refresh cookie, with provider keys kept server-side only.",
      },
    ],

    architecture: [
      {
        layer: "Client",
        detail: "React 19 + Vite, Tailwind v4, TanStack Query for server state, Zustand for UI state, feature-folder structure",
      },
      {
        layer: "API",
        detail: "Fastify 5 modular monolith — api, application, domain and infrastructure layers, bundled by esbuild into one server file",
      },
      {
        layer: "Contracts",
        detail: "@nexusai/contracts: Zod schemas for requests, responses, SSE events and error codes, imported by both sides",
      },
      {
        layer: "Data + providers",
        detail: "MongoDB for users, sessions, conversations and messages; LLM adapters per provider; same-origin /api rewrite to the backend",
      },
    ],

    highlights: [
      "Bounded concurrency — N workers draining a shared queue — instead of Promise.all over a user-controlled list, which would be a fan-out amplifier.",
      "A model that failed this turn can never be chosen to write the synthesis, and if only one survives the turn degrades to a direct answer and says so.",
      "Other vendors' responses are fenced as untrusted input before the synthesis model reads them.",
      "The browser only ever calls a relative /api path; the rewrite keeps everything same-origin, which is what allows a SameSite=Strict refresh cookie — and a test asserts the rewrite order.",
      "A production server with no provider key refuses to start rather than serving a broken workspace.",
    ],

    challenges: [
      {
        title: "Degrading without lying",
        body: "Dropping a failed model makes a degraded turn look perfect. The orchestrator keeps every attempt in provenance and has three explicit levels — full synthesis, synthesis over survivors, or a direct answer from the only survivor.",
      },
      {
        title: "Free-tier providers are rarely healthy together",
        body: "Real runs against Google, Mistral and Groq showed that provider accounts fail independently. Rather than simulate availability, the UI reports UNKNOWN or unavailable per model and the answer states how many actually responded.",
      },
      {
        title: "A leaked key in git history",
        body: "A JWT key reached public history through a .env backup file that matched no ignore pattern. It was rotated, and .env.* is now ignored wholesale — a lesson in treating ignore rules as security controls.",
      },
    ],

    learnings: [
      "The value of calling several models is in reconciliation and provenance, not in the fan-out itself.",
      "One shared schema package is the most reliable way to keep a streaming protocol in sync across client and server.",
      "Honest UI is a design constraint: every displayed number has to have been measured.",
      "Model output from another vendor is untrusted input and should be handled like any other.",
    ],

    futureWork: [
      "Retrieval-backed sources — the sources event exists in the contract but is deliberately not faked",
      "Shared rate limiting across instances",
      "Key rotation with a kid-based key set instead of a hard cutover",
      "Verify the remaining providers end to end and publish quality evaluations",
    ],
  },

  {
    slug: "vedanjay",
    title: "Vedanjay Power — Corporate Website",
    tagline: "Client website · Renewable energy",
    year: "2026",
    accent: "emerald",
    role: "Full-stack — research, design system, build, deployment",
    summary:
      "A ground-up rebuild of the corporate website for Vedanjay Power Pvt. Ltd., a renewable power-sector consultancy — twelve pre-rendered routes, light and dark themes, an interactive dotted atlas of its QCA portfolio, a client-side assistant, and a rate-limited enquiry API built for Cloudflare Workers.",
    tech: [
      "React 19",
      "JavaScript",
      "Vite 8",
      "React Router 7",
      "Bootstrap 5 (grid + utilities)",
      "Custom CSS design tokens",
      "Cloudflare Workers",
      "Cloudflare D1",
      "Vercel",
      "Pre-rendering",
      "SEO + structured data",
      "Vitest",
    ],
    links: {
      github: "https://github.com/Omkar-Gavade/Vedanjay-power-website",
      demo: "https://vedanjay.omkargavade.xyz/",
    },
    media: {
      cover: "/projects/vedanjay/cover.jpg",
      screenshots: [
        { src: "/projects/vedanjay/expertise.jpg", alt: "Renewable-energy expertise across solar, wind and hybrid" },
        { src: "/projects/vedanjay/portfolio-map.jpg", alt: "Interactive dotted atlas of the QCA portfolio" },
        { src: "/projects/vedanjay/services.jpg", alt: "Services page — six lines of technical and commercial work" },
        { src: "/projects/vedanjay/projects.jpg", alt: "Project portfolio with total capacity at a glance" },
        { src: "/projects/vedanjay/about.jpg", alt: "Company overview page" },
        { src: "/projects/vedanjay/contact.jpg", alt: "Contact page with enquiry form" },
      ],
      video: "/projects/vedanjay/demo.webm",
      poster: "/projects/vedanjay/cover.jpg",
      gif: null,
    },

    overview:
      "Vedanjay Power, established in 2011, provides forecasting and scheduling (QCA), open-access power, ABT metering and telemetry, electrical infrastructure and grid studies. I researched the sector, audited the legacy site, defined the information architecture and design system, and built the new site: home, about, team, awards, downloads, partners, services, industries, projects, gallery, careers and contact — photography-led, responsive, and pre-rendered for fast, crawlable pages.",

    problem:
      "The existing site was a 2017 Bootstrap 3 theme. An audit measured 56 script tags on the homepage, 0 of 57 images with alt text, only 1 of 6 services with its own URL, no contact form anywhere, 15 of 22 download links returning HTTP 503, and a mobile hero headline clipped mid-word. The company's strongest credentials — real field work and repeat clients — were not visible at all.",

    objectives: [
      "Give every service, industry and project a real, linkable page",
      "Make the company's verified credentials and portfolio visible and credible",
      "Capture leads through an enquiry flow that never loses a submission",
      "Ship fast, accessible pages with SEO metadata a crawler can read",
      "Ensure no unverified company fact can reach the live site",
    ],

    metrics: [
      { label: "Legacy homepage script tags replaced", value: "56" },
      { label: "Legacy images with alt text", value: "0 of 57" },
      { label: "Pre-rendered routes", value: "12" },
    ],

    features: [
      {
        title: "Rotating photographic hero",
        body: "Real photography of the company's technical work with cross-dissolving frames, a headline per frame and a light/dark theme toggle.",
      },
      {
        title: "Interactive portfolio atlas",
        body: "A zoomable dotted map of Asia plots the QCA and forecasting portfolio by state, with clickable turbine markers.",
      },
      {
        title: "Client-side assistant",
        body: "\"Ask Vedanjay\" answers questions from the site's own verified data modules — instant, free to run, no API key and nothing to hallucinate.",
      },
      {
        title: "Enquiry API",
        body: "A Worker route validates submissions, rate-limits by salted client key, notifies the team and can persist leads to D1 so a failed notification never loses one.",
      },
      {
        title: "Projects and downloads",
        body: "Capacity cards, a filterable table view and a regulatory downloads library replace a single static register page.",
      },
      {
        title: "SEO built in",
        body: "A route metadata table, structured data, sitemap and pre-rendered HTML head for every page.",
      },
    ],

    architecture: [
      {
        layer: "Frontend",
        detail: "React 19 + Vite 8, React Router 7 with lazy routes, Bootstrap 5 grid and utilities only, custom token-driven CSS",
      },
      {
        layer: "Build",
        detail: "Vite build followed by a pre-render script, plus generators for SEO metadata, project data and the dotted atlas",
      },
      {
        layer: "Hosting",
        detail: "Static pre-rendered build on Vercel today; wrangler config targets one Cloudflare Worker that serves assets directly and runs only for /api/*",
      },
      {
        layer: "API",
        detail: "/api/enquiries and /api/health with validation, rate limiting, webhook notification and optional D1 persistence",
      },
    ],

    highlights: [
      "run_worker_first is scoped to /api/*, so the ~99% of traffic that is static costs no Worker invocation and adds no latency.",
      "Full Bootstrap was avoided — only its grid and utilities are imported, saving roughly 160 KB of unused component CSS.",
      "The Stat component requires an asOf date and statistics are filtered on a verified flag, so an unsourced number cannot ship.",
      "The API emits no CORS headers and rejects cross-site Sec-Fetch-Site requests — the absence of the header is the control.",
      "Every motion pattern is suppressed under prefers-reduced-motion.",
    ],

    challenges: [
      {
        title: "Replacing an AI assistant with no AI",
        body: "The first assistant ran Workers AI with a Groq fallback, SSE streaming and an eval harness — but the hardest question class scored 71%, the daily quota ran out and a fallback key had to be rotated. For a small, fixed set of company facts, a client-side matcher over verified data is right every time, costs nothing and cannot leak a key.",
      },
      {
        title: "Content integrity",
        body: "The legacy site contradicted itself on key statistics. Every company claim was tracked in a facts register with a verification status, and that rule was enforced in code rather than left to review.",
      },
      {
        title: "Researching the real competitive set",
        body: "Four of the five 'competitors' named in the brief turned out to be Vedanjay's clients. Modelling the information architecture on an independent energy advisory firm instead of power producers changed the whole site structure.",
      },
    ],

    learnings: [
      "Research changes the brief — the most valuable finding came before any code.",
      "Not every assistant needs a model; match the tool to how bounded the knowledge is.",
      "Edge platforms reward keeping dynamic code to the few paths that truly need it.",
      "Accessibility and performance budgets are easier to keep when they are built into components.",
    ],

    futureWork: [
      "Move production onto the Cloudflare Worker so the enquiry API and D1 persistence go live",
      "Performance and accessibility budgets enforced in CI with Lighthouse and axe",
      "Individual case-study pages for flagship projects",
      "A lightweight CMS so the team can update projects and careers themselves",
    ],
  },
];

/** Convenience lookup used by the modal and any future deep links. */
export const getProject = (slug) => projects.find((p) => p.slug === slug);
