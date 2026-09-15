/**
 * Pre-renders the single-page portfolio into dist/index.html.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server entry). The
 * client bundle then hydrates this HTML instead of rendering into an empty
 * <div>, so crawlers and link previews see the full page content and the
 * structured data without executing JavaScript.
 */
import { readFile, rm, writeFile } from "node:fs/promises";

const dist = new URL("../dist/", import.meta.url);
const ssrDir = new URL("../dist-ssr/", import.meta.url);

const { render, structuredData } = await import(
  new URL("entry-server.js", ssrDir).href
);

const indexUrl = new URL("index.html", dist);
const template = await readFile(indexUrl, "utf8");

for (const marker of ["<!--app-html-->", "<!--structured-data-->"]) {
  if (!template.includes(marker)) {
    throw new Error(`prerender: ${marker} is missing from index.html`);
  }
}

// `<` is escaped so no string in the data can close the script tag early.
const jsonLd = JSON.stringify(structuredData()).replace(/</g, "\\u003c");

const html = template
  .replace("<!--app-html-->", render())
  .replace(
    "<!--structured-data-->",
    `<script type="application/ld+json">${jsonLd}</script>`
  );

await writeFile(indexUrl, html);
await rm(ssrDir, { recursive: true, force: true });

console.log(`prerender: wrote ${(html.length / 1024).toFixed(1)} kB to dist/index.html`);
