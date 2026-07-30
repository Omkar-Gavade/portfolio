/**
 * Per-project accent classes.
 *
 * Tailwind scans source files for *literal* class strings, so every class a
 * project can use has to appear here in full — never build them by string
 * concatenation.
 */
export const ACCENTS = {
  blue: {
    solid: "bg-blue-500",
    text: "text-blue-500 dark:text-blue-400",
    button:
      "bg-blue-500/10 text-blue-500 dark:text-blue-400 hover:bg-blue-500/20",
    ring: "focus-visible:outline-blue-500",
    dot: "bg-blue-500",
  },
  emerald: {
    solid: "bg-emerald-500",
    text: "text-emerald-500 dark:text-emerald-400",
    button:
      "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400 hover:bg-emerald-500/20",
    ring: "focus-visible:outline-emerald-500",
    dot: "bg-emerald-500",
  },
  violet: {
    solid: "bg-violet-500",
    text: "text-violet-500 dark:text-violet-400",
    button:
      "bg-violet-500/10 text-violet-500 dark:text-violet-400 hover:bg-violet-500/20",
    ring: "focus-visible:outline-violet-500",
    dot: "bg-violet-500",
  },
  amber: {
    solid: "bg-amber-500",
    text: "text-amber-500 dark:text-amber-400",
    button:
      "bg-amber-500/10 text-amber-500 dark:text-amber-400 hover:bg-amber-500/20",
    ring: "focus-visible:outline-amber-500",
    dot: "bg-amber-500",
  },
};

export const getAccent = (key) => ACCENTS[key] ?? ACCENTS.blue;
