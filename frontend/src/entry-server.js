import { StrictMode, createElement } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";
import { site } from "./data/site";
import { projects } from "./data/projects";
import { education } from "./data/education";
import { experience } from "./data/experience";
import { skillGroups } from "./data/skills";
import { certificates } from "./data/certificates";

/**
 * Build-time entry used by scripts/prerender.mjs. Written without JSX so the
 * react-refresh lint rule, which only applies to .jsx, stays out of the way.
 */
export function render() {
  return renderToString(createElement(StrictMode, null, createElement(App)));
}

export const SITE_URL = "https://www.omkargavade.xyz/";
const abs = (path) => new URL(path, SITE_URL).href;

/**
 * schema.org JSON-LD for the page, generated from the same data modules the
 * sections render — so a new project or certificate reaches search engines
 * without anyone remembering to edit index.html.
 */
export function structuredData() {
  const person = { "@id": `${SITE_URL}#person` };

  const knowsAbout = [
    ...new Set([
      ...skillGroups.flatMap((group) => group.items),
      ...projects.flatMap((project) => project.tech),
    ]),
  ].slice(0, 40);

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}#website`,
        url: SITE_URL,
        name: site.name,
        inLanguage: "en",
        publisher: person,
      },
      {
        "@type": "ProfilePage",
        "@id": `${SITE_URL}#profile`,
        url: SITE_URL,
        name: `${site.name} — Full Stack & AI Software Engineer`,
        isPartOf: { "@id": `${SITE_URL}#website` },
        mainEntity: person,
        dateModified: new Date().toISOString().slice(0, 10),
      },
      {
        "@type": "Person",
        ...person,
        name: site.name,
        alternateName: "Omkar Kuber Gavade",
        url: SITE_URL,
        image: abs("/omkar-gavade.jpg"),
        jobTitle: "Full Stack Software Engineer",
        description:
          "Full stack and AI software engineer building React, Node.js and TypeScript applications, including retrieval-augmented and multi-model AI products.",
        email: `mailto:${site.email}`,
        address: { "@type": "PostalAddress", addressCountry: "IN" },
        alumniOf: education.map((entry) => ({
          "@type": "CollegeOrUniversity",
          name: entry.institution,
        })),
        memberOf: [...new Set(experience.map((entry) => entry.org))].map(
          (name) => ({ "@type": "Organization", name })
        ),
        hasCredential: certificates.map((cert) => ({
          "@type": "EducationalOccupationalCredential",
          name: cert.title,
          credentialCategory: "certificate",
          recognizedBy: { "@type": "Organization", name: cert.issuer },
          ...(cert.credentialUrl ? { url: cert.credentialUrl } : {}),
        })),
        knowsAbout,
        sameAs: Object.values(site.socials).filter(Boolean),
      },
      {
        "@type": "ItemList",
        "@id": `${SITE_URL}#projects`,
        name: "Projects",
        itemListElement: projects.map((project, index) => ({
          "@type": "ListItem",
          position: index + 1,
          item: {
            "@type": "SoftwareSourceCode",
            name: project.title,
            description: project.summary,
            codeRepository: project.links.github,
            ...(project.links.demo ? { url: project.links.demo } : {}),
            image: abs(project.media.cover),
            keywords: project.tech.join(", "),
            dateCreated: project.year,
            author: person,
          },
        })),
      },
    ],
  };
}
