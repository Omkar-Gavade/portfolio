import { useState } from "react";

/**
 * The inline script in `index.html` applies the saved theme before first paint,
 * so this reads the current state off `<html>` rather than re-deciding it —
 * that's what keeps the button in sync with what's already on screen.
 */
export default function ThemeToggle() {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    const next = !dark;

    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      /* private mode — the toggle still works for this session */
    }

    setDark(next);
  };

  return (
    <button
      onClick={toggleTheme}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      aria-pressed={dark}
      className="w-10 h-10 rounded-full bg-black/70 border border-white/10 text-white flex items-center justify-center"
    >
      <span aria-hidden="true">{dark ? "☀️" : "🌙"}</span>
    </button>
  );
}
