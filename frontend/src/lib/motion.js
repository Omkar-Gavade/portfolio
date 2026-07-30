/**
 * Shared motion tokens.
 *
 * The site's existing CSS transitions are short and unfussy, so the Framer
 * Motion layer matches that: one easing curve, one small travel distance, and
 * durations that stay under a second. Anything louder would read as a different
 * site.
 */
export const EASE = [0.16, 1, 0.3, 1];

export const DURATION = {
  fast: 0.25,
  base: 0.5,
  slow: 0.7,
};

/** Distance a revealing element travels, in px. */
export const TRAVEL = 16;

/** Gap between children in a staggered group, in seconds. */
export const STAGGER = 0.06;
