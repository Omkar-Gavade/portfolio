import zerodhaImg from "../assets/zerodha.png";
import chatgptImg from "../assets/chatgpt.png";

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
 * @property {string=}  video        MP4 demo, e.g. "/projects/zerodha/demo.mp4".
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
    slug: "zerodha",
    title: "Zerodha Trading Platform (Clone)",
    tagline: "Fintech · Real-time",
    year: "2025",
    accent: "blue",
    role: "Full-stack — architecture, real-time layer, auth",
    summary:
      "A full-stack trading platform inspired by Zerodha, supporting real-time market data, order placement, portfolio tracking, and secure authentication. Built with scalability and performance in mind.",
    tech: [
      "React",
      "Node.js",
      "Express",
      "MongoDB",
      "WebSockets",
      "JWT Authentication",
      "REST APIs",
      "Redis",
      "Chart.js",
      "Role-Based Access",
      "Market Data Handling",
      "Tailwind CSS",
    ],
    links: {
      github: "https://github.com/Omkar-Gavade/mern-trading-platform",
      /** No public deployment yet — the Live Demo button degrades gracefully. */
      demo: null,
    },
    media: {
      cover: zerodhaImg,
      screenshots: [],
      video: null,
      poster: null,
      gif: null,
    },

    overview:
      "Zerodha is India's largest retail broker. I rebuilt the core trading experience end to end — not a static clone, but a working system with live prices, an order lifecycle, and a portfolio that reconciles against the market as it moves.",

    problem:
      "Most trading-app clones stop at the screenshot: a static dashboard with hardcoded numbers. That skips the part that makes the domain hard — prices change continuously, orders have to be validated against real balances, and a portfolio has to stay consistent with both while someone is watching it.",

    objectives: [
      "Stream live prices without one request per client per tick",
      "Model the full order lifecycle instead of mutating balances directly",
      "Keep holdings, positions and orders in agreement at all times",
      "Isolate every account's book behind enforced authorisation",
    ],

    /** Add measured numbers here — nothing estimated. */
    metrics: [],

    features: [
      {
        title: "Live market data",
        body: "Quotes stream to the client over a shared WebSocket channel and repaint charts in place — no full refreshes, no polling storms.",
      },
      {
        title: "Order placement",
        body: "Buy and sell orders validate against the user's funds and holdings, then move through a defined lifecycle to filled.",
      },
      {
        title: "Portfolio tracking",
        body: "Holdings reconcile against live prices to show real-time P&L, average cost, and current value.",
      },
      {
        title: "Secure authentication",
        body: "JWT sessions with role-based access keep each account's book isolated and every mutation attributable.",
      },
    ],

    architecture: [
      {
        layer: "Client",
        detail: "React + Chart.js, WebSocket subscriber for live quotes",
      },
      {
        layer: "API",
        detail:
          "Node + Express REST for orders and holdings, WebSocket gateway for market data",
      },
      {
        layer: "Data",
        detail: "MongoDB for orders and portfolio, Redis for the hot quote cache",
      },
      {
        layer: "Auth",
        detail: "JWT sessions with role-based middleware on every mutation",
      },
    ],

    highlights: [
      "One WebSocket channel fans quotes out to every connected client, so read volume stopped scaling with the number of open tabs.",
      "Redis sits in front of the hot quote reads, which is what decoupled user growth from database load.",
      "Orders move through explicit states rather than writing straight to holdings, so every balance change traces back to a transition.",
      "Authorisation lives in middleware on every mutating route, so a new endpoint is protected by default rather than by review.",
    ],

    challenges: [
      {
        title: "Streaming without stampede",
        body: "Naive polling put load on the database that scaled with every connected tab. Moving to a single shared WebSocket stream plus a Redis quote cache decoupled read volume from the database and kept order latency around 120ms.",
      },
      {
        title: "Keeping the book consistent",
        body: "Orders, holdings and positions live in separate collections but have to agree at all times. Modelling the order lifecycle explicitly — rather than mutating holdings ad hoc — made every state transition auditable.",
      },
    ],

    learnings: [
      "One shared stream beats N polling clients: push architecture is a data-volume decision before it is a UX one.",
      "A cache in front of hot reads is what actually decouples user growth from database load.",
      "Authorising every mutation at the middleware layer is cheaper than auditing each route later.",
      "Financial UIs earn trust through latency and consistency, not through visual polish alone.",
    ],

    futureWork: [
      "Move order matching onto a queue so bursts are absorbed rather than dropped",
      "Add historical candles and indicator overlays to the charting layer",
      "Introduce optimistic order placement with server-side reconciliation",
      "Cover the order lifecycle with integration tests against a seeded book",
    ],
  },

  {
    slug: "novagpt",
    title: "NovaGPT — Multi-Provider AI Platform",
    tagline: "AI Infrastructure · Multi-provider",
    year: "2025",
    accent: "emerald",
    role: "Full-stack — architecture, provider layer, routing",
    summary:
      "A production-oriented AI platform that unifies multiple large language model providers behind one interface, routing each request to the most suitable model by capability, availability and latency instead of locking users to a single vendor.",
    tech: [
      "React",
      "Vite",
      "Node.js",
      "Express",
      "MongoDB",
      "Redis",
      "Docker",
      "REST APIs",
      "JavaScript",
    ],
    links: {
      github: "https://github.com/Omkar-Gavade/NovaGPT-Fullstack",
      demo: null,
    },
    media: {
      cover: chatgptImg,
      screenshots: [],
      video: null,
      poster: null,
      gif: null,
    },

    overview:
      "NovaGPT puts several LLM providers behind a single interface and decides, per request, which model should answer — based on what that model can do, whether it is currently healthy, and how fast it is responding. The backend is built as Ports & Adapters, so each provider is an adapter behind one port rather than another branch in shared code.",

    problem:
      "Building directly against one provider's SDK ties the whole application to that vendor's shape, pricing and uptime. Providers also word the same request differently — streaming, token limits and error semantics all diverge — so switching later means rewriting call sites instead of swapping a dependency.",

    objectives: [
      "Present one stable interface regardless of which provider answers",
      "Select a model by declared capability, not a hardcoded name",
      "Fail over automatically when a provider degrades or goes down",
      "Keep adding a provider down to writing a single adapter",
    ],

    metrics: [],

    features: [
      {
        title: "Intelligent routing",
        body: "Each request is matched to a model by declared capability, current health and observed latency, rather than a name fixed in config.",
      },
      {
        title: "Provider failover",
        body: "When a provider starts failing or timing out, traffic moves to the next viable model instead of surfacing the error.",
      },
      {
        title: "Streaming responses",
        body: "Tokens are relayed to the client as they arrive, so perceived latency is measured to the first word rather than the last.",
      },
      {
        title: "Health monitoring",
        body: "Providers are checked and scored continuously, and the registry uses that signal to keep unhealthy models out of rotation.",
      },
    ],

    architecture: [
      {
        layer: "Client",
        detail: "React + Vite consuming a streamed token feed over REST",
      },
      {
        layer: "Domain",
        detail:
          "Hexagonal core — routing and selection behind ports, no provider SDK imports",
      },
      {
        layer: "Adapters",
        detail:
          "One adapter per provider, registered in a registry the core resolves against",
      },
      {
        layer: "Infrastructure",
        detail:
          "Node + Express, MongoDB for persistence, Redis for cache and health state, Docker for packaging",
      },
    ],

    highlights: [
      "Provider differences are normalised at the adapter boundary, so the domain layer never learns which vendor answered a request.",
      "A provider registry resolves capabilities at runtime, which is what makes capability-based selection possible instead of name-based config.",
      "Health state lives in Redis rather than process memory, so scoring survives restarts and is shared across instances.",
      "API keys are held and used server-side only; the browser never receives a provider credential.",
    ],

    challenges: [
      {
        title: "Designing the provider abstraction",
        body: "Every provider words the same operation differently — streaming shape, token accounting and error semantics all diverge. Finding a port narrow enough to stay honest, yet wide enough to express real capability differences, took more iterations than the routing logic itself.",
      },
      {
        title: "Holding the architecture boundary",
        body: "Ports & Adapters only pays off if nothing leaks. It was repeatedly tempting to reach for a provider SDK inside domain code for one special case; keeping that out is what preserved the ability to add a provider without touching the core.",
      },
    ],

    learnings: [
      "Hexagonal Architecture earns its cost the moment a second implementation of the same port appears.",
      "A good abstraction hides vendor differences without hiding the capabilities you need to choose between.",
      "Injecting dependencies rather than importing them is what makes a provider layer testable in isolation.",
      "Provider keys and failover belong behind your own API — the client should only ever see one interface.",
    ],

    futureWork: [
      "Track per-provider cost and factor it into the routing decision",
      "Cache responses for repeated prompts to cut both spend and latency",
      "Surface routing decisions in the UI so model choice is explainable",
      "Contract-test each adapter against the port to catch drift on provider updates",
    ],
  },
];

/** Convenience lookup used by the modal and any future deep links. */
export const getProject = (slug) => projects.find((p) => p.slug === slug);
