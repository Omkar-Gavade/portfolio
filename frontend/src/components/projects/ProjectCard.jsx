import { ExternalLink, Eye, Github } from "lucide-react";
import { getAccent } from "../../data/accents";
import { EVENTS, track } from "../../lib/analytics";
import ActionButton from "../ui/ActionButton";
import { ChipList } from "../ui/Chip";
import { RevealItem } from "../ui/Reveal";

/**
 * Project card. Same surface, border, radius, padding and image treatment as
 * before — the only change is the row of actions replacing the single link.
 */
export default function ProjectCard({ project, onPreview }) {
  const accent = getAccent(project.accent);
  const { github, demo } = project.links;

  return (
    <RevealItem
      as="article"
      className="bg-gray-50 dark:bg-white/5
                 border border-gray-200 dark:border-white/10
                 rounded-2xl p-6 h-full flex flex-col"
    >
      {/* Image */}
      <button
        type="button"
        onClick={onPreview}
        aria-label={`Preview ${project.title}`}
        className="overflow-hidden rounded-xl mb-6 group block w-full text-left"
      >
        <img
          src={project.media.cover}
          alt={`${project.title} preview`}
          loading="lazy"
          decoding="async"
          className="w-full h-56 object-contain
                     bg-white rounded-xl
                     transition-transform duration-500
                     group-hover:scale-105
                     motion-reduce:transition-none motion-reduce:group-hover:scale-100"
        />
      </button>

      <h3 className="text-xl font-semibold mb-2">{project.title}</h3>

      <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
        {project.summary}
      </p>

      <ChipList items={project.tech} className="mb-6" />

      {/* Actions */}
      <div className="mt-auto flex flex-wrap items-center gap-3">
        <ActionButton
          href={github}
          external
          variant={accent.button}
          icon={Github}
          onClick={() =>
            track(EVENTS.GITHUB_CLICK, { project: project.slug, source: "card" })
          }
        >
          GitHub
        </ActionButton>

        <ActionButton
          href={demo ?? undefined}
          external
          icon={ExternalLink}
          disabled={!demo}
          disabledHint="Live demo coming soon"
          onClick={() =>
            track(EVENTS.LIVE_DEMO_CLICK, {
              project: project.slug,
              source: "card",
            })
          }
        >
          Live Demo
        </ActionButton>

        <ActionButton icon={Eye} onClick={onPreview}>
          Preview
        </ActionButton>
      </div>
    </RevealItem>
  );
}
