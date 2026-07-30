/**
 * Single source of truth for the Certificates section.
 *
 * Everything is stored locally — nothing is fetched from an API.
 *
 * ── How to add a certificate ────────────────────────────────────────────────
 * 1. Put the certificate image in `public/certificates/` (PNG or JPG, and a
 *    WebP alongside it if you have one — it loads faster).
 * 2. Put the issuer logo in `public/certificates/logos/` (SVG or PNG,
 *    transparent background works best). `logo` is optional — without one the
 *    card falls back to the issuer's initials.
 * 3. Copy the template below into the `certificates` array.
 *
 * The section hides itself automatically while the array is empty, so an
 * unfinished list never ships a broken-looking section.
 *
 * ── Template ────────────────────────────────────────────────────────────────
 *
 *   {
 *     id: "meta-frontend",                       // unique, kebab-case
 *     title: "Meta Front-End Developer",         // certificate name
 *     issuer: "Meta · Coursera",                 // issuing organisation
 *     issued: "Mar 2025",                        // human-readable issue date
 *     issuedAt: "2025-03-01",                    // ISO date, used for sorting
 *     credentialId: "ABCD1234EFGH",              // optional
 *     credentialUrl: "https://coursera.org/verify/ABCD1234EFGH", // optional
 *     logo: "/certificates/logos/meta.svg",      // optional
 *     image: "/certificates/meta-frontend.png",  // full certificate scan
 *     skills: ["React", "JavaScript", "UI/UX"],  // rendered as chips
 *   }
 *
 * @typedef {Object} Certificate
 * @property {string}   id
 * @property {string}   title
 * @property {string}   issuer
 * @property {string}   issued
 * @property {string=}  issuedAt
 * @property {string=}  credentialId
 * @property {string=}  credentialUrl
 * @property {string=}  logo
 * @property {string=}  image
 * @property {string[]} skills
 */

/** @type {Certificate[]} */
export const certificates = [
  {
    id: "infosys-reactjs",
    title: "ReactJS",
    issuer: "Infosys Springboard",
    issued: "Jun 2025",
    issuedAt: "2025-06-23",
    credentialId: "",
    credentialUrl: "https://verify.onwingspan.com",
    logo: "/certificates/logos/infosys.png",
    image: "/certificates/reactjs-infosys.png",
    skills: [
      "React.js",
      "JavaScript",
      "JSX",
      "Components",
      "Hooks",
      "State Management",
      "Frontend Development",
    ],
  },
];

/** Newest first, falling back to the authored order when no ISO date is set. */
export const sortedCertificates = () =>
  [...certificates].sort((a, b) =>
    a.issuedAt && b.issuedAt ? b.issuedAt.localeCompare(a.issuedAt) : 0
  );

/** Initials fallback for cards without a logo — "Meta · Coursera" → "MC". */
export const issuerInitials = (issuer = "") =>
  issuer
    .split(/[\s·|,–—-]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
