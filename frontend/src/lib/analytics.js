import { track as vercelTrack } from "@vercel/analytics";

/**
 * Event names, kept in one place so a rename can't silently split a metric in
 * the dashboard. Page views are collected automatically by `<Analytics />`;
 * everything below is an explicit interaction.
 */
export const EVENTS = {
  RESUME_DOWNLOAD: "resume_download",
  GITHUB_CLICK: "github_click",
  LIVE_DEMO_CLICK: "live_demo_click",
  PROJECT_PREVIEW_OPEN: "project_preview_open",
  CERTIFICATE_PREVIEW_OPEN: "certificate_preview_open",
  CERTIFICATE_CREDENTIAL_CLICK: "certificate_credential_click",
  CONTACT_SUBMIT: "contact_submit",
};

/**
 * Fire-and-forget wrapper. Analytics must never be able to break a click, so
 * every failure — blocked script, ad blocker, offline — is swallowed.
 */
export function track(event, properties = {}) {
  try {
    vercelTrack(event, properties);
  } catch {
    /* analytics is best-effort by design */
  }
}
