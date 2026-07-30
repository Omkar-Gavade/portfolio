import { Suspense, lazy, useState } from "react";
import { projects } from "../data/projects";
import { EVENTS, track } from "../lib/analytics";
import ProjectCard from "../components/projects/ProjectCard";
import SectionHeader from "../components/ui/SectionHeader";
import { RevealGroup } from "../components/ui/Reveal";

/** The modal — with its media viewer — only downloads once someone opens one. */
const ProjectModal = lazy(() => import("../components/projects/ProjectModal"));

export default function Projects() {
  const [activeSlug, setActiveSlug] = useState(null);
  const [open, setOpen] = useState(false);

  const active = projects.find((project) => project.slug === activeSlug);

  const openPreview = (project) => {
    setActiveSlug(project.slug);
    setOpen(true);
    track(EVENTS.PROJECT_PREVIEW_OPEN, { project: project.slug });
  };

  return (
    <section
      id="projects"
      className="min-h-screen
                 bg-white dark:bg-black
                 text-black dark:text-white
                 px-6 py-24"
    >
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <SectionHeader title="My Projects" titleClassName="text-4xl font-bold mb-4">
          A selection of full-stack projects showcasing scalable architecture,
          real-time systems, and production-ready UI/UX.
        </SectionHeader>
      </div>

      {/* Grid */}
      <RevealGroup className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
        {projects.map((project) => (
          <ProjectCard
            key={project.slug}
            project={project}
            onPreview={() => openPreview(project)}
          />
        ))}
      </RevealGroup>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-white/20 to-transparent my-10" />

      {active && (
        <Suspense fallback={null}>
          <ProjectModal
            project={active}
            open={open}
            onClose={() => setOpen(false)}
          />
        </Suspense>
      )}
    </section>
  );
}
