import { site } from "../data/site";
import { EVENTS, track } from "../lib/analytics";
import Reveal from "../components/ui/Reveal";

const SOCIALS = [
  { label: "LinkedIn", short: "in", href: site.socials.linkedin },
  { label: "GitHub", short: "GH", href: site.socials.github },
  { label: "Instagram", short: "IG", href: site.socials.instagram },
  // Kept so the icon row stays as designed. Set `socials.x` in data/site.js
  // and this points somewhere real.
  { label: "X", short: "X", href: site.socials.x },
];

export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex items-center justify-center
                 bg-white dark:bg-black
                 text-black dark:text-white"
    >
      <div className="flex flex-col items-center text-center px-6 pt-32">

        {/* Availability Badge */}
        <Reveal
          className="flex items-center gap-2 px-4 py-1.5 rounded-full
                     bg-gray-100 dark:bg-white/10
                     border border-gray-300 dark:border-white/10
                     text-sm mb-4"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75 motion-reduce:animate-none"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          Available for work
        </Reveal>

        {/* Location */}
        <Reveal
          as="span"
          delay={0.05}
          className="block text-sm text-gray-600 dark:text-gray-400 mb-6"
        >
          Based in India — open to opportunities
        </Reveal>

        {/* Heading */}
        <Reveal
          delay={0.1}
          className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-4xl"
        >
          <h1>
            Hi I’m{" "}
            <span className="text-red-500">Omkar Gavade</span> — Full Stack
            Developer with modern web expertise.
          </h1>
        </Reveal>

        {/* Description */}
        <Reveal
          delay={0.15}
          className="mt-6 max-w-2xl text-gray-600 dark:text-gray-400 text-base leading-relaxed"
        >
          I build fast, scalable, and user-focused web applications using modern
          technologies like React, Node.js, and Tailwind CSS. I focus on clean
          architecture, performance, and great user experience.
        </Reveal>

        {/* CTA + Socials */}
        <Reveal
          delay={0.2}
          className="mt-12 flex flex-wrap items-center justify-center gap-4"
        >

          {/* Get in touch */}
          <a
            href="#contact"
            className="flex items-center gap-2 px-7 py-3 rounded-full
                       bg-black text-white
                       dark:bg-white dark:text-black
                       text-sm font-medium
                       hover:opacity-90 transition"
          >
            Get in touch →
          </a>

          {/* View projects */}
          <a
            href="#projects"
            className="flex items-center gap-2 px-7 py-3 rounded-full
                       bg-gray-100 dark:bg-white/10
                       border border-gray-300 dark:border-white/10
                       text-sm
                       hover:bg-gray-200 dark:hover:bg-white/20
                       transition"
          >
            View projects →
          </a>

          {/* Download CV */}
          <a
            href={site.cv}
            download
            onClick={() => track(EVENTS.RESUME_DOWNLOAD, { source: "hero" })}
            className="px-6 py-3 rounded-full
                       bg-gray-100 dark:bg-white/10
                       border border-gray-300 dark:border-white/10
                       text-sm
                       hover:bg-gray-200 dark:hover:bg-white/20
                       transition"
          >
            Download CV ↓
          </a>

          {/* Social Icons */}
          <div className="flex items-center gap-3 ml-2">
            {SOCIALS.map((social) => (
              <a
                key={social.label}
                href={social.href || "#"}
                {...(social.href
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                aria-label={social.label}
                className="w-11 h-11 flex items-center justify-center rounded-full
                           border border-gray-300 dark:border-white/15
                           text-black dark:text-white
                           hover:bg-gray-200 dark:hover:bg-white/10
                           transition"
              >
                <span aria-hidden="true">{social.short}</span>
              </a>
            ))}
          </div>

        </Reveal>

      </div>

    </section>
  );
}
