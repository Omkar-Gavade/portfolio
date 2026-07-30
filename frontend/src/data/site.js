/**
 * Profile-level constants shared across sections.
 * Keeping them here means a username or link changes in exactly one place.
 */
export const site = {
  name: "Omkar Gavade",
  role: "Full Stack Developer",
  email: "omkargavade002@gmail.com",
  location: "India",
  cv: "/Omkar_Gavade_CV.pdf",
  githubUser: "Omkar-Gavade",

  /**
   * Repositories to feature in the GitHub Activity section, in this order.
   *
   * GitHub's real "pinned" list is only available through its GraphQL API,
   * which needs an access token — so this is the curated equivalent: put the
   * exact repo names here and they're the ones shown, with live stars, forks,
   * language and push date pulled from the public API.
   *
   * Leave the array empty to fall back to your most recently pushed repos,
   * most-starred first.
   */
  pinnedRepos: ["mern-trading-platform", "NovaGPT-Fullstack"],
  socials: {
    github: "https://github.com/Omkar-Gavade",
    linkedin: "https://www.linkedin.com/in/omkar-gavade/",
    instagram: "https://www.instagram.com/gavadeomkar002/",
    /** TODO: add your X profile URL — the icon links nowhere until you do. */
    x: null,
  },
};
