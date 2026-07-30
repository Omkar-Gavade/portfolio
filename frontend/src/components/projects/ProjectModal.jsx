import { useMemo } from "react";
import { ExternalLink, Github } from "lucide-react";
import { getAccent } from "../../data/accents";
import { EVENTS, track } from "../../lib/analytics";
import ActionButton from "../ui/ActionButton";
import { ChipList } from "../ui/Chip";
import { toSlides } from "../../lib/media";
import MediaCarousel from "../ui/MediaFrame";
import Modal from "../ui/Modal";

/** Section heading inside the modal — same weight/size as the section cards. */
function Block({ title, children, className = "" }) {
  return (
    <section className={className}>
      <h4 className="text-lg font-medium mb-4">{title}</h4>
      {children}
    </section>
  );
}

function Divider() {
  return (
    <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent" />
  );
}

/**
 * Accent-bulleted list, shared by Objectives, Development Highlights,
 * Learnings and Future Improvements — same markup the Learnings block already
 * used, just named so it isn't repeated four times.
 */
function BulletList({ items, accent }) {
  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <span
            className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${accent.dot}`}
            aria-hidden="true"
          />
          <span className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {item}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Bordered sub-card, matching the Skills and Education cards. */
function Panel({ children, className = "" }) {
  return (
    <div
      className={`border border-gray-200 dark:border-white/10
                  bg-gray-50 dark:bg-transparent
                  rounded-xl p-4 ${className}`}
    >
      {children}
    </div>
  );
}

export default function ProjectModal({ project, open, onClose }) {
  const slides = useMemo(() => toSlides(project?.media), [project]);

  if (!project) return null;

  const accent = getAccent(project.accent);
  const { github, demo } = project.links;

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      title={project.title}
      subtitle={`${project.tagline} · ${project.year} · ${project.role}`}
      footer={
        <div className="flex flex-wrap items-center gap-3">
          <ActionButton
            href={github}
            external
            variant={accent.button}
            icon={Github}
            onClick={() =>
              track(EVENTS.GITHUB_CLICK, {
                project: project.slug,
                source: "modal",
              })
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
                source: "modal",
              })
            }
          >
            Live Demo
          </ActionButton>
        </div>
      }
    >
      <div className="space-y-8">
        <MediaCarousel slides={slides} label={`${project.title} media`} />

        <Block title="Overview">
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
            {project.overview}
          </p>
        </Block>

        {project.problem && (
          <>
            <Divider />
            <Block title="Problem Statement">
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {project.problem}
              </p>
            </Block>
          </>
        )}

        {project.objectives?.length > 0 && (
          <>
            <Divider />
            <Block title="Objectives">
              <BulletList items={project.objectives} accent={accent} />
            </Block>
          </>
        )}

        {project.metrics?.length > 0 && (
          <>
            <Divider />
            <Block title="Metrics">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {project.metrics.map((metric) => (
                  <Panel key={metric.label}>
                    <p className="text-lg font-semibold">{metric.value}</p>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                      {metric.label}
                    </p>
                  </Panel>
                ))}
              </div>
            </Block>
          </>
        )}

        <Divider />

        <Block title="Features">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.features.map((feature) => (
              <Panel key={feature.title}>
                <p className="font-medium mb-1.5">{feature.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {feature.body}
                </p>
              </Panel>
            ))}
          </div>
        </Block>

        <Divider />

        <Block title="Tech Stack">
          <ChipList items={project.tech} />
        </Block>

        <Divider />

        <Block title="Architecture">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {project.architecture.map((row) => (
              <Panel key={row.layer}>
                <p className="text-sm font-medium mb-1">{row.layer}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {row.detail}
                </p>
              </Panel>
            ))}
          </div>
        </Block>

        {project.highlights?.length > 0 && (
          <>
            <Divider />
            <Block title="Development Highlights">
              <BulletList items={project.highlights} accent={accent} />
            </Block>
          </>
        )}

        <Divider />

        <Block title="Challenges">
          <div className="space-y-4">
            {project.challenges.map((challenge) => (
              <Panel key={challenge.title}>
                <p className="font-medium mb-1.5">{challenge.title}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {challenge.body}
                </p>
              </Panel>
            ))}
          </div>
        </Block>

        <Divider />

        <Block title="Learnings">
          <BulletList items={project.learnings} accent={accent} />
        </Block>

        {project.futureWork?.length > 0 && (
          <>
            <Divider />
            <Block title="Future Improvements">
              <BulletList items={project.futureWork} accent={accent} />
            </Block>
          </>
        )}
      </div>
    </Modal>
  );
}
